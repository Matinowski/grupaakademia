"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Filter,
  Bike,
  Car,
  Truck,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Phone,
} from "lucide-react"

// Poprawiona funkcja formatowania daty - unika problemów ze strefami czasowymi
function formatDate(dateString) {
  try {
    // Parsuj datę ręcznie, aby uniknąć problemów ze strefami czasowymi
    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, day) // month - 1 bo miesiące są 0-indeksowane
    const dayStr = date.getDate().toString().padStart(2, "0")
    const monthStr = (date.getMonth() + 1).toString().padStart(2, "0")
    const yearStr = date.getFullYear()
    return `${dayStr}.${monthStr}.${yearStr}`
  } catch (e) {
    return dateString
  }
}

// Dodaj nową funkcję do bezpiecznego parsowania dat
function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

// Dodaj funkcję do konwersji Date na string w formacie YYYY-MM-DD
function dateToString(date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Funkcja kategoryzująca typy prawa jazdy
function categorizeAcademy(licenseType) {
  if (licenseType.startsWith("A")) {
    return "moto"
  } else if (licenseType.startsWith("B")) {
    return "auto"
  } else if (
    licenseType.startsWith("C") ||
    licenseType.startsWith("D") ||
    licenseType.startsWith("T") ||
    licenseType.startsWith("E")
  ) {
    return "zawodowa"
  }
  return "auto"
}

// Funkcja zwracająca kolor dla kategorii
function getCategoryColor(licenseType) {
  if (licenseType.startsWith("A")) {
    return "bg-red-100 text-red-800 border-red-200"
  } else if (licenseType.startsWith("B")) {
    return "bg-blue-100 text-blue-800 border-blue-200"
  } else if (licenseType.startsWith("C")) {
    return "bg-green-100 text-green-800 border-green-200"
  } else if (licenseType.startsWith("D")) {
    return "bg-purple-100 text-purple-800 border-purple-200"
  } else if (licenseType.startsWith("E")) {
    return "bg-amber-100 text-amber-800 border-amber-200"
  } else if (licenseType.startsWith("T")) {
    return "bg-cyan-100 text-cyan-800 border-cyan-200"
  }
  return "bg-gray-100 text-gray-800 border-gray-200"
}

// Funkcja zwracająca kolor paska postępu
function getProgressColor(percentage) {
  if (percentage === 100) return "bg-green-500"
  if (percentage >= 75) return "bg-blue-500"
  if (percentage >= 50) return "bg-yellow-500"
  return "bg-red-500"
}

// Komponent kalendarza
function CustomCalendar({ availableDates, selectedDate, onDateSelect, onClose }) {
  console.log("Calendar received availableDates:", availableDates)
  console.log("Calendar selectedDate:", selectedDate)

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const monthNames = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ]

  const daysOfWeek = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"]

  // Funkcja sprawdzająca czy data jest dostępna
  const isDateAvailable = (date) => {
    const dateString = dateToString(date)
    const isAvailable = availableDates.includes(dateString)
    console.log(`Checking date ${dateString}, available: ${isAvailable}`)
    return isAvailable
  }

  // Funkcja sprawdzająca czy data jest wybrana
  const isDateSelected = (date) => {
    const dateString = dateToString(date)
    return selectedDate === dateString
  }

  // Generowanie dni miesiąca
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    // Znajdź pierwszy poniedziałek
    const dayOfWeek = firstDay.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(firstDay.getDate() - mondayOffset)

    const days = []
    const currentDate = new Date(startDate)
    // Generuj 42 dni (6 tygodni)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        {/* Nagłówek kalendarza */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dni tygodnia */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Dni miesiąca */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth
            const isAvailable = isDateAvailable(date)
            const isSelected = isDateSelected(date)
            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <button
                key={index}
                onClick={() => {
                  if (isAvailable) {
                    onDateSelect(dateToString(date))
                    onClose()
                  }
                }}
                disabled={!isAvailable}
                className={`
                  h-10 w-10 rounded-full text-sm font-medium transition-all duration-200
                  ${!isCurrentMonth ? "text-gray-300" : ""}
                  ${isAvailable && isCurrentMonth ? "hover:bg-blue-100 cursor-pointer" : ""}
                  ${!isAvailable ? "cursor-not-allowed opacity-50" : ""}
                  ${isSelected ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                  ${isToday && !isSelected ? "bg-blue-100 text-blue-600" : ""}
                  ${isAvailable && isCurrentMonth && !isSelected ? "bg-green-100 text-green-800" : ""}
                `}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
            <span className="text-gray-600">Dostępne daty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-gray-600">Wybrana data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
            <span className="text-gray-600">Dzisiaj</span>
          </div>
        </div>

        {/* Przycisk zamknij */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </motion.div>
    </motion.div>
  )
}

