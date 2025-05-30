"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, Users, Filter, MoreHorizontal } from "lucide-react"

export default function Header({
  currentDate,
  onPrevious,
  onNext,
  onToday,
  view,
  onViewChange,
  userRole = "admin",

}) {

  const [showViewDropdown, setShowViewDropdown] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)

  // Utility function to conditionally join classNames
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
  }

  // Format date for display
  const formatDate = () => {
    const options = {
      month: "long",
      year: "numeric",
    }

    if (view === "day") {
      options.day = "numeric"
    } else if (view === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const startMonth = startOfWeek.toLocaleDateString("default", { month: "short" })
      const endMonth = endOfWeek.toLocaleDateString("default", { month: "short" })

      return `${startOfWeek.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth} ${endOfWeek.getFullYear()}`
    }

    return currentDate.toLocaleDateString("default", options)
  }



  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center mb-4 sm:mb-0">
        <div className="flex items-center mr-4">
          <button
            className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-1"
            onClick={onPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onNext}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <h2 className="text-xl font-bold">{formatDate()}</h2>

        <button
          className="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          onClick={onToday}
        >
          Today
        </button>
      </div>

      <div className="flex items-center space-x-2">

        <div className="relative">
          <button
            className={classNames(
              "inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              showViewDropdown ? "bg-gray-50" : "",
            )}
            onClick={() => setShowViewDropdown(!showViewDropdown)}
          >
            {view === "month" && <CalendarIcon className="w-4 h-4 mr-2" />}
            {view === "week" && <Users className="w-4 h-4 mr-2" />}
            {view === "day" && <Clock className="w-4 h-4 mr-2" />}
            {view === "month" ? "Miesiąc" : view === "week" ? "Tydzień" : "Dzień"}
          </button>

          {showViewDropdown && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    onViewChange("month")
                    setShowViewDropdown(false)
                  }}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Miesiąc
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    onViewChange("week")
                    setShowViewDropdown(false)
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Tydzień
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    onViewChange("day")
                    setShowViewDropdown(false)
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Dzień
                </button>
              </div>
            </div>
          )}
        </div>



      </div>
    </div>
  )
}
