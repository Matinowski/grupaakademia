"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Check,
  Clock,
  AlertCircle,
  Filter,
  ChevronDown,
  Edit,
  Trash2,
  Building,
  Calendar,
  User,
} from "lucide-react"

// Statusy zadań
const TASK_STATUSES = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
}

// Priorytety zadań
const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
}



export default function BranchReports({
  branches = [
    { id: "retkinia", name: "Retkinia" },
    { id: "widzew", name: "Widzew" },
    { id: "ozorkow", name: "Ozorków" },
  ],
}) {
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    status: TASK_STATUSES.NOT_STARTED,
    priority: TASK_PRIORITIES.MEDIUM,
    due_date: "",
  })

  // Pobieranie raportów dla wybranej placówki
  useEffect(() => {
    if (selectedBranch !== null) {
      fetchReportsForBranch()
    } else {
      setReports([])
      setFilteredReports([])
    }
  }, [selectedBranch])

  // Funkcja pobierająca raporty dla wybranej placówki
  const fetchReportsForBranch = async () => {
    setIsLoading(true)
    try {
      const query = selectedBranch ? `?branchId=${selectedBranch}` : ""
      const res = await fetch(`/api/reports${query}`)
      const data = await res.json()
  
      if (!res.ok) throw new Error(data.error || "Błąd pobierania")
  
      setReports(data)
      setFilteredReports(data)
    } catch (error) {
      console.error("Błąd podczas pobierania raportów:", error)
    } finally {
      setIsLoading(false)
    }
  }
  

  // Filtrowanie raportów
  useEffect(() => {
    let filtered = [...reports]

    // Filtrowanie po wyszukiwaniu
    if (searchQuery) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtrowanie po statusie
    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }

    // Filtrowanie po priorytecie
    if (priorityFilter !== "all") {
      filtered = filtered.filter((report) => report.priority === priorityFilter)
    }

    setFilteredReports(filtered)
  }, [reports, searchQuery, statusFilter, priorityFilter])

  // Dodawanie nowego raportu
  const handleAddReport = async (e) => {
    e.preventDefault()
  
    const newReportWithId = {
      ...newReport,
      branch: selectedBranch === "general" ? null : selectedBranch,
    }
  
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReportWithId),
      })
      const data = await res.json()
  
      if (!res.ok) throw new Error(data.error || "Błąd dodawania raportu")
  
      setReports([...reports, data])
      setShowAddForm(false)
      setNewReport({
        title: "",
        description: "",
        status: TASK_STATUSES.NOT_STARTED,
        priority: TASK_PRIORITIES.MEDIUM,
        due_date: "",
      })
    } catch (error) {
      console.error("Błąd podczas dodawania raportu:", error)
      alert("Nie udało się dodać raportu. Spróbuj ponownie.")
    }
  }
  

  // Aktualizacja raportu
  const handleUpdateReport = async (e) => {
    e.preventDefault()
  
    try {
      const res = await fetch(`/api/reports/${editingReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingReport),
      })
      const data = await res.json()
  
      if (!res.ok) throw new Error(data.error || "Błąd aktualizacji")
  
      const updatedReports = reports.map((r) => (r.id === data.id ? data : r))
      setReports(updatedReports)
      setEditingReport(null)
    } catch (error) {
      console.error("Błąd podczas aktualizacji raportu:", error)
      alert("Nie udało się zaktualizować raportu.")
    }
  }
  

  // Zmiana statusu raportu
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const reportToUpdate = reports.find((r) => r.id === reportId)
      if (!reportToUpdate) return
  
      const updatedReport = {
        ...reportToUpdate,
        status: newStatus,
        ...(newStatus === TASK_STATUSES.COMPLETED
          ? { completed_at: new Date().toISOString() }
          : {}),
      }
  
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedReport),
      })
      const data = await res.json()
  
      if (!res.ok) throw new Error(data.error || "Błąd zmiany statusu")
  
      const updatedReports = reports.map((r) => (r.id === reportId ? data : r))
      setReports(updatedReports)
    } catch (error) {
      console.error("Błąd zmiany statusu:", error)
      alert("Nie udało się zmienić statusu.")
    }
  }
  

  // Usuwanie raportu
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten raport?")) return
  
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      })
      const data = await res.json()
  
      if (!res.ok) throw new Error(data.error || "Błąd usuwania raportu")
  
      setReports(reports.filter((r) => r.id !== reportId))
    } catch (error) {
      console.error("Błąd podczas usuwania raportu:", error)
      alert("Nie udało się usunąć raportu.")
    }
  }
  

  // Formatowanie daty
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pl-PL")
  }

  // Renderowanie statusu
  const renderStatus = (status) => {
    switch (status) {
      case TASK_STATUSES.COMPLETED:
        return (
          <span className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded-full text-sm">
            <Check className="w-4 h-4 mr-1" />
            Zrobione
          </span>
        )
      case TASK_STATUSES.IN_PROGRESS:
        return (
          <span className="flex items-center text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4 mr-1" />W trakcie
          </span>
        )
      case TASK_STATUSES.NOT_STARTED:
        return (
          <span className="flex items-center text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Nie rozpoczęte
          </span>
        )
      default:
        return null
    }
  }

  // Renderowanie priorytetu
  const renderPriority = (priority) => {
    switch (priority) {
      case TASK_PRIORITIES.HIGH:
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Wysoki</span>
      case TASK_PRIORITIES.MEDIUM:
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Średni</span>
      case TASK_PRIORITIES.LOW:
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Niski</span>
      default:
        return null
    }
  }

  // Renderowanie kafelków placówek
  const renderBranchTiles = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {/* Kafelek dla raportów ogólnych */}
        <div
          onClick={() => setSelectedBranch("general")}
          className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedBranch === "general" ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <div className="flex items-center justify-center mb-3">
            <Building className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-center">Ogólne</h3>
          <p className="text-sm text-gray-500 text-center mt-1">Raporty dotyczące wszystkich placówek</p>
        </div>

        {/* Kafelki dla poszczególnych placówek */}
        {branches.map((branch) => (
          <div
            key={branch.id}
            onClick={() => setSelectedBranch(branch.id)}
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
              selectedBranch === branch.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="flex items-center justify-center mb-3">
              <Building className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-center">{branch.name}</h3>
            <p className="text-sm text-gray-500 text-center mt-1">Raporty dla placówki</p>
          </div>
        ))}
      </div>
    )
  }

  // Renderowanie nagłówka dla wybranej placówki
  const renderSelectedBranchHeader = () => {
    if (!selectedBranch) return null

    const branchName =
      selectedBranch === "general" ? "Ogólne" : branches.find((b) => b.id === selectedBranch)?.name || ""

    return (
      <div className="flex items-center mb-4">
        <button onClick={() => setSelectedBranch(null)} className="mr-3 text-blue-600 hover:text-blue-800">
          &larr; Powrót
        </button>
        <h2 className="text-xl font-bold">Raporty: {branchName}</h2>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{selectedBranch ? "Raporty Placówki" : "Placówki"}</h1>
          {selectedBranch && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" />
              Dodaj Nowy Raport
            </button>
          )}
        </div>

        {/* Widok kafelków placówek */}
        {!selectedBranch && renderBranchTiles()}

        {/* Widok raportów dla wybranej placówki */}
        {selectedBranch && (
          <>
            {renderSelectedBranchHeader()}

            {/* Wyszukiwarka i filtry */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Szukaj raportów..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                  >
                    <Filter className="w-5 h-5 mr-1" />
                    Filtry
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Wszystkie statusy</option>
                      <option value={TASK_STATUSES.NOT_STARTED}>Nie rozpoczęte</option>
                      <option value={TASK_STATUSES.IN_PROGRESS}>W trakcie</option>
                      <option value={TASK_STATUSES.COMPLETED}>Zrobione</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorytet</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Wszystkie priorytety</option>
                      <option value={TASK_PRIORITIES.LOW}>Niski</option>
                      <option value={TASK_PRIORITIES.MEDIUM}>Średni</option>
                      <option value={TASK_PRIORITIES.HIGH}>Wysoki</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Formularz dodawania/edycji raportu */}
            {(showAddForm || editingReport) && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">{editingReport ? "Edytuj Raport" : "Dodaj Nowy Raport"}</h2>
                <form onSubmit={editingReport ? handleUpdateReport : handleAddReport} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tytuł</label>
                      <input
                        type="text"
                        value={editingReport ? editingReport.title : newReport.title}
                        onChange={(e) =>
                          editingReport
                            ? setEditingReport({ ...editingReport, title: e.target.value })
                            : setNewReport({ ...newReport, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Termin wykonania</label>
                      <input
                        type="date"
                        value={editingReport ? editingReport.due_date : newReport.due_date}
                        onChange={(e) =>
                          editingReport
                            ? setEditingReport({ ...editingReport, due_date: e.target.value })
                            : setNewReport({ ...newReport, due_date: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
          
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priorytet</label>
                      <select
                        value={editingReport ? editingReport.priority : newReport.priority}
                        onChange={(e) =>
                          editingReport
                            ? setEditingReport({ ...editingReport, priority: e.target.value })
                            : setNewReport({ ...newReport, priority: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={TASK_PRIORITIES.LOW}>Niski</option>
                        <option value={TASK_PRIORITIES.MEDIUM}>Średni</option>
                        <option value={TASK_PRIORITIES.HIGH}>Wysoki</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                      <textarea
                        value={editingReport ? editingReport.description : newReport.description}
                        onChange={(e) =>
                          editingReport
                            ? setEditingReport({ ...editingReport, description: e.target.value })
                            : setNewReport({ ...newReport, description: e.target.value })
                        }
                        rows="3"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      ></textarea>
                    </div>
                    {editingReport && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editingReport.status}
                          onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={TASK_STATUSES.NOT_STARTED}>Nie rozpoczęte</option>
                          <option value={TASK_STATUSES.IN_PROGRESS}>W trakcie</option>
                          <option value={TASK_STATUSES.COMPLETED}>Zrobione</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingReport(null)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      {editingReport ? "Zapisz zmiany" : "Dodaj raport"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista raportów */}
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-500">Ładowanie raportów...</div>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {renderStatus(report.status)}
                            {renderPriority(report.priority)}
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                          <p className="text-gray-600 mb-4">{report.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-500 mr-1">Placówka:</span>
                              <span>
                                {report.branch
                                  ? branches.find((b) => b.id === report.branch)?.name || report.branch
                                  : "Ogólne (wszystkie placówki)"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-500 mr-1">Termin:</span>
                              <span>{formatDate(report.due_date)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => setEditingReport(report)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Utworzono: {formatDate(report.created_at)}
                        {report.completedAt && <span> • Ukończono: {formatDate(report.completedAt)}</span>}
                      </div>

                      {report.status !== TASK_STATUSES.COMPLETED && (
                        <div className="flex gap-2">
                          {report.status === TASK_STATUSES.NOT_STARTED && (
                            <button
                              onClick={() => handleStatusChange(report.id, TASK_STATUSES.IN_PROGRESS)}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Rozpocznij
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(report.id, TASK_STATUSES.COMPLETED)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Oznacz jako ukończone
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-500 mb-2">Nie znaleziono raportów spełniających kryteria.</div>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                    setPriorityFilter("all")
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Wyczyść filtry
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
