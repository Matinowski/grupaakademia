"use client"

import { useState } from "react"
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Plus,
  Users,
  Settings,
  Home,
  BookOpen,
  Car,
  CreditCard,
} from "lucide-react"

// Importujemy funkcję translate
import { translate } from "@/lib/translations"

// Zmieniamy etykiety w menu nawigacyjnym
const navigationItems = [
  { id: "dashboard", name: translate("navigation.Pulpit"), icon: Home },
  { id: "calendar", name: translate("navigation.Kalendarz"), icon: Calendar },
  { id: "drivers", name: translate("navigation.Profile Kursantów"), icon: Users },
  { id: "instructors", name: translate("navigation.Profile Instruktorów"), icon: BookOpen },
  { id: "vehicles", name: translate("navigation.Pojazdy"), icon: Car },
  { id: "finances", name: translate("navigation.Finanse"), icon: CreditCard },
  { id: "settings", name: translate("navigation.Ustawienia"), icon: Settings },
]

export default function Sidebar({
  calendars = [],
  onCalendarToggle,
  onAddCalendar,
  onCalendarColorChange,
  activeSection,
  onSectionChange,
}) {
  const [expanded, setExpanded] = useState({
    myCalendars: true,
    otherCalendars: false,
    navigation: true,
  })

  const [newCalendarName, setNewCalendarName] = useState("")
  const [showAddCalendarInput, setShowAddCalendarInput] = useState(false)

  const myCalendars = calendars.filter((cal) => cal.type === "my")
  const otherCalendars = calendars.filter((cal) => cal.type === "other")

  const toggleSection = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section],
    })
  }

  const handleCalendarToggle = (calendarId) => {
    onCalendarToggle(calendarId)
  }

  const handleAddCalendar = (type) => {
    if (showAddCalendarInput) {
      if (newCalendarName.trim()) {
        onAddCalendar({
          name: newCalendarName.trim(),
          type: type,
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
        <h1 className="text-xl font-bold text-gray-800">SzkołaJazdy</h1>
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
                <span className="font-medium text-gray-700">{translate("calendar.Moje kalendarze")}</span>
                {expanded.myCalendars ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {expanded.myCalendars && (
                <div className="ml-2 space-y-2">
                  {myCalendars.map((calendar) => (
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
                        placeholder={translate("calendar.Nazwa kalendarza")}
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
                      onClick={() => handleAddCalendar("my")}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {/* Zmieniamy tekst przycisku dodawania kalendarza */}
                      {translate("calendar.Dodaj kalendarz")}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <button
                className="flex items-center justify-between w-full text-left mb-2"
                onClick={() => toggleSection("otherCalendars")}
              >
                {/* Zmieniamy teksty sekcji kalendarza */}
                <span className="font-medium text-gray-700">{translate("calendar.Inne kalendarze")}</span>
                {expanded.otherCalendars ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {expanded.otherCalendars && (
                <div className="ml-2 space-y-2">
                  {otherCalendars.map((calendar) => (
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

                  {showAddCalendarInput && expanded.otherCalendars ? (
                    <div className="flex items-center mt-2">
                      <input
                        type="text"
                        value={newCalendarName}
                        onChange={(e) => setNewCalendarName(e.target.value)}
                        placeholder="Nazwa kalendarza"
                        className="text-sm border rounded px-2 py-1 w-full"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddCalendar("other")
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
                      onClick={() => handleAddCalendar("other")}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Dodaj kalendarz
                    </button>
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

