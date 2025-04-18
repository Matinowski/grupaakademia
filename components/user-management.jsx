"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Filter,
  ChevronDown,
  Shield,
  User,
  Users,
  Building,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react"

// Role użytkowników
const USER_ROLES = {
  OFFICE: "pracownik_biura",
  INSTRUCTOR: "instruktor",
  ADMIN: "administrator",
}

// Status użytkowników
const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
}

export default function UserManagement() {
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

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: USER_ROLES.OFFICE,
    branch: "",
    status: USER_STATUS.ACTIVE,
    password: "",
    confirmPassword: "",
  })

  // Lista placówek
  const branches = ["Widzew", "Bałuty", "Zgierz", "Górna", "Dąbrowa", "Retkinia"]

  // Przykładowe dane użytkowników
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setIsLoading(true)

    // Symulacja ładowania danych z API
    setTimeout(() => {
      const sampleUsers = [
        {
          id: "1",
          firstName: "Jan",
          lastName: "Kowalski",
          email: "jan.kowalski@akademia.pl",
          phone: "601-234-567",
          role: USER_ROLES.ADMIN,
          branch: "Widzew",
          status: USER_STATUS.ACTIVE,
          lastLogin: "2025-04-17T08:30:00Z",
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          firstName: "Anna",
          lastName: "Nowak",
          email: "anna.nowak@akademia.pl",
          phone: "602-345-678",
          role: USER_ROLES.INSTRUCTOR,
          branch: "Bałuty",
          status: USER_STATUS.ACTIVE,
          lastLogin: "2025-04-18T09:15:00Z",
          createdAt: "2024-02-10T11:30:00Z",
        },
        {
          id: "3",
          firstName: "Piotr",
          lastName: "Wiśniewski",
          email: "piotr.wisniewski@akademia.pl",
          phone: "603-456-789",
          role: USER_ROLES.OFFICE,
          branch: "Zgierz",
          status: USER_STATUS.ACTIVE,
          lastLogin: "2025-04-16T14:45:00Z",
          createdAt: "2024-03-05T09:00:00Z",
        },
        {
          id: "4",
          firstName: "Magdalena",
          lastName: "Lewandowska",
          email: "magdalena.lewandowska@akademia.pl",
          phone: "604-567-890",
          role: USER_ROLES.INSTRUCTOR,
          branch: "Górna",
          status: USER_STATUS.INACTIVE,
          lastLogin: "2025-03-30T10:20:00Z",
          createdAt: "2024-01-20T13:15:00Z",
        },
        {
          id: "5",
          firstName: "Tomasz",
          lastName: "Kamiński",
          email: "tomasz.kaminski@akademia.pl",
          phone: "605-678-901",
          role: USER_ROLES.OFFICE,
          branch: "Dąbrowa",
          status: USER_STATUS.ACTIVE,
          lastLogin: "2025-04-18T11:10:00Z",
          createdAt: "2024-02-25T08:45:00Z",
        },
        {
          id: "6",
          firstName: "Karolina",
          lastName: "Zielińska",
          email: "karolina.zielinska@akademia.pl",
          phone: "606-789-012",
          role: USER_ROLES.INSTRUCTOR,
          branch: "Retkinia",
          status: USER_STATUS.ACTIVE,
          lastLogin: "2025-04-17T15:30:00Z",
          createdAt: "2024-03-15T10:30:00Z",
        },
      ]

      setUsers(sampleUsers)
      setFilteredUsers(sampleUsers)
      setIsLoading(false)
    }, 500)
  }

  // Filtrowanie użytkowników
  useEffect(() => {
    let filtered = [...users]

    // Filtrowanie po wyszukiwaniu
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      filtered = filtered.filter((user) => user.branch === branchFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter, statusFilter, branchFilter])

  // Dodawanie nowego użytkownika
  const handleAddUser = (e) => {
    e.preventDefault()

    if (newUser.password !== newUser.confirmPassword) {
      alert("Hasła nie są identyczne!")
      return
    }

    const newUserWithId = {
      ...newUser,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastLogin: null,
    }

    // Usuwamy potwierdzenie hasła przed zapisaniem
    delete newUserWithId.confirmPassword

    setUsers([...users, newUserWithId])
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: USER_ROLES.OFFICE,
      branch: "",
      status: USER_STATUS.ACTIVE,
      password: "",
      confirmPassword: "",
    })
    setShowAddForm(false)
  }

  // Aktualizacja użytkownika
  const handleUpdateUser = (e) => {
    e.preventDefault()

    if (editingUser.password && editingUser.password !== editingUser.confirmPassword) {
      alert("Hasła nie są identyczne!")
      return
    }

    const updatedUser = { ...editingUser }

    // Jeśli nie zmieniamy hasła, usuwamy pola związane z hasłem
    if (!updatedUser.password) {
      delete updatedUser.password
    }
    delete updatedUser.confirmPassword

    const updatedUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    setUsers(updatedUsers)
    setEditingUser(null)
  }

  // Usuwanie użytkownika
  const handleDeleteUser = (userId) => {
    if (window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
      const updatedUsers = users.filter((user) => user.id !== userId)
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

  return (
    <div className="bg-gray-50 min-h-screen p-6">
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
                    value={editingUser ? editingUser.firstName : newUser.firstName}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, firstName: e.target.value })
                        : setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
                  <input
                    type="text"
                    value={editingUser ? editingUser.lastName : newUser.lastName}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, lastName: e.target.value })
                        : setNewUser({ ...newUser, lastName: e.target.value })
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placówka</label>
                  <select
                    value={editingUser ? editingUser.branch : newUser.branch}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, branch: e.target.value })
                        : setNewUser({ ...newUser, branch: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Wybierz placówkę</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingUser ? "Nowe hasło (zostaw puste, aby nie zmieniać)" : "Hasło"}
                  </label>
                  <input
                    type="password"
                    value={editingUser ? editingUser.password || "" : newUser.password}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, password: e.target.value })
                        : setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Potwierdź hasło</label>
                  <input
                    type="password"
                    value={editingUser ? editingUser.confirmPassword || "" : newUser.confirmPassword}
                    onChange={(e) =>
                      editingUser
                        ? setEditingUser({ ...editingUser, confirmPassword: e.target.value })
                        : setNewUser({ ...newUser, confirmPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingUser || (editingUser && editingUser.password)}
                  />
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
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
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">Utworzono: {formatDate(user.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderRole(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderStatus(user.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? (
                        <>
                          {formatDate(user.lastLogin)}
                          <div className="text-xs text-gray-400">{formatTime(user.lastLogin)}</div>
                        </>
                      ) : (
                        "Nigdy"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-1 rounded-full ${
                            user.status === USER_STATUS.ACTIVE
                              ? "text-red-600 hover:bg-red-100"
                              : "text-green-600 hover:bg-green-100"
                          }`}
                          title={user.status === USER_STATUS.ACTIVE ? "Dezaktywuj" : "Aktywuj"}
                        >
                          {user.status === USER_STATUS.ACTIVE ? (
                            <X className="w-5 h-5" />
                          ) : (
                            <Check className="w-5 h-5" />
                          )}
                        </button>
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
                        <div className="relative group">
                          <button className="p-1 text-gray-500 hover:bg-gray-100 rounded-full">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                            <div className="py-1">
                              <a
                                href="#"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.preventDefault()
                                  alert(`Resetowanie hasła dla ${user.firstName} ${user.lastName}`)
                                }}
                              >
                                Resetuj hasło
                              </a>
                              <a
                                href="#"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.preventDefault()
                                  alert(`Wysyłanie powiadomienia do ${user.firstName} ${user.lastName}`)
                                }}
                              >
                                Wyślij powiadomienie
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
