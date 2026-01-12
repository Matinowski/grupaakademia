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

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => null)
  const allCells = [...emptyCells, ...days]

  const weeks = []
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7))
  }

  const getEventsForDate = (day) => {
    if (!day) return []

    const date = new Date(year, month, day)
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year
    })
  }

  const filterEventsByRole = (events) => {
    if (userRole === "admin") return events

    return events.filter((event) => {
      if (userRole === "instructor" && event.instructor_id) return true
      if (userRole === "driver" && event.driver_id) return true
      return false
    })
  }

  const dayNames = ["Nie", "Pon", "Wto", "Śro", "Czw", "Pią", "Sob"]

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

  const toggleExpandDay = (day, e) => {
    e.stopPropagation()
    setExpandedDays((prev) => ({
      ...prev,
      [`${month}-${day}`]: !prev[`${month}-${day}`],
    }))
  }

  const getEventTypeColor = (event) => {
    const createdAt = new Date(event.created_at)
    const hour = createdAt.getHours()

    if (event.is_too_late) {
      return "#FBBF24"
    } else if (event.payment_due) {
      return "#FF0000"
    } else {
      return event.calendar?.color || "#222222"
    }
  }

  const getEventDisplayInfo = (event) => {
    const info = {
      time: event.start_time,
      studentName: event.driver?.name || "Brak danych",
      category: event.driver?.license_type || "B",
      phone: event.driver?.phone || "Brak tel.",
      instructor: event.instructor?.name || "Brak instruktora",
    }
    return info
  }

  return (
    <div className="h-full p-1 sm:p-4 bg-white">
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden shadow-sm">
        {dayNames.map((day, index) => (
          <div
            key={index}
            className="p-1 sm:p-2 text-center text-[10px] sm:text-sm font-medium bg-gray-50 text-gray-700"
          >
            {day}
          </div>
        ))}

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
            const maxVisibleEvents = window.innerWidth < 640 ? 2 : 3
            const visibleEvents = isExpanded ? filteredEvents : filteredEvents.slice(0, maxVisibleEvents)

            return (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                className={classNames(
                  "min-h-[80px] sm:min-h-[140px] p-0.5 sm:p-2 bg-white border-t relative transition-all",
                  day ? "cursor-pointer" : "",
                  isDragOver ? "bg-blue-50" : "",
                  isToday ? "ring-1 sm:ring-2 ring-blue-400 ring-inset" : "",
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
                    <div className="flex justify-end mb-0.5 sm:mb-2">
                      <div
                        className={classNames(
                          "flex items-center justify-center w-5 h-5 sm:w-8 sm:h-8 text-[10px] sm:text-sm font-medium rounded-full",
                          isToday ? "bg-blue-600 text-white" : "text-gray-700",
                        )}
                      >
                        {day}
                      </div>
                    </div>
                    <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                      <AnimatePresence>
                        {visibleEvents.map((event, eventIndex) => {
                          const eventInfo = getEventDisplayInfo(event)
                          const isHovered = hoveredEvent === event.id

                          return (
                            <motion.div
                              key={event.id}
                              className={classNames(
                                "px-1 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-xs rounded text-white cursor-move shadow-sm",
                                "border border-white/20 transition-all duration-200",
                                draggedEvent && draggedEvent.id === event.id ? "opacity-50" : "",
                                isHovered ? "ring-2 ring-white/50" : "",
                              )}
                              style={{
                                backgroundColor: getEventTypeColor(event),
                                minHeight: window.innerWidth < 640 ? "28px" : "42px",
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
                                <div className="font-medium text-[9px] sm:text-xs leading-tight truncate">
                                  {event.title}
                                </div>
                                <div className="flex items-center justify-between text-[8px] sm:text-xs opacity-90">
                                  <div className="flex items-center">
                                    <Clock className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                                    <span className="text-[8px] sm:text-xs">{eventInfo.time}</span>
                                  </div>
                                  <div className="hidden sm:flex items-center">
                                    <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="text-xs">{eventInfo.phone.slice(-4)}</span>
                                  </div>
                                </div>
                                <div className="hidden sm:flex items-center justify-between text-xs opacity-90">
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
                          className="text-[8px] sm:text-xs text-gray-500 pl-1 sm:pl-2 flex items-center cursor-pointer hover:text-blue-600"
                          onClick={(e) => toggleExpandDay(day, e)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronDown
                            className={classNames(
                              "w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 transition-transform",
                              isExpanded ? "rotate-180" : "",
                            )}
                          />
                          {isExpanded ? "Mniej" : `+${filteredEvents.length - maxVisibleEvents}`}
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
