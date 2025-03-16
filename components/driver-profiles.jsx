"use client"

import { useState } from "react"
import { Search, User, Phone, Calendar, Clock, Plus } from "lucide-react"
// Importujemy funkcję translate
import { translate } from "@/lib/translations"

export default function DriverProfiles({ drivers, onSelectDriver, onAddDriver }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showAddDriverForm, setShowAddDriverForm] = useState(false)
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    email: "",
    licenseType: "B",
    startDate: "",
    completedHours: 0,
    remainingHours: 30,
    instructor: "",
    notes: "",
  })

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver)
    if (onSelectDriver) {
      onSelectDriver(driver)
    }
  }

  const handleAddDriverSubmit = (e) => {
    e.preventDefault()
    onAddDriver(newDriver)
    setNewDriver({
      name: "",
      phone: "",
      email: "",
      licenseType: "B",
      startDate: "",
      completedHours: 0,
      remainingHours: 30,
      instructor: "",
      notes: "",
    })
    setShowAddDriverForm(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewDriver({
      ...newDriver,
      [name]: value,
    })
  }

  return (
    <div className="h-full flex">
      {/* Driver list */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            {/* Zmieniamy tekst pola wyszukiwania */}
            <input
              type="text"
              placeholder={translate("driverProfiles.Search drivers...")}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Zmieniamy tekst przycisku dodawania */}
          <button
            className="mt-3 flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => setShowAddDriverForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            {translate("driverProfiles.Add New Driver")}
          </button>
        </div>

        <div className="divide-y">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedDriver?.id === driver.id ? "bg-blue-50" : ""}`}
              onClick={() => handleDriverSelect(driver)}
            >
              <div className="font-medium">{driver.name}</div>
              <div className="text-sm text-gray-500">{driver.phone}</div>
              <div className="text-sm text-gray-500">{driver.email}</div>
              <div className="mt-1 flex items-center">
                {/* Zmieniamy tekst statusu kursanta */}
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    driver.remainingHours === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {driver.remainingHours === 0
                    ? translate("driverProfiles.Completed")
                    : `${driver.remainingHours} ${translate("driverProfiles.hours")} ${translate("driverProfiles.remaining")}`}
                </span>
              </div>
            </div>
          ))}

          {filteredDrivers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {translate("driverProfiles.No drivers found matching")} "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Driver details */}
      <div className="w-2/3 overflow-y-auto">
        {selectedDriver ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedDriver.name}</h2>
                <p className="text-gray-500">
                  {translate("driverProfiles.License Type")}: {selectedDriver.licenseType}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedDriver.remainingHours === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {selectedDriver.remainingHours === 0
                  ? translate("driverProfiles.Training Completed")
                  : translate("driverProfiles.In Training")}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{translate("driverProfiles.Phone")}</div>
                  <div>{selectedDriver.phone}</div>
                </div>
              </div>

              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{translate("driverProfiles.Email")}</div>
                  <div>{selectedDriver.email}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{translate("driverProfiles.Start Date")}</div>
                  <div>{selectedDriver.startDate}</div>
                </div>
              </div>

              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{translate("driverProfiles.Instructor")}</div>
                  <div>{selectedDriver.instructor}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{translate("driverProfiles.Completed Hours")}</div>
                  <div>{selectedDriver.completedHours}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{translate("driverProfiles.Remaining Hours")}</div>
                  <div>{selectedDriver.remainingHours}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">{translate("driverProfiles.Progress")}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${(selectedDriver.completedHours / (selectedDriver.completedHours + selectedDriver.remainingHours)) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {Math.round(
                  (selectedDriver.completedHours / (selectedDriver.completedHours + selectedDriver.remainingHours)) *
                    100,
                )}
                % {translate("driverProfiles.complete")}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">{translate("driverProfiles.Notes")}</h3>
              <div className="p-4 bg-gray-50 rounded-md">
                {selectedDriver.notes || translate("driverProfiles.No notes available.")}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">{translate("driverProfiles.Upcoming Lessons")}</h3>
              {selectedDriver.upcomingLessons && selectedDriver.upcomingLessons.length > 0 ? (
                <div className="space-y-2">
                  {selectedDriver.upcomingLessons.map((lesson, index) => (
                    <div key={index} className="p-3 border rounded-md flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                      <div>
                        <div className="font-medium">
                          {lesson.date} at {lesson.time}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lesson.duration} hours with {lesson.instructor}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">{translate("driverProfiles.No upcoming lessons scheduled.")}</div>
              )}
            </div>
          </div>
        ) : showAddDriverForm ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{translate("driverProfiles.Add New Driver")}</h2>
            <form onSubmit={handleAddDriverSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("driverProfiles.Full Name")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newDriver.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("driverProfiles.Phone")}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={newDriver.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("driverProfiles.Email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newDriver.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("driverProfiles.License Type")}
                  </label>
                  <select
                    name="licenseType"
                    value={newDriver.licenseType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A - Motorcycle</option>
                    <option value="B">B - Car</option>
                    <option value="C">C - Truck</option>
                    <option value="D">D - Bus</option>
                    <option value="E">E - Trailer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("driverProfiles.Start Date")}
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={newDriver.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("driverProfiles.Instructor")}
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={newDriver.instructor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("driverProfiles.Completed Hours")}
                  </label>
                  <input
                    type="number"
                    name="completedHours"
                    value={newDriver.completedHours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("driverProfiles.Remaining Hours")}
                  </label>
                  <input
                    type="number"
                    name="remainingHours"
                    value={newDriver.remainingHours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translate("driverProfiles.Notes")}
                </label>
                <textarea
                  name="notes"
                  value={newDriver.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setShowAddDriverForm(false)}
                >
                  {translate("driverProfiles.Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {translate("driverProfiles.Add Driver")}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {translate("driverProfiles.Select a driver to view details or add a new driver.")}
          </div>
        )}
      </div>
    </div>
  )
}

