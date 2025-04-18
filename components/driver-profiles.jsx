"use client"

import { useState } from "react"
import {
  Search,
  User,
  Phone,
  Calendar,
  Clock,
  Plus,
  Upload,
  CreditCard,
  FileText,
  AlertTriangle,
  Edit,
  Check,
} from "lucide-react"

export default function DriverProfiles({ drivers, instructors = [], onSelectDriver, onAddDriver, onUpdateDriver }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showAddDriverForm, setShowAddDriverForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    email: "",
    licenseType: "B",
    courseType: "basic", // basic or additional
    startDate: "",
    contractDate: "",
    completedHours: 0,
    remainingHours: 30,
    instructor: "",
    notes: "",
    paymentType: "onetime", // onetime or installments
    paymentInstallments: [{ hours: 0, amount: 0 }],
    paymentFiles: [],
    totalPaid: 0,
  })
  const [installments, setInstallments] = useState([{ hours: 0, amount: 0 }])
  const [editedDriver, setEditedDriver] = useState(null)
  const [editInstallments, setEditInstallments] = useState([])

  // Filtruj kierowców na podstawie zapytania wyszukiwania
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver)
    setEditMode(false)
    if (onSelectDriver) {
      onSelectDriver(driver)
    }
  }

  const handleAddDriverSubmit = (e) => {
    e.preventDefault()

    // Add installments to the new driver object
    const driverWithInstallments = {
      ...newDriver,
      paymentInstallments: newDriver.paymentType === "installments" ? installments : [],
    }

    onAddDriver(driverWithInstallments)
    setNewDriver({
      name: "",
      phone: "",
      email: "",
      licenseType: "B",
      courseType: "basic",
      startDate: "",
      contractDate: "",
      completedHours: 0,
      remainingHours: 30,
      instructor: "",
      notes: "",
      paymentType: "onetime",
      paymentInstallments: [],
      paymentFiles: [],
      totalPaid: 0,
    })
    setInstallments([{ hours: 0, amount: 0 }])
    setShowAddDriverForm(false)
  }

  const handleEditDriverSubmit = (e) => {
    e.preventDefault()

    // Add installments to the edited driver object
    const updatedDriver = {
      ...editedDriver,
      paymentInstallments: editedDriver.paymentType === "installments" ? editInstallments : [],
    }

    onUpdateDriver(updatedDriver)
    setSelectedDriver(updatedDriver)
    setEditMode(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewDriver({
      ...newDriver,
      [name]: value,
    })
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditedDriver({
      ...editedDriver,
      [name]: value,
    })
  }

  const handleInstallmentChange = (index, field, value) => {
    const updatedInstallments = [...installments]
    updatedInstallments[index] = {
      ...updatedInstallments[index],
      [field]: value,
    }
    setInstallments(updatedInstallments)
  }

  const handleEditInstallmentChange = (index, field, value) => {
    const updatedInstallments = [...editInstallments]
    updatedInstallments[index] = {
      ...updatedInstallments[index],
      [field]: value,
    }
    setEditInstallments(updatedInstallments)
  }

  const addInstallment = () => {
    setInstallments([...installments, { hours: 0, amount: 0 }])
  }

  const addEditInstallment = () => {
    setEditInstallments([...editInstallments, { hours: 0, amount: 0 }])
  }

  const removeInstallment = (index) => {
    if (installments.length > 1) {
      const updatedInstallments = [...installments]
      updatedInstallments.splice(index, 1)
      setInstallments(updatedInstallments)
    }
  }

  const removeEditInstallment = (index) => {
    if (editInstallments.length > 1) {
      const updatedInstallments = [...editInstallments]
      updatedInstallments.splice(index, 1)
      setEditInstallments(updatedInstallments)
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setNewDriver({
      ...newDriver,
      paymentFiles: [...newDriver.paymentFiles, ...files],
    })
  }

  const handleEditFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setEditedDriver({
      ...editedDriver,
      paymentFiles: [...editedDriver.paymentFiles, ...files],
    })
  }

  const removeFile = (index) => {
    const updatedFiles = [...newDriver.paymentFiles]
    updatedFiles.splice(index, 1)
    setNewDriver({
      ...newDriver,
      paymentFiles: updatedFiles,
    })
  }

  const removeEditFile = (index) => {
    const updatedFiles = [...editedDriver.paymentFiles]
    updatedFiles.splice(index, 1)
    setEditedDriver({
      ...editedDriver,
      paymentFiles: updatedFiles,
    })
  }

  const startEditMode = () => {
    setEditedDriver({ ...selectedDriver })
    setEditInstallments(
      selectedDriver.paymentInstallments?.length > 0
        ? [...selectedDriver.paymentInstallments]
        : [{ hours: 0, amount: 0 }],
    )
    setEditMode(true)
  }

  const cancelEditMode = () => {
    setEditMode(false)
  }

  // Check if a driver has missed a payment threshold
  const hasMissedPayment = (driver) => {
    if (!driver.paymentInstallments || driver.paymentInstallments.length === 0) return false

    for (const installment of driver.paymentInstallments) {
      if (driver.completedHours >= installment.hours && driver.totalPaid < installment.amount) {
        return true
      }
    }
    return false
  }

  // Get the current payment threshold
  const getCurrentPaymentThreshold = (driver) => {
    if (!driver.paymentInstallments || driver.paymentInstallments.length === 0) return null

    let currentThreshold = null
    for (const installment of driver.paymentInstallments) {
      if (driver.completedHours >= installment.hours) {
        currentThreshold = installment
      }
    }
    return currentThreshold
  }

  return (
    <div className="h-full flex">
      {/* Lista kierowców */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj kierowców..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="mt-3 flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => setShowAddDriverForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Dodaj Nowego Kierowcę
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
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    driver.remainingHours === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {driver.remainingHours === 0 ? "Ukończono" : `${driver.remainingHours} godzin pozostało`}
                </span>

                {hasMissedPayment(driver) && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Zaległa płatność
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredDrivers.length === 0 && (
            <div className="p-8 text-center text-gray-500">Nie znaleziono kierowców pasujących do "{searchQuery}"</div>
          )}
        </div>
      </div>

      {/* Szczegóły kierowcy */}
      <div className="w-2/3 overflow-y-auto">
        {selectedDriver && !editMode && !showAddDriverForm ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedDriver.name}</h2>
                <p className="text-gray-500">Typ Prawa Jazdy: {selectedDriver.licenseType}</p>
                <p className="text-gray-500">
                  Typ Kursu: {selectedDriver.courseType === "basic" ? "Podstawowy" : "Dodatkowy"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={startEditMode}
                  className="flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edytuj Profil
                </button>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDriver.remainingHours === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedDriver.remainingHours === 0 ? "Szkolenie Ukończone" : "W Trakcie Szkolenia"}
                </div>

                {hasMissedPayment(selectedDriver) && (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Zaległa płatność
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Telefon</div>
                  <div>{selectedDriver.phone}</div>
                </div>
              </div>

              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div>{selectedDriver.email}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Data Rozpoczęcia</div>
                  <div>{selectedDriver.startDate}</div>
                </div>
              </div>

              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Data Zawarcia Umowy</div>
                  <div>{selectedDriver.contractDate || "-"}</div>
                </div>
              </div>

              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Instruktor</div>
                  <div>{selectedDriver.instructor}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Ukończone Godziny</div>
                  <div>{selectedDriver.completedHours}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Pozostałe Godziny</div>
                  <div>{selectedDriver.remainingHours}</div>
                </div>
              </div>

              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Typ Płatności</div>
                  <div>{selectedDriver.paymentType === "onetime" ? "Jednorazowa" : "Raty"}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Postęp</h3>
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
                % ukończone
              </div>
            </div>

            {selectedDriver.paymentType === "installments" &&
              selectedDriver.paymentInstallments &&
              selectedDriver.paymentInstallments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Harmonogram Płatności</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Po Godzinach
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Kwota
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedDriver.paymentInstallments.map((installment, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{installment.hours}h</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {installment.amount} PLN
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {selectedDriver.completedHours >= installment.hours ? (
                                selectedDriver.totalPaid >= installment.amount ? (
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                    Opłacone
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                    Zaległa płatność
                                  </span>
                                )
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                  Oczekujące
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {selectedDriver.paymentFiles && selectedDriver.paymentFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Potwierdzenia Płatności</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedDriver.paymentFiles.map((file, index) => (
                    <div key={index} className="border rounded-md p-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-500" />
                      <div className="overflow-hidden">
                        <div className="font-medium truncate">{file.name}</div>
                        <div className="text-xs text-gray-500">{new Date(file.lastModified).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Notatki</h3>
              <div className="p-4 bg-gray-50 rounded-md">{selectedDriver.notes || "Brak dostępnych notatek."}</div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Nadchodzące Lekcje</h3>
              {selectedDriver.upcomingLessons && selectedDriver.upcomingLessons.length > 0 ? (
                <div className="space-y-2">
                  {selectedDriver.upcomingLessons.map((lesson, index) => (
                    <div key={index} className="p-3 border rounded-md flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                      <div>
                        <div className="font-medium">
                          {lesson.date} o {lesson.time}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lesson.duration} godzin z {lesson.instructor}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">Brak zaplanowanych nadchodzących lekcji.</div>
              )}
            </div>
          </div>
        ) : selectedDriver && editMode && !showAddDriverForm ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Edytuj Profil Kierowcy</h2>
            <form onSubmit={handleEditDriverSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pełne Imię i Nazwisko</label>
                  <input
                    type="text"
                    name="name"
                    value={editedDriver.name}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="text"
                    name="phone"
                    value={editedDriver.phone}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedDriver.email}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ Prawa Jazdy</label>
                  <select
                    name="licenseType"
                    value={editedDriver.licenseType}
                    onChange={handleEditInputChange}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ Kursu</label>
                  <select
                    name="courseType"
                    value={editedDriver.courseType}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Podstawowy</option>
                    <option value="additional">Dodatkowy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Rozpoczęcia</label>
                  <input
                    type="date"
                    name="startDate"
                    value={editedDriver.startDate}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Zawarcia Umowy</label>
                  <input
                    type="date"
                    name="contractDate"
                    value={editedDriver.contractDate || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instruktor</label>
                  <select
                    name="instructor"
                    value={editedDriver.instructor}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Wybierz instruktora</option>
                    {instructors.map((instructor, index) => (
                      <option key={index} value={instructor.name}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ukończone Godziny</label>
                  <input
                    type="number"
                    name="completedHours"
                    value={editedDriver.completedHours}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pozostałe Godziny</label>
                  <input
                    type="number"
                    name="remainingHours"
                    value={editedDriver.remainingHours}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suma Wpłat (PLN)</label>
                  <input
                    type="number"
                    name="totalPaid"
                    value={editedDriver.totalPaid || 0}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ Płatności</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentType"
                      value="onetime"
                      checked={editedDriver.paymentType === "onetime"}
                      onChange={handleEditInputChange}
                      className="mr-2"
                    />
                    Jednorazowa
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentType"
                      value="installments"
                      checked={editedDriver.paymentType === "installments"}
                      onChange={handleEditInputChange}
                      className="mr-2"
                    />
                    Raty
                  </label>
                </div>
              </div>

              {editedDriver.paymentType === "installments" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Harmonogram Rat</label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      onClick={addEditInstallment}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Dodaj Ratę
                    </button>
                  </div>

                  {editInstallments.map((installment, index) => (
                    <div key={index} className="flex gap-4 items-center mb-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Po Godzinach</label>
                        <input
                          type="number"
                          value={installment.hours}
                          onChange={(e) => handleEditInstallmentChange(index, "hours", Number.parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Kwota (PLN)</label>
                        <input
                          type="number"
                          value={installment.amount}
                          onChange={(e) =>
                            handleEditInstallmentChange(index, "amount", Number.parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      {editInstallments.length > 1 && (
                        <button
                          type="button"
                          className="mt-5 text-red-500 hover:text-red-700"
                          onClick={() => removeEditInstallment(index)}
                        >
                          Usuń
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potwierdzenia Płatności</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 mb-2">
                  <div className="flex items-center justify-center flex-col">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Przeciągnij pliki lub kliknij, aby dodać</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleEditFileUpload}
                      className="hidden"
                      id="edit-payment-files"
                    />
                    <label
                      htmlFor="edit-payment-files"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
                    >
                      Wybierz Pliki
                    </label>
                  </div>
                </div>

                {editedDriver.paymentFiles && editedDriver.paymentFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {editedDriver.paymentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="text-sm truncate max-w-xs">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeEditFile(index)}
                        >
                          Usuń
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notatki</label>
                <textarea
                  name="notes"
                  value={editedDriver.notes || ""}
                  onChange={handleEditInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={cancelEditMode}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Zapisz Zmiany
                </button>
              </div>
            </form>
          </div>
        ) : showAddDriverForm ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Dodaj Nowego Kierowcę</h2>
            <form onSubmit={handleAddDriverSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pełne Imię i Nazwisko</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ Prawa Jazdy</label>
                  <select
                    name="licenseType"
                    value={newDriver.licenseType}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ Kursu</label>
                  <select
                    name="courseType"
                    value={newDriver.courseType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Podstawowy</option>
                    <option value="additional">Dodatkowy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Rozpoczęcia</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Zawarcia Umowy</label>
                  <input
                    type="date"
                    name="contractDate"
                    value={newDriver.contractDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instruktor</label>
                  <select
                    name="instructor"
                    value={newDriver.instructor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Wybierz instruktora</option>
                    {instructors.map((instructor, index) => (
                      <option key={index} value={instructor.name}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ukończone Godziny</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pozostałe Godziny</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ Płatności</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentType"
                      value="onetime"
                      checked={newDriver.paymentType === "onetime"}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Jednorazowa
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentType"
                      value="installments"
                      checked={newDriver.paymentType === "installments"}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Raty
                  </label>
                </div>
              </div>

              {newDriver.paymentType === "installments" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Harmonogram Rat</label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      onClick={addInstallment}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Dodaj Ratę
                    </button>
                  </div>

                  {installments.map((installment, index) => (
                    <div key={index} className="flex gap-4 items-center mb-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Po Godzinach</label>
                        <input
                          type="number"
                          value={installment.hours}
                          onChange={(e) => handleInstallmentChange(index, "hours", Number.parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Kwota (PLN)</label>
                        <input
                          type="number"
                          value={installment.amount}
                          onChange={(e) => handleInstallmentChange(index, "amount", Number.parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      {installments.length > 1 && (
                        <button
                          type="button"
                          className="mt-5 text-red-500 hover:text-red-700"
                          onClick={() => removeInstallment(index)}
                        >
                          Usuń
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potwierdzenia Płatności</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 mb-2">
                  <div className="flex items-center justify-center flex-col">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Przeciągnij pliki lub kliknij, aby dodać</p>
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" id="payment-files" />
                    <label
                      htmlFor="payment-files"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
                    >
                      Wybierz Pliki
                    </label>
                  </div>
                </div>

                {newDriver.paymentFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {newDriver.paymentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="text-sm truncate max-w-xs">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeFile(index)}
                        >
                          Usuń
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notatki</label>
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
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Dodaj Kierowcę
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Wybierz kierowcę, aby zobaczyć szczegóły lub dodaj nowego kierowcę.
          </div>
        )}
      </div>
    </div>
  )
}
