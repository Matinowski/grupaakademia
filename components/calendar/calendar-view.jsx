"use client"

import { useState } from "react"
import { ChevronDown, Clock, Car, User, Phone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Calendar({
  currentDate,
  events,
  onDateClick,
  onEventClick,
  onDragEvent,
  onDayClick,
  userRole = "admin",
}) {
  const [draggedEvent, setDraggedEvent] = useState(null)
  const [dragOverDate, setDragOverDate] = useState(null)
  const [expandedDays, setExpandedDays] = useState({})
  const [hoveredEvent, setHoveredEvent] = useState(null)

  console.log("events", events)

  // Utility function to conditionally join classNames
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
  }

  // Get number of days in current month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  // Create array of day numbers for current month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Add empty cells for days before first day of month
  const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => null)

  // Combine empty cells and days
  const allCells = [...emptyCells, ...days]

  // Create weeks (rows of 7 days)
  const weeks = []
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7))
  }

  // Check if date has events
  const getEventsForDate = (day) => {
    if (!day) return []

    const date = new Date(year, month, day)
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year
    })
  }

  // Filter events based on user role
  const filterEventsByRole = (events) => {
    if (userRole === "admin") return events // Admin sees all events

    return events.filter((event) => {
      if (userRole === "instructor" && event.instructor_id) return true
      if (userRole === "driver" && event.driver_id) return true
      return false
    })
  }

  // Day names
  const dayNames = ["Nie", "Pon", "Wto", "Śro", "Czw", "Pią", "Sob"]

  // Drag and drop handlers
  const handleDragStart = (e, event) => {
    e.stopPropagation()
    setDraggedEvent(event)
  }

  const handleDragOver = (e, day) => {
    e.preventDefault()
    if (day) {
      setDragOverDate(day)
    }
  }

  const handleDrop = (e, day) => {
    e.preventDefault()
    if (draggedEvent && day) {
      const newDate = new Date(year, month, day)
      onDragEvent(draggedEvent.id, newDate)
      setDraggedEvent(null)
      setDragOverDate(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedEvent(null)
    setDragOverDate(null)
  }

  // Toggle expanded day view for days with multiple events
  const toggleExpandDay = (day, e) => {
    e.stopPropagation()
    setExpandedDays((prev) => ({
      ...prev,
      [`${month}-${day}`]: !prev[`${month}-${day}`],
    }))
  }

  // Get event color based on type
  const getEventTypeColor = (event) => {
    const createdAt = new Date(event.created_at)
    const hour = createdAt.getHours()

    if (hour >= 14) {
      return "#FBBF24" // amber
    } else if (event.payment_due) {
      return "#FF0000" // Red for payment due
    } else {
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

  return (
    <div className="h-full p-4 bg-white">
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Day headers */}
        {dayNames.map((day, index) => (
          <div key={index} className="p-2 text-center font-medium bg-gray-50 text-gray-700">
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const dateEvents = getEventsForDate(day)
            const filteredEvents = filterEventsByRole(dateEvents)
            const isToday =
              day &&
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year

            const isDragOver = day && dragOverDate === day
            const isExpanded = expandedDays[`${month}-${day}`]
            const maxVisibleEvents = 3
            const visibleEvents = isExpanded ? filteredEvents : filteredEvents.slice(0, maxVisibleEvents)

            return (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                className={classNames(
                  "min-h-[140px] p-2 bg-white border-t relative transition-all",
                  day ? "cursor-pointer" : "",
                  isDragOver ? "bg-blue-50" : "",
                  isToday ? "ring-2 ring-blue-400 ring-inset" : "",
                )}
                onClick={() => day && onDateClick(new Date(year, month, day))}
                onDoubleClick={() => day && onDayClick(new Date(year, month, day))}
                onDragOver={(e) => handleDragOver(e, day)}
                onDrop={(e) => handleDrop(e, day)}
                whileHover={day ? { backgroundColor: "#F9FAFB" } : {}}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {day && (
                  <>
                    <div className="flex justify-end mb-2">
                      <div
                        className={classNames(
                          "flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full",
                          isToday ? "bg-blue-600 text-white" : "text-gray-700",
                        )}
                      >
                        {day}
                      </div>
                    </div>
                    <div className="mt-1 space-y-1">
                      <AnimatePresence>
                        {visibleEvents.map((event, eventIndex) => {
                          const eventInfo = getEventDisplayInfo(event)
                          const isHovered = hoveredEvent === event.id

                          return (
                            <motion.div
                              key={event.id}
                              className={classNames(
                                "px-2 py-1 text-xs rounded text-white cursor-move shadow-sm",
                                "border border-white/20 transition-all duration-200",
                                draggedEvent && draggedEvent.id === event.id ? "opacity-50" : "",
                                isHovered ? "ring-2 ring-white/50" : "",
                              )}
                              style={{
                                backgroundColor: getEventTypeColor(event),
                                minHeight: "42px",
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
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="space-y-0.5">
                                <div className="font-medium text-xs leading-tight truncate">{event.title}</div>
                                <div className="flex items-center justify-between text-xs opacity-90">
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                    {eventInfo.time}
                                  </div>
                                  <div className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="text-xs">{eventInfo.phone.slice(-4)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-xs opacity-90">
                                  <div className="flex items-center truncate flex-1 mr-2">
                                    <User className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{eventInfo.studentName}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Car className="w-3 h-3 mr-1 flex-shrink-0" />
                                    {eventInfo.category}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>

                      {filteredEvents.length > maxVisibleEvents && (
                        <motion.div
                          className="text-xs text-gray-500 pl-2 flex items-center cursor-pointer hover:text-blue-600"
                          onClick={(e) => toggleExpandDay(day, e)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronDown
                            className={classNames("w-3 h-3 mr-1 transition-transform", isExpanded ? "rotate-180" : "")}
                          />
                          {isExpanded ? "Pokaż mniej" : `+${filteredEvents.length - maxVisibleEvents} więcej`}
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )
          }),
        )}
      </div>
    </div>
  )
}
