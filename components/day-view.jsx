"use client"

import { useState } from "react"
import { User } from "lucide-react"

export default function DayView({ currentDate, events, onTimeClick, onEventClick, onDragEventTime }) {
  const [draggedEvent, setDraggedEvent] = useState(null)
  const [dragOverHour, setDragOverHour] = useState(null)

  // Generate hours for the day (from 0 to 23)
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Format hour for display (e.g., "9 AM", "2 PM")
  const formatHour = (hour) => {
    if (hour === 0) return "12 AM"
    if (hour === 12) return "12 PM"
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
    // Nie tłumaczymy AM/PM, ponieważ w polskim formacie czasu zwykle używa się 24-godzinnego formatu
  }

  // Get events for the current day
  const getDayEvents = () => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === currentDate.getDate() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  // Get the hour from a time string (e.g., "09:00" -> 9)
  const getHourFromTimeString = (timeString) => {
    if (!timeString) return 0
    const [hours] = timeString.split(":")
    return Number.parseInt(hours, 10)
  }

  // Get the minutes from a time string (e.g., "09:30" -> 30)
  const getMinutesFromTimeString = (timeString) => {
    if (!timeString) return 0
    const [, minutes] = timeString.split(":")
    return Number.parseInt(minutes || "0", 10)
  }

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeString) => {
    const hours = getHourFromTimeString(timeString)
    const minutes = getMinutesFromTimeString(timeString)
    return hours * 60 + minutes
  }

  // Check if two events overlap
  const eventsOverlap = (event1, event2) => {
    const start1 = timeToMinutes(event1.startTime)
    const end1 = timeToMinutes(event1.endTime)
    const start2 = timeToMinutes(event2.startTime)
    const end2 = timeToMinutes(event2.endTime)

    return start1 < end2 && start2 < end1
  }

  // Group overlapping events
  const groupOverlappingEvents = (events) => {
    if (!events.length) return []

    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

    const groups = []
    let currentGroup = [sortedEvents[0]]

    for (let i = 1; i < sortedEvents.length; i++) {
      const event = sortedEvents[i]

      // Check if this event overlaps with any event in the current group
      const overlapsWithGroup = currentGroup.some((groupEvent) => eventsOverlap(event, groupEvent))

      if (overlapsWithGroup) {
        currentGroup.push(event)
      } else {
        groups.push([...currentGroup])
        currentGroup = [event]
      }
    }

    if (currentGroup.length) {
      groups.push(currentGroup)
    }

    return groups
  }

  // Get events for a specific hour
  const getEventsForHour = (hour) => {
    return getDayEvents().filter((event) => {
      const startHour = getHourFromTimeString(event.startTime)
      const endHour = getHourFromTimeString(event.endTime)

      // Event starts in this hour or spans this hour
      return startHour === hour || (startHour < hour && endHour > hour)
    })
  }

  // Calculate event position and height based on start and end times
  const calculateEventStyle = (event, index = 0, total = 1) => {
    const startHour = getHourFromTimeString(event.startTime)
    const startMinute = getMinutesFromTimeString(event.startTime)

    const endHour = getHourFromTimeString(event.endTime)
    const endMinute = getMinutesFromTimeString(event.endTime)

    // Calculate top position (percentage within the hour)
    const topPercentage = (startMinute / 60) * 100

    // Calculate duration in minutes
    const durationMinutes = (endHour - startHour) * 60 + (endMinute - startMinute)

    // Calculate height based on duration (percentage of an hour)
    const heightPercentage = (durationMinutes / 60) * 100

    // Calculate width and left position for overlapping events
    const width = total > 1 ? `${100 / total}%` : "100%"
    const left = total > 1 ? `${(index / total) * 100}%` : "0"

    return {
      top: `${topPercentage}%`,
      height: `${heightPercentage}%`,
      backgroundColor: event.color || "#4285F4",
      width,
      left,
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e, event) => {
    e.stopPropagation()
    setDraggedEvent(event)
  }

  const handleDragOver = (e, hour) => {
    e.preventDefault()
    setDragOverHour(hour)
  }

  const handleDrop = (e, hour) => {
    e.preventDefault()
    if (draggedEvent) {
      // Calculate new start and end times
      const startHour = getHourFromTimeString(draggedEvent.startTime)
      const endHour = getHourFromTimeString(draggedEvent.endTime)
      const duration = endHour - startHour

      const newStartHour = hour
      const newEndHour = hour + duration

      // Format times as strings (e.g., "09:00")
      const formatTimeString = (h) => {
        return `${h.toString().padStart(2, "0")}:00`
      }

      onDragEventTime(draggedEvent.id, formatTimeString(newStartHour), formatTimeString(newEndHour))

      setDraggedEvent(null)
      setDragOverHour(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedEvent(null)
    setDragOverHour(null)
  }

  // Get current hour for highlighting
  const currentHour = new Date().getHours()
  const isCurrentDay =
    new Date().getDate() === currentDate.getDate() &&
    new Date().getMonth() === currentDate.getMonth() &&
    new Date().getFullYear() === currentDate.getFullYear()

  // Process all day events to find overlapping groups
  const dayEvents = getDayEvents()
  const eventGroups = groupOverlappingEvents(dayEvents)

  // Create a map of events to their position in their group
  const eventPositions = new Map()

  eventGroups.forEach((group) => {
    group.forEach((event, index) => {
      eventPositions.set(event.id, {
        index,
        total: group.length,
      })
    })
  })

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-[100px_1fr] min-h-full">
        {/* Time labels */}
        <div className="border-r">
          {hours.map((hour) => (
            <div key={hour} className="h-20 border-b flex items-center justify-end pr-2 text-sm text-gray-500">
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Hour slots */}
        <div className="relative">
          {hours.map((hour) => {
            const isNowHour = isCurrentDay && hour === currentHour
            const isDragOver = dragOverHour === hour

            return (
              <div
                key={hour}
                className={`h-20 border-b relative ${isNowHour ? "bg-blue-50" : ""} ${isDragOver ? "bg-blue-100" : ""}`}
                onClick={() => {
                  const date = new Date(currentDate)
                  date.setHours(hour)
                  date.setMinutes(0)
                  onTimeClick(date)
                }}
                onDragOver={(e) => handleDragOver(e, hour)}
                onDrop={(e) => handleDrop(e, hour)}
              >
                {/* Current time indicator */}
                {isNowHour && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-red-500"
                    style={{
                      top: `${(new Date().getMinutes() / 60) * 100}%`,
                    }}
                  ></div>
                )}

                {/* Events */}
                {getEventsForHour(hour).map((event) => {
                  const startHour = getHourFromTimeString(event.startTime)

                  // Only render the event at its start hour to avoid duplicates
                  if (startHour !== hour) return null

                  const position = eventPositions.get(event.id) || { index: 0, total: 1 }
                  const eventStyle = calculateEventStyle(event, position.index, position.total)

                  return (
                    <div
                      key={event.id}
                      className="absolute rounded px-2 py-1 text-white text-sm overflow-hidden cursor-move"
                      style={{
                        ...eventStyle,
                        opacity: draggedEvent && draggedEvent.id === event.id ? 0.5 : 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="font-medium flex items-center truncate">
                        {event.driverId && <User className="w-3 h-3 mr-1 flex-shrink-0" />}
                        <span className="truncate">{event.title}</span>
                      </div>
                      <div className="text-xs truncate">
                        {event.startTime} - {event.endTime}
                      </div>
                      {event.lessonType && (
                        <div className="text-xs mt-1 bg-black bg-opacity-20 inline-block px-1 rounded truncate">
                          {event.lessonType}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

