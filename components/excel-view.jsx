"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Filter, User, Bike, Car, Truck, ChevronDown, ChevronRight } from "lucide-react"

// Prosty formatter daty
function formatDate(dateString) {
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  } catch (e) {
    return dateString
  }
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

// Główny komponent dashboardu
export function ExcelView() {
  const [loading, setLoading] = useState(true)
  const [drivers, setDrivers] = useState([])
  const [groupedDrivers, setGroupedDrivers] = useState({})
  const [dates, setDates] = useState([])
  const [licenseTypes, setLicenseTypes] = useState([])
  const [branches, setBranches] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [filterBranch, setFilterBranch] = useState("all")
  const [expandedAcademies, setExpandedAcademies] = useState({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    async function fetchDrivers() {
      try {
        setLoading(true)

        // Pobieranie danych z API
        const response = await fetch("/api/drivers")
        const data = await response.json()

        if (!data.drivers) {
          throw new Error("Nie udało się pobrać danych kierowców")
        }

        const driversData = data.drivers
        setDrivers(driversData)

        // Wyodrębnianie unikalnych dat, typów prawa jazdy i placówek
        const uniqueDates = [...new Set(driversData.map((driver) => driver.start_date))].sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime(),
        )

        const uniqueLicenseTypes = [...new Set(driversData.map((driver) => driver.license_type))]
        const uniqueBranches = [...new Set(driversData.map((driver) => driver.branch))]

        setDates(uniqueDates)
        setLicenseTypes(uniqueLicenseTypes)
        setBranches(uniqueBranches)

        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0])
        }

        // Grupowanie kierowców według daty, akademii, typu prawa jazdy i placówki
        const grouped = {}

        driversData.forEach((driver) => {
          const date = driver.start_date
          const licenseType = driver.license_type
          const branch = driver.branch
          const academy = categorizeAcademy(licenseType)

          if (!grouped[date]) {
            grouped[date] = { moto: {}, auto: {}, zawodowa: {} }
          }

          if (!grouped[date][academy][licenseType]) {
            grouped[date][academy][licenseType] = {}
          }

          if (!grouped[date][academy][licenseType][branch]) {
            grouped[date][academy][licenseType][branch] = []
          }

          grouped[date][academy][licenseType][branch].push(driver)
        })

        setGroupedDrivers(grouped)

        // Inicjalizacja rozwinięcia wszystkich akademii
        const initialExpandedAcademies = {}
        uniqueDates.forEach((date) => {
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

  const filteredBranches = filterBranch === "all" ? branches : branches.filter((branch) => branch === filterBranch)

  const academyConfig = {
    moto: {
      name: "MOTOAKADEMIA",
      description: "Kategorie prawa jazdy dla motorów",
      icon: Bike,
      color: "bg-red-600 text-white",
      headerBg: "bg-red-100",
      headerText: "text-red-800",
    },
    zawodowa: {
      name: "ZAWODOWA AKADEMIA",
      description: "Ciężarówki, autobusy, autokary, traktory",
      icon: Truck,
      color: "bg-green-600 text-white",
      headerBg: "bg-green-100",
      headerText: "text-green-800",
    },
    auto: {
      name: "AUTOAKADEMIA",
      description: "Samochody osobowe",
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
    <div className="space-y-6 bg-gray-50 min-h-screen p-4">
      {/* Nagłówek z datami i filtrem */}
      <div className="sticky top-0 z-10 bg-white pt-2 pb-4 border-b border-gray-200 shadow-sm p-4 rounded-md">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          {/* Selektor dat */}
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Wybierz datę</h2>
              <span className="text-sm text-gray-500">
                ({dates.length} {dates.length === 1 ? "data" : "daty"})
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedDate === date
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {formatDate(date)}
                </button>
              ))}
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
            const hasData = Object.keys(academyData).length > 0
            const isAcademyExpanded = expandedAcademies[selectedDate]?.[academyKey]

            if (!hasData) return null

            const IconComponent = config.icon
            const academyLicenseTypes = Object.keys(academyData).sort()

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
                            <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800 bg-gray-200 min-w-[150px]">
                              KATEGORIA
                            </th>
                            {filteredBranches.map((branch, index) => {
                              // Kolory dla nagłówków placówek
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
                                  className={`border border-gray-300 px-3 py-3 text-center font-bold ${colorClass} min-w-[180px]`}
                                >
                                  {branch}
                                </th>
                              )
                            })}
                          </tr>
                        </thead>

                        {/* Ciało tabeli z kategoriami i kursantami */}
                        <tbody>
                          {academyLicenseTypes.map((licenseType, rowIndex) => {
                            // Kolory dla kategorii
                            let categoryBg = "bg-gray-50"
                            let categoryText = "text-gray-800"

                            if (licenseType.startsWith("A")) {
                              categoryBg = "bg-red-50"
                              categoryText = "text-red-800"
                            } else if (licenseType.startsWith("B")) {
                              categoryBg = "bg-blue-50"
                              categoryText = "text-blue-800"
                            } else if (licenseType.startsWith("C")) {
                              categoryBg = "bg-green-50"
                              categoryText = "text-green-800"
                            } else if (licenseType.startsWith("D")) {
                              categoryBg = "bg-purple-50"
                              categoryText = "text-purple-800"
                            } else if (licenseType.startsWith("E")) {
                              categoryBg = "bg-amber-50"
                              categoryText = "text-amber-800"
                            } else if (licenseType.startsWith("T")) {
                              categoryBg = "bg-cyan-50"
                              categoryText = "text-cyan-800"
                            }

                            return (
                              <motion.tr
                                key={licenseType}
                                className="border-b border-gray-200 hover:bg-gray-50"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                              >
                                {/* Kolumna z kategorią */}
                                <td
                                  className={`border border-gray-300 px-4 py-4 font-bold ${categoryBg} ${categoryText}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color} text-xs font-bold`}
                                    >
                                      {licenseType}
                                    </div>
                                    <span>Kategoria {licenseType}</span>
                                  </div>
                                </td>

                                {/* Kolumny z kursantami dla każdej placówki */}
                                {filteredBranches.map((branch, colIndex) => {
                                  const branchDrivers = academyData[licenseType]?.[branch] || []

                                  // Kolory dla komórek
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
                                      className={`border border-gray-300 px-2 py-2 align-top ${cellBg} min-h-[60px]`}
                                    >
                                      {branchDrivers.length > 0 ? (
                                        <div className="space-y-1">
                                          {branchDrivers.map((driver, driverIndex) => (
                                            <motion.div
                                              key={driver.id}
                                              className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-sm"
                                              initial={{ opacity: 0, scale: 0.9 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              transition={{
                                                duration: 0.2,
                                                delay: rowIndex * 0.05 + driverIndex * 0.02,
                                              }}
                                              whileHover={{ scale: 1.02 }}
                                            >
                                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <User className="h-3 w-3 text-gray-600" />
                                              </div>
                                              <span className="font-medium text-gray-800 truncate">{driver.name}</span>
                                            </motion.div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center text-gray-400 text-sm py-4">Brak kursantów</div>
                                      )}
                                    </td>
                                  )
                                })}
                              </motion.tr>
                            )
                          })}
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

      {selectedDate &&
        Object.values(groupedDrivers[selectedDate] || {}).every((academy) => Object.keys(academy).length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Brak danych</h3>
            <p className="text-gray-500 text-center">Nie znaleziono kierowców dla wybranej daty.</p>
          </motion.div>
        )}
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
