"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLoadingScreen } from "@/hooks/use-loading-screen"
import { useNotification } from "@/hooks/use-notification"
import { getDrivers } from "@/app/actions/driver-actions"
import { supabase } from "@/lib/supabase-client"
import { translate } from "@/lib/translations"

// Calendar components
import Calendar from "@/components/calendar/calendar-view"
import DayView from "@/components/calendar/day-view"
import WeekView from "@/components/calendar/week-view"
import EventModal from "@/components/calendar/event-modal"
import Header from "@/components/calendar/header"

// Other components
import Sidebar from "@/components/sidebar"
import DriverProfiles from "@/components/driver-profiles"
import InstructorProfiles from "@/components/instructor-profiles"
import FinanceManagement from "@/components/finance-management"
import BranchReports from "@/components/reports"
import StatisticsDashboard from "@/components/statistic"
import UserManagement from "@/components/user-management"
import { ExcelView } from "@/components/excel-view"

export default function DrivingSchoolApp() {
  const { showLoading, updateLoading, hideLoading } = useLoadingScreen()
  const notification = useNotification()

  // State variables
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("week") // 'month', 'week', or 'day'
  const [activeSection, setActiveSection] = useState("calendar")
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState("admin") // 'admin', 'instructor', or 'driver'

  // Data state
  const [events, setEvents] = useState([])
  const [drivers, setDrivers] = useState([])
  const [instructors, setInstructors] = useState([])
  const [calendars, setCalendars] = useState([])

  // Modal state
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Add this new state variable after the existing state declarations
  const [selectedInstructorId, setSelectedInstructorId] = useState(null)

  // Update the state management for instructors and drivers filtering
  const [selectedInstructors, setSelectedInstructors] = useState({})
  const [selectedDrivers, setSelectedDrivers] = useState({})

  // Fetch all data on component mount
  useEffect(() => {
    loadAllData()

    // Subscribe to changes in 'instructors' table
    const instructorSubscription = supabase
      .channel("custom-instructors-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "instructors",
        },
        (payload) => {
          fetch("/api/realtime/instructors")
            .then((res) => res.json())
            .then((data) => {
              setInstructors(data.instructors || [])
              notification.warning("Zmiana w tabeli instruktorów", "Zaktualizowano dane instruktorów")
            })
        },
      )
      .subscribe()

    // Subscribe to changes in 'drivers' table
    const driverSubscription = supabase
      .channel("custom-drivers-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "drivers",
        },
        async (payload) => {
          const result = await getDrivers()

          if (result) {
            notification.warning("Zmiana w tabeli kierowców", "Zaktualizowano dane kierowców")
            setDrivers(result)
          } else {
            notification.error("Błąd", "Nie udało się pobrać danych kierowców, spróbuj ponownie")
            throw new Error("Nie udało się pobrać danych kierowców")
          }
        },
      )
      .subscribe()

    // Subscribe to changes in 'payments' table
    const paymentSubscription = supabase
      .channel("custom-payments-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        async (payload) => {
          const result = await getDrivers()

          if (result) {
            notification.warning("Zmiana w tabeli kierowców", "Zaktualizowano dane kierowców (płatności)")
            setDrivers(result)
          } else {
            notification.error("Błąd", "Nie udało się pobrać danych kierowców, spróbuj ponownie (płatności)")
            throw new Error("Nie udało się pobrać danych kierowców")
          }
        },
      )
      .subscribe()

    // Subscribe to changes in 'events' table
    const eventsSubscription = supabase
      .channel("custom-events-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        async (payload) => {
          // Fetch updated events
          console.log("Event change detected:", payload)
          fetch("/api/events")
            .then((res) => res.json())
            .then((data) => {
              setEvents(data.events || [])
              notification.info("Kalendarz", "Zaktualizowano wydarzenia w kalendarzu")
            })
            .catch((error) => {
              notification.error("Błąd", "Nie udało się pobrać wydarzeń")
              console.error("Error fetching events:", error)
            })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(instructorSubscription)
      supabase.removeChannel(driverSubscription)
      supabase.removeChannel(paymentSubscription)
      supabase.removeChannel(eventsSubscription)
    }
  }, [])

  // Function to load all data with loading indicators
  const loadAllData = async () => {
    try {
      showLoading("Inicjalizacja aplikacji...", 0)

      updateLoading("Pobieranie danych początkowych", 10)
      await fetch("/api/init/getinitdata")
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error)
          }
          console.log("Initial data loaded:", data)
          setInstructors(data.instructors || [])

          // Ustaw wszystkie kalendarze jako niewidoczne domyślnie
          const calendarsWithDefaultVisibility = (data.calendars || []).map((calendar) => ({
            ...calendar,
            visible: false,
          }))
          setCalendars(calendarsWithDefaultVisibility)
        })
        .catch((error) => {
          hideLoading()
          setIsLoading(false)
          notification.error("Błąd ładowania danych", error.message || "Wystąpił problem podczas ładowania danych")
          console.error("Error loading data:", error)
        })

      // Load events for current month
      updateLoading("Pobieranie wydarzeń", 30)
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      await fetch(`/api/events?month=${currentMonth}&year=${currentYear}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error)
          }

          // Transform API events to match component format if needed
          const formattedEvents = data.events.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description || "",
            date: new Date(event.date),
            start_time: event.start_time,
            end_time: event.end_time,
            calendar_id: event.calendar_id,
            driver_id: event.driver_id,
            instructor_id: event.instructor_id,
            // Add any additional properties needed by the component
            driver: event.driver,
            instructor: event.instructor,
            calendar: event.calendar,
            payment_due: event.payment_due || false,
            created_at: event.created_at,
            is_too_late: event.is_too_late,
          }))

          setEvents(formattedEvents)
          console.log("Events loaded:", formattedEvents)
        })
        .catch((error) => {
          notification.error("Błąd ładowania wydarzeń", error.message || "Wystąpił problem podczas ładowania wydarzeń")
          console.error("Error loading events:", error)
        })

      // Load drivers
      updateLoading("Pobieranie danych kursantów", 60)
      const result = await getDrivers()

      if (result) {
        setDrivers(result)
      } else {
        throw new Error("Nie udało się pobrać danych kierowców")
      }

      updateLoading("Pobieranie zakończone, ładowanie aplikacji...", 90)
      updateLoading("Gotowe!", 100)
      setTimeout(() => {
        hideLoading()
        setIsLoading(false)
        notification.success("Aplikacja gotowa", "Wszystkie dane zostały pomyślnie załadowane")
      }, 500)
    } catch (error) {
      hideLoading()
      setIsLoading(false)
      notification.error("Błąd ładowania danych", error.message || "Wystąpił problem podczas ładowania danych")
      console.error("Error loading data:", error)
    }
  }

  // Function to load events for the current month
  const loadEvents = async () => {
    try {
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      const response = await fetch(`/api/events?month=${currentMonth}&year=${currentYear}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Transform API events to match component format
      const formattedEvents = data.events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        date: new Date(event.date),
        start_time: event.start_time,
        end_time: event.end_time,
        calendar_id: event.calendar_id,
        driver_id: event.driver_id,
        instructor_id: event.instructor_id,
        driver: event.driver,
        instructor: event.instructor,
        calendar: event.calendar,
        payment_due: event.payment_due || false,
        created_at: event.created_at,
        is_too_late: event.is_too_late,
      }))

      setEvents(formattedEvents)
    } catch (error) {
      notification.error("Błąd ładowania wydarzeń", error.message || "Wystąpił problem podczas ładowania wydarzeń")
      console.error("Error loading events:", error)
    }
  }

  // Add these handler functions after the handleCalendarToggle function
  const handleInstructorToggle = (instructor_id, isSelected) => {
    setSelectedInstructors((prev) => ({
      ...prev,
      [instructor_id]: isSelected,
    }))
  }

  const handleDriverToggle = (driver_id, isSelected) => {
    setSelectedDrivers((prev) => ({
      ...prev,
      [driver_id]: isSelected,
    }))
  }

  // Update the getFilteredEvents function to filter by instructors and drivers
  const getFilteredEvents = () => {
    // Get arrays of selected calendar, instructor and driver IDs
    const selectedCalendarIds = calendars.filter((cal) => cal.visible).map((cal) => cal.id)
    const selectedinstructor_ids = Object.entries(selectedInstructors)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id)

    const selecteddriver_ids = Object.entries(selectedDrivers)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id)

    return events.filter((event) => {
      // NEW LOGIC: If no calendars are selected, show all events
      // If calendars are selected, only show events from those calendars
      if (selectedCalendarIds.length > 0 && !selectedCalendarIds.includes(event.calendar_id)) {
        return false
      }

      // If no instructors are selected, don't filter by instructor
      // If instructors are selected, only show events for those instructors
      if (
        selectedinstructor_ids.length > 0 &&
        (!event.instructor_id || !selectedinstructor_ids.includes(event.instructor_id))
      ) {
        return false
      }

      // If no drivers are selected, don't filter by driver
      // If drivers are selected, only show events for those drivers
      if (selecteddriver_ids.length > 0 && (!event.driver_id || !selecteddriver_ids.includes(event.driver_id))) {
        return false
      }

      return true
    })
  }

  // Event handlers
  const handleDateClick = (date) => {
    // Get the first selected instructor (if any)
    const selectedInstructorIds = Object.entries(selectedInstructors)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id)

    const selectedInstructorId = selectedInstructorIds.length > 0 ? selectedInstructorIds[0] : null

    setSelectedDate(date)
    setSelectedEvent(null)
    setSelectedInstructorId(selectedInstructorId) // Add this new state
    setShowEventModal(true)
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const closeModal = () => {
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  const navigateToToday = () => {
    setCurrentDate(new Date())
  }

  const navigateToPrevious = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else if (view === "week") {
      const prevWeek = new Date(currentDate)
      prevWeek.setDate(prevWeek.getDate() - 7)
      setCurrentDate(prevWeek)
    } else {
      const prevDay = new Date(currentDate)
      prevDay.setDate(prevDay.getDate() - 1)
      setCurrentDate(prevDay)
    }
  }

  const navigateToNext = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else if (view === "week") {
      const nextWeek = new Date(currentDate)
      nextWeek.setDate(nextWeek.getDate() + 7)
      setCurrentDate(nextWeek)
    } else {
      const nextDay = new Date(currentDate)
      nextDay.setDate(nextDay.getDate() + 1)
      setCurrentDate(nextDay)
    }
  }

  const handleDayClick = (date) => {
    setCurrentDate(date)
    setView("day")
  }

  const switchView = (newView) => {
    setView(newView)
  }

  // Update handleCalendarToggle to use the API
  const handleCalendarToggle = (calendar_id) => {
    // Update only local state without calling the API
    console.log(calendar_id)
    setCalendars(calendars.map((cal) => (cal.id === calendar_id ? { ...cal, visible: !cal.visible } : cal)))
    console.log(
      "Updated calendars:",
      calendars.map((cal) => (cal.id === calendar_id ? { ...cal, visible: !cal.visible } : cal)),
    )
  }

  // Update handleAddCalendar to use the API
  const handleAddCalendar = async (newCalendar) => {
    try {
      showLoading("Dodawanie kalendarza...", 50)

      // Call API to create calendar
      const response = await fetch("/api/calendars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCalendar.name,
          color: newCalendar.color,
          visible: false, // Zmienione z true na false
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Update local state with the new calendar from API
      setCalendars([...calendars, data.calendar])

      hideLoading()
      notification.success("Kalendarz dodany", "Nowy kalendarz został pomyślnie dodany")
    } catch (error) {
      hideLoading()
      notification.error("Błąd", "Nie udało się dodać kalendarza: " + (error.message || ""))
      console.error("Error adding calendar:", error)
    }
  }

  // Update handleCalendarColorChange to use the API
  const handleCalendarColorChange = async (calendar_id, newColor) => {
    try {
      showLoading("Aktualizacja koloru kalendarza...", 50)

      // Update local state immediately for responsive UI
      setCalendars(calendars.map((cal) => (cal.id === calendar_id ? { ...cal, color: newColor } : cal)))

      // Call API to update calendar color
      const response = await fetch(`/api/calendars/${calendar_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ color: newColor }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      hideLoading()
      notification.success("Kolor zaktualizowany", "Kolor kalendarza został pomyślnie zmieniony")
    } catch (error) {
      // Revert local state if API call fails
      hideLoading()
      notification.error("Błąd", "Nie udało się zmienić koloru kalendarza: " + (error.message || ""))
      console.error("Error updating calendar color:", error)
    }
  }

  // Update handleDragEvent to use the API
  const handleDragEvent = async (eventId, newDate) => {
    try {
      showLoading("Aktualizacja wydarzenia...", 50)

      const eventToUpdate = events.find((event) => event.id === eventId)
      if (!eventToUpdate) {
        throw new Error("Nie znaleziono wydarzenia")
      }

      // Create a new date object with the same time
      const originalDate = new Date(eventToUpdate.date)
      const updatedDate = new Date(newDate)
      updatedDate.setHours(originalDate.getHours())
      updatedDate.setMinutes(originalDate.getMinutes())

      // Format date for API
      const formattedDate = updatedDate.toISOString()

      // Update local state immediately for responsive UI
      const updatedEvent = {
        ...eventToUpdate,
        date: updatedDate,
      }

      setEvents(
        events.map((event) => {
          if (event.id === eventId) {
            return updatedEvent
          }
          return event
        }),
      )

      // Call API to update event
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: formattedDate }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      hideLoading()
      notification.success("Zaktualizowano", "Wydarzenie zostało przesunięte")
    } catch (error) {
      hideLoading()
      notification.error("Błąd", "Nie udało się przesunąć wydarzenia: " + (error.message || ""))
      console.error("Error updating event:", error)

      // Reload events to ensure UI is in sync with server
      loadEvents()
    }
  }

  // Update handleDragEventTime to use the API
  const handleDragEventTime = async (eventId, newstart_time, newend_time) => {
    try {
      showLoading("Aktualizacja czasu wydarzenia...", 50)

      const eventToUpdate = events.find((event) => event.id === eventId)
      if (!eventToUpdate) {
        throw new Error("Nie znaleziono wydarzenia")
      }

      // Update local state immediately for responsive UI
      const updatedEvent = {
        ...eventToUpdate,
        start_time: newstart_time,
        end_time: newend_time,
      }

      setEvents(
        events.map((event) => {
          if (event.id === eventId) {
            return updatedEvent
          }
          return event
        }),
      )

      // Call API to update event
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_time: newstart_time,
          end_time: newend_time,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      hideLoading()
      notification.success("Zaktualizowano", "Czas wydarzenia został zmieniony")
    } catch (error) {
      hideLoading()
      notification.error("Błąd", "Nie udało się zmienić czasu wydarzenia: " + (error.message || ""))
      console.error("Error updating event time:", error)

      // Reload events to ensure UI is in sync with server
      loadEvents()
    }
  }

  // Update handleSaveEvent to use the API
  const handleSaveEvent = async (eventData) => {
    try {
      showLoading(selectedEvent ? "Aktualizacja wydarzenia..." : "Tworzenie wydarzenia...", 50)

      // Format the event data for the API
      const apiEventData = {
        title: eventData.title,
        description: eventData.description || null,
        date: new Date(eventData.date).toISOString(),
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        calendar_id: eventData.calendar_id,
        driver_id: eventData.driver_id || null,
        instructor_id: eventData.instructor_id || null,
      }

      let response, data

      if (selectedEvent) {
        // Update existing event

        response = await fetch(`/api/events/${selectedEvent.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiEventData),
        })

        data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        // Update local state with the updated event
        const updatedEvent = {
          ...selectedEvent,
          ...eventData,
          date: new Date(eventData.date),
        }

        setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
        notification.success("Zaktualizowano", "Wydarzenie zostało zaktualizowane")
      } else {
        // Create new event
        response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiEventData),
        })

        data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        // Format the new event from API to match component format
        const newEvent = {
          id: data.event.id,
          title: data.event.title,
          description: data.event.description || "",
          date: new Date(data.event.date),
          start_time: data.event.start_time,
          end_time: data.event.end_time,
          calendar_id: data.event.calendar_id,
          driver_id: data.event.driver_id,
          instructor_id: data.event.instructor_id,
        }

        // Update local state with the new event
        setEvents([...events, newEvent])
        notification.success("Utworzono", "Nowe wydarzenie zostało utworzone")
      }

      hideLoading()
      closeModal()
    } catch (error) {
      hideLoading()
      notification.error(
        "Błąd",
        selectedEvent
          ? "Nie udało się zaktualizować wydarzenia: " + (error.message || "")
          : "Nie udało się utworzyć wydarzenia: " + (error.message || ""),
      )
      console.error("Error saving event:", error)
    }
  }

  // Update handleDeleteEvent to use the API
  const handleDeleteEvent = async (eventId) => {
    try {
      showLoading("Usuwanie wydarzenia...", 50)

      // Call API to delete event
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Update local state
      setEvents(events.filter((event) => event.id !== eventId))

      hideLoading()
      notification.success("Usunięto", "Wydarzenie zostało usunięte")
      closeModal()
    } catch (error) {
      hideLoading()
      notification.error("Błąd", "Nie udało się usunąć wydarzenia: " + (error.message || ""))
      console.error("Error deleting event:", error)
    }
  }

  // Add effect to reload events when currentDate changes
  useEffect(() => {
    if (!isLoading) {
      loadEvents()
    }
  }, [currentDate.getMonth(), currentDate.getFullYear()])

  // Render the appropriate view based on activeSection
  const renderContent = () => {
    if (isLoading) {
      return null // Loading screen is handled by the useLoadingScreen hook
    }

    switch (activeSection) {
      case "calendar":
        return (
          <>
            <Header
              currentDate={currentDate}
              onPrevious={navigateToPrevious}
              onNext={navigateToNext}
              onToday={navigateToToday}
              view={view}
              onViewChange={switchView}
              userRole={userRole}
            />
            <div className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  className="h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {view === "month" ? (
                    <Calendar
                      currentDate={currentDate}
                      events={getFilteredEvents()}
                      onDateClick={handleDateClick}
                      onEventClick={handleEventClick}
                      onDragEvent={handleDragEvent}
                      onDayClick={handleDayClick}
                      userRole={userRole}
                    />
                  ) : view === "week" ? (
                    <WeekView
                      currentDate={currentDate}
                      events={getFilteredEvents()}
                      onTimeClick={handleDateClick}
                      onEventClick={handleEventWeekClick}
                      onDragEvent={handleDragWeekEvent}
                      onDragEventTime={handleDragEventWeekTime}
                      userRole={userRole}
                    />
                  ) : (
                    <DayView
                      currentDate={currentDate}
                      events={getFilteredEvents()}
                      onTimeClick={handleDateClick}
                      onEventClick={handleEventClick}
                      onDragEventTime={handleDragEventTime}
                      userRole={userRole}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {showEventModal && (
              <EventModal
                date={selectedDate}
                event={selectedEvent}
                calendars={calendars}
                drivers={drivers}
                instructors={instructors}
                selectedInstructorId={selectedInstructorId} // Add this prop
                onClose={closeModal}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                userRole={userRole}
              />
            )}
          </>
        )
      case "dashboard":
        return <StatisticsDashboard events={events} drivers={drivers} instructors={instructors} />
      case "drivers":
        return (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h1 className="text-2xl font-bold text-gray-800">{"Profile kursantów"}</h1>
            </div>
            <div className="flex-1 overflow-auto">
              <DriverProfiles
                drivers={drivers}
                onSelectDriver={(driver) => console.log("Selected driver:", driver.name)}
                onAddDriver={async (newDriver) => {
                  console.log("Adding driver:", newDriver)
                }}
                instructors={instructors}
                events={events}
              />
            </div>
          </div>
        )
      case "instructors":
        return (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h1 className="text-2xl font-bold text-gray-800">
                {translate("instructorProfiles.Instructor Profiles")}
              </h1>
            </div>
            <div className="flex-1 overflow-auto">
              <InstructorProfiles
                instructors={instructors}
                drivers={drivers}
                onSelectInstructor={(instructor) => console.log("Selected instructor:", instructor.name)}
                onAddInstructor={async (newInstructor) => {
                  try {
                    showLoading("Dodawanie instruktora...", 50)
                    // Simulate API call
                    await new Promise((resolve) => setTimeout(resolve, 500))
                    const newId = Math.max(...instructors.map((instructor) => instructor.id), 0) + 1
                    const instructorToAdd = {
                      ...newInstructor,
                      id: newId,
                      upcomingLessons: [],
                    }
                    setInstructors([...instructors, instructorToAdd])
                    hideLoading()
                    notification.success("Dodano", "Nowy instruktor został dodany")
                  } catch (error) {
                    hideLoading()
                    notification.error("Błąd", "Nie udało się dodać instruktora")
                  }
                }}
              />
            </div>
          </div>
        )
      case "finances":
        return (
          <div className="flex-1 overflow-y-scroll flex flex-col">
            <FinanceManagement />
          </div>
        )
      case "raports":
        return (
          <div className="flex-1 overflow-hidden flex flex-col">
            <BranchReports events={events} drivers={drivers} instructors={instructors} />
          </div>
        )
      case "excel":
        return (
          <div className="flex-1 overflow-hidden flex flex-col p-6">
            <ExcelView className="m-8" />
          </div>
        )
      case "users":
        return <UserManagement />
      case "settings":
        return (
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{translate("settings.Settings")}</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">{translate("settings.Driving School Information")}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("settings.School Name")}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="Professional Driving School"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("settings.Address")}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="123 Main Street, Anytown, USA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{translate("settings.Phone")}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="555-123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{translate("settings.Email")}</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="info@professionaldrivingschool.com"
                  />
                </div>

                <div className="pt-4">
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    onClick={async () => {
                      try {
                        showLoading("Zapisywanie ustawień...", 50)
                        // Simulate API call
                        await new Promise((resolve) => setTimeout(resolve, 500))
                        hideLoading()
                        notification.success("Zapisano", "Ustawienia zostały pomyślnie zapisane")
                      } catch (error) {
                        hideLoading()
                        notification.error("Błąd", "Nie udało się zapisać ustawień")
                      }
                    }}
                  >
                    {translate("settings.Save Changes")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Update handleDragWeekEvent to use the API
  const handleDragWeekEvent = async (eventId, newDate) => {
    // Reuse the handleDragEvent function
    await handleDragEvent(eventId, newDate)
  }

  // Update handleDragEventWeekTime to use the API
  const handleDragEventWeekTime = async (eventId, newstart_time, newend_time) => {
    // Reuse the handleDragEventTime function
    await handleDragEventTime(eventId, newstart_time, newend_time)
  }

  // Update handleEventWeekClick to use the API
  const handleEventWeekClick = (event) => {
    // Reuse the handleEventClick function
    handleEventClick(event)
  }

  // Update the Sidebar component in the return statement to pass instructors and drivers
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        calendars={calendars}
        instructors={instructors}
        drivers={drivers}
        onCalendarToggle={handleCalendarToggle}
        onAddCalendar={handleAddCalendar}
        onCalendarColorChange={handleCalendarColorChange}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onInstructorToggle={handleInstructorToggle}
        onDriverToggle={handleDriverToggle}
        userRole={userRole}
        onRoleChange={setUserRole}
      />
      <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-scroll">{renderContent()}</div>
    </div>
  )
}
