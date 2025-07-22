"use client"

import { useState, useEffect, useTransition } from "react"
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
  Trash2,
  Download,
  Eye,
} from "lucide-react"
import { addDriver, updateDriver, deleteDriver } from "@/app/actions/driver-actions"
import { useRouter } from "next/navigation"
import PaymentForm from "@/components/driverProfiels/payment-form"
import { useAuth } from "@/hooks/use-auth"
import PdfViewer from "@/components/ui/pdf-viewer"

const branches = ["Widzew", "Bałuty", "Zgierz", "Górna", "Dąbrowa", "Retkinia", "Centrum", "Ozorków"]

export default function DriverProfiles({ drivers, events, dates }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { user } = useAuth()
  console.log(dates)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showAddDriverForm, setShowAddDriverForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    email: "",
    license_type: "B",
    course_type: "basic", // basic or additional
    start_date: dates?.length > 0 ? dates[0].id : "", // Store date ID instead of date string
    contract_date: "",
    completed_hours: 0,
    remaining_hours: 30,
    notes: "",
    payment_type: "onetime", // onetime or installments
    paymentInstallments: [{ hours: 0, amount: 0 }],
    paymentFiles: [],
    totalPaid: 0,
    price: 0,
    branch: "Widzew", // Dodaj domyślną wartość
  })
  const [installments, setInstallments] = useState([{ hours: 0, amount: 0 }])
  const [editedDriver, setEditedDriver] = useState(null)
  const [editInstallments, setEditInstallments] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pdfPreview, setPdfPreview] = useState(null)
  const [branchFilter, setBranchFilter] = useState("all")

  useEffect(() => {
    // Jeśli mamy wybranego kierowcę, sprawdź, czy istnieje on na nowej liście
    const driver_id = selectedDriver?.id
    if (driver_id) {
      // Sprawdź, czy wybrany kierowca nadal jest na liście
      const selected = drivers.find((driver) => driver.id === driver_id)
      if (selected) {
        // Jeśli kierowca istnieje, zaktualizuj selectedDriver
        setSelectedDriver(selected)
      } else {
        // Jeśli kierowca nie istnieje na liście, zresetuj selectedDriver
        setSelectedDriver(null)
      }
    } else if (drivers.length > 0) {
      // Jeśli nie mamy wybranego kierowcy i lista kierowców nie jest pusta, ustaw pierwszego kierowcę jako wybranego
      setSelectedDriver(drivers[0])
    }
  }, [drivers]) // Uruchom efekty tylko wtedy, gdy lista drivers się zmienia

  // Filtruj kierowców na podstawie zapytania wyszukiwania
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  function formatDate(dateString) {
    const date = new Date(dateString)
    const day = String(date.getUTCDate()).padStart(2, "0")
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const year = date.getUTCFullYear()
    return `${day}.${month}.${year}`
  }

  function calculateDuration(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)
    const startTotal = startHour * 60 + startMinute
    const endTotal = endHour * 60 + endMinute
    const durationMinutes = endTotal - startTotal
    const durationHours = durationMinutes / 60
    return durationHours.toFixed(1) // np. 1.5
  }

  // Helper function to get date string from date ID
  const getDateStringFromId = (dateId) => {
    const dateObj = dates?.find((d) => d.id === dateId)
    return dateObj ? dateObj.data : dateId
  }

  // Helper function to get date ID from date string (for existing drivers)
  const getDateIdFromString = (dateString) => {
    const dateObj = dates?.find((d) => d.data === dateString)
    return dateObj ? dateObj.id : dateString
  }

  const handleDriverSelect = async (driver) => {
    setSelectedDriver(driver)
    console.log("Selected driver:", driver)
    setEditMode(false)
    setConfirmDelete(false)
  }

  const handleAddDriverSubmit = async (e) => {
    e.preventDefault()
    // Add installments to the new driver object
    const driverWithInstallments = {
      ...newDriver,
      branch: newDriver.branch || "Widzew", // Upewnij się, że branch nie jest pusty
      paymentInstallments: newDriver.payment_type === "installments" ? installments : [],
      price: Number(newDriver.price) || 0, // Ensure price is a number
    }

    startTransition(async () => {
      const result = await addDriver(driverWithInstallments)
      if (result.success) {
        // Refresh the page to get updated data
        router.refresh()
        // Reset form
        setNewDriver({
          name: "",
          phone: "",
          email: "",
          license_type: "B",
          course_type: "basic",
          start_date: dates?.length > 0 ? dates[0].id : "",
          contract_date: "",
          completed_hours: 0,
          remaining_hours: 30,
          notes: "",
          payment_type: "onetime",
          paymentInstallments: [],
          paymentFiles: [],
          totalPaid: 0,
          price: 0,
          branch: "Widzew",
        })
        setInstallments([{ hours: 0, amount: 0 }])
        setShowAddDriverForm(false)
      } else {
        alert(`Błąd podczas dodawania kierowcy: ${result.error}`)
      }
    })
  }

  const handleEditDriverSubmit = async (e) => {
    e.preventDefault()
    // Add installments to the edited driver object
    const updatedDriver = {
      ...editedDriver,
      paymentInstallments: editedDriver.payment_type === "installments" ? editInstallments : [],
      branch: editedDriver.branch || "Widzew", // Upewnij się, że branch nie jest pusty
    }

    startTransition(async () => {
      const result = await updateDriver(updatedDriver)
      if (result.success) {
        // Refresh the page to get updated data
        router.refresh()
        // Update local state
        setSelectedDriver(updatedDriver)
        setEditMode(false)
      } else {
        alert(`Błąd podczas aktualizacji kierowcy: ${result.error}`)
      }
    })
  }

  const handleDeleteDriver = () => {
    if (!selectedDriver) return

    startTransition(async () => {
      const result = await deleteDriver(selectedDriver.id)
      if (result.success) {
        // Refresh the page to get updated data
        router.refresh()
        // Reset selected driver
        setSelectedDriver(null)
        setConfirmDelete(false)
      } else {
        alert(`Błąd podczas usuwania kierowcy: ${result.error}`)
      }
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewDriver({
      ...newDriver,
      [name]: name === "price" ? Number(value) : value,
    })
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditedDriver({
      ...editedDriver,
      [name]: name === "price" ? Number(value) : value,
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
      paymentFiles: [...(editedDriver.paymentFiles || []), ...files],
      newPaymentFiles: [...(editedDriver.newPaymentFiles || []), ...files],
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
    // Check if this is an existing file or a new file
    const isExistingFile = index < editedDriver.paymentFiles?.length - (editedDriver.newPaymentFiles?.length || 0)

    if (isExistingFile) {
      // Mark the file for deletion in the database
      const filesToDelete = editedDriver.filesToDelete || []
      filesToDelete.push(editedDriver.paymentFiles[index])
      setEditedDriver({
        ...editedDriver,
        filesToDelete,
      })
    }

    const updatedFiles = [...(editedDriver.paymentFiles || [])]
    updatedFiles.splice(index, 1)

    // Also update newPaymentFiles if applicable
    const updatedNewFiles = [...(editedDriver.newPaymentFiles || [])]
    if (!isExistingFile) {
      const newFileIndex = index - (editedDriver.paymentFiles?.length - updatedNewFiles.length)
      if (newFileIndex >= 0) {
        updatedNewFiles.splice(newFileIndex, 1)
      }
    }

    setEditedDriver({
      ...editedDriver,
      paymentFiles: updatedFiles,
      newPaymentFiles: updatedNewFiles,
    })
  }

  const startEditMode = () => {
    setEditedDriver({
      ...selectedDriver,
      branch: selectedDriver.branch || "Widzew", // Upewnij się, że branch ma wartość
      start_date: getDateIdFromString(selectedDriver.start_date), // Convert date string to ID for editing
    })
    setEditInstallments(
      selectedDriver.paymentInstallments?.length > 0
        ? [...selectedDriver.paymentInstallments]
        : [{ hours: 0, amount: 0 }],
    )
    setEditMode(true)
    setConfirmDelete(false)
  }

  const cancelEditMode = () => {
    setEditMode(false)
  }

  // Check if a driver has missed a payment threshold
  const hasMissedPayment = (driver) => {
    if (!driver.paymentInstallments || driver.paymentInstallments.length === 0) return false

    for (const installment of driver.paymentInstallments) {
      if (driver.completed_hours >= installment.hours && driver.totalPaid < installment.amount) {
        return true
      }
    }
    return false
  }

  const handlePreviewFile = (file) => {
    setPdfPreview(file)
  }

  const handleClosePreview = () => {
    setPdfPreview(null)
  }

  // Sprawdź, czy plik jest PDF-em
  const isPdfFile = (file) => {
    return (
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type === "application/pdf" ||
      (file.path && file.path.toLowerCase().endsWith(".pdf"))
    )
  }

  return (
    <div className="h-full flex overflow-y-scroll">
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
            disabled={isPending}
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
                    driver.remaining_hours === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {driver.remaining_hours === 0 ? "Ukończono" : `${driver.remaining_hours} godzin pozostało`}
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
                <p className="text-gray-500">Typ Prawa Jazdy: {selectedDriver.license_type}</p>
                <p className="text-gray-500">
                  Typ Kursu: {selectedDriver.course_type === "basic" ? "Podstawowy" : "Dodatkowy"}
                </p>
                <p className="text-gray-500">Placówka: {selectedDriver.branch || "Brak"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={startEditMode}
                    className="flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    disabled={isPending}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edytuj Profil
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Usuń
                  </button>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDriver.remaining_hours === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedDriver.remaining_hours === 0 ? "Szkolenie Ukończone" : "W Trakcie Szkolenia"}
                </div>
                {hasMissedPayment(selectedDriver) && (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Zaległa płatność
                  </div>
                )}
              </div>
            </div>

            {confirmDelete && (
              <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-md">
                <h3 className="text-lg font-medium text-red-800 mb-2">Potwierdź usunięcie</h3>
                <p className="text-red-700 mb-4">
                  Czy na pewno chcesz usunąć tego kierowcę? Ta operacja jest nieodwracalna.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleDeleteDriver}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    disabled={isPending}
                  >
                    {isPending ? "Usuwanie..." : "Tak, usuń"}
                  </button>
                </div>
              </div>
            )}

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
                  <div>{getDateStringFromId(selectedDriver.start_date)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Data Zawarcia Umowy</div>
                  <div>{selectedDriver.contract_date || "-"}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Ukończone Godziny</div>
                  <div>{selectedDriver.completed_hours}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Liczba Godziny</div>
                  <div>{selectedDriver.remaining_hours}</div>
                </div>
              </div>
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Typ Płatności</div>
                  <div>{selectedDriver.payment_type === "onetime" ? "Jednorazowa" : "Raty"}</div>
                </div>
              </div>
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Cena za kurs</div>
                  <div>{selectedDriver?.price || "Brak ceny"}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Postęp</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${(selectedDriver.completed_hours / selectedDriver.remaining_hours) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {Math.round((selectedDriver.completed_hours / selectedDriver.remaining_hours) * 100)}% ukończone
              </div>
            </div>

            {selectedDriver.paymentFiles && selectedDriver.paymentFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Potwierdzenia Płatności</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDriver.paymentFiles.map((file, index) => (
                    <div key={index} className="border rounded-md p-3 flex items-center justify-between">
                      <div className="flex items-center overflow-hidden">
                        <FileText className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <div className="font-medium truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(file.lastModified).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isPdfFile(file) && (
                          <button
                            onClick={() => handlePreviewFile(file)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Podgląd"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <a
                          href={file.path}
                          download={file.name}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Pobierz"
                        >
                          <Download className="w-4 h-4" />
                        </a>
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

            <div className="mb-6">
              <PaymentForm driver_id={selectedDriver.id} driver={selectedDriver} userId={user.id} />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Lekcje</h3>
              {selectedDriver.events && selectedDriver.events.length > 0 ? (
                <div className="space-y-2">
                  {selectedDriver.events.map((lesson, index) => (
                    <div key={index} className="p-3 border rounded-md flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                      <div>
                        <div className="font-medium">
                          {formatDate(lesson.date)} o {lesson.start_time}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Number(calculateDuration(lesson.start_time, lesson.end_time))} godzin z{" "}
                          {lesson.instructor.name + " " + lesson.instructor.surname}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ Prawa Jazdy</label>
                  <select
                    name="license_type"
                    value={editedDriver.license_type}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A </option>
                    <option value="A2">A2</option>
                    <option value="A1">A1</option>
                    <option value="AM">AM</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="C+E">C + E</option>
                    <option value="C&C+E">C & C + E</option>
                    <option value="KWP">KWP</option>
                    <option value="KU">KU</option>
                    <option value="KUP">KUP</option>
                    <option value="D">D</option>
                    <option value="Wózek">Wózek Widłowy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ Kursu</label>
                  <select
                    name="course_type"
                    value={editedDriver.course_type}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Podstawowy</option>
                    <option value="additional">Dodatkowy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Rozpoczęcia</label>
                  <select
                    name="start_date"
                    value={editedDriver.start_date}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Wybierz datę</option>
                    {dates?.map((date) => (
                      <option key={date.id} value={date.id}>
                        {formatDate(date.data)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Zawarcia Umowy</label>
                  <input
                    type="date"
                    name="contract_date"
                    value={editedDriver.contract_date || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ukończone Godziny</label>
                  <input
                    type="number"
                    name="completed_hours"
                    value={editedDriver.completed_hours}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cena Kursu</label>
                  <input
                    type="number"
                    name="price"
                    value={editedDriver.price}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Liczba Godziny</label>
                  <input
                    type="number"
                    name="remaining_hours"
                    value={editedDriver.remaining_hours}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placówka</label>
                  <select
                    name="branch"
                    value={editedDriver?.branch || "Widzew"}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
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
                      name="payment_type"
                      value="onetime"
                      checked={editedDriver.payment_type === "onetime"}
                      onChange={handleEditInputChange}
                      className="mr-2"
                    />
                    Jednorazowa
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_type"
                      value="installments"
                      checked={editedDriver.payment_type === "installments"}
                      onChange={handleEditInputChange}
                      className="mr-2"
                    />
                    Raty
                  </label>
                </div>
              </div>

              {editedDriver.payment_type === "installments" && (
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
                  disabled={isPending}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                  disabled={isPending}
                >
                  {isPending ? (
                    "Zapisywanie..."
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Zapisz Zmiany
                    </>
                  )}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ Prawa Jazdy</label>
                  <select
                    name="license_type"
                    value={newDriver.license_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A </option>
                    <option value="A2">A2</option>
                    <option value="A1">A1</option>
                    <option value="AM">AM</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="C+E">C + E</option>
                    <option value="C&C+E">C & C + E</option>
                    <option value="KWP">KWP</option>
                    <option value="KU">KU</option>
                    <option value="KUP">KUP</option>
                    <option value="D">D</option>
                    <option value="Wózek">Wózek Widłowy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ Kursu</label>
                  <select
                    name="course_type"
                    value={newDriver.course_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Podstawowy</option>
                    <option value="additional">Dodatkowy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Rozpoczęcia</label>
                  <select
                    name="start_date"
                    value={newDriver.start_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Wybierz datę</option>
                    {dates?.map((date) => (
                      <option key={date.id} value={date.id}>
                        {formatDate(date.data)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Zawarcia Umowy</label>
                  <input
                    type="date"
                    name="contract_date"
                    value={newDriver.contract_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ukończone Godziny</label>
                  <input
                    type="number"
                    name="completed_hours"
                    value={newDriver.completed_hours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cena Kursu</label>
                  <input
                    type="number"
                    name="price"
                    value={newDriver.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Liczba Godziny</label>
                  <input
                    type="number"
                    name="remaining_hours"
                    value={newDriver.remaining_hours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placówka</label>
                <select
                  name="branch"
                  value={newDriver.branch}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ Płatności</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_type"
                      value="onetime"
                      checked={newDriver.payment_type === "onetime"}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Jednorazowa
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_type"
                      value="installments"
                      checked={newDriver.payment_type === "installments"}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Raty
                  </label>
                </div>
              </div>

              {newDriver.payment_type === "installments" && (
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
                  disabled={isPending}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  disabled={isPending}
                >
                  {isPending ? "Dodawanie..." : "Dodaj Kierowcę"}
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

      {/* PDF Preview Modal */}
      {pdfPreview && <PdfViewer file={pdfPreview} onClose={handleClosePreview} />}
    </div>
  )
}
