"use client"

import { useState } from "react"
import { User, ChevronDown } from 'lucide-react'

// Importujemy funkcje tłumaczące
import { translate, translateDayShort } from "@/lib/translations"

export default function Calendar({ currentDate, events, onDateClick, onEventClick, onDragEvent, onDayClick }) {
  const [draggedEvent, setDraggedEvent] = useState(null)
  const [dragOverDate, setDragOverDate] = useState(null)
  const [expandedDays, setExpandedDays] = useState({})

  // Pobierz liczbę dni w bieżącym miesiącu
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Pobierz pierwszy dzień miesiąca (0 = Niedziela, 1 = Poniedziałek, itd.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  // Utwórz tablicę numerów dni dla bieżącego miesiąca
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Dodaj puste komórki dla dni przed pierwszym dniem miesiąca
  const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => null)

  // Połącz puste komórki i dni
  const allCells = [...emptyCells, ...days]

  // Utwórz tygodnie (rzędy po 7 dni)
  const weeks = []
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7))
  }

  // Sprawdź, czy data ma wydarzenia
  const getEventsForDate = (day) => {
    if (!day) return []

    const date = new Date(year, month, day)
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year
    })
  }

  // Nazwy dni
  const dayNames = ["Nie", "Pon", "Wto", "Śro", "Czw", "Pią", "Sob"].map((day) => translateDayShort(day))

  // Obsługa przeciągnij i upuść
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

  // Przełącz rozszerzony widok dnia dla dni z wieloma wydarzeniami
  const toggleExpandDay = (day, e) => {
    e.stopPropagation()
    setExpandedDays((prev) => ({
      ...prev,
      [`${month}-${day}`]: !prev[`${month}-${day}`],
    }))
  }

  return (
    <div className="h-full p-4">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Nagłówki dni */}
        {dayNames.map((day, index) => (
          <div key={index} className="p-2 text-center text-sm font-medium text-gray-500 bg-white">
            {day}
          </div>
        ))}

        {/* Komórki kalendarza */}
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const dateEvents = getEventsForDate(day)
            const isToday =
              day &&
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year

            const isDragOver = day && dragOverDate === day
            const isExpanded = expandedDays[`${month}-${day}`]
            const hasMoreEvents = dateEvents.length > 3

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`min-h-[100px] p-1 bg-white border-t ${day ? "cursor-pointer" : ""} ${isDragOver ? "bg-blue-50" : ""}`}
                onClick={() => day && onDateClick(new Date(year, month, day))}
                onDoubleClick={() => day && onDayClick(new Date(year, month, day))}
                onDragOver={(e) => handleDragOver(e, day)}
                onDrop={(e) => handleDrop(e, day)}
              >
                {day && (
                  <>
                    <div
                      className={`text-right ${isToday ? "bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center ml-auto" : "text-gray-700"}`}
                    >
                      {day}
                    </div>
                    <div className="mt-1 space-y-1">
                      {(isExpanded ? dateEvents : dateEvents.slice(0, 3)).map((event) => (
                        <div
                          key={event.id}
                          className="px-2 py-1 text-xs truncate rounded text-white cursor-move"
                          style={{
                            backgroundColor: event.color || "#4285F4",
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
                          {event.driverId && <User className="inline-block w-3 h-3 mr-1" />}
                          <span>{event.title}</span>
                          <span className="text-xs ml-1">
                            {event.startTime}-{event.endTime}
                          </span>
                        </div>
                      ))}
                      {hasMoreEvents && (
                        <div
                          className="text-xs text-gray-500 pl-2 flex items-center cursor-pointer hover:text-blue-600"
                          onClick={(e) => toggleExpandDay(day, e)}
                        >
                          <ChevronDown
                            className={`w-3 h-3 mr-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                          {isExpanded
                            ? translate("common.Pokaż mniej")
                            : `+${dateEvents.length - 3} ${translate("common.więcej")}`}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}