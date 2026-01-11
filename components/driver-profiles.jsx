"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import {
  Search,
  User,
  Phone,
  Calendar,
  Clock,
  Plus,
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
   const [signedUrls, setSignedUrls] = useState({})
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { user } = useAuth()
  console.log(dates)

  const detailsContainerRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showAddDriverForm, setShowAddDriverForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [newDriver, setNewDriver] = useState({
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
    paymentInstallments: [{ hours: 0, amount: 0 }],
    paymentFiles: [],
    totalPaid: 0,
    price: 0,
    branch: "Widzew",
  })
  const [installments, setInstallments] = useState([{ hours: 0, amount: 0 }])
  const [editedDriver, setEditedDriver] = useState(null)
  const [editInstallments, setEditInstallments] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pdfPreview, setPdfPreview] = useState(null)
  const [branchFilter, setBranchFilter] = useState("all")

  useEffect(() => {
    if (detailsContainerRef.current && (showAddDriverForm || selectedDriver)) {
      detailsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [showAddDriverForm, selectedDriver])

  const fetchSignedUrl = async (filePath) => {
    try {
      const res = await fetch(
        `/api/get-file-url?filePath=${encodeURIComponent(filePath)}&driverId=${selectedDriver.id}`,
      )
      if (!res.ok) throw new Error("Nie udało się pobrać pliku")
      const data = await res.json()
      return data.signedUrl
    } catch (err) {
      console.error(err)
      return null
    }
  }

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
    return durationHours.toFixed(1)
  }

  const getDateStringFromId = (dateId) => {
    const dateObj = dates?.find((d) => d.id === dateId)
    return dateObj ? dateObj.data : dateId
  }

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
    if (newDriver.course_type !== "basic") {
      newDriver.start_date = null
    }
    const driverWithInstallments = {
      ...newDriver,
      branch: newDriver.branch || "Widzew",
      paymentInstallments: newDriver.payment_type === "installments" ? installments : [],
      price: Number(newDriver.price) || 0,
    }

    startTransition(async () => {
      const result = await addDriver(driverWithInstallments)
      if (result.success) {
        router.refresh()
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
    if (editedDriver.course_type !== "basic") {
      editedDriver.start_date = null
    }
    console.log("Edited Driver before update:", editedDriver)

    const updatedDriver = {
      ...editedDriver,
      paymentInstallments: editedDriver.payment_type === "installments" ? editInstallments : [],
      branch: editedDriver.branch || "Widzew",
    }

    startTransition(async () => {
      const result = await updateDriver(updatedDriver)
      if (result.success) {
        router.refresh()
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
        router.refresh()
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
    setEditedDriver((prev) => ({
      ...prev,
      newPaymentFiles: [...(prev.newPaymentFiles || []), ...files],
    }))
    e.target.value = ""
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
    const isExistingFile = index < editedDriver.paymentFiles?.length - (editedDriver.newPaymentFiles?.length || 0)

    const filesToDelete = [...(editedDriver.filesToDelete || [])]
    if (isExistingFile) {
      filesToDelete.push(editedDriver.paymentFiles[index])
    }

    const updatedFiles = [...(editedDriver.paymentFiles || [])]
    updatedFiles.splice(index, 1)

    const updatedNewFiles = [...(editedDriver.newPaymentFiles || [])]
    if (!isExistingFile) {
      const newFileIndex = index - (editedDriver.paymentFiles?.length - updatedNewFiles.length)
      if (newFileIndex >= 0) updatedNewFiles.splice(newFileIndex, 1)
    }

    setEditedDriver({
      ...editedDriver,
      paymentFiles: updatedFiles,
      newPaymentFiles: updatedNewFiles,
      filesToDelete,
    })
  }

  const startEditMode = () => {
    setEditedDriver({
      ...selectedDriver,
      branch: selectedDriver.branch || "Widzew",
      start_date: getDateIdFromString(selectedDriver.start_date),
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

  const hasMissedPayment = (driver) => {
    if (!driver.paymentInstallments || driver.paymentInstallments.length === 0) return false

    let cumulativeThreshold = 0

    for (const installment of driver.paymentInstallments) {
      cumulativeThreshold += installment.amount

      if (driver.completed_hours >= installment.hours && driver.totalPaid < cumulativeThreshold) {
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

  const isPdfFile = (file) => {
    return file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf"
  }
  return (
    <div className="h-full flex flex-col lg:flex-row overflow-y-scroll">
      {/* Lista kierowców */}
      <div
        className={`${selectedDriver && !showAddDriverForm ? "hidden lg:block" : "block"} w-full lg:w-1/3 border-r overflow-y-auto`}
      >
        <div className="p-3 lg:p-4 border-b sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj kierowców..."
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <span className="hidden sm:inline">Dodaj Nowego Kierowcę</span>
            <span className="sm:hidden">Dodaj</span>
          </button>
        </div>

        <div className="divide-y">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className={`p-3 lg:p-4 cursor-pointer hover:bg-gray-50 ${selectedDriver?.id === driver.id ? "bg-blue-50" : ""}`}
              onClick={() => handleDriverSelect(driver)}
            >
              <div className="font-medium text-sm lg:text-base">{driver.name}</div>
              <div className="text-xs lg:text-sm text-gray-500">{driver.phone}</div>
              <div className="text-xs lg:text-sm text-gray-500 truncate">{driver.email}</div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    driver.remaining_hours === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {driver.remaining_hours === 0 ? "Ukończono" : `${driver.remaining_hours}h`}
                </span>
                {hasMissedPayment(driver) && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Zaległa płatność</span>
                    <span className="sm:hidden">Zaległa</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          {filteredDrivers.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">
              Nie znaleziono kierowców pasujących do "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Szczegóły kierowcy */}
      <div
        ref={detailsContainerRef}
        className={`${selectedDriver || showAddDriverForm ? "block" : "hidden lg:block"} w-full lg:w-2/3 overflow-y-auto`}
      >
        {selectedDriver && !editMode && !showAddDriverForm ? (
          <div className="p-4 lg:p-6">
            <button
              onClick={() => setSelectedDriver(null)}
              className="lg:hidden mb-4 flex items-center text-blue-600 hover:text-blue-700"
            >
              <span className="mr-1">←</span> Powrót do listy
            </button>

            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
              <div className="flex-1">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{selectedDriver.name}</h2>
                <p className="text-sm text-gray-500">Typ Prawa Jazdy: {selectedDriver.license_type}</p>
                <p className="text-sm text-gray-500">
                  Typ Kursu: {selectedDriver.course_type === "basic" ? "Podstawowy" : "Dodatkowy"}
                </p>
                <p className="text-sm text-gray-500">Placówka: {selectedDriver.branch || "Brak"}</p>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="flex gap-2">
                  <button
                    onClick={startEditMode}
                    className="flex-1 sm:flex-initial flex items-center justify-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    disabled={isPending}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Edytuj Profil</span>
                    <span className="sm:hidden">Edytuj</span>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    <span className="sm:hidden">Usuń</span>
                  </button>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs lg:text-sm font-medium text-center ${
                    selectedDriver.remaining_hours === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedDriver.remaining_hours === 0 ? "Ukończone" : "W Trakcie"}
                </div>
                {hasMissedPayment(selectedDriver) && (
                  <div className="px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-red-100 text-red-800 flex items-center justify-center">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6">
              <div className="flex items-center">
                <Phone className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs lg:text-sm text-gray-500">Telefon</div>
                  <div className="text-sm lg:text-base">{selectedDriver.phone}</div>
                </div>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs lg:text-sm text-gray-500">Email</div>
                  <div className="text-sm lg:text-base truncate">{selectedDriver.email}</div>
                </div>
              </div>
              {selectedDriver.course_type === "basic" ? (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-gray-400 flex-shrink-0" />
                  <div>
                    <>
                      <div className="text-xs lg:text-sm text-gray-500">Data Rozpoczęcia</div>
                      <div className="text-sm lg:text-base">{getDateStringFromId(selectedDriver.start_date)}</div>
                    </>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center">
                <FileText className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs lg:text-sm text-gray-500">Data Zawarcia Umowy</div>
                  <div className="text-sm lg:text-base">{selectedDriver.contract_date || "-"}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs lg:text-sm text-gray-500">Ukończone Godziny</div>
                  <div className="text-sm lg:text-base">{selectedDriver.completed_hours}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs lg:text-sm text-gray-500">Pozostałe Godziny</div>
                  <div className="text-sm lg:text-base">{selectedDriver.remaining_hours}</div>
                </div>
              </div>
            </div>

            {selectedDriver.paymentFiles.map((file, index) => (
              <div key={index} className="border rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center overflow-hidden">
                  <FileText className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">{new Date(file.lastModified).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isPdfFile(file) && (
                    <button
                      onClick={async () => {
                        let url = null
                        if (!url) {
                          url = await fetchSignedUrl(file.path)
                          console.log("Fetched URL:", url)
                          setSignedUrls((prev) => ({ ...prev, [file.path]: url }))
                        }
                        console.log("Preview URL:", file)
                        setPdfPreview({ ...file, path: url })
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Podgląd"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      let url = signedUrls[file.path]
                      if (!url) {
                        url = await fetchSignedUrl(file.path)
                        setSignedUrls((prev) => ({ ...prev, [file.path]: url }))
                      }
                      // Pobierz plik przez browser
                      const link = document.createElement("a")
                      link.href = url
                      link.download = file.name
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Pobierz"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="mb-6">
              <h3 className="text-base lg:text-lg font-semibold mb-3">Historia Jazd</h3>
              <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Data
                        </th>
                        <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Godzina
                        </th>
                        <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                          Instruktor
                        </th>
                        <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Czas
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events
                        .filter((event) => event.student_phone === selectedDriver.phone)
                        .map((event) => (
                          <tr key={event.id}>
                            <td className="px-3 lg:px-4 py-2 text-xs lg:text-sm whitespace-nowrap">
                              {formatDate(event.date)}
                            </td>
                            <td className="px-3 lg:px-4 py-2 text-xs lg:text-sm whitespace-nowrap">
                              {event.start_time} - {event.end_time}
                            </td>
                            <td className="px-3 lg:px-4 py-2 text-xs lg:text-sm hidden sm:table-cell">
                              {event.instructor}
                            </td>
                            <td className="px-3 lg:px-4 py-2 text-xs lg:text-sm">
                              {calculateDuration(event.start_time, event.end_time)}h
                            </td>
                          </tr>
                        ))}
                      {events.filter((event) => event.student_phone === selectedDriver.phone).length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
                            Brak historii jazd dla tego kierowcy.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base lg:text-lg font-semibold mb-3">Notatki</h3>
              <div className="p-3 lg:p-4 bg-gray-50 rounded-md text-sm lg:text-base whitespace-pre-wrap break-words">
                {selectedDriver.notes || "Brak notatek"}
              </div>
            </div>

            <PaymentForm driver={selectedDriver} />
          </div>
        ) : editMode ? (
          <div className="p-4 lg:p-6">
            <button
              onClick={cancelEditMode}
              className="lg:hidden mb-4 flex items-center text-blue-600 hover:text-blue-700"
            >
              <span className="mr-1">←</span> Anuluj
            </button>

            <h2 className="text-xl lg:text-2xl font-bold mb-6">Edytuj Profil Kierowcy</h2>
            <form onSubmit={handleEditDriverSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Imię i Nazwisko</label>
                  <input
                    type="text"
                    name="name"
                    value={editedDriver.name}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedDriver.phone}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedDriver.email}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Typ Prawa Jazdy</label>
                  <select
                    name="license_type"
                    value={editedDriver.license_type}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-md"
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
                    <option value="SzkolenieOkresowe">Szkolenie okresowe</option>
                    <option value="C&C+E&KWP">C & C + E & KWP </option>
                    <option value="B+E">B+E</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Typ Kursu</label>
                  <select
                    name="course_type"
                    value={editedDriver.course_type}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  >
                    <option value="basic">Podstawowy</option>
                    <option value="additional">Dodatkowy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Placówka</label>
                  <select
                    name="branch"
                    value={editedDriver.branch || "Widzew"}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  >
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
                {editedDriver.course_type === "basic" ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">Data Rozpoczęcia</label>
                    <select
                      name="start_date"
                      value={editedDriver.start_date}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 text-sm border rounded-md"
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
                ) : null}
                <div>
                  <label className="block text-sm font-medium mb-1">Data Zawarcia Umowy</label>
                  <input
                    type="date"
                    name="contract_date"
                    value={editedDriver.contract_date}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ukończone Godziny</label>
                  <input
                    type="number"
                    name="completed_hours"
                    value={editedDriver.completed_hours}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pozostałe Godziny</label>
                  <input
                    type="number"
                    name="remaining_hours"
                    value={editedDriver.remaining_hours}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cena Kursu (PLN)</label>
                  <input
                    type="number"
                    name="price"
                    value={editedDriver.price || 0}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Notatki</label>
                <textarea
                  name="notes"
                  value={editedDriver.notes}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  rows="4"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Typ Płatności</label>
                <select
                  name="payment_type"
                  value={editedDriver.payment_type}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                >
                  <option value="onetime">Jednorazowa</option>
                  <option value="installments">Raty</option>
                </select>
              </div>

              {editedDriver.payment_type === "installments" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Raty</label>
                  {editInstallments.map((installment, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="number"
                        placeholder="Godziny"
                        value={installment.hours}
                        onChange={(e) => handleEditInstallmentChange(index, "hours", Number.parseFloat(e.target.value))}
                        className="flex-1 px-3 py-2 text-sm border rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Kwota (PLN)"
                        value={installment.amount}
                        onChange={(e) =>
                          handleEditInstallmentChange(index, "amount", Number.parseFloat(e.target.value))
                        }
                        className="flex-1 px-3 py-2 text-sm border rounded-md"
                      />
                      {editInstallments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEditInstallment(index)}
                          className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEditInstallment}
                    className="flex items-center px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Dodaj Ratę
                  </button>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Dokumenty Płatności</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                  <input
                    type="file"
                    onChange={handleEditFileUpload}
                    className="flex-1 text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                {editedDriver.paymentFiles && editedDriver.paymentFiles.length > 0 && (
                  <div className="space-y-2">
                    {editedDriver.paymentFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs lg:text-sm"
                      >
                        <span className="truncate flex-1 mr-2">{typeof file === "string" ? file : file.name}</span>
                        <div className="flex gap-1 flex-shrink-0">
                          {typeof file === "string" && isPdfFile({ name: file }) && (
                            <button
                              type="button"
                              onClick={async () => {
                                const url = await fetchSignedUrl(file)
                                if (url) handlePreviewFile(url)
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {typeof file === "string" && (
                            <a
                              href="#"
                              onClick={async (e) => {
                                e.preventDefault()
                                const url = await fetchSignedUrl(file)
                                if (url) {
                                  const link = document.createElement("a")
                                  link.href = url
                                  link.download = file
                                  link.click()
                                }
                              }}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => removeEditFile(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEditMode}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  disabled={isPending}
                >
                  <Check className="w-4 h-4 mr-1" />
                  {isPending ? "Zapisywanie..." : "Zapisz Zmiany"}
                </button>
              </div>
            </form>
          </div>
        ) : showAddDriverForm ? (
          <>
            {/* Modal backdrop - tylko na telefonach */}
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddDriverForm(false)} />

            {/* Modal content */}
            <div className="lg:relative fixed lg:inset-auto inset-0 lg:z-auto z-50 flex items-start justify-center lg:block overflow-y-auto">
              <div className="lg:p-6 p-3 sm:p-4 bg-white lg:bg-transparent min-h-full lg:min-h-0 w-full max-w-2xl lg:max-w-none m-0 lg:m-0 mt-0 lg:mt-0">
                <button
                  onClick={() => setShowAddDriverForm(false)}
                  className="lg:hidden mb-4 flex items-center text-blue-600 hover:text-blue-700"
                >
                  <span className="mr-1">←</span> Anuluj
                </button>

                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">Dodaj Nowego Kierowcę</h2>
                <form onSubmit={handleAddDriverSubmit}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Imię i Nazwisko</label>
                      <input
                        type="text"
                        name="name"
                        value={newDriver.name}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Telefon</label>
                      <input
                        type="tel"
                        name="phone"
                        value={newDriver.phone}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newDriver.email}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Typ Prawa Jazdy</label>
                      <select
                        name="license_type"
                        value={newDriver.license_type}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
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
                        <option value="SzkolenieOkresowe">Szkolenie okresowe</option>
                        <option value="C&C+E&KWP">C & C + E & KWP </option>
                        <option value="B+E">B+E</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Typ Kursu</label>
                      <select
                        name="course_type"
                        value={newDriver.course_type}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                      >
                        <option value="basic">Podstawowy</option>
                        <option value="additional">Dodatkowy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Placówka</label>
                      <select
                        name="branch"
                        value={newDriver.branch}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                      >
                        {branches.map((branch) => (
                          <option key={branch} value={branch}>
                            {branch}
                          </option>
                        ))}
                      </select>
                    </div>
                    {newDriver.course_type === "basic" ? (
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">Data Rozpoczęcia</label>
                        <select
                          name="start_date"
                          value={newDriver.start_date}
                          onChange={handleInputChange}
                          className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
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
                    ) : null}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Data Zawarcia Umowy</label>
                      <input
                        type="date"
                        name="contract_date"
                        value={newDriver.contract_date}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Ukończone Godziny</label>
                      <input
                        type="number"
                        name="completed_hours"
                        value={newDriver.completed_hours}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Pozostałe Godziny</label>
                      <input
                        type="number"
                        name="remaining_hours"
                        value={newDriver.remaining_hours}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Cena Kursu (PLN)</label>
                      <input
                        type="number"
                        name="price"
                        value={newDriver.price || 0}
                        onChange={handleInputChange}
                        className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium mb-1">Notatki</label>
                    <textarea
                      name="notes"
                      value={newDriver.notes}
                      onChange={handleInputChange}
                      className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                      rows="3"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium mb-1">Typ Płatności</label>
                    <select
                      name="payment_type"
                      value={newDriver.payment_type}
                      onChange={handleInputChange}
                      className="w-full px-2 sm:px-3 py-2 text-sm border rounded-md"
                    >
                      <option value="onetime">Jednorazowa</option>
                      <option value="installments">Raty</option>
                    </select>
                  </div>

                  {newDriver.payment_type === "installments" && (
                    <div className="mb-4">
                      <label className="block text-xs sm:text-sm font-medium mb-2">Raty</label>
                      {installments.map((installment, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                          <input
                            type="number"
                            placeholder="Godziny"
                            value={installment.hours}
                            onChange={(e) => handleInstallmentChange(index, "hours", Number.parseFloat(e.target.value))}
                            className="flex-1 px-2 sm:px-3 py-2 text-sm border rounded-md"
                          />
                          <input
                            type="number"
                            placeholder="Kwota (PLN)"
                            value={installment.amount}
                            onChange={(e) =>
                              handleInstallmentChange(index, "amount", Number.parseFloat(e.target.value))
                            }
                            className="flex-1 px-2 sm:px-3 py-2 text-sm border rounded-md"
                          />
                          {installments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeInstallment(index)}
                              className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addInstallment}
                        className="flex items-center px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Dodaj Ratę
                      </button>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium mb-2">Dokumenty Płatności</label>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="w-full text-xs sm:text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {newDriver.paymentFiles.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {newDriver.paymentFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs sm:text-sm"
                          >
                            <span className="truncate flex-1 mr-2">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddDriverForm(false)
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
                      }}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      disabled={isPending}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {isPending ? "Dodawanie..." : "Dodaj Kierowcę"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm lg:text-base">Wybierz kierowcę z listy lub dodaj nowego</p>
            </div>
          </div>
        )}
      </div>

      {pdfPreview && <PdfViewer pdfUrl={pdfPreview} onClose={handleClosePreview} />}
    </div>
  )
}
