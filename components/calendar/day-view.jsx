"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Clock, User, Car, Phone } from "lucide-react"

export default function DayView({
  currentDate,
  events,
  onTimeClick,
  onEventClick,
  onDragEventTime,
  userRole = "admin",
}) {
  const [draggedEvent, setDraggedEvent] = useState(null)
  const [dragStartY, setDragStartY] = useState(null)
  const [hoveredEvent, setHoveredEvent] = useState(null)
  const timeGridRef = useRef(null)

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
  }

  const calendarStartHour = 3

  const getHoursOfDay = () => {
    const hours = []
    for (let i = 3; i < 24; i++) {
      hours.push(i)
    }
    return hours
  }

  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  const formatDateHeader = (date) => {
    return date.toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getEventsForDay = () => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === currentDate.getDate() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  // Google Calendar style layout algorithm for day view
  const calculateEventLayout = (events) => {
    if (!events.length) return { layouts: {}, maxColumns: 0, totalWidth: 300 }

    const eventsWithTimes = events.map((event) => ({
      ...event,
      startMinutes:
        Number.parseInt(event.start_time.split(":")[0], 10) * 60 + Number.parseInt(event.start_time.split(":")[1], 10),
      endMinutes:
        Number.parseInt(event.end_time.split(":")[0], 10) * 60 + Number.parseInt(event.end_time.split(":")[1], 10),
    }))

    eventsWithTimes.sort((a, b) => {
      if (a.startMinutes !== b.startMinutes) {
        return a.startMinutes - b.startMinutes
      }
      return b.endMinutes - b.startMinutes - (a.endMinutes - a.startMinutes)
    })

    const columns = []
    const eventLayouts = {}

    eventsWithTimes.forEach((event) => {
      let columnIndex = 0

      while (columnIndex < columns.length) {
        const column = columns[columnIndex]
        let canFit = true

        for (const existingEvent of column) {
          if (event.startMinutes < existingEvent.endMinutes && event.endMinutes > existingEvent.startMinutes) {
            canFit = false
            break
          }
        }

        if (canFit) break
        columnIndex++
      }

      if (columnIndex === columns.length) {
        columns.push([])
      }

      columns[columnIndex].push(event)

      eventLayouts[event.id] = {
        column: columnIndex,
        totalColumns: 0,
      }
    })

    const maxColumns = columns.length
    const eventWidth = 180 // Slightly wider for day view
    const eventGap = 6 // Gap between events
    const minDayWidth = 300 // Minimum width for single day

    // Calculate total width needed
    const totalWidth =
      maxColumns > 0
        ? Math.max(maxColumns * (eventWidth + eventGap) - eventGap + 32, minDayWidth) // 32px for padding
        : minDayWidth

    Object.keys(eventLayouts).forEach((eventId) => {
      const event = eventsWithTimes.find((e) => e.id === eventId)
      const layout = eventLayouts[eventId]

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
      const left = layout.column * (eventWidth + eventGap) + 16 // 16px left padding

      eventLayouts[eventId] = {
        ...layout,
        width: `${width}px`,
        left: `${left}px`,
        totalColumns: maxColumns,
        columnsSpanned,
      }
    })

    return { layouts: eventLayouts, maxColumns, totalWidth }
  }

  const getEventStyle = (event, layout) => {
    const eventStartHour = Number.parseInt(event.start_time.split(":")[0], 10)
    const eventStartMinute = Number.parseInt(event.start_time.split(":")[1], 10)
    const eventEndHour = Number.parseInt(event.end_time.split(":")[0], 10)
    const eventEndMinute = Number.parseInt(event.end_time.split(":")[1], 10)

    const startPosition = (eventStartHour - calendarStartHour) * 60 + eventStartMinute
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

    if (hour >= 14) {
      return "#FBBF24"
    } else if (event.payment_due) {
      return "#FF0000"
    } else {
      switch (event.lessonType) {
        case "practical":
          return "#10B981"
        case "theory":
          return "#6366F1"
        case "exam":
          return "#F43F5E"
        default:
          return event.color || "#4285F4"
      }
    }
  }

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

  const handleDragStart = (e, event) => {
    e.stopPropagation()
    setDraggedEvent(event)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragStartY(e.clientY - rect.top)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (draggedEvent) {
      const timeGridRect = timeGridRef.current.getBoundingClientRect()
      const relativeY = e.clientY - timeGridRect.top

      const totalMinutes = Math.floor(relativeY)
      let newHour = Math.floor(totalMinutes / 60) + calendarStartHour
      let newMinute = totalMinutes % 60

      if (newHour > 23 || (newHour === 23 && newMinute > 59)) {
        newHour = 23
        newMinute = 59
      }

      const newstart_time = `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`

      const startHour = Number.parseInt(draggedEvent.start_time.split(":")[0], 10)
      const startMinute = Number.parseInt(draggedEvent.start_time.split(":")[1], 10)
      const endHour = Number.parseInt(draggedEvent.end_time.split(":")[0], 10)
      const endMinute = Number.parseInt(draggedEvent.end_time.split(":")[1], 10)
      const durationMinutes = (endHour - startHour) * 60 + (endMinute - startMinute)

      const endTotalMinutes = totalMinutes + durationMinutes
      let newEndHour = Math.floor(endTotalMinutes / 60) + calendarStartHour
      let newEndMinute = endTotalMinutes % 60

      if (newEndHour > 23 || (newEndHour === 23 && newEndMinute > 59)) {
        newEndHour = 23
        newEndMinute = 59
      }

      const newend_time = `${newEndHour.toString().padStart(2, "0")}:${newEndMinute.toString().padStart(2, "0")}`

      onDragEventTime(draggedEvent.id, newstart_time, newend_time)

      setDraggedEvent(null)
      setDragStartY(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedEvent(null)
    setDragStartY(null)
  }

  const isToday = () => {
    const today = new Date()
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const hoursOfDay = getHoursOfDay()
  const dayEvents = getEventsForDay()
  const eventLayout = calculateEventLayout(dayEvents)

  return (
    <div className="h-full bg-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b sticky top-0 bg-white  py-3 px-4">
          <h2 className={classNames("text-xl font-semibold", isToday() ? "text-blue-600" : "text-gray-800")}>
            {formatDateHeader(currentDate)}
            {isToday() && <span className="ml-2 text-sm font-normal text-blue-600">(Dzisiaj)</span>}
          </h2>
        </div>

        {/* Unified scrolling container */}
        <div className="flex-1 overflow-auto">
          <div
            className="flex min-w-full relative"
            style={{
              width: `${eventLayout.totalWidth + 64}px`, // 64px for time column
            }}
          >
            {/* Time labels */}
            <div className="w-16 flex-shrink-0 border-r bg-white">
              {hoursOfDay.map((hour) => (
                <div key={hour} className="h-[60px] border-b text-xs text-gray-500 text-right pr-2 pt-0">
                  {formatTime(hour)}
                </div>
              ))}
            </div>

            {/* Day content */}
            <div className="flex-1 relative min-w-full" style={{ width: `${eventLayout.totalWidth}px` }} ref={timeGridRef}>
              {/* Hour cells */}
              {hoursOfDay.map((hour) => (
                <div
                  key={hour}
                  className={classNames("h-[60px] relative ", isToday() ? "bg-blue-50/30" : "")}
                  onClick={() => {
                    const clickedDate = new Date(currentDate)
                    clickedDate.setHours(hour)
                    onTimeClick(clickedDate)
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {/* Full width border line */}
                  <div
                    className="absolute bottom-0 left-0 h-px bg-gray-100 min-w-full"
                    style={{ width: `${eventLayout.totalWidth}px` }}
                  />
                </div>
              ))}

              {/* Events container */}
              <div className="absolute inset-0 pointer-events-none">
                {dayEvents.map((event) => {
                  const layout = eventLayout.layouts[event.id]
                  if (!layout) return null

                  const eventInfo = getEventDisplayInfo(event)

                  return (
                    <motion.div
                      key={event.id}
                      className={classNames(
                        "absolute rounded px-3 py-2 text-white text-xs pointer-events-auto cursor-move",
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
                        <div className="font-medium leading-tight text-sm">{event.title}</div>

                        {/* Always show time */}
                        <div className="flex items-center text-xs opacity-90">
                          <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="whitespace-nowrap">{eventInfo.time}</span>
                        </div>

                        {/* Show additional info on hover or if event is tall enough */}
                        {(hoveredEvent === event.id || getEventStyle(event, layout).height.replace("px", "") > 80) && (
                          <>
                            <div className="flex items-center text-xs opacity-90">
                              <User className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="leading-tight break-words">{eventInfo.studentName}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs opacity-90 flex-wrap gap-1">
                              <div className="flex items-center">
                                <Car className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span>{eventInfo.category}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="text-xs whitespace-nowrap">{eventInfo.phone}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Current time indicator */}
              {isToday() &&
                (() => {
                  const now = new Date()
                  const currentHour = now.getHours()
                  const currentMinute = now.getMinutes()

                  if (currentHour >= 3 && currentHour < 24) {
                    const top = (currentHour - 3) * 60 + currentMinute
                    return (
                      <div
                        className="absolute h-0.5 bg-red-500 w-full z-20 pointer-events-none"
                        style={{ top: `${top}px` }}
                      >
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
  )
}
