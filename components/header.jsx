"use client"

import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
// Importujemy funkcje tłumaczące
import { translate, translateMonth, translateDay } from "@/lib/translations"

export default function Header({ currentDate, onPrevious, onNext, onToday, view, onViewChange }) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Zmieniamy formatowanie daty, żeby używało tłumaczeń
  let formattedDate
  if (view === "month") {
    formattedDate = `${translateMonth(monthNames[currentDate.getMonth()])} ${currentDate.getFullYear()}`
  } else {
    formattedDate = `${translateDay(dayNames[currentDate.getDay()])}, ${translateMonth(monthNames[currentDate.getMonth()])} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center space-x-4">
        {/* Zmień tekst przycisków */}
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          onClick={onToday}
        >
          {translate("header.Today")}
        </button>
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-full hover:bg-gray-100" onClick={onPrevious}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-100" onClick={onNext}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{formattedDate}</h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex border rounded-md overflow-hidden">
          {/* Zmień tekst przycisków widoku */}
          <button
            className={`px-4 py-2 text-sm font-medium ${view === "month" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
            onClick={() => onViewChange("month")}
          >
            {translate("header.Month")}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${view === "day" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
            onClick={() => onViewChange("day")}
          >
            {translate("header.Day")}
          </button>
        </div>
        {/* Zmień tekst przycisku Create */}
        <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1" />
          {translate("header.Create")}
        </button>
      </div>
    </header>
  )
}

