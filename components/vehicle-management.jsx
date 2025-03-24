"use client"

import { useState } from "react"
import { Search, Car, Calendar, Clock, Plus, PenToolIcon as Tool, AlertTriangle } from "lucide-react"

export default function VehicleManagement({ vehicles, onSelectVehicle, onAddVehicle, onUpdateVehicle }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false)
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    licenseType: "B",
    status: "available",
    lastMaintenance: "",
    nextMaintenance: "",
    mileage: "",
    notes: "",
  })
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)
  const [maintenanceRecord, setMaintenanceRecord] = useState({
    date: "",
    type: "regular",
    description: "",
    cost: "",
    mileage: "",
  })

  // Filtruj pojazdy na podstawie zapytania wyszukiwania
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle)
    if (onSelectVehicle) {
      onSelectVehicle(vehicle)
    }
  }

  const handleAddVehicleSubmit = (e) => {
    e.preventDefault()
    onAddVehicle(newVehicle)
    setNewVehicle({
      make: "",
      model: "",
      year: "",
      licensePlate: "",
      licenseType: "B",
      status: "available",
      lastMaintenance: "",
      nextMaintenance: "",
      mileage: "",
      notes: "",
    })
    setShowAddVehicleForm(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewVehicle({
      ...newVehicle,
      [name]: value,
    })
  }

  const handleMaintenanceInputChange = (e) => {
    const { name, value } = e.target
    setMaintenanceRecord({
      ...maintenanceRecord,
      [name]: value,
    })
  }

  const handleAddMaintenanceSubmit = (e) => {
    e.preventDefault()

    // Dodaj rekord konserwacji do pojazdu
    const updatedVehicle = {
      ...selectedVehicle,
      maintenanceHistory: [
        ...(selectedVehicle.maintenanceHistory || []),
        {
          ...maintenanceRecord,
          id: Date.now(),
        },
      ],
      lastMaintenance: maintenanceRecord.date,
      nextMaintenance: calculateNextMaintenanceDate(maintenanceRecord.date),
      mileage: maintenanceRecord.mileage,
    }

    onUpdateVehicle(updatedVehicle)
    setShowMaintenanceForm(false)
    setMaintenanceRecord({
      date: "",
      type: "regular",
      description: "",
      cost: "",
      mileage: "",
    })
  }

  const calculateNextMaintenanceDate = (currentDate) => {
    // Oblicz następną datę konserwacji (3 miesiące od bieżącej)
    const date = new Date(currentDate)
    date.setMonth(date.getMonth() + 3)
    return date.toISOString().split("T")[0]
  }

  const getMaintenanceStatus = (vehicle) => {
    if (!vehicle.nextMaintenance) return "unknown"

    const today = new Date()
    const nextMaintenance = new Date(vehicle.nextMaintenance)
    const diffTime = nextMaintenance - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "overdue"
    if (diffDays < 14) return "due-soon"
    return "ok"
  }

  return (
    <div className="h-full flex">
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj pojazdów..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="mt-3 flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => setShowAddVehicleForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Dodaj Nowy Pojazd
          </button>
        </div>

        <div className="divide-y">
          {filteredVehicles.map((vehicle) => {
            const maintenanceStatus = getMaintenanceStatus(vehicle)

            return (
              <div
                key={vehicle.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedVehicle?.id === vehicle.id ? "bg-blue-50" : ""}`}
                onClick={() => handleVehicleSelect(vehicle)}
              >
                <div className="font-medium">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </div>
                <div className="text-sm text-gray-500">Tablica: {vehicle.licensePlate}</div>
                <div className="text-sm text-gray-500">Typ: {vehicle.licenseType}</div>
                <div className="mt-1 flex items-center space-x-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      vehicle.status === "available"
                        ? "bg-green-100 text-green-800"
                        : vehicle.status === "in-use"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {vehicle.status === "available" ? "Dostępny" : vehicle.status === "in-use" ? "W użyciu" : "Serwis"}
                  </span>

                  {maintenanceStatus === "overdue" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Przegląd zaległy
                    </span>
                  )}

                  {maintenanceStatus === "due-soon" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      Przegląd wkrótce
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {filteredVehicles.length === 0 && (
            <div className="p-8 text-center text-gray-500">Nie znaleziono pojazdów pasujących do "{searchQuery}"</div>
          )}
        </div>
      </div>

      {/* Szczegóły pojazdu */}
      <div className="w-2/3 overflow-y-auto">
        {selectedVehicle ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                </h2>
                <p className="text-gray-500">Tablica: {selectedVehicle.licensePlate}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedVehicle.status === "available"
                    ? "bg-green-100 text-green-800"
                    : selectedVehicle.status === "in-use"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {selectedVehicle.status === "available"
                  ? "Dostępny"
                  : selectedVehicle.status === "in-use"
                    ? "W użyciu"
                    : "Serwis"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="flex items-center">
                <Car className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Kategoria</div>
                  <div>{selectedVehicle.licenseType}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Przebieg</div>
                  <div>{selectedVehicle.mileage} km</div>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Ostatni przegląd</div>
                  <div>{selectedVehicle.lastMaintenance || "Nie zarejestrowano"}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Następny przegląd</div>
                  <div
                    className={`${
                      getMaintenanceStatus(selectedVehicle) === "overdue"
                        ? "text-red-600 font-medium"
                        : getMaintenanceStatus(selectedVehicle) === "due-soon"
                          ? "text-yellow-600 font-medium"
                          : ""
                    }`}
                  >
                    {selectedVehicle.nextMaintenance || "Nie zaplanowano"}
                    {getMaintenanceStatus(selectedVehicle) === "overdue" && " (ZALEGŁY)"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Notatki</h3>
              <div className="p-4 bg-gray-50 rounded-md">{selectedVehicle.notes || "Brak dostępnych notatek."}</div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Historia przeglądów</h3>
                <button
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                  onClick={() => setShowMaintenanceForm(true)}
                >
                  <Tool className="w-4 h-4 mr-1" />
                  Dodaj przegląd
                </button>
              </div>

              {selectedVehicle.maintenanceHistory && selectedVehicle.maintenanceHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedVehicle.maintenanceHistory
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((record) => (
                      <div key={record.id} className="p-3 border rounded-md">
                        <div className="flex justify-between">
                          <div className="font-medium">{record.date}</div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full ${
                              record.type === "regular" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.type === "regular" ? "Przegląd okresowy" : "Naprawa"}
                          </div>
                        </div>
                        <div className="text-sm mt-1">{record.description}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Koszt: ${record.cost} • Przebieg: {record.mileage} km
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-gray-500 p-4 text-center border rounded-md">Brak historii przeglądów.</div>
              )}

              {showMaintenanceForm && (
                <div className="mt-4 p-4 border rounded-md">
                  <h4 className="font-medium mb-3">Dodaj przegląd</h4>
                  <form onSubmit={handleAddMaintenanceSubmit}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <input
                          type="date"
                          name="date"
                          value={maintenanceRecord.date}
                          onChange={handleMaintenanceInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                        <select
                          name="type"
                          value={maintenanceRecord.type}
                          onChange={handleMaintenanceInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="regular">Przegląd okresowy</option>
                          <option value="repair">Naprawa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Koszt (zł)</label>
                        <input
                          type="number"
                          name="cost"
                          value={maintenanceRecord.cost}
                          onChange={handleMaintenanceInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Przebieg (km)</label>
                        <input
                          type="number"
                          name="mileage"
                          value={maintenanceRecord.mileage}
                          onChange={handleMaintenanceInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                      <textarea
                        name="description"
                        value={maintenanceRecord.description}
                        onChange={handleMaintenanceInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      ></textarea>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        onClick={() => setShowMaintenanceForm(false)}
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Zapisz
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Nadchodzące jazdy</h3>
              {selectedVehicle.upcomingBookings && selectedVehicle.upcomingBookings.length > 0 ? (
                <div className="space-y-2">
                  {selectedVehicle.upcomingBookings.map((booking, index) => (
                    <div key={index} className="p-3 border rounded-md flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                      <div>
                        <div className="font-medium">
                          {booking.date} o {booking.time}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.duration} godzin z instruktorem {booking.instructor} i kursantem: {booking.student}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 p-4 text-center border rounded-md">
                  Brak zaplanowanych jazd dla tego pojazdu
                </div>
              )}
            </div>
          </div>
        ) : showAddVehicleForm ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Dodaj Nowy Pojazd</h2>
            <form onSubmit={handleAddVehicleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                  <input
                    type="text"
                    name="make"
                    value={newVehicle.make}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={newVehicle.model}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rok produkcji</label>
                  <input
                    type="number"
                    name="year"
                    value={newVehicle.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numer rejestracyjny</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={newVehicle.licensePlate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria prawa jazdy</label>
                  <select
                    name="licenseType"
                    value={newVehicle.licenseType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A - Motocykl</option>
                    <option value="B">B - Samochód osobowy</option>
                    <option value="C">C - Samochód ciężarowy</option>
                    <option value="D">D - Autobus</option>
                    <option value="E">E - Przyczepa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={newVehicle.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Dostępny</option>
                    <option value="in-use">W użyciu</option>
                    <option value="maintenance">Serwis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ostatni przegląd</label>
                  <input
                    type="date"
                    name="lastMaintenance"
                    value={newVehicle.lastMaintenance}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Następny przegląd</label>
                  <input
                    type="date"
                    name="nextMaintenance"
                    value={newVehicle.nextMaintenance}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Przebieg (km)</label>
                  <input
                    type="number"
                    name="mileage"
                    value={newVehicle.mileage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notatki</label>
                <textarea
                  name="notes"
                  value={newVehicle.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setShowAddVehicleForm(false)}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Dodaj Pojazd
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Wybierz pojazd, aby zobaczyć szczegóły lub dodaj nowy pojazd
          </div>
        )}
      </div>
    </div>
  )
}

