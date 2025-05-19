"use client"

import { useState } from "react"
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Plus,
  Users,
  User,
  Settings,
  Home,
  BookOpen,
  CreditCard,
  Database,
  Book,
} from "lucide-react"

import { useAuth } from "@/hooks/use-auth"




export default function Sidebar({
  calendars = [],
  instructors = [],
  drivers = [],
  onCalendarToggle,
  onAddCalendar,
  onCalendarColorChange,
  activeSection,
  onSectionChange,
  onInstructorToggle,
  onDriverToggle,
}) {
  console.log("Sidebar calendars:", calendars)
  const [expanded, setExpanded] = useState({
    myCalendars: true,
    otherCalendars: false,
    navigation: true,
    instructors: false,
    drivers: false,
  })

  const [newCalendarName, setNewCalendarName] = useState("")
  const [showAddCalendarInput, setShowAddCalendarInput] = useState(false)
  const [selectedInstructors, setSelectedInstructors] = useState({})
  const [selectedDrivers, setSelectedDrivers] = useState({})

    const { user } = useAuth()
    let navigationItems = []

    if(user && user.role === "admin") {
      // Zmieniamy etykiety w menu nawigacyjnym
      navigationItems = [
  { id: "dashboard", name: "Pulpit", icon: Home },
  { id: "calendar", name: "Kalendarz", icon: Calendar },
  { id: "drivers", name: "Profile Kursantów", icon: Users },
  { id: "instructors", name: "Profile Instruktorów", icon: BookOpen },
  { id: "raports", name: "Raporty", icon: Book },
  { id: "finances", name: "Finanse", icon: CreditCard },
  { id: "excel", name: "Wykaz data/placowka/licencja", icon: Database },
  { id: "users", name: "Zarządzanie kontami", icon: User },
]

    } else if(user && user.role === "instructor") { 
      navigationItems = [
        { id: "calendar", name: "Kalendarz", icon: Calendar },
        { id: "drivers", name: "Profile Kursantów", icon: Users },
      ]
    } else if(user && user.role === "biuro") { 
      navigationItems = [
        { id: "calendar", name: "Kalendarz", icon: Calendar },
        { id: "drivers", name: "Profile Kursantów", icon: Users },
        { id: "instructors", name: "Profile Instruktorów", icon: BookOpen },
        { id: "raports", name: "Raporty", icon: Book },
        { id: "excel", name: "Wykaz data/placowka/licencja", icon: Database },
      ]

    }


    console.log("User from sidebar:", user)

  const toggleSection = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section],
    })
  }

  const handleCalendarToggle = (calendarId) => {
    onCalendarToggle(calendarId)
  }

  const handleInstructorToggle = (instructor_id) => {
    const newSelectedInstructors = {
      ...selectedInstructors,
      [instructor_id]: !selectedInstructors[instructor_id],
    }
    setSelectedInstructors(newSelectedInstructors)
    if (onInstructorToggle) {
      onInstructorToggle(instructor_id, newSelectedInstructors[instructor_id])
    }
  }

  const handleDriverToggle = (driver_id) => {
    const newSelectedDrivers = {
      ...selectedDrivers,
      [driver_id]: !selectedDrivers[driver_id],
    }
    setSelectedDrivers(newSelectedDrivers)
    if (onDriverToggle) {
      onDriverToggle(driver_id, newSelectedDrivers[driver_id])
    }
  }

  const handleAddCalendar = () => {
    if (showAddCalendarInput) {
      if (newCalendarName.trim()) {
        onAddCalendar({
          name: newCalendarName.trim(),
          color: getRandomColor(),
        })
        setNewCalendarName("")
      }
      setShowAddCalendarInput(false)
    } else {
      setShowAddCalendarInput(true)
    }
  }

  const getRandomColor = () => {
    const colors = ["#4285F4", "#A142F4", "#33B679", "#D50000", "#F4B400", "#0B8043", "#8E24AA", "#3F51B5", "#E67C73"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div className="w-64 h-full border-r bg-white overflow-y-auto">
      <div className="flex items-center justify-center p-4 border-b">
        <Calendar className="w-6 h-6 mr-2 text-blue-600" />
        <h1 className="text-xl font-bold text-gray-800">Grupa Akademia</h1>
      </div>

      <div className="p-4">
        {/* Sekcja nawigacji */}
        <div className="mb-4">
          <button
            className="flex items-center justify-between w-full text-left mb-2"
            onClick={() => toggleSection("navigation")}
          >
            {/* Zmieniamy nagłówki sekcji */}
            <span className="font-medium text-gray-700">{"Panel"}</span>
            {expanded.navigation ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expanded.navigation && (
            <div className="ml-2 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  className={`flex items-center w-full px-2 py-2 text-sm rounded-md ${
                    activeSection === item.id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => onSectionChange(item.id)}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pokaż sekcję kalendarzy tylko w widoku kalendarza */}
        {activeSection === "calendar" && (
          <>
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full text-left mb-2"
                onClick={() => toggleSection("myCalendars")}
              >
                {/* Zmieniamy teksty sekcji kalendarza */}
                <span className="font-medium text-gray-700">Kalendarze</span>
                {expanded.myCalendars ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {expanded.myCalendars && (
                <div className="ml-2 space-y-2">
                  {calendars.map((calendar) => (
                    <div key={calendar.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cal-${calendar.id}`}
                        className="mr-2"
                        checked={calendar.visible}
                        onChange={() => handleCalendarToggle(calendar.id)}
                      />
                      <div
                        className="w-3 h-3 rounded-full mr-2 cursor-pointer"
                        style={{ backgroundColor: calendar.color }}
                        onClick={() => {
                          const newColor = getRandomColor()
                          onCalendarColorChange(calendar.id, newColor)
                        }}
                        title="Kliknij, aby zmienić kolor"
                      ></div>
                      <label htmlFor={`cal-${calendar.id}`} className="text-sm text-gray-700">
                        {calendar.name}
                      </label>
                    </div>
                  ))}

                  {showAddCalendarInput && expanded.myCalendars ? (
                    <div className="flex items-center mt-2">
                      {/* Zmieniamy tekst dodawania kalendarza */}
                      <input
                        type="text"
                        value={newCalendarName}
                        onChange={(e) => setNewCalendarName(e.target.value)}
                        placeholder={"Nazwa kalendarza"}
                        className="text-sm border rounded px-2 py-1 w-full"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddCalendar("my")
                          } else if (e.key === "Escape") {
                            setShowAddCalendarInput(false)
                            setNewCalendarName("")
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      className="flex items-center text-sm text-gray-600 mt-2 hover:text-blue-600"
                      onClick={() => handleAddCalendar()}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Dodaj nowy kalendarz
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sekcja instruktorów */}
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full text-left mb-2"
                onClick={() => toggleSection("instructors")}
              >
                <span className="font-medium text-gray-700">Instruktorzy</span>
                {expanded.instructors ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {expanded.instructors && (
                <div className="ml-2 space-y-2">
                  {instructors.map((instructor) => (
                    <div key={instructor.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`instructor-${instructor.id}`}
                        className="mr-2"
                        checked={!!selectedInstructors[instructor.id]}
                        onChange={() => handleInstructorToggle(instructor.id)}
                      />
                      <label htmlFor={`instructor-${instructor.id}`} className="text-sm text-gray-700">
                        {instructor.name}
                      </label>
                    </div>
                  ))}
                  {instructors.length === 0 && (
                    <div className="text-sm text-gray-500 italic">Brak dostępnych instruktorów</div>
                  )}
                </div>
              )}
            </div>

            {/* Sekcja kursantów */}
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full text-left mb-2"
                onClick={() => toggleSection("drivers")}
              >
                <span className="font-medium text-gray-700">Kursanci</span>
                {expanded.drivers ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {expanded.drivers && (
                <div className="ml-2 space-y-2">
                  {drivers.map((driver) => (
                    <div key={driver.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`driver-${driver.id}`}
                        className="mr-2"
                        checked={!!selectedDrivers[driver.id]}
                        onChange={() => handleDriverToggle(driver.id)}
                      />
                      <label htmlFor={`driver-${driver.id}`} className="text-sm text-gray-700">
                        {driver.name}
                      </label>
                    </div>
                  ))}
                  {drivers.length === 0 && (
                    <div className="text-sm text-gray-500 italic">Brak dostępnych kursantów</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
