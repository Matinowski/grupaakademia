"use client"

import { useState, useEffect } from "react"
import { X, Trash, User, Search, BookOpen, Calendar, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function EventModal({
  date,
  event,
  calendars = [],
  drivers = [],
  instructors = [],
  selectedInstructorId = null, // Add this prop
  onClose,
  onSave,
  onDelete,
  userRole = "admin",
}) {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "09:00",
    end_time: "10:00",
    calendar_id: "",
    color: "#4285F4",
    driver_id: null,
    instructor_id: null,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("people")
  const [showDriverSearch, setShowDriverSearch] = useState(false)
  const [showInstructorSearch, setShowInstructorSearch] = useState(false)

  // Utility function to conditionally join classNames
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
  }

  useEffect(() => {
    if (event) {
      setEventData({
        ...event,
        date: formatDate(new Date(event.date)),
        start_time: event.start_time || "09:00",
        end_time: event.end_time || "10:00",
        driver_id: event.driver_id || null,
        instructor_id: event.instructor_id || null,
      })
    } else if (date) {
      // If a specific hour was clicked, set that as the start time
      let start_time = "09:00"
      let end_time = "10:00"

      if (date.getHours() !== 0) {
        start_time = `${date.getHours().toString().padStart(2, "0")}:00`
        end_time = `${(date.getHours() + 1).toString().padStart(2, "0")}:00`
      }

      // Default to first visible calendar
      const defaultCalendar = calendars.find((cal) => cal.visible) || calendars[0] || { id: 1, color: "#4285F4" }

      setEventData({
        ...eventData,
        date: formatDate(date),
        start_time,
        end_time,
        calendar_id: defaultCalendar.id,
        color: defaultCalendar.color,
        driver_id: null,
        instructor_id: selectedInstructorId, // Automatically assign selected instructor
      })
    }
  }, [event, date, calendars, selectedInstructorId]) // Add selectedInstructorId to dependencies

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "calendar_id") {
      const calendar_id = value
      const calendar = calendars.find((cal) => cal.id === calendar_id)
      setEventData({
        ...eventData,
        color: calendar ? calendar.color : eventData.color,
        calendar_id: calendar_id,
      })
    } else {
      setEventData({
        ...eventData,
        [name]: value,
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const formattedEvent = {
      ...eventData,
      id: event?.id || undefined,
      date: new Date(eventData.date),
      calendar_id: eventData.calendar_id,
      driver_id: eventData.driver_id,
      instructor_id: eventData.instructor_id,
    }
    console.log("Formatted Event:", formattedEvent)
    onSave(formattedEvent)
    onClose()
  }

  const handleDelete = () => {
    if (event && event.id) {
      onDelete(event.id)
      onClose()
    }
  }

  const handleSelectDriver = (driver) => {
    setEventData({
      ...eventData,
      driver_id: driver.id,
      title: eventData.title || `Lekcja jazdy z ${driver.name}`,
    })
    setShowDriverSearch(false)
    setSearchQuery("")
  }

  const handleRemoveDriver = () => {
    setEventData({
      ...eventData,
      driver_id: null,
    })
  }

  const handleSelectInstructor = (instructor) => {
    setEventData({
      ...eventData,
      instructor_id: instructor.id,
    })
    setShowInstructorSearch(false)
    setSearchQuery("")
  }

  const handleRemoveInstructor = () => {
    setEventData({
      ...eventData,
      instructor_id: null,
    })
  }

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone?.includes(searchQuery) ||
      driver.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter instructors based on search query
  const filteredInstructors = instructors.filter(
    (instructor) =>
      instructor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.phone?.includes(searchQuery) ||
      instructor.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get the selected entities
  const selectedDriver = drivers.find((driver) => driver.id === eventData.driver_id)
  const selectedInstructor = instructors.find((instructor) => instructor.id === eventData.instructor_id)

  // Check if user has permission to edit
  const canEdit = true

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{event ? "Edytuj Wydarzenie" : "Dodaj Wydarzenie"}</h2>
          <button className="p-1 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full">
          <div className="px-4 pt-4">
            <div className="grid w-full grid-cols-3 bg-gray-100 rounded-md p-1">
              
              <button
                className={classNames(
                  "flex items-center justify-center py-2 px-3 text-sm rounded-md transition-colors",
                  activeTab === "people" ? "bg-white shadow-sm" : "hover:bg-gray-200",
                )}
                onClick={() => setActiveTab("people")}
              >
                <User className="w-4 h-4 mr-2" />
                Uczestnicy
              </button>
              <button
                className={classNames(
                  "flex items-center justify-center py-2 px-3 text-sm rounded-md transition-colors",
                  activeTab === "basic" ? "bg-white shadow-sm" : "hover:bg-gray-200",
                )}
                onClick={() => setActiveTab("basic")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Dane podstawowe
              </button>
              <button
                className={classNames(
                  "flex items-center justify-center py-2 px-3 text-sm rounded-md transition-colors",
                  activeTab === "details" ? "bg-white shadow-sm" : "hover:bg-gray-200",
                )}
                onClick={() => setActiveTab("details")}
              >
                <Info className="w-4 h-4 mr-2" />
                Szczegóły
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === "basic" && (
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Tytul
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={eventData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <label htmlFor="calendar" className="block text-sm font-medium text-gray-700">
                    Kalendarz
                  </label>
                  <div className="flex items-center mt-1">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: eventData.color }}></div>
                    <select
                      id="calendar"
                      name="calendar_id"
                      value={eventData.calendar_id}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={!canEdit}
                    >
                      {calendars.map((calendar) => (
                        <option key={calendar.id} value={calendar.id}>
                          {calendar.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Data
                    </label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      value={eventData.date}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                      Godzina rozpoczecia
                    </label>
                    <input
                      id="start_time"
                      type="time"
                      name="start_time"
                      value={eventData.start_time}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                      Godzina zakoncznienia
                    </label>
                    <input
                      id="end_time"
                      type="time"
                      name="end_time"
                      value={eventData.end_time}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "people" && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kursant</label>
                  {selectedDriver ? (
                    <div className="flex items-center justify-between p-2 border rounded-md mt-1">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{selectedDriver.name}</div>
                          <div className="text-xs text-gray-500">{selectedDriver.phone}</div>
                        </div>
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 p-1 h-auto"
                          onClick={handleRemoveDriver}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full mt-1 flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => {
                        setShowDriverSearch(true)
                        setShowInstructorSearch(false)
                        setSearchQuery("")
                      }}
                      disabled={!canEdit}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Przypisz kursanta
                    </button>
                  )}

                  <AnimatePresence>
                    {showDriverSearch && (
                      <motion.div
                        className="mt-2 border rounded-md p-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search drivers..."
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {filteredDrivers.map((driver) => (
                            <div
                              key={driver.id}
                              className="p-2 hover:bg-gray-50 cursor-pointer rounded-md"
                              onClick={() => handleSelectDriver(driver)}
                            >
                              <div className="font-medium">{driver.name}</div>
                              <div className="text-xs text-gray-500">{driver.phone}</div>
                            </div>
                          ))}
                          {filteredDrivers.length === 0 && (
                            <div className="p-2 text-center text-gray-500 text-sm">Nie znaleziono kursantow</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Instruktor</label>
                  {selectedInstructor ? (
                    <div className="flex items-center justify-between p-2 border rounded-md mt-1">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {selectedInstructor.name + " " + selectedInstructor.surname}
                          </div>
                          <div className="text-xs text-gray-500">{selectedInstructor.phone}</div>
                        </div>
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 p-1 h-auto"
                          onClick={handleRemoveInstructor}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full mt-1 flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => {
                        setShowInstructorSearch(true)
                        setShowDriverSearch(false)
                        setSearchQuery("")
                      }}
                      disabled={!canEdit}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Przypisz Instruktora
                    </button>
                  )}

                  <AnimatePresence>
                    {showInstructorSearch && (
                      <motion.div
                        className="mt-2 border rounded-md p-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search instructors..."
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {filteredInstructors.map((instructor) => (
                            <div
                              key={instructor.id}
                              className="p-2 hover:bg-gray-50 cursor-pointer rounded-md"
                              onClick={() => handleSelectInstructor(instructor)}
                            >
                              <div className="font-medium">{instructor.name + " " + instructor.surname}</div>
                              <div className="text-xs text-gray-500">{instructor.phone}</div>
                            </div>
                          ))}
                          {filteredInstructors.length === 0 && (
                            <div className="p-2 text-center text-gray-500 text-sm">Nie znaleziono</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Opis
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={eventData.description}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canEdit}
                  ></textarea>
                </div>
              </div>
            )}

            <div className="flex justify-between p-4 border-t">
              {event && canEdit ? (
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={handleDelete}
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Usunąć
                </button>
              ) : (
                <div></div>
              )}

              <div className="space-x-2">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  Anuluj
                </button>
                {canEdit && (
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Zapisz
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
