"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Filter, Lock, Building2, User, ChevronDown, ChevronRight } from "lucide-react"

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
  const [expandedLicenses, setExpandedLicenses] = useState({})
  const [expandedBranches, setExpandedBranches] = useState({})
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

        // Grupowanie kierowców według daty, typu prawa jazdy i placówki
        const grouped = {}

        driversData.forEach((driver) => {
          const date = driver.start_date
          const licenseType = driver.license_type
          const branch = driver.branch

          if (!grouped[date]) {
            grouped[date] = {}
          }

          if (!grouped[date][licenseType]) {
            grouped[date][licenseType] = {}
          }

          if (!grouped[date][licenseType][branch]) {
            grouped[date][licenseType][branch] = []
          }

          grouped[date][licenseType][branch].push(driver)
        })

        setGroupedDrivers(grouped)

        // Inicjalizacja rozwinięcia wszystkich licencji
        const initialExpandedLicenses = {}
        uniqueDates.forEach((date) => {
          initialExpandedLicenses[date] = {}
          uniqueLicenseTypes.forEach((license) => {
            initialExpandedLicenses[date][license] = true
          })
        })
        setExpandedLicenses(initialExpandedLicenses)

        // Inicjalizacja rozwinięcia wszystkich placówek
        const initialExpandedBranches = {}
        uniqueDates.forEach((date) => {
          initialExpandedBranches[date] = {}
          uniqueLicenseTypes.forEach((license) => {
            initialExpandedBranches[date][license] = {}
            uniqueBranches.forEach((branch) => {
              initialExpandedBranches[date][license][branch] = true
            })
          })
        })
        setExpandedBranches(initialExpandedBranches)
      } catch (error) {
        console.error("Błąd podczas pobierania danych kierowców:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  const toggleLicense = (date, license) => {
    setExpandedLicenses((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [license]: !prev[date]?.[license],
      },
    }))
  }

  const toggleBranch = (date, license, branch) => {
    setExpandedBranches((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [license]: {
          ...prev[date]?.[license],
          [branch]: !prev[date]?.[license]?.[branch],
        },
      },
    }))
  }

  const filteredBranches = filterBranch === "all" ? branches : branches.filter((branch) => branch === filterBranch)

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Nagłówek z datami i filtrem */}
      <div className="sticky top-0 z-10 bg-white pt-2 pb-4 border-b border-gray-200 shadow-sm p-4 rounded-md">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          {/* Nowy, uproszczony selektor dat */}
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Wybierz datę</h2>
              <span className="text-sm text-gray-500">
                ({dates.length} {dates.length === 1 ? "data" : "daty"})
              </span>
            </div>

            {/* Poziomy pasek dat */}
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

      {/* Główna zawartość */}
      {selectedDate && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 gap-6">
            {licenseTypes.map((licenseType) => {
              // Pomijamy, jeśli nie ma kierowców dla tego typu prawa jazdy w wybranej dacie
              if (!groupedDrivers[selectedDate]?.[licenseType]) return null

              const isExpanded = expandedLicenses[selectedDate]?.[licenseType]

              // Określenie koloru dla licencji bezpośrednio klasami Tailwind
              let licenseColorClass = "bg-gray-600 text-white" // domyślny
              if (licenseType.startsWith("A")) licenseColorClass = "bg-red-600 text-white"
              else if (licenseType.startsWith("B")) licenseColorClass = "bg-blue-600 text-white"
              else if (licenseType.startsWith("C")) licenseColorClass = "bg-green-600 text-white"
              else if (licenseType.startsWith("D")) licenseColorClass = "bg-purple-600 text-white"
              else if (licenseType.startsWith("E")) licenseColorClass = "bg-amber-600 text-white"
              else if (licenseType.startsWith("T")) licenseColorClass = "bg-cyan-600 text-white"

              return (
                <motion.div
                  key={licenseType}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  {/* Nagłówek typu prawa jazdy */}
                  <motion.div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleLicense(selectedDate, licenseType)}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${licenseColorClass}`}>
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Kategoria {licenseType}</h3>
                        <div className="text-sm text-gray-500">{formatDate(selectedDate)}</div>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </motion.div>
                  </motion.div>

                  {/* Zawartość dla typu prawa jazdy */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200"
                      >
                        {filteredBranches.map((branch) => {
                          const branchDrivers = groupedDrivers[selectedDate]?.[licenseType]?.[branch] || []

                          // Pomijamy, jeśli nie ma kierowców dla tej placówki
                          if (branchDrivers.length === 0) return null

                          const isBranchExpanded = expandedBranches[selectedDate]?.[licenseType]?.[branch]

                          // Określenie koloru dla placówki bezpośrednio klasami Tailwind
                          let branchColorClass
                          const branchIndex = branches.indexOf(branch) % 8

                          switch (branchIndex) {
                            case 0:
                              branchColorClass = "bg-blue-100 border-blue-300 text-blue-800"
                              break
                            case 1:
                              branchColorClass = "bg-green-100 border-green-300 text-green-800"
                              break
                            case 2:
                              branchColorClass = "bg-purple-100 border-purple-300 text-purple-800"
                              break
                            case 3:
                              branchColorClass = "bg-amber-100 border-amber-300 text-amber-800"
                              break
                            case 4:
                              branchColorClass = "bg-rose-100 border-rose-300 text-rose-800"
                              break
                            case 5:
                              branchColorClass = "bg-cyan-100 border-cyan-300 text-cyan-800"
                              break
                            case 6:
                              branchColorClass = "bg-indigo-100 border-indigo-300 text-indigo-800"
                              break
                            case 7:
                              branchColorClass = "bg-emerald-100 border-emerald-300 text-emerald-800"
                              break
                            default:
                              branchColorClass = "bg-gray-100 border-gray-300 text-gray-800"
                          }

                          return (
                            <motion.div key={branch} className="border-b border-gray-200 last:border-b-0" layout>
                              {/* Nagłówek placówki */}
                              <motion.div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleBranch(selectedDate, licenseType, branch)}
                                whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${branchColorClass}`}
                                  >
                                    <Building2 className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-800">{branch}</h4>
                                    <div className="text-sm text-gray-500">
                                      {branchDrivers.length}{" "}
                                      {branchDrivers.length === 1
                                        ? "kierowca"
                                        : branchDrivers.length < 5
                                          ? "kierowców"
                                          : "kierowców"}
                                    </div>
                                  </div>
                                </div>
                                <motion.div
                                  animate={{ rotate: isBranchExpanded ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="h-4 w-4 text-gray-500" />
                                </motion.div>
                              </motion.div>

                              {/* Lista kierowców dla placówki */}
                              <AnimatePresence>
                                {isBranchExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="px-4 pb-4"
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                      {branchDrivers.map((driver, index) => (
                                        <motion.div
                                          key={driver.id}
                                          className={`flex items-center gap-3 p-3 rounded-lg border ${branchColorClass}`}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{
                                            duration: 0.2,
                                            delay: index * 0.05,
                                          }}
                                          whileHover={{ scale: 1.03, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                                        >
                                          <div className="bg-white rounded-full p-1.5">
                                            <User className="h-4 w-4" />
                                          </div>
                                          <div className="font-medium truncate">{driver.name}</div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {selectedDate && Object.keys(groupedDrivers[selectedDate] || {}).length === 0 && (
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
    <div className="space-y-6 bg-white">
      <div className="animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-5 w-24 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