// Komponent do dodawania nowej daty
function AddDateModal({ isOpen, onClose, onAddDate }) {
  const [newDate, setNewDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newDate) return

    setIsLoading(true)
    setError("")

    try {
      // Walidacja formatu daty
      const date = new Date(newDate)
      if (isNaN(date.getTime())) {
        throw new Error("Nieprawidłowy format daty")
      }

      // Wywołanie funkcji dodawania daty
      await onAddDate(newDate)
      setNewDate("")
      onClose()
    } catch (err) {
      setError(err.message || "Błąd podczas dodawania daty")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Dodaj nową datę</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newDate" className="block text-sm font-medium text-gray-700 mb-2">
              Data (YYYY-MM-DD)
            </label>
            <input
              type="date"
              id="newDate"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isLoading || !newDate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isLoading ? "Dodawanie..." : "Dodaj datę"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Główny komponent dashboardu
export function ExcelView() {
  const [loading, setLoading] = useState(true)
  const [drivers, setDrivers] = useState([])
  const [groupedDrivers, setGroupedDrivers] = useState({})
  const [dates, setDates] = useState([]) // Dostępne daty z API
  const [licenseTypes, setLicenseTypes] = useState([])
  const [branches, setBranches] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [filterBranch, setFilterBranch] = useState("all")
  const [expandedAcademies, setExpandedAcademies] = useState({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isAddDateModalOpen, setIsAddDateModalOpen] = useState(false)

  // Funkcja pobierania kierowców
  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/drivers")
      const data = await response.json()

      if (!data.drivers) {
        throw new Error("Nie udało się pobrać danych kierowców")
      }

      const driversData = data.drivers

      setDrivers(driversData)

      // Użyj data.dates zamiast wyodrębniania dat z kierowców
      const datesData = data.dates || []
      console.log("Raw dates data from API:", datesData)

      // Wyodrębnij właściwość 'data' z każdego obiektu daty
      const availableDates = datesData.map((dateObj) => dateObj.data)
      console.log("Available dates from API:", availableDates)

      // Sortuj daty od najnowszej do najstarszej
      const sortedDates = availableDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

      const uniqueLicenseTypes = [...new Set(driversData.map((driver) => driver.license_type))]
      const allBranches = [
  "Widzew",
  "Bałuty",
  "Zgierz",
  "Górna",
  "Dąbrowa",
  "Retkinia",
  "Centrum",
  "Ozorków",
]

setBranches(allBranches)

      setDates(sortedDates)
      setLicenseTypes(uniqueLicenseTypes)


      // Ustaw pierwszą dostępną datę jako wybraną, jeśli nie ma wybranej daty
      if (sortedDates.length > 0 && !selectedDate) {
        setSelectedDate(sortedDates[0])
      }

      // Grupowanie danych - użyj course_dates.data lub start_date
      const grouped = {}

      // Inicjalizuj wszystkie dostępne daty, nawet te bez kierowców
      sortedDates.forEach((date) => {
        grouped[date] = { moto: {}, auto: {}, zawodowa: {} }
      })

      // Dodaj kierowców do odpowiednich dat
      driversData.forEach((driver) => {
        const date = driver.course_dates?.data || driver.start_date
        const branch = driver.branch
        const academy = categorizeAcademy(driver.license_type)

        // Sprawdź czy data kierowcy jest w dostępnych datach
        if (sortedDates.includes(date)) {
          if (!grouped[date][academy][branch]) {
            grouped[date][academy][branch] = []
          }
          grouped[date][academy][branch].push(driver)
        }
      })

      setGroupedDrivers(grouped)

      // Inicjalizacja rozwinięcia wszystkich akademii dla wszystkich dostępnych dat
      const initialExpandedAcademies = {}
      sortedDates.forEach((date) => {
        initialExpandedAcademies[date] = {
          moto: true,
          auto: true,
          zawodowa: true,
        }
      })
      setExpandedAcademies(initialExpandedAcademies)
    } catch (error) {
      console.error("Błąd podczas pobierania danych kierowców:", error)
    } finally {
      setLoading(false)
    }
  }

  // Funkcja dodawania nowej daty
  const handleAddDate = async (newDate) => {
    try {
      const response = await fetch("/api/dates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: newDate }),
      })

      if (!response.ok) {
        throw new Error("Błąd podczas dodawania daty")
      }

      // Odśwież dane po dodaniu nowej daty
      await fetchDrivers()
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const toggleAcademy = (date, academy) => {
    setExpandedAcademies((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [academy]: !prev[date]?.[academy],
      },
    }))
  }

  const academyConfig = {
    moto: {
      name: "MOTOAKADEMIA",
      description: "",
      icon: Bike,
      color: "bg-red-600 text-white",
      headerBg: "bg-red-100",
      headerText: "text-red-800",
    },
    zawodowa: {
      name: "ZAWODOWA AKADEMIA",
      description: "",
      icon: Truck,
      color: "bg-green-600 text-white",
      headerBg: "bg-green-100",
      headerText: "text-green-800",
    },
    auto: {
      name: "AUTOAKADEMIA",
      description: "",
      icon: Car,
      color: "bg-blue-600 text-white",
      headerBg: "bg-blue-100",
      headerText: "text-blue-800",
    },
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4 overflow-y-scroll">
      {/* Nagłówek z kalendarzem i filtrem */}
      <div className="sticky top-0 z-10 bg-white pt-2 pb-4 border-b border-gray-200 shadow-sm p-4 rounded-md">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          {/* Selektor dat z kalendarzem */}
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Wybierz datę</h2>
              <span className="text-sm text-gray-500">
                ({dates.length} {dates.length === 1 ? "data" : "daty"})
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-gray-800 min-w-[200px]"
              >
                <Calendar className="h-4 w-4" />
                <span>{selectedDate ? formatDate(selectedDate) : "Wybierz datę"}</span>
              </button>
              <button
                onClick={() => setIsAddDateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj datę</span>
              </button>
            </div>
          </div>

          {/* Filtr placówek */}
          <div className="relative w-full md:w-auto">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Filtruj placówkę</h2>
            </div>
            <div className="relative inline-block w-full md:w-auto">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-between w-full md:w-[200px] px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-gray-800"
              >
                <span>{filterBranch === "all" ? "Wszystkie placówki" : filterBranch}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-1 w-full md:w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setFilterBranch("all")
                        setIsFilterOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                    >
                      Wszystkie placówki
                    </button>
                    {branches.map((branch) => (
                      <button
                        key={branch}
                        onClick={() => {
                          setFilterBranch(branch)
                          setIsFilterOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                      >
                        {branch}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Główna zawartość - 3 tabele akademii */}
      {selectedDate && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {Object.entries(academyConfig).map(([academyKey, config]) => {
            const academyData = groupedDrivers[selectedDate]?.[academyKey] || {}
            const hasData = Object.keys(academyData).some((branch) => academyData[branch]?.length > 0)
            const isAcademyExpanded = expandedAcademies[selectedDate]?.[academyKey]
            const IconComponent = config.icon

            return (
              <motion.div
                key={academyKey}
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                layout
              >
                {/* Nagłówek akademii */}
                <motion.div
                  className={`${config.headerBg} border-b border-gray-300 p-4 cursor-pointer hover:opacity-90`}
                  onClick={() => toggleAcademy(selectedDate, academyKey)}
                  whileHover={{ scale: 1.005 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.color} shadow-md`}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${config.headerText}`}>{config.name}</h2>
                        <p className="text-sm text-gray-600">{config.description}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isAcademyExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-full p-2 shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Tabela akademii */}
                <AnimatePresence>
                  {isAcademyExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-x-auto"
                    >
                      <table className="w-full border-collapse">
                        {/* Nagłówek tabeli z placówkami */}
                        <thead>
                          <tr className="bg-gray-100 border-b-2 border-gray-300">
                            {branches.map((branch, index) => {
                              const branchColors = [
                                "bg-blue-50 text-blue-800",
                                "bg-green-50 text-green-800",
                                "bg-purple-50 text-purple-800",
                                "bg-amber-50 text-amber-800",
                                "bg-rose-50 text-rose-800",
                                "bg-cyan-50 text-cyan-800",
                                "bg-indigo-50 text-indigo-800",
                                "bg-emerald-50 text-emerald-800",
                              ]
                              const colorClass = branchColors[index % branchColors.length]

                              return (
                                <th
                                  key={branch}
                                  className={`border border-gray-300 px-3 py-3 text-center font-bold ${colorClass} min-w-[280px]`}
                                >
                                  {branch}
                                </th>
                              )
                            })}
                          </tr>
                        </thead>

                        {/* Ciało tabeli z kursantami */}
                        <tbody>
                          <tr className="border-b border-gray-200">
                            {branches.map((branch, colIndex) => {
                              let branchDrivers = academyData[branch] || []

                              if (filterBranch !== "all" && branch !== filterBranch) {
                                branchDrivers = []
                              }

                              const cellColors = [
                                "bg-blue-25",
                                "bg-green-25",
                                "bg-purple-25",
                                "bg-amber-25",
                                "bg-rose-25",
                                "bg-cyan-25",
                                "bg-indigo-25",
                                "bg-emerald-25",
                              ]
                              const cellBg = cellColors[colIndex % cellColors.length] || "bg-white"

                              return (
                                <td
                                  key={branch}
                                  className={`border border-gray-300 px-2 py-2 align-top ${cellBg} min-h-[100px]`}
                                >
                                  {branchDrivers.length > 0 ? (
                                    <div className="space-y-3">
                                      {branchDrivers.map((driver, driverIndex) => {
                                        const totalHours = driver.completed_hours + driver.remaining_hours
                                        const progressPercentage =
                                          totalHours > 0 ? Math.round((driver.completed_hours / totalHours) * 100) : 0

                                        return (
                                          <motion.div
                                            key={driver.id}
                                            className="flex flex-col gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                              duration: 0.2,
                                              delay: driverIndex * 0.02,
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                          >
                                            {/* Nagłówek z numerem i imieniem */}
                                            <div className="flex items-start gap-3">
                                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                                                {driverIndex + 1}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-800 truncate text-sm">
                                                  {driver.name}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Kategoria prawa jazdy */}
                                            <div className="flex justify-center">
                                              <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                                                  driver.license_type,
                                                )}`}
                                              >
                                                {driver.license_type}
                                              </span>
                                            </div>
                                          </motion.div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-center text-gray-400 text-sm py-8">Brak kursantów</div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Brak wybranej daty */}
      {!selectedDate && dates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Wybierz datę</h3>
          <p className="text-gray-500 text-center">Kliknij przycisk kalendarza, aby wybrać datę do wyświetlenia.</p>
        </motion.div>
      )}

      {/* Brak dostępnych dat */}
      {dates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Brak dostępnych dat</h3>
          <p className="text-gray-500 text-center mb-4">Nie znaleziono żadnych dostępnych dat.</p>
          <button
            onClick={() => setIsAddDateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Dodaj pierwszą datę</span>
          </button>
        </motion.div>
      )}

      {/* Kalendarz */}
      <AnimatePresence>
        {isCalendarOpen && (
          <CustomCalendar
            availableDates={dates}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onClose={() => setIsCalendarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal dodawania daty */}
      <AnimatePresence>
        {isAddDateModalOpen && (
          <AddDateModal
            isOpen={isAddDateModalOpen}
            onClose={() => setIsAddDateModalOpen(false)}
            onAddDate={handleAddDate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4">
      <div className="animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      <div className="space-y-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="p-4 bg-gray-100 border-b border-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-5 w-48 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
