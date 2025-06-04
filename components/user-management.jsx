"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Check, X, Filter, ChevronDown, Shield, User, Users, Building, RefreshCw } from 'lucide-react'
import { LoadingProvider, useLoadingScreen, LoadingIndicator } from "@/components/loader/loading-screen"
import { useNotification } from "@/hooks/use-notification"

// Role użytkowników
const USER_ROLES = {
  OFFICE: "biuro",
  INSTRUCTOR: "instruktor",
  ADMIN: "admin",
}

// Status użytkowników
const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
}

// Kategorie prawa jazdy
const LICENSE_CATEGORIES = ["A", "A1", "A2", "AM", "B", "B1", "C", "C1", "D", "D1", "BE", "CE", "C1E", "DE", "D1E", "T"]

function UserManagementContent() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { showLoading, updateLoading, hideLoading } = useLoadingScreen()

  const [newUser, setNewUser] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    role: USER_ROLES.OFFICE,
    branches: [],
    status: USER_STATUS.ACTIVE,
    licenseCategory: "",
  })

  // Lista placówek
  const branches = ["Widzew", "Bałuty", "Zgierz", "Górna", "Dąbrowa", "Retkinia", "Moto-akademia", "Zawodowa-Akademia", "Budowlana-Akademia", "Kwalifikacje i szkolenia Okresowe"]
  const notification = useNotification()

  // Przykładowe dane użytkowników
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    showLoading("Ładowanie użytkowników...", 10)

    // Symulacja ładowania danych z API
    const fetchUsers = async () => {
      try {
        updateLoading("Pobieranie danych...", 30)

        const response = await fetch("/api/users/admin/getallusers")
        updateLoading("Przetwarzanie danych...", 70)

        const data = await response.json()
        console.log("Dane użytkowników:", data)

        if (response.ok) {
          updateLoading("Finalizowanie...", 90)
          setUsers(data.user)
          setFilteredUsers(data.user)
        } else {
          console.error("Błąd podczas ładowania użytkowników:", data.error)
        }
      } catch (error) {
        console.error("Błąd podczas ładowania użytkowników:", error)
      } finally {
        setTimeout(() => {
          hideLoading()
          setIsLoading(false)
        }, 500)
      }
    }
    await fetchUsers()
    console.log("Użytkownicy:", users)
  }

  // Filtrowanie użytkowników
  useEffect(() => {
    let filtered = [...users]

    // Filtrowanie po wyszukiwaniu
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          `${user.name} ${user.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone.includes(searchQuery),
      )
    }

    // Filtrowanie po roli
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Filtrowanie po statusie
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    // Filtrowanie po placówce
    if (branchFilter !== "all") {
      filtered = filtered.filter((user) => 
        user.branches && user.branches.includes(branchFilter)
      )
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter, statusFilter, branchFilter])

  // Dodawanie nowego użytkownika
  const handleAddUser = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/users/admin/adduser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          surname: newUser.surname,
          phone: newUser.phone,
          role: newUser.role,
          branches: newUser.branches,
          status: newUser.status,
          licenseCategory: newUser.role === USER_ROLES.INSTRUCTOR ? newUser.licenseCategory : null,
        }),
      })
      notification.success("Użytkownik został dodany")
      const result = await response.json()
      alert(`Tymczasowe hasło: ${result.tempPassword}`)
    } catch (error) {
      console.error("Błąd podczas dodawania użytkownika:", error)
    }

    setUsers([...users, newUser])
    setNewUser({
      name: "",
      surname: "",
      email: "",
      phone: "",
      role: USER_ROLES.OFFICE,
      branches: [],
      status: USER_STATUS.ACTIVE,
      licenseCategory: "",
    })
    setShowAddForm(false)
  }

  // Aktualizacja użytkownika
  const handleUpdateUser = (e) => {
    e.preventDefault()

    const updatedUser = { ...editingUser }
    try {
      fetch("/api/users/admin/edituser", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      })
      notification.success("Użytkownik został zaktualizowany")
    } catch (error) {
      console.error("Błąd podczas aktualizacji użytkownika:", error)
      notification.error("Błąd podczas aktualizacji użytkownika")
    }

    const updatedUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    setUsers(updatedUsers)
    setEditingUser(null)
  }

  // Usuwanie użytkownika
  const handleDeleteUser = (userId) => {
    if (window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
      const updatedUsers = users.filter((user) => user.id !== userId)
      try {
        fetch(`/api/users/admin/deleteuser`, {
          method: "DELETE",
          body: JSON.stringify({ id: userId }),
        })

        notification.success("Użytkownik został usunięty")
      } catch (error) {
        console.error("Błąd podczas usuwania użytkownika:", error)
        notification.error("Błąd podczas usuwania użytkownika")
      }
      setUsers(updatedUsers)
    }
  }

  // Zmiana statusu użytkownika
  const handleToggleStatus = (userId) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return {
          ...user,
          status: user.status === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE,
        }
      }
      return user
    })
    setUsers(updatedUsers)
  }

  // Formatowanie daty
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Formatowanie czasu
  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
  }

  // Renderowanie roli użytkownika
  const renderRole = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return (
          <span className="flex items-center text-purple-700 bg-purple-100 px-2 py-1 rounded-full text-sm">
            <Shield className="w-4 h-4 mr-1" />
            Administrator
          </span>
        )
      case USER_ROLES.INSTRUCTOR:
        return (
          <span className="flex items-center text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-sm">
            <User className="w-4 h-4 mr-1" />
            Instruktor
          </span>
        )
      case USER_ROLES.OFFICE:
        return (
          <span className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded-full text-sm">
            <Building className="w-4 h-4 mr-1" />
            Pracownik biura
          </span>
        )
      default:
        return null
    }
  }

  // Renderowanie statusu użytkownika
  const renderStatus = (status) => {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return (
          <span className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded-full text-sm">
            <Check className="w-4 h-4 mr-1" />
            Aktywny
          </span>
        )
      case USER_STATUS.INACTIVE:
        return (
          <span className="flex items-center text-red-700 bg-red-100 px-2 py-1 rounded-full text-sm">
            <X className="w-4 h-4 mr-1" />
            Nieaktywny
          </span>
        )
      default:
        return null
    }
  }

  // Resetowanie hasła użytkownika
  const handleResetPassword = async (userId) => {
    try {
      showLoading("Resetowanie hasła...", 30)

      const response = await fetch("/api/users/admin/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      })

      const result = await response.json()

      if (response.ok) {
        notification.success("Hasło zostało zresetowane")
        if (result.tempPassword) {
          alert(`Tymczasowe hasło: ${result.tempPassword}`)
        }
      } else {
        notification.error(result.error || "Błąd podczas resetowania hasła")
      }
    } catch (error) {
      console.error("Błąd podczas resetowania hasła:", error)
      notification.error("Wystąpił błąd podczas resetowania hasła")
    } finally {
      hideLoading()
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 overflow-y-scroll">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Zarządzanie Użytkownikami</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 mr-1" />
              Filtry
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={loadUsers}
              className={`flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Odśwież
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-1" />
              Dodaj Użytkownika
            </button>
          </div>
        </div>

        {/* Wyszukiwarka i filtry */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj użytkowników..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500 mr-2">Użytkownicy: {filteredUsers.length}</span>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Wszystkie role</option>
                  <option value={USER_ROLES.ADMIN}>Administrator</option>
                  <option value={USER_ROLES.INSTRUCTOR}>Instruktor</option>
                  <option value={USER_ROLES.OFFICE}>Pracownik biura</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Wszystkie statusy</option>
                  <option value={USER_STATUS.ACTIVE}>Aktywny</option>
                  <option value={USER_STATUS.INACTIVE}>Nieaktywny</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placówka</label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Wszystkie placówki</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Formularz dodawania/edycji użytkownika */}
        {(showAddForm || editingUser) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? "Edytuj Użytkownika" : "Dodaj Nowego Użytkownika"}
            </h2>
            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
                  <input
                    type="text"
                    value={editingUser ? editingUser.name : newUser.name}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, name: e.target.value })
                        : setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
                  <input
                    type="text"
                    value={editingUser ? editingUser.surname : newUser.surname}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, surname: e.target.value })
                        : setNewUser({ ...newUser, surname: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser ? editingUser.email : newUser.email}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, email: e.target.value })
                        : setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={editingUser ? editingUser.phone : newUser.phone}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, phone: e.target.value })
                        : setNewUser({ ...newUser, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
                  <select
                    value={editingUser ? editingUser.role : newUser.role}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, role: e.target.value })
                        : setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={USER_ROLES.OFFICE}>Pracownik biura</option>
                    <option value={USER_ROLES.INSTRUCTOR}>Instruktor</option>
                    <option value={USER_ROLES.ADMIN}>Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placówki</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {branches.map((branch) => (
                      <label key={branch} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingUser 
                            ? (editingUser.branches || []).includes(branch)
                            : newUser.branches.includes(branch)
                          }
                          onChange={(e) => {
                            const currentBranches = editingUser 
                              ? (editingUser.branches || [])
                              : newUser.branches;
                            
                            if (e.target.checked) {
                              const newBranches = [...currentBranches, branch];
                              if (editingUser) {
                                setEditingUser({ ...editingUser, branches: newBranches });
                              } else {
                                setNewUser({ ...newUser, branches: newBranches });
                              }
                            } else {
                              const newBranches = currentBranches.filter(b => b !== branch);
                              if (editingUser) {
                                setEditingUser({ ...editingUser, branches: newBranches });
                              } else {
                                setNewUser({ ...newUser, branches: newBranches });
                              }
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{branch}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {(editingUser ? editingUser.role : newUser.role) === USER_ROLES.INSTRUCTOR && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria prawa jazdy</label>
                    <select
                      value={editingUser ? editingUser.licenseCategory || "" : newUser.licenseCategory}
                      onChange={(e) =>
                        editingUser
                          ? setEditingUser({ ...editingUser, licenseCategory: e.target.value })
                          : setNewUser({ ...newUser, licenseCategory: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={
                        editingUser
                          ? editingUser.role === USER_ROLES.INSTRUCTOR
                          : newUser.role === USER_ROLES.INSTRUCTOR
                      }
                    >
                      <option value="">Wybierz kategorię</option>
                      {LICENSE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingUser ? editingUser.status : newUser.status}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, status: e.target.value })
                        : setNewUser({ ...newUser, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={USER_STATUS.ACTIVE}>Aktywny</option>
                    <option value={USER_STATUS.INACTIVE}>Nieaktywny</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingUser(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingUser ? "Zapisz zmiany" : "Dodaj użytkownika"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista użytkowników */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
          {isLoading ? (
            <LoadingIndicator className="absolute inset-0 z-10" size="md" />
          ) : (
            <>
              {/* Desktop view - table (only visible at 1500px and above) */}
              <div className="hidden min-[1500px]:block overflow-x-scroll">
                <table className="min-w-full divide-y divide-gray-200 ">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Użytkownik
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Kontakt
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rola
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Placówka
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Ostatnie logowanie
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Akcje</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {user.name.charAt(0)}
                                {user.surname.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name} {user.surname}
                              </div>
                              <div className="text-sm text-gray-500">Utworzono: {formatDate(user.created_at)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{renderRole(user.role)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.branches && user.branches.length > 0 
                            ? user.branches.join(", ")
                            : "Brak przypisanych placówek"
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{renderStatus(user.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login ? (
                            <>
                              {formatDate(user.last_login)}
                              <div className="text-xs text-gray-400">{formatTime(user.last_login)}</div>
                            </>
                          ) : (
                            "Nigdy"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end items-center space-x-2">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
                              title="Edytuj"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                              title="Usuń"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Czy na pewno chcesz zresetować hasło dla ${user.name} ${user.surname}?`,
                                  )
                                ) {
                                  handleResetPassword(user.id)
                                }
                              }}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                              title="Resetuj hasło"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet view - cards (visible below 1500px) */}
              <div className="min-[1500px]:hidden">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border-b p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-gray-600 font-medium">
                            {user.name.charAt(0)}
                            {user.surname.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.name} {user.surname}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(`Czy na pewno chcesz zresetować hasło dla ${user.name} ${user.surname}?`)
                          ) {
                            handleResetPassword(user.id)
                          }
                        }}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                        title="Resetuj hasło"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <div className="text-gray-500">Telefon</div>
                        <div>{user.phone}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Placówki</div>
                        <div>{user.branches && user.branches.length > 0 
                          ? user.branches.join(", ")
                          : "Brak przypisanych placówek"
                        }</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Rola</div>
                        <div>{renderRole(user.role)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Status</div>
                        <div>{renderStatus(user.status)}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="px-3 py-1 text-xs text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100"
                      >
                        Edytuj
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1 text-xs text-red-600 bg-red-50 rounded-full hover:bg-red-100"
                      >
                        Usuń
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(`Czy na pewno chcesz zresetować hasło dla ${user.name} ${user.surname}?`)
                          ) {
                            handleResetPassword(user.id)
                          }
                        }}
                        className="px-3 py-1 text-xs text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100"
                      >
                        Reset hasła
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-2">Nie znaleziono użytkowników spełniających kryteria.</div>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setRoleFilter("all")
                  setStatusFilter("all")
                  setBranchFilter("all")
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Wyczyść filtry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Wrapper component to provide LoadingProvider context
export default function UserManagement() {
  return (
    <LoadingProvider>
      <UserManagementContent />
    </LoadingProvider>
  )
}