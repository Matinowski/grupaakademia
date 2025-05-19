"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Clock, User, BookOpen, Car, Tag } from "lucide-react"

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
  const [showTooltip, setShowTooltip] = useState(null)
  const timeGridRef = useRef(null)

  // Utility function to conditionally join classNames
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
  }

  // Get start of week (Sunday)
  const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
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

  // Calculate event layout to prevent overlaps
  const calculateEventLayout = (events, day) => {
    if (!events.length) return {}

    // Filter events for this day
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      )
    })

    if (!dayEvents.length) return {}

    // Sort events by start time
    const sortedEvents = [...dayEvents].sort((a, b) => {
      const aStart =
        Number.parseInt(a.start_time.split(":")[0], 10) * 60 + Number.parseInt(a.start_time.split(":")[1], 10)
      const bStart =
        Number.parseInt(b.start_time.split(":")[0], 10) * 60 + Number.parseInt(b.start_time.split(":")[1], 10)
      return aStart - bStart
    })

    // Group overlapping events
    const groups = []
    let currentGroup = [sortedEvents[0]]

    for (let i = 1; i < sortedEvents.length; i++) {
      const event = sortedEvents[i]
      const eventStart =
        Number.parseInt(event.start_time.split(":")[0], 10) * 60 + Number.parseInt(event.start_time.split(":")[1], 10)

      // Check if this event overlaps with any event in the current group
      let overlaps = false
      for (const groupEvent of currentGroup) {
        const groupEventEnd =
          Number.parseInt(groupEvent.end_time.split(":")[0], 10) * 60 +
          Number.parseInt(groupEvent.end_time.split(":")[1], 10)
        if (eventStart < groupEventEnd) {
          overlaps = true
          break
        }
      }

      if (overlaps) {
        currentGroup.push(event)
      } else {
        groups.push([...currentGroup])
        currentGroup = [event]
      }
    }

    groups.push(currentGroup)

    // Calculate position for each event
    const eventLayout = {}

    groups.forEach((group) => {
      const groupSize = group.length

      group.forEach((event, index) => {
        eventLayout[event.id] = {
          width: groupSize > 1 ? `calc(${100 / groupSize}% - 4px)` : "calc(100% - 4px)",
          left: groupSize > 1 ? `calc(${(100 / groupSize) * index}% + 2px)` : "2px",
          zIndex: 10 + index, // Higher index events appear on top
        }
      })
    })

    return eventLayout
  }

  // Get event position and height
  const getEventStyle = (event) => {
    const eventStartHour = Number.parseInt(event.start_time.split(":")[0], 10)
    const eventStartMinute = Number.parseInt(event.start_time.split(":")[1], 10)
    const eventEndHour = Number.parseInt(event.end_time.split(":")[0], 10)
    const eventEndMinute = Number.parseInt(event.end_time.split(":")[1], 10)

    const startPosition = (eventStartHour - 3) * 60 + eventStartMinute
    const duration = (eventEndHour - eventStartHour) * 60 + (eventEndMinute - eventStartMinute)

    return {
      top: `${startPosition}px`,
      height: `${duration}px`,
      backgroundColor: getEventTypeColor(event),
    }
  }

  // Get event color based on type
  const getEventTypeColor = (event) => {
    if (!event.lessonType) return event.color || "#4285F4"

    switch (event.lessonType) {
      case "practical":
        return "#10B981" // green
      case "theory":
        return "#6366F1" // indigo
      case "exam":
        return "#F43F5E" // rose
      default:
        return event.color || "#4285F4" // blue
    }
  }

  // Get event details
  const getEventDetails = (event) => {
    const details = []

    if (event.start_time) {
      details.push(event.start_time)
    }

    if (event.driver_id) {
      const driver = event.driver || { name: "Kursant" }
      details.push(driver.name)
    }

    if (event.instructor_id) {
      const instructor = event.instructor || { name: "Instruktor" }
      if (userRole !== "instructor") {
        details.push(instructor.name)
      }
    }

    if (details.length > 0) {
      return details.join(" • ")
    }

    return ""
  }

  // Get start of week and days of week
  const startOfWeek = getStartOfWeek(currentDate)
  const daysOfWeek = getDaysOfWeek(startOfWeek)
  const hoursOfDay = getHoursOfDay()

  // Calculate event layouts for each day
  const eventLayouts = {}
  daysOfWeek.forEach((day) => {
    eventLayouts[day.toISOString()] = calculateEventLayout(events, day)
  })

  // Enhanced drag and drop handlers
  const handleDragStart = (e, event) => {
    e.stopPropagation()
    setDraggedEvent(event)

    // Calculate drag start position
    const rect = e.currentTarget.getBoundingClientRect()
    setDragStartY(e.clientY - rect.top)

    // Set the drag image to be transparent
    const dragImage = document.createElement("div")
    dragImage.style.opacity = "0"
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)

    // Clean up the drag image element after a short delay
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
      // Calculate new time based on drop position
      const dayColumnRect = e.currentTarget.getBoundingClientRect()
      const relativeY = e.clientY - dayColumnRect.top + e.currentTarget.scrollTop

      // Calculate hour and minute from pixel position
      const totalMinutes = Math.floor(relativeY)
      const newHour = Math.floor(totalMinutes / 60) + 3 // 3 is the start hour
      const newMinute = totalMinutes % 60

      // Format new times
      const newstart_time = `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`

      // Calculate event duration in minutes
      const startHour = Number.parseInt(draggedEvent.start_time.split(":")[0], 10)
      const startMinute = Number.parseInt(draggedEvent.start_time.split(":")[1], 10)
      const endHour = Number.parseInt(draggedEvent.end_time.split(":")[0], 10)
      const endMinute = Number.parseInt(draggedEvent.end_time.split(":")[1], 10)
      const durationMinutes = (endHour - startHour) * 60 + (endMinute - startMinute)

      // Calculate new end time
      const endTotalMinutes = totalMinutes + durationMinutes
      const newEndHour = Math.floor(endTotalMinutes / 60) + 3
      const newEndMinute = endTotalMinutes % 60
      const newend_time = `${newEndHour.toString().padStart(2, "0")}:${newEndMinute.toString().padStart(2, "0")}`

      // Check if we're moving to a different day
      const oldDate = new Date(draggedEvent.date)
      const sameDay =
        oldDate.getDate() === day.getDate() &&
        oldDate.getMonth() === day.getMonth() &&
        oldDate.getFullYear() === day.getFullYear()

      // If same day, just update the time
      if (sameDay) {
        onDragEventTime(draggedEvent.id, newstart_time, newend_time)
      } else {
        // If different day, update both date and time
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
    <div className="h-full bg-white overflow-auto">
      <div className="flex flex-col h-full">
        {/* Header with days */}
        <div className="flex border-b sticky top-0 bg-white z-10">
          <div className="w-16 flex-shrink-0 border-r bg-gray-50"></div>
          {daysOfWeek.map((day, index) => (
            <div
              key={index}
              className={classNames(
                "flex-1 text-center py-2 font-medium border-r",
                isToday(day) ? "bg-blue-50" : "bg-gray-50",
              )}
            >
              <div className={classNames("text-sm", isToday(day) ? "text-blue-600" : "text-gray-700")}>
                {formatDate(day)}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="flex flex-1 relative" ref={timeGridRef}>
          {/* Time labels */}
          <div className="w-16 flex-shrink-0 border-r">
            {hoursOfDay.map((hour) => (
              <div key={hour} className="h-[60px] border-b text-xs text-gray-500 text-right pr-2 pt-0">
                {formatTime(hour)}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {daysOfWeek.map((day, dayIndex) => (
            <div
              key={dayIndex}
              data-day-index={dayIndex}
              className="flex-1 border-r relative"
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

              {/* Events */}
              <div className="absolute inset-0 pointer-events-none">
                {getEventsForDay(day).map((event) => {
                  const layout = eventLayouts[day.toISOString()][event.id] || { width: "calc(100% - 4px)", left: "2px" }

                  return (
                    <motion.div
                      key={event.id}
                      className={classNames(
                        "absolute rounded px-2 py-1 text-white text-xs overflow-hidden pointer-events-auto cursor-move",
                        hoveredEvent === event.id ? "ring-2 ring-white" : "",
                      )}
                      style={{
                        ...getEventStyle(event),
                        width: layout.width,
                        left: layout.left,
                        zIndex: layout.zIndex || 10,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                      onDragEnd={handleDragEnd}
                      onMouseEnter={() => {
                        setHoveredEvent(event.id)
                        setShowTooltip(event.id)
                      }}
                      onMouseLeave={() => {
                        setHoveredEvent(null)
                        setShowTooltip(null)
                      }}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: draggedEvent && draggedEvent.id === event.id ? 0.5 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs text-white text-opacity-90 truncate">{getEventDetails(event)}</div>

                      {/* Tooltip */}
                      {showTooltip === event.id && (
                        <div className="absolute z-50 bg-white rounded-md shadow-lg p-2 text-sm w-56 left-full ml-2 mt-0 text-gray-800">
                          <div className="space-y-1">
                            <p className="font-medium">{event.title}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {event.start_time} - {event.end_time}
                            </div>
                            {event.driver_id && (
                              <div className="flex items-center text-xs text-gray-500">
                                <User className="w-3 h-3 mr-1" />
                                Kursant: {event.driver?.name || "Brak danych"}
                              </div>
                            )}
                            {event.instructor_id && (
                              <div className="flex items-center text-xs text-gray-500">
                                <BookOpen className="w-3 h-3 mr-1" />
                                Instruktor: {event.instructor?.name || "Brak danych"}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Current time indicator */}
          <div className="absolute left-16 right-0 z-20 pointer-events-none">
            {(() => {
              const now = new Date()
              const currentHour = now.getHours()
              const currentMinute = now.getMinutes()

              // Only show if current time is within view
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
  )
}
