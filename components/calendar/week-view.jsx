"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Clock, User, Car, Phone } from "lucide-react"

export default function WeekView({
  currentDate,
  events,
  onTimeClick,
  onEventClick,
  onDragEvent,
  onDragEventTime,
  userRole = "admin",
}) {
  const [draggedEvent, setDraggedEvent] = useState(null)
  const [dragStartY, setDragStartY] = useState(null)
  const [hoveredEvent, setHoveredEvent] = useState(null)
  const timeGridRef = useRef(null)

  // Utility function to conditionally join classNames
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
  }

 // Get start of week (Monday)
const getStartOfWeek = (date) => {
  const startOfWeek = new Date(date)
  const day = date.getDay()
  const diff = (day === 0 ? -6 : 1 - day) // if Sunday (0), go back 6 days; else back to Monday
  startOfWeek.setDate(date.getDate() + diff)
  startOfWeek.setHours(0, 0, 0, 0)
  return startOfWeek
}

  // Get days of the week
  const getDaysOfWeek = (startDate) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  // Get hours of the day
  const getHoursOfDay = () => {
    const hours = []
    for (let i = 3; i < 24; i++) {
      hours.push(i)
    }
    return hours
  }

  // Format time
  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString("pl-PL", { weekday: "short", day: "numeric" })
  }

  // Check if date is today
  const isToday = (date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Get events for a specific day
  const getEventsForDay = (day) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      )
    })
  }

  // Google Calendar inspired layout algorithm
  const calculateEventLayout = (events, day) => {
    if (!events.length) return { layouts: {}, maxColumns: 0, dayWidth: 150 }

    // Filter events for this specific day only
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      )
    })

    if (!dayEvents.length) return { layouts: {}, maxColumns: 0, dayWidth: 150 }

    // Convert times to minutes for easier calculation
    const eventsWithTimes = dayEvents.map((event) => ({
      ...event,
      startMinutes:
        Number.parseInt(event.start_time.split(":")[0], 10) * 60 + Number.parseInt(event.start_time.split(":")[1], 10),
      endMinutes:
        Number.parseInt(event.end_time.split(":")[0], 10) * 60 + Number.parseInt(event.end_time.split(":")[1], 10),
    }))

    // Sort by start time, then by duration (longer first)
    eventsWithTimes.sort((a, b) => {
      if (a.startMinutes !== b.startMinutes) {
        return a.startMinutes - b.startMinutes
      }
      return b.endMinutes - b.startMinutes - (a.endMinutes - a.startMinutes)
    })

    // Assign columns using Google Calendar approach
    const columns = []
    const eventLayouts = {}

    eventsWithTimes.forEach((event) => {
      // Find the leftmost column where this event can fit
      let columnIndex = 0

      while (columnIndex < columns.length) {
        const column = columns[columnIndex]
        let canFit = true

        // Check if this event overlaps with any event in this column
        for (const existingEvent of column) {
          if (event.startMinutes < existingEvent.endMinutes && event.endMinutes > existingEvent.startMinutes) {
            canFit = false
            break
          }
        }

        if (canFit) break
        columnIndex++
      }

      // If no existing column works, create a new one
      if (columnIndex === columns.length) {
        columns.push([])
      }

      columns[columnIndex].push(event)

      eventLayouts[event.id] = {
        column: columnIndex,
        totalColumns: columns.length,
      }
    })

    const maxColumns = columns.length
    const eventWidth = 140 // Fixed width per event for readability
    const eventGap = 4 // Gap between events
    const dayWidth = Math.max(maxColumns * (eventWidth + eventGap), 150) // Minimum day width

    // Calculate final positions with fixed widths
    Object.keys(eventLayouts).forEach((eventId) => {
      const event = eventsWithTimes.find((e) => e.id === eventId)
      const layout = eventLayouts[eventId]

      // Calculate how many columns this event can span
      let rightmostColumn = layout.column

      for (let col = layout.column + 1; col < maxColumns; col++) {
        const column = columns[col]
        let canExpand = true

        for (const existingEvent of column) {
          if (event.startMinutes < existingEvent.endMinutes && event.endMinutes > existingEvent.startMinutes) {
            canExpand = false
            break
          }
        }

        if (!canExpand) break
        rightmostColumn = col
      }

      const columnsSpanned = rightmostColumn - layout.column + 1
      const width = columnsSpanned * eventWidth + (columnsSpanned - 1) * eventGap
      const left = layout.column * (eventWidth + eventGap)

      eventLayouts[eventId] = {
        ...layout,
        width: `${width}px`,
        left: `${left}px`,
        totalColumns: maxColumns,
        columnsSpanned,
      }
    })

    return { layouts: eventLayouts, maxColumns, dayWidth }
  }

  // Get event position and height
  const getEventStyle = (event, layout) => {
    const eventStartHour = Number.parseInt(event.start_time.split(":")[0], 10)
    const eventStartMinute = Number.parseInt(event.start_time.split(":")[1], 10)
    const eventEndHour = Number.parseInt(event.end_time.split(":")[0], 10)
    const eventEndMinute = Number.parseInt(event.end_time.split(":")[1], 10)

    const startPosition = (eventStartHour - 3) * 60 + eventStartMinute
    const duration = (eventEndHour - eventStartHour) * 60 + (eventEndMinute - eventStartMinute)

    // Expand height on hover for short events
    const isHovered = hoveredEvent === event.id
    const minHeight = isHovered && duration < 80 ? 120 : Math.max(duration, 30)

    return {
      top: `${startPosition}px`,
      height: `${minHeight}px`,
      backgroundColor: getEventTypeColor(event),
      transform: isHovered ? "scale(1.02)" : "scale(1)",
      zIndex: isHovered ? 1000 : "auto",
      transition: "all 0.2s ease-in-out",
    }
  }

   const getEventTypeColor = (event) => {
    const createdAt = new Date(event.created_at)
    const hour = createdAt.getHours()
    
    if (event.is_too_late) {
      return "#FBBF24" // amber
    } else if (event.payment_due) {
      return "#FF0000" // Red for payment due
    } else {
      return event.calendar.color || "#222222" // blue
    }
  }

  // Get comprehensive event info for display
  const getEventDisplayInfo = (event) => {
    const info = {
      time: event.start_time,
      studentName: event.driver?.name || "Brak danych",
      category: event.driver?.license_category || "B",
      phone: event.driver?.phone || "Brak tel.",
      instructor: event.instructor?.name || "Brak instruktora",
    }
    return info
  }

  // Get start of week and days of week
  const startOfWeek = getStartOfWeek(currentDate)
  const daysOfWeek = getDaysOfWeek(startOfWeek)
  const hoursOfDay = getHoursOfDay()

  // Calculate event layouts for each day
  const dayLayouts = {}
  daysOfWeek.forEach((day) => {
    dayLayouts[day.toISOString()] = calculateEventLayout(events, day)
  })

  // Enhanced drag and drop handlers
  const handleDragStart = (e, event) => {
    e.stopPropagation()
    setDraggedEvent(event)

    const rect = e.currentTarget.getBoundingClientRect()
    setDragStartY(e.clientY - rect.top)

    const dragImage = document.createElement("div")
    dragImage.style.opacity = "0"
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)

    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)
  }

  const handleDragOver = (e, day) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, day, dayIndex) => {
    e.preventDefault()
    if (draggedEvent) {
      const dayColumnRect = e.currentTarget.getBoundingClientRect()
      const relativeY = e.clientY - dayColumnRect.top + e.currentTarget.scrollTop

      const totalMinutes = Math.floor(relativeY)
      const newHour = Math.floor(totalMinutes / 60) + 3
      const newMinute = totalMinutes % 60

      const newstart_time = `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`

      const startHour = Number.parseInt(draggedEvent.start_time.split(":")[0], 10)
      const startMinute = Number.parseInt(draggedEvent.start_time.split(":")[1], 10)
      const endHour = Number.parseInt(draggedEvent.end_time.split(":")[0], 10)
      const endMinute = Number.parseInt(draggedEvent.end_time.split(":")[1], 10)
      const durationMinutes = (endHour - startHour) * 60 + (endMinute - startMinute)

      const endTotalMinutes = totalMinutes + durationMinutes
      const newEndHour = Math.floor(endTotalMinutes / 60) + 3
      const newEndMinute = endTotalMinutes % 60
      const newend_time = `${newEndHour.toString().padStart(2, "0")}:${newEndMinute.toString().padStart(2, "0")}`

      const oldDate = new Date(draggedEvent.date)
      const sameDay =
        oldDate.getDate() === day.getDate() &&
        oldDate.getMonth() === day.getMonth() &&
        oldDate.getFullYear() === day.getFullYear()

      if (sameDay) {
        onDragEventTime(draggedEvent.id, newstart_time, newend_time)
      } else {
        const newDate = new Date(day)
        newDate.setHours(newHour, newMinute, 0, 0)
        onDragEvent(draggedEvent.id, newDate)
        onDragEventTime(draggedEvent.id, newstart_time, newend_time)
      }

      setDraggedEvent(null)
      setDragStartY(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedEvent(null)
    setDragStartY(null)
  }

  return (
    <div className="h-full bg-white">
      <div className="flex flex-col h-full">
        {/* Unified scrolling container */}
        <div className="flex-1 overflow-auto">
          <div
            className="flex flex-col"
            style={{
              width: `${daysOfWeek.reduce((total, day) => total + dayLayouts[day.toISOString()].dayWidth, 0) + 64}px`,
            }}
          >
            {/* Header with days */}
            <div className="flex border-b sticky top-0 bg-white z-10">
              <div className="w-16 flex-shrink-0 border-r bg-gray-50"></div>
              {daysOfWeek.map((day, index) => {
                const dayLayout = dayLayouts[day.toISOString()]
                return (
                  <div
                    key={index}
                    className={classNames(
                      "text-center py-2 font-medium border-r",
                      isToday(day) ? "bg-blue-50" : "bg-gray-50",
                    )}
                    style={{
                      minWidth: `${dayLayout.dayWidth}px`,
                      width: `${dayLayout.dayWidth}px`,
                    }}
                  >
                    <div className={classNames("text-sm", isToday(day) ? "text-blue-600" : "text-gray-700")}>
                      {formatDate(day)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Time grid */}
            <div className="flex relative" ref={timeGridRef}>
              {/* Time labels */}
              <div className="w-16 flex-shrink-0 border-r bg-white">
                {hoursOfDay.map((hour) => (
                  <div key={hour} className="h-[60px] border-b text-xs text-gray-500 text-right pr-2 pt-0">
                    {formatTime(hour)}
                  </div>
                ))}
              </div>

              {/* Days columns */}
              {daysOfWeek.map((day, dayIndex) => {
                const dayLayout = dayLayouts[day.toISOString()]

                return (
                  <div
                    key={dayIndex}
                    data-day-index={dayIndex}
                    className="border-r relative"
                    style={{
                      minWidth: `${dayLayout.dayWidth}px`,
                      width: `${dayLayout.dayWidth}px`,
                    }}
                    onDragOver={(e) => handleDragOver(e, day)}
                    onDrop={(e) => handleDrop(e, day, dayIndex)}
                  >
                    {/* Hour cells */}
                    {hoursOfDay.map((hour) => (
                      <div
                        key={hour}
                        className={classNames("h-[60px] border-b border-gray-100", isToday(day) ? "bg-blue-50/30" : "")}
                        onClick={() => {
                          const clickedDate = new Date(day)
                          clickedDate.setHours(hour)
                          onTimeClick(clickedDate)
                        }}
                      ></div>
                    ))}

                    {/* Events container */}
                    <div className="absolute inset-0 pointer-events-none">
                      {getEventsForDay(day).map((event) => {
                        const layout = dayLayout.layouts[event.id]
                        if (!layout) return null

                        const eventInfo = getEventDisplayInfo(event)

                        return (
                          <motion.div
                            key={event.id}
                            className={classNames(
                              "absolute rounded px-2 py-1 text-white text-xs pointer-events-auto cursor-move",
                              "shadow-md border border-white/30 transition-all duration-200",
                              hoveredEvent === event.id ? "ring-2 ring-white/70 shadow-lg" : "",
                            )}
                            style={{
                              ...getEventStyle(event, layout),
                              width: layout.width,
                              left: layout.left,
                              zIndex: hoveredEvent === event.id ? 100 : layout.column + 10,
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              onEventClick(event)
                            }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, event)}
                            onDragEnd={handleDragEnd}
                            onMouseEnter={() => setHoveredEvent(event.id)}
                            onMouseLeave={() => setHoveredEvent(null)}
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: draggedEvent && draggedEvent.id === event.id ? 0.5 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="space-y-1">
                              <div className="font-medium leading-tight">{event.title}</div>

                              {/* Always show time */}
                              <div className="flex items-center text-xs opacity-90">
                                <User className="w-3 h-3 mr-0.5 flex-shrink-0" />
                                <span>{eventInfo.studentName}</span>
                              </div>

                              

                              {/* Show additional info on hover or if event is tall enough */}
                              {(hoveredEvent === event.id ||
                                getEventStyle(event, layout).height.replace("px", "") > 60) && (
                                <>
                                  
                                  <div className="flex items-center justify-between text-xs opacity-90">
                                    <div className="flex items-center">
                                      <Car className="w-3 h-3 mr-1 flex-shrink-0" />
                                      <span>{eventInfo.category}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                      <span className="text-xs">{eventInfo.phone}</span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Current time indicator */}
              <div className="absolute left-16 right-0 z-20 pointer-events-none">
                {(() => {
                  const now = new Date()
                  const currentHour = now.getHours()
                  const currentMinute = now.getMinutes()

                  if (currentHour >= 3 && currentHour < 24) {
                    const top = (currentHour - 3) * 60 + currentMinute
                    return (
                      <div className="absolute h-0.5 bg-red-500 w-full" style={{ top: `${top}px` }}>
                        <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
