"use client"

import { useState } from "react"
import { User, ChevronDown, Clock, Tag, BookOpen, Car } from "lucide-react"
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
  const [showTooltip, setShowTooltip] = useState(null)
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
    const createdAt = new Date(event.created_at);
      const hour = createdAt.getHours();

    if(hour >= 14) {
      
    
    
        return "#FBBF24"; // amber

    } 
    else if (event.payment_due) {
     

      return "#FF0000" // Red for payment due
    }
    else {
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

  const getEventDetails = (event) => {
    const details = []

    if (event.start_time) {
      details.push(event.start_time)
    }

    if (event.driver_id) {
      const driverName = "Kursant"
      const driver = event.driver || { name: "Kursant" }
      details.push(driver.name)
    }

    if (event.instructor_id) {
      const instructorName = "Instruktor"
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
            const hasMoreEvents = filteredEvents.length > 3

            return (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                className={classNames(
                  "min-h-[120px] p-2 bg-white border-t relative transition-all",
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
                    <div className="flex justify-end">
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
                        {(isExpanded ? filteredEvents : filteredEvents.slice(0, 3)).map((event) => (
                          <div key={event.id} className="relative">
                            <motion.div
                              className={classNames(
                                "px-2 py-1 text-xs rounded text-white cursor-move relative group",
                                hoveredEvent === event.id ? "ring-2 ring-white" : "",
                              )}
                              style={{
                                backgroundColor: getEventTypeColor(event),
                                opacity: draggedEvent && draggedEvent.id === event.id ? 0.5 : 1,
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
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex flex-col">
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="text-xs text-white text-opacity-90 truncate">
                                  {getEventDetails(event)}
                                </div>
                              </div>

                              {/* Hover details - only show on hover */}
                              {hoveredEvent === event.id && (
                                <div className="absolute -right-1 -top-1 flex">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 shadow-sm">
                                    {event.payment_due ? "Płatność wymagana" : "Planowa lekcja"}
                                  </span>
                                </div>
                              )}
                            </motion.div>

                            {/* Custom tooltip */}
                            {showTooltip === event.id && (
                              <div className="absolute z-50 bg-white rounded-md shadow-lg p-2 text-sm w-56 left-0 mt-1">
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
                                  {event.description && (
                                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </AnimatePresence>

                      {hasMoreEvents && (
                        <motion.div
                          className="text-xs text-gray-500 pl-2 flex items-center cursor-pointer hover:text-blue-600"
                          onClick={(e) => toggleExpandDay(day, e)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronDown
                            className={classNames("w-3 h-3 mr-1 transition-transform", isExpanded ? "rotate-180" : "")}
                          />
                          {isExpanded ? "Pokaż mniej" : `+${filteredEvents.length - 3} więcej`}
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
