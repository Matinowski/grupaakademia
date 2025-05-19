"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Clock, User, BookOpen, Car, Tag } from "lucide-react"

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
  const [showTooltip, setShowTooltip] = useState(null)
  const timeGridRef = useRef(null)

  // Utility function to conditionally join classNames
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
  }

  const calendarStartHour = 3
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

  // Format date for header
  const formatDateHeader = (date) => {
    return date.toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Get events for the current day
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

  // Get event position and height
  const getEventStyle = (event) => {
    const eventStartHour = Number.parseInt(event.start_time.split(":")[0], 10)
    const eventStartMinute = Number.parseInt(event.start_time.split(":")[1], 10)
    const eventEndHour = Number.parseInt(event.end_time.split(":")[0], 10)
    const eventEndMinute = Number.parseInt(event.end_time.split(":")[1], 10)

    const startPosition = (eventStartHour - calendarStartHour) * 60 + eventStartMinute
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

    if (event.start_time && event.end_time) {
      details.push(`${event.start_time} - ${event.end_time}`)
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

  // Drag and drop handlers
  const handleDragStart = (e, event) => {
    e.stopPropagation()
    setDraggedEvent(event)

    // Calculate drag start position
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
  
      // Zabezpieczenie przed wyjściem poza 23:59
      if (newHour > 23 || (newHour === 23 && newMinute > 59)) {
        newHour = 23
        newMinute = 59
      }
  
      const newstart_time = `${newHour.toString().padStart(2, "0")}:${newMinute
        .toString()
        .padStart(2, "0")}`
  
      const startHour = Number.parseInt(draggedEvent.start_time.split(":")[0], 10)
      const startMinute = Number.parseInt(draggedEvent.start_time.split(":")[1], 10)
      const endHour = Number.parseInt(draggedEvent.end_time.split(":")[0], 10)
      const endMinute = Number.parseInt(draggedEvent.end_time.split(":")[1], 10)
      const durationMinutes = (endHour - startHour) * 60 + (endMinute - startMinute)
  
      let endTotalMinutes = totalMinutes + durationMinutes
      let newEndHour = Math.floor(endTotalMinutes / 60) + calendarStartHour
      let newEndMinute = endTotalMinutes % 60
  
      // Korekta jeśli end_time wykracza poza zakres
      if (newEndHour > 23 || (newEndHour === 23 && newEndMinute > 59)) {
        newEndHour = 23
        newEndMinute = 59
      }
  
      const newend_time = `${newEndHour.toString().padStart(2, "0")}:${newEndMinute
        .toString()
        .padStart(2, "0")}`
  
      onDragEventTime(draggedEvent.id, newstart_time, newend_time)
  
      setDraggedEvent(null)
      setDragStartY(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedEvent(null)
    setDragStartY(null)
  }

  // Check if date is today
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

  // Calculate event layout to prevent overlaps
  const calculateEventLayout = (events) => {
    if (!events.length) return {}

    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => {
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

  const eventLayout = calculateEventLayout(dayEvents)

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="flex flex-col h-full">
        {/* Day header */}
        <div className="border-b sticky top-0 bg-white z-10 py-3 px-4">
          <h2 className={classNames("text-xl font-semibold", isToday() ? "text-blue-600" : "text-gray-800")}>
            {formatDateHeader(currentDate)}
            {isToday() && <span className="ml-2 text-sm font-normal text-blue-600">(Dzisiaj)</span>}
          </h2>
        </div>

        {/* Time grid */}
        <div className="flex flex-1 relative" ref={timeGridRef}>
          {/* Time labels */}
          <div className="w-20 flex-shrink-0 border-r">
            {hoursOfDay.map((hour) => (
              <div key={hour} className="h-[60px] border-b text-xs text-gray-500 text-right pr-2 pt-0">
                {formatTime(hour)}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="flex-1 relative">
            {/* Hour cells */}
            {hoursOfDay.map((hour) => (
              <div
                key={hour}
                className={classNames("h-[60px] border-b border-gray-100", isToday() ? "bg-blue-50/30" : "")}
                onClick={() => {
                  const clickedDate = new Date(currentDate)
                  clickedDate.setHours(hour)
                  onTimeClick(clickedDate)
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              ></div>
            ))}

            {/* Half-hour lines */}
            {hoursOfDay.map((hour) => (
              <div
                key={`half-${hour}`}
                className="absolute left-0 right-0 border-b border-dashed border-gray-100"
                style={{ top: `${(hour - 7) * 60 + 30}px` }}
              ></div>
            ))}

            {/* Events */}
            <div className="absolute inset-0 pointer-events-none">
              {dayEvents.map((event) => (
                <motion.div
                  key={event.id}
                  className={classNames(
                    "absolute rounded px-2 py-1 text-white text-xs overflow-hidden pointer-events-auto cursor-move",
                    hoveredEvent === event.id ? "ring-2 ring-white" : "",
                  )}
                  style={{
                    ...getEventStyle(event),
                    ...(eventLayout[event.id] || { width: "calc(100% - 4px)", left: "2px" }),
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
                        {event.description && <p className="text-xs text-gray-600 mt-1">{event.description}</p>}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Current time indicator */}
            {isToday() &&
              (() => {
                const now = new Date()
                const currentHour = now.getHours()
                const currentMinute = now.getMinutes()

                // Only show if current time is within view
                if (currentHour >= 7 && currentHour < 20) {
                  const top = (currentHour - 7) * 60 + currentMinute
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
  )
}
