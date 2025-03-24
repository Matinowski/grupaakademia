"use client"

import { useState } from "react"
import { User } from 'lucide-react'

export default function DayView({ currentDate, events, onTimeClick, onEventClick, onDragEventTime }) {
  const [draggedEvent, setDraggedEvent] = useState(null)
  const [dragOverHour, setDragOverHour] = useState(null)

  // Generuj godziny dla dnia (od 0 do 23)
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Formatuj godzinę do wyświetlenia (np. "9:00", "14:00")
  const formatHour = (hour) => {
    return `${hour}:00`
    // W polskim formacie używamy 24-godzinnego zapisu
  }

  // Pobierz wydarzenia dla bieżącego dnia
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

  // Pobierz godzinę z ciągu czasu (np. "09:00" -> 9)
  const getHourFromTimeString = (timeString) => {
    if (!timeString) return 0
    const [hours] = timeString.split(":")
    return Number.parseInt(hours, 10)
  }

  // Pobierz minuty z ciągu czasu (np. "09:30" -> 30)
  const getMinutesFromTimeString = (timeString) => {
    if (!timeString) return 0
    const [, minutes] = timeString.split(":")
    return Number.parseInt(minutes || "0", 10)
  }

  // Konwertuj ciąg czasu na minuty od północy
  const timeToMinutes = (timeString) => {
    const hours = getHourFromTimeString(timeString)
    const minutes = getMinutesFromTimeString(timeString)
    return hours * 60 + minutes
  }

  // Sprawdź, czy dwa wydarzenia nakładają się
  const eventsOverlap = (event1, event2) => {
    const start1 = timeToMinutes(event1.startTime)
    const end1 = timeToMinutes(event1.endTime)
    const start2 = timeToMinutes(event2.startTime)
    const end2 = timeToMinutes(event2.endTime)

    return start1 < end2 && start2 < end1
  }

  // Grupuj nakładające się wydarzenia
  const groupOverlappingEvents = (events) => {
    if (!events.length) return []

    // Sortuj wydarzenia według czasu rozpoczęcia
    const sortedEvents = [...events].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

    const groups = []
    let currentGroup = [sortedEvents[0]]

    for (let i = 1; i < sortedEvents.length; i++) {
      const event = sortedEvents[i]

      // Sprawdź, czy to wydarzenie nakłada się z jakimkolwiek wydarzeniem w bieżącej grupie
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

  // Pobierz wydarzenia dla określonej godziny
  const getEventsForHour = (hour) => {
    return getDayEvents().filter((event) => {
      const startHour = getHourFromTimeString(event.startTime)
      const endHour = getHourFromTimeString(event.endTime)

      // Wydarzenie rozpoczyna się w tej godzinie lub obejmuje tę godzinę
      return startHour === hour || (startHour < hour && endHour > hour)
    })
  }

  // Oblicz pozycję wydarzenia i wysokość na podstawie czasów rozpoczęcia i zakończenia
  const calculateEventStyle = (event, index = 0, total = 1) => {
    const startHour = getHourFromTimeString(event.startTime)
    const startMinute = getMinutesFromTimeString(event.startTime)

    const endHour = getHourFromTimeString(event.endTime)
    const endMinute = getMinutesFromTimeString(event.endTime)

    // Oblicz pozycję górną (procent w ramach godziny)
    const topPercentage = (startMinute / 60) * 100

    // Oblicz czas trwania w minutach
    const durationMinutes = (endHour - startHour) * 60 + (endMinute - startMinute)

    // Oblicz wysokość na podstawie czasu trwania (procent godziny)
    const heightPercentage = (durationMinutes / 60) * 100

    // Oblicz szerokość i pozycję lewą dla nakładających się wydarzeń
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

  // Obsługa przeciągnij i upuść
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
      // Oblicz nowe czasy rozpoczęcia i zakończenia
      const startHour = getHourFromTimeString(draggedEvent.startTime)
      const endHour = getHourFromTimeString(draggedEvent.endTime)
      const duration = endHour - startHour

      const newStartHour = hour
      const newEndHour = hour + duration

      // Formatuj czasy jako ciągi (np. "09:00")
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

  // Pobierz bieżącą godzinę do podświetlenia
  const currentHour = new Date().getHours()
  const isCurrentDay =
    new Date().getDate() === currentDate.getDate() &&
    new Date().getMonth() === currentDate.getMonth() &&
    new Date().getFullYear() === currentDate.getFullYear()

  // Przetwórz wszystkie wydarzenia dnia, aby znaleźć nakładające się grupy
  const dayEvents = getDayEvents()
  const eventGroups = groupOverlappingEvents(dayEvents)

  // Utwórz mapę wydarzeń do ich pozycji w grupie
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
        {/* Etykiety czasu */}
        <div className="border-r">
          {hours.map((hour) => (
            <div key={hour} className="h-20 border-b flex items-center justify-end pr-2 text-sm text-gray-500">
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Sloty godzinowe */}
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
                {/* Wskaźnik bieżącego czasu */}
                {isNowHour && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-red-500"
                    style={{
                      top: `${(new Date().getMinutes() / 60) * 100}%`,
                    }}
                  ></div>
                )}

                {/* Wydarzenia */}
                {getEventsForHour(hour).map((event) => {
                  const startHour = getHourFromTimeString(event.startTime)

                  // Renderuj wydarzenie tylko w godzinie rozpoczęcia, aby uniknąć duplikatów
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