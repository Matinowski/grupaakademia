"use client"

import { useState, useEffect } from "react"
import { X, Trash, User, Search, BookOpen, Car } from "lucide-react"
// Importujemy funkcję translate
import { translate } from "@/lib/translations"

export default function EventModal({
  date,
  event,
  calendars,
  drivers,
  instructors,
  vehicles,
  onClose,
  onSave,
  onDelete,
}) {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    calendarId: 1,
    color: "#4285F4",
    driverId: null,
    instructorId: null,
    vehicleId: null,
    lessonType: "practical",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [showDriverSearch, setShowDriverSearch] = useState(false)
  const [showInstructorSearch, setShowInstructorSearch] = useState(false)
  const [showVehicleSearch, setShowVehicleSearch] = useState(false)

  useEffect(() => {
    if (event) {
      setEventData({
        ...event,
        date: formatDate(new Date(event.date)),
        startTime: event.startTime || "09:00",
        endTime: event.endTime || "10:00",
        driverId: event.driverId || null,
        instructorId: event.instructorId || null,
        vehicleId: event.vehicleId || null,
        lessonType: event.lessonType || "practical",
      })
    } else if (date) {
      // If a specific hour was clicked, set that as the start time
      let startTime = "09:00"
      let endTime = "10:00"

      if (date.getHours() !== 0) {
        startTime = `${date.getHours().toString().padStart(2, "0")}:00`
        endTime = `${(date.getHours() + 1).toString().padStart(2, "0")}:00`
      }

      // Default to first visible calendar
      const defaultCalendar = calendars.find((cal) => cal.visible) || calendars[0]

      setEventData({
        ...eventData,
        date: formatDate(date),
        startTime,
        endTime,
        calendarId: defaultCalendar.id,
        color: defaultCalendar.color,
        driverId: null,
        instructorId: null,
        vehicleId: null,
        lessonType: "practical",
      })
    }
  }, [event, date, calendars])

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "calendarId") {
      const calendarId = Number.parseInt(value, 10)
      const calendar = calendars.find((cal) => cal.id === calendarId)

      setEventData({
        ...eventData,
        calendarId,
        color: calendar ? calendar.color : eventData.color,
      })
    } else if (name === "lessonType") {
      // Auto-select calendar based on lesson type
      let calendarId = eventData.calendarId

      if (value === "practical") {
        const practicalCalendar = calendars.find((cal) => cal.name.includes("Practical"))
        if (practicalCalendar) calendarId = practicalCalendar.id
      } else if (value === "theory") {
        const theoryCalendar = calendars.find((cal) => cal.name.includes("Theory"))
        if (theoryCalendar) calendarId = theoryCalendar.id
      } else if (value === "exam") {
        const examCalendar = calendars.find((cal) => cal.name.includes("Exam"))
        if (examCalendar) calendarId = examCalendar.id
      }

      const calendar = calendars.find((cal) => cal.id === calendarId)

      setEventData({
        ...eventData,
        [name]: value,
        calendarId,
        color: calendar ? calendar.color : eventData.color,
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
      calendarId: Number.parseInt(eventData.calendarId, 10),
      driverId: eventData.driverId,
      instructorId: eventData.instructorId,
      vehicleId: eventData.vehicleId,
    }

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
      driverId: driver.id,
      title: eventData.title || `Driving Lesson with ${driver.name}`,
    })
    setShowDriverSearch(false)
    setSearchQuery("")
  }

  const handleRemoveDriver = () => {
    setEventData({
      ...eventData,
      driverId: null,
    })
  }

  const handleSelectInstructor = (instructor) => {
    setEventData({
      ...eventData,
      instructorId: instructor.id,
    })
    setShowInstructorSearch(false)
    setSearchQuery("")
  }

  const handleRemoveInstructor = () => {
    setEventData({
      ...eventData,
      instructorId: null,
    })
  }

  const handleSelectVehicle = (vehicle) => {
    setEventData({
      ...eventData,
      vehicleId: vehicle.id,
    })
    setShowVehicleSearch(false)
    setSearchQuery("")
  }

  const handleRemoveVehicle = () => {
    setEventData({
      ...eventData,
      vehicleId: null,
    })
  }

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter instructors based on search query
  const filteredInstructors = instructors.filter(
    (instructor) =>
      instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.phone.includes(searchQuery) ||
      instructor.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter vehicles based on search query and license type
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      (vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (eventData.lessonType !== "practical" ||
        vehicle.status === "available" ||
        (event && event.vehicleId === vehicle.id)),
  )

  // Get the selected entities
  const selectedDriver = drivers.find((driver) => driver.id === eventData.driverId)
  const selectedInstructor = instructors.find((instructor) => instructor.id === eventData.instructorId)
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === eventData.vehicleId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          {/* Zmieniamy tytuł modalu */}
          <h2 className="text-lg font-semibold text-gray-800">
            {event ? translate("eventModal.Edit Event") : translate("eventModal.Add Event")}
          </h2>
          <button className="p-1 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              {/* Zmieniamy wszystkie etykiety pól formularza */}
              <label className="block text-sm font-medium text-gray-700 mb-1">{translate("eventModal.Title")}</label>
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate("eventModal.Lesson Type")}
              </label>
              <select
                name="lessonType"
                value={eventData.lessonType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="practical">{translate("eventModal.Practical Driving")}</option>
                <option value="theory">{translate("eventModal.Theory Class")}</option>
                <option value="exam">{translate("eventModal.Driving Exam")}</option>
                <option value="other">{translate("eventModal.Other")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calendar</label>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: eventData.color }}></div>
                <select
                  name="calendarId"
                  value={eventData.calendarId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
              {selectedDriver ? (
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <div className="font-medium">{selectedDriver.name}</div>
                      <div className="text-xs text-gray-500">{selectedDriver.phone}</div>
                    </div>
                  </div>
                  <button type="button" className="text-red-500 hover:text-red-700" onClick={handleRemoveDriver}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => {
                    setShowDriverSearch(true)
                    setShowInstructorSearch(false)
                    setShowVehicleSearch(false)
                    setSearchQuery("")
                  }}
                >
                  <User className="w-4 h-4 mr-1" />
                  Assign Driver
                </button>
              )}

              {showDriverSearch && (
                <div className="mt-2 border rounded-md p-2">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search drivers..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <div className="p-2 text-center text-gray-500 text-sm">No drivers found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              {selectedInstructor ? (
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <div className="font-medium">{selectedInstructor.name}</div>
                      <div className="text-xs text-gray-500">{selectedInstructor.phone}</div>
                    </div>
                  </div>
                  <button type="button" className="text-red-500 hover:text-red-700" onClick={handleRemoveInstructor}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => {
                    setShowInstructorSearch(true)
                    setShowDriverSearch(false)
                    setShowVehicleSearch(false)
                    setSearchQuery("")
                  }}
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Assign Instructor
                </button>
              )}

              {showInstructorSearch && (
                <div className="mt-2 border rounded-md p-2">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search instructors..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <div className="font-medium">{instructor.name}</div>
                        <div className="text-xs text-gray-500">{instructor.phone}</div>
                      </div>
                    ))}
                    {filteredInstructors.length === 0 && (
                      <div className="p-2 text-center text-gray-500 text-sm">No instructors found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {eventData.lessonType === "practical" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                {selectedVehicle ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                      <Car className="w-5 h-5 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {selectedVehicle.make} {selectedVehicle.model}
                        </div>
                        <div className="text-xs text-gray-500">{selectedVehicle.licensePlate}</div>
                      </div>
                    </div>
                    <button type="button" className="text-red-500 hover:text-red-700" onClick={handleRemoveVehicle}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => {
                      setShowVehicleSearch(true)
                      setShowDriverSearch(false)
                      setShowInstructorSearch(false)
                      setSearchQuery("")
                    }}
                  >
                    <Car className="w-4 h-4 mr-1" />
                    Assign Vehicle
                  </button>
                )}

                {showVehicleSearch && (
                  <div className="mt-2 border rounded-md p-2">
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search vehicles..."
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredVehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="p-2 hover:bg-gray-50 cursor-pointer rounded-md"
                          onClick={() => handleSelectVehicle(vehicle)}
                        >
                          <div className="font-medium">
                            {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.licensePlate} •
                            <span
                              className={`${
                                vehicle.status === "available"
                                  ? "text-green-600"
                                  : vehicle.status === "in-use"
                                    ? "text-blue-600"
                                    : "text-red-600"
                              }`}
                            >
                              {vehicle.status === "available"
                                ? " Available"
                                : vehicle.status === "in-use"
                                  ? " In Use"
                                  : " Maintenance"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {filteredVehicles.length === 0 && (
                        <div className="p-2 text-center text-gray-500 text-sm">No suitable vehicles found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={eventData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={eventData.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            {event ? (
              <button
                type="button"
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash className="w-4 h-4 mr-1" />
                {translate("eventModal.Delete")}
              </button>
            ) : (
              <div></div>
            )}

            <div className="space-x-2">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={onClose}
              >
                {translate("eventModal.Cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {translate("eventModal.Save")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

