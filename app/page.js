"use client"

import { useState, useEffect } from "react"
import Calendar from "@/components/calendar"
import DayView from "@/components/day-view"
import DriverProfiles from "@/components/driver-profiles"
import InstructorProfiles from "@/components/instructor-profiles"
import VehicleManagement from "@/components/vehicle-management"
import FinanceManagement from "@/components/finance-management"
import EventModal from "@/components/event-modal"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

// Na początku pliku, dodajemy import funkcji translate z pliku translations
import { translate } from "@/lib/translations"

export default function DrivingSchoolApp() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useState([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [view, setView] = useState("month") // 'month' or 'day'
  const [activeSection, setActiveSection] = useState("dashboard") // 'dashboard', 'calendar', 'drivers', 'instructors', 'vehicles', 'finances', 'settings'
  const [calendars, setCalendars] = useState([
    { id: 1, name: "Practical Lessons", color: "#4285F4", type: "my", visible: true },
    { id: 2, name: "Theory Classes", color: "#33B679", type: "my", visible: true },
    { id: 3, name: "Exams", color: "#D50000", type: "my", visible: true },
    { id: 4, name: "Instructor Availability", color: "#A142F4", type: "other", visible: true },
    { id: 5, name: "Holidays", color: "#EF6C00", type: "other", visible: true },
  ])
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: "John Smith",
      phone: "555-123-4567",
      email: "john.smith@example.com",
      licenseType: "B",
      startDate: "2023-10-15",
      completedHours: 20,
      remainingHours: 10,
      instructorId: 1,
      notes: "Good progress, needs more practice with parallel parking.",
      upcomingLessons: [{ date: "2023-11-20", time: "14:00", duration: 2, instructor: "Michael Johnson" }],
    },
    {
      id: 2,
      name: "Emma Wilson",
      phone: "555-987-6543",
      email: "emma.wilson@example.com",
      licenseType: "B",
      startDate: "2023-09-05",
      completedHours: 30,
      remainingHours: 0,
      instructorId: 2,
      notes: "Completed all required hours. Ready for exam.",
      upcomingLessons: [],
    },
    {
      id: 3,
      name: "David Brown",
      phone: "555-456-7890",
      email: "david.brown@example.com",
      licenseType: "A",
      startDate: "2023-10-25",
      completedHours: 8,
      remainingHours: 22,
      instructorId: 3,
      notes: "Needs more practice with highway driving.",
      upcomingLessons: [{ date: "2023-11-22", time: "10:00", duration: 2, instructor: "Robert Miller" }],
    },
  ])
  const [instructors, setInstructors] = useState([
    {
      id: 1,
      name: "Michael Johnson",
      phone: "555-111-2222",
      email: "michael.johnson@example.com",
      licenseTypes: ["A", "B"],
      hireDate: "2020-03-15",
      specialization: "Defensive Driving",
      bio: "Experienced instructor with over 10 years of teaching. Specializes in defensive driving techniques.",
      status: "active",
      upcomingLessons: [{ date: "2023-11-20", time: "14:00", duration: 2, student: "John Smith" }],
    },
    {
      id: 2,
      name: "Sarah Davis",
      phone: "555-333-4444",
      email: "sarah.davis@example.com",
      licenseTypes: ["B", "C"],
      hireDate: "2021-06-10",
      specialization: "New Drivers",
      bio: "Patient instructor who excels at teaching beginners. Creates a calm learning environment.",
      status: "active",
      upcomingLessons: [],
    },
    {
      id: 3,
      name: "Robert Miller",
      phone: "555-555-6666",
      email: "robert.miller@example.com",
      licenseTypes: ["A", "B", "D"],
      hireDate: "2019-11-05",
      specialization: "Motorcycle Training",
      bio: "Motorcycle enthusiast and certified instructor for all types of two-wheeled vehicles.",
      status: "active",
      upcomingLessons: [{ date: "2023-11-22", time: "10:00", duration: 2, student: "David Brown" }],
    },
  ])
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      make: "Toyota",
      model: "Corolla",
      year: 2022,
      licensePlate: "ABC-1234",
      licenseType: "B",
      status: "available",
      lastMaintenance: "2023-09-15",
      nextMaintenance: "2023-12-15",
      mileage: "15000",
      notes: "Regular maintenance up to date.",
      maintenanceHistory: [
        {
          id: 1,
          date: "2023-09-15",
          type: "regular",
          description: "Oil change, filter replacement, and general inspection",
          cost: "150",
          mileage: "14500",
        },
        {
          id: 2,
          date: "2023-06-10",
          type: "regular",
          description: "Tire rotation and brake check",
          cost: "100",
          mileage: "12000",
        },
      ],
      upcomingBookings: [
        { date: "2023-11-20", time: "14:00", duration: 2, instructor: "Michael Johnson", student: "John Smith" },
      ],
    },
    {
      id: 2,
      make: "Honda",
      model: "CBR500",
      year: 2021,
      licensePlate: "XYZ-7890",
      licenseType: "A",
      status: "in-use",
      lastMaintenance: "2023-08-20",
      nextMaintenance: "2023-11-20",
      mileage: "8000",
      notes: "Motorcycle for license type A training.",
      maintenanceHistory: [
        {
          id: 3,
          date: "2023-08-20",
          type: "regular",
          description: "Chain adjustment, oil change, and general inspection",
          cost: "120",
          mileage: "7500",
        },
      ],
      upcomingBookings: [
        { date: "2023-11-22", time: "10:00", duration: 2, instructor: "Robert Miller", student: "David Brown" },
      ],
    },
    {
      id: 3,
      make: "Ford",
      model: "Transit",
      year: 2020,
      licensePlate: "DEF-5678",
      licenseType: "C",
      status: "maintenance",
      lastMaintenance: "2023-10-05",
      nextMaintenance: "2024-01-05",
      mileage: "35000",
      notes: "Currently undergoing scheduled maintenance.",
      maintenanceHistory: [
        {
          id: 4,
          date: "2023-10-05",
          type: "repair",
          description: "Brake system repair and replacement",
          cost: "450",
          mileage: "34800",
        },
        {
          id: 5,
          date: "2023-07-15",
          type: "regular",
          description: "Full service and inspection",
          cost: "300",
          mileage: "30000",
        },
      ],
      upcomingBookings: [],
    },
  ])
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: "2023-11-15",
      type: "income",
      category: "lesson",
      amount: 150,
      description: "Driving lesson with John Smith",
      paymentMethod: "card",
    },
    {
      id: 2,
      date: "2023-11-14",
      type: "income",
      category: "theory",
      amount: 80,
      description: "Theory class for 4 students",
      paymentMethod: "cash",
    },
    {
      id: 3,
      date: "2023-11-10",
      type: "expense",
      category: "vehicle",
      amount: 120,
      description: "Fuel for all vehicles",
      paymentMethod: "card",
    },
    {
      id: 4,
      date: "2023-11-05",
      type: "expense",
      category: "salary",
      amount: 2500,
      description: "Instructor salaries",
      paymentMethod: "transfer",
    },
    {
      id: 5,
      date: "2023-11-01",
      type: "expense",
      category: "rent",
      amount: 1200,
      description: "Office rent for November",
      paymentMethod: "transfer",
    },
  ])

  // Initialize with some sample events
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const sampleEvents = [
      {
        id: 1,
        title: "Driving Lesson with John Smith",
        description: "Highway driving practice",
        date: today,
        startTime: "10:00",
        endTime: "12:00",
        calendarId: 1, // Practical Lessons
        color: "#4285F4",
        driverId: 1,
        instructorId: 1,
        vehicleId: 1,
        lessonType: "practical",
      },
      {
        id: 2,
        title: "Theory Class",
        description: "Traffic rules and regulations",
        date: today,
        startTime: "14:00",
        endTime: "16:00",
        calendarId: 2, // Theory Classes
        color: "#33B679",
        driverId: null,
        instructorId: 2,
        vehicleId: null,
        lessonType: "theory",
      },
      {
        id: 3,
        title: "Driving Exam - Emma Wilson",
        description: "Final driving test",
        date: tomorrow,
        startTime: "09:00",
        endTime: "11:00",
        calendarId: 3, // Exams
        color: "#D50000",
        driverId: 2,
        instructorId: 2,
        vehicleId: 1,
        lessonType: "exam",
      },
      {
        id: 4,
        title: "Driving Lesson with David Brown",
        description: "City driving practice",
        date: nextWeek,
        startTime: "13:00",
        endTime: "15:00",
        calendarId: 1, // Practical Lessons
        color: "#4285F4",
        driverId: 3,
        instructorId: 3,
        vehicleId: 2,
        lessonType: "practical",
      },
    ]

    setEvents(sampleEvents)
  }, [])

  // Get filtered events based on visible calendars
  const getFilteredEvents = () => {
    const visibleCalendarIds = calendars.filter((cal) => cal.visible).map((cal) => cal.id)

    return events.filter((event) => visibleCalendarIds.includes(event.calendarId))
  }

  const addEvent = (event) => {
    // Find the calendar to get its color
    const calendar = calendars.find((cal) => cal.id === event.calendarId)

    const newEvent = {
      ...event,
      id: Date.now(),
      color: calendar ? calendar.color : "#4285F4",
    }

    setEvents([...events, newEvent])

    // If this event has a driver, update their upcoming lessons
    if (event.driverId) {
      updateDriverUpcomingLessons(event.driverId)
    }

    // If this event has an instructor, update their upcoming lessons
    if (event.instructorId) {
      updateInstructorUpcomingLessons(event.instructorId)
    }

    // If this event has a vehicle, update its upcoming bookings
    if (event.vehicleId) {
      updateVehicleUpcomingBookings(event.vehicleId)
    }
  }

  const updateEvent = (updatedEvent) => {
    // Find the calendar to get its color
    const calendar = calendars.find((cal) => cal.id === updatedEvent.calendarId)

    const newEvent = {
      ...updatedEvent,
      color: calendar ? calendar.color : updatedEvent.color,
    }

    setEvents(events.map((event) => (event.id === updatedEvent.id ? newEvent : event)))

    // If this event has a driver, update their upcoming lessons
    if (updatedEvent.driverId) {
      updateDriverUpcomingLessons(updatedEvent.driverId)
    }

    // If this event has an instructor, update their upcoming lessons
    if (updatedEvent.instructorId) {
      updateInstructorUpcomingLessons(updatedEvent.instructorId)
    }

    // If this event has a vehicle, update its upcoming bookings
    if (updatedEvent.vehicleId) {
      updateVehicleUpcomingBookings(updatedEvent.vehicleId)
    }
  }

  const deleteEvent = (eventId) => {
    const eventToDelete = events.find((event) => event.id === eventId)
    setEvents(events.filter((event) => event.id !== eventId))

    // If this event had a driver, update their upcoming lessons
    if (eventToDelete && eventToDelete.driverId) {
      updateDriverUpcomingLessons(eventToDelete.driverId)
    }

    // If this event had an instructor, update their upcoming lessons
    if (eventToDelete && eventToDelete.instructorId) {
      updateInstructorUpcomingLessons(eventToDelete.instructorId)
    }

    // If this event had a vehicle, update their upcoming bookings
    if (eventToDelete && eventToDelete.vehicleId) {
      updateVehicleUpcomingBookings(eventToDelete.vehicleId)
    }
  }

  const updateDriverUpcomingLessons = (driverId) => {
    // Get all future events for this driver
    const now = new Date()
    const futureEvents = events
      .filter((event) => event.driverId === driverId && new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5) // Limit to 5 upcoming lessons

    // Format the events for the driver's upcoming lessons
    const upcomingLessons = futureEvents.map((event) => {
      const eventDate = new Date(event.date)
      const formattedDate = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}`

      // Calculate duration in hours
      const startHour = Number.parseInt(event.startTime.split(":")[0], 10)
      const startMinute = Number.parseInt(event.startTime.split(":")[1], 10)
      const endHour = Number.parseInt(event.endTime.split(":")[0], 10)
      const endMinute = Number.parseInt(event.endTime.split(":")[1], 10)

      const durationMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)
      const durationHours = Math.round((durationMinutes / 60) * 10) / 10 // Round to 1 decimal place

      // Find the instructor
      const instructor = instructors.find((i) => i.id === event.instructorId)?.name || "Assigned Instructor"

      return {
        date: formattedDate,
        time: event.startTime,
        duration: durationHours,
        instructor,
      }
    })

    // Update the driver with the new upcoming lessons
    setDrivers(drivers.map((driver) => (driver.id === driverId ? { ...driver, upcomingLessons } : driver)))
  }

  const updateInstructorUpcomingLessons = (instructorId) => {
    // Get all future events for this instructor
    const now = new Date()
    const futureEvents = events
      .filter((event) => event.instructorId === instructorId && new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5) // Limit to 5 upcoming lessons

    // Format the events for the instructor's upcoming lessons
    const upcomingLessons = futureEvents.map((event) => {
      const eventDate = new Date(event.date)
      const formattedDate = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}`

      // Calculate duration in hours
      const startHour = Number.parseInt(event.startTime.split(":")[0], 10)
      const startMinute = Number.parseInt(event.startTime.split(":")[1], 10)
      const endHour = Number.parseInt(event.endTime.split(":")[0], 10)
      const endMinute = Number.parseInt(event.endTime.split(":")[1], 10)

      const durationMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)
      const durationHours = Math.round((durationMinutes / 60) * 10) / 10 // Round to 1 decimal place

      // Find the student
      const student = drivers.find((d) => d.id === event.driverId)?.name || "No student assigned"

      return {
        date: formattedDate,
        time: event.startTime,
        duration: durationHours,
        student,
      }
    })

    // Update the instructor with the new upcoming lessons
    setInstructors(
      instructors.map((instructor) =>
        instructor.id === instructorId ? { ...instructor, upcomingLessons } : instructor,
      ),
    )
  }

  const updateVehicleUpcomingBookings = (vehicleId) => {
    // Get all future events for this vehicle
    const now = new Date()
    const futureEvents = events
      .filter((event) => event.vehicleId === vehicleId && new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5) // Limit to 5 upcoming bookings

    // Format the events for the vehicle's upcoming bookings
    const upcomingBookings = futureEvents.map((event) => {
      const eventDate = new Date(event.date)
      const formattedDate = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}`

      // Calculate duration in hours
      const startHour = Number.parseInt(event.startTime.split(":")[0], 10)
      const startMinute = Number.parseInt(event.startTime.split(":")[1], 10)
      const endHour = Number.parseInt(event.endTime.split(":")[0], 10)
      const endMinute = Number.parseInt(event.endTime.split(":")[1], 10)

      const durationMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)
      const durationHours = Math.round((durationMinutes / 60) * 10) / 10 // Round to 1 decimal place

      // Find the instructor and student
      const instructor = instructors.find((i) => i.id === event.instructorId)?.name || "Assigned Instructor"
      const student = drivers.find((d) => d.id === event.driverId)?.name || "No student assigned"

      return {
        date: formattedDate,
        time: event.startTime,
        duration: durationHours,
        instructor,
        student,
      }
    })

    // Update the vehicle with the new upcoming bookings
    setVehicles(vehicles.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, upcomingBookings } : vehicle)))
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
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

  const navigateToPreviousMonth = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else {
      const prevDay = new Date(currentDate)
      prevDay.setDate(prevDay.getDate() - 1)
      setCurrentDate(prevDay)
    }
  }

  const navigateToNextMonth = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else {
      const nextDay = new Date(currentDate)
      nextDay.setDate(nextDay.getDate() + 1)
      setCurrentDate(nextDay)
    }
  }

  const handleDragEvent = (eventId, newDate) => {
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          // Create a new date object with the same time
          const originalDate = new Date(event.date)
          const updatedDate = new Date(newDate)
          updatedDate.setHours(originalDate.getHours())
          updatedDate.setMinutes(originalDate.getMinutes())

          const updatedEvent = {
            ...event,
            date: updatedDate,
          }

          // If this event has a driver, update their upcoming lessons
          if (event.driverId) {
            updateDriverUpcomingLessons(event.driverId)
          }

          // If this event has an instructor, update their upcoming lessons
          if (event.instructorId) {
            updateInstructorUpcomingLessons(event.instructorId)
          }

          // If this event has a vehicle, update its upcoming bookings
          if (event.vehicleId) {
            updateVehicleUpcomingBookings(event.vehicleId)
          }

          return updatedEvent
        }
        return event
      }),
    )
  }

  const handleDragEventTime = (eventId, newStartTime, newEndTime) => {
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          const updatedEvent = {
            ...event,
            startTime: newStartTime,
            endTime: newEndTime,
          }

          // If this event has a driver, update their upcoming lessons
          if (event.driverId) {
            updateDriverUpcomingLessons(event.driverId)
          }

          // If this event has an instructor, update their upcoming lessons
          if (event.instructorId) {
            updateInstructorUpcomingLessons(event.instructorId)
          }

          // If this event has a vehicle, update its upcoming bookings
          if (event.vehicleId) {
            updateVehicleUpcomingBookings(event.vehicleId)
          }

          return updatedEvent
        }
        return event
      }),
    )
  }

  const switchView = (newView) => {
    setView(newView)
  }

  const handleDayClick = (date) => {
    setCurrentDate(date)
    setView("day")
  }

  const handleCalendarToggle = (calendarId) => {
    setCalendars(calendars.map((cal) => (cal.id === calendarId ? { ...cal, visible: !cal.visible } : cal)))
  }

  const handleAddCalendar = (newCalendar) => {
    const newId = Math.max(...calendars.map((cal) => cal.id), 0) + 1
    setCalendars([
      ...calendars,
      {
        ...newCalendar,
        id: newId,
        visible: true,
      },
    ])
  }

  const handleCalendarColorChange = (calendarId, newColor) => {
    // Update calendar color
    setCalendars(calendars.map((cal) => (cal.id === calendarId ? { ...cal, color: newColor } : cal)))

    // Update all events for this calendar
    setEvents(events.map((event) => (event.calendarId === calendarId ? { ...event, color: newColor } : event)))
  }

  const handleAddDriver = (newDriver) => {
    const newId = Math.max(...drivers.map((driver) => driver.id), 0) + 1
    setDrivers([
      ...drivers,
      {
        ...newDriver,
        id: newId,
        upcomingLessons: [],
      },
    ])
  }

  const handleSelectDriver = (driver) => {
    // Just select the driver, don't open the event modal
    console.log("Selected driver:", driver.name)
    // We could use this for other functionality in the future
  }

  const handleAddInstructor = (newInstructor) => {
    const newId = Math.max(...instructors.map((instructor) => instructor.id), 0) + 1
    setInstructors([
      ...instructors,
      {
        ...newInstructor,
        id: newId,
        upcomingLessons: [],
      },
    ])
  }

  const handleSelectInstructor = (instructor) => {
    console.log("Selected instructor:", instructor.name)
  }

  const handleAddVehicle = (newVehicle) => {
    const newId = Math.max(...vehicles.map((vehicle) => vehicle.id), 0) + 1
    setVehicles([
      ...vehicles,
      {
        ...newVehicle,
        id: newId,
        maintenanceHistory: [],
        upcomingBookings: [],
      },
    ])
  }

  const handleUpdateVehicle = (updatedVehicle) => {
    setVehicles(vehicles.map((vehicle) => (vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle)))
  }

  const handleAddTransaction = (newTransaction) => {
    setTransactions([...transactions, newTransaction])
  }

  const renderContent = () => {
    switch (activeSection) {
      case "calendar":
        return (
          <>
            <Header
              currentDate={currentDate}
              onPrevious={navigateToPreviousMonth}
              onNext={navigateToNextMonth}
              onToday={navigateToToday}
              view={view}
              onViewChange={switchView}
            />
            <div className="flex-1 overflow-auto">
              {view === "month" ? (
                <Calendar
                  currentDate={currentDate}
                  events={getFilteredEvents()}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  onDragEvent={handleDragEvent}
                  onDayClick={handleDayClick}
                />
              ) : (
                <DayView
                  currentDate={currentDate}
                  events={getFilteredEvents()}
                  onTimeClick={handleDateClick}
                  onEventClick={handleEventClick}
                  onDragEventTime={handleDragEventTime}
                />
              )}
            </div>
          </>
        )
      case "drivers":
        return (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h1 className="text-2xl font-bold text-gray-800">{translate("driverProfiles.Driver Profiles")}</h1>
            </div>
            <div className="flex-1 overflow-auto">
              <DriverProfiles drivers={drivers} onSelectDriver={handleSelectDriver} onAddDriver={handleAddDriver} />
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
                onSelectInstructor={handleSelectInstructor}
                onAddInstructor={handleAddInstructor}
              />
            </div>
          </div>
        )
      case "vehicles":
        return (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h1 className="text-2xl font-bold text-gray-800">{translate("vehicleManagement.Vehicle Management")}</h1>
            </div>
            <div className="flex-1 overflow-auto">
              <VehicleManagement
                vehicles={vehicles}
                onAddVehicle={handleAddVehicle}
                onUpdateVehicle={handleUpdateVehicle}
              />
            </div>
          </div>
        )
      case "finances":
        return (
          <div className="flex-1 overflow-hidden flex flex-col">
            <FinanceManagement transactions={transactions} onAddTransaction={handleAddTransaction} />
          </div>
        )
      case "dashboard":
        return (
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{translate("dashboard.Dashboard")}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">{translate("dashboard.Active Drivers")}</h2>
                <div className="text-3xl font-bold text-blue-600">
                  {drivers.filter((d) => d.remainingHours > 0).length}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {drivers.length} {translate("dashboard.total drivers")}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">{translate("dashboard.Upcoming Lessons")}</h2>
                <div className="text-3xl font-bold text-green-600">
                  {events.filter((e) => new Date(e.date) >= new Date()).length}
                </div>
                <div className="text-sm text-gray-500 mt-1">{translate("dashboard.Next 7 days")}</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">{translate("dashboard.Completed Hours")}</h2>
                <div className="text-3xl font-bold text-purple-600">
                  {drivers.reduce((total, driver) => total + driver.completedHours, 0)}
                </div>
                <div className="text-sm text-gray-500 mt-1">{translate("dashboard.All drivers")}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">{translate("dashboard.Instructor Status")}</h2>
                <div className="space-y-4">
                  {instructors.map((instructor) => (
                    <div key={instructor.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span>{instructor.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {drivers.filter((d) => d.instructorId === instructor.id).length}{" "}
                        {translate("dashboard.students")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">{translate("dashboard.Vehicle Status")}</h2>
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            vehicle.status === "available"
                              ? "bg-green-500"
                              : vehicle.status === "in-use"
                                ? "bg-blue-500"
                                : "bg-red-500"
                          }`}
                        ></div>
                        <span>
                          {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          vehicle.status === "available"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "in-use"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {vehicle.status === "available"
                          ? translate("dashboard.Available")
                          : vehicle.status === "in-use"
                            ? translate("dashboard.In Use")
                            : translate("dashboard.Maintenance")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-medium mb-4">{translate("dashboard.Recent Activity")}</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y">
                  {events
                    .filter((e) => new Date(e.date) <= new Date())
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map((event) => {
                      const driver = drivers.find((d) => d.id === event.driverId)
                      const instructor = instructors.find((i) => i.id === event.instructorId)
                      return (
                        <div key={event.id} className="p-4">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString()} at {event.startTime}
                          </div>
                          <div className="flex flex-wrap mt-1 gap-2">
                            {driver && (
                              <div className="text-sm text-blue-600">
                                {translate("dashboard.Driver")}: {driver.name}
                              </div>
                            )}
                            {instructor && (
                              <div className="text-sm text-purple-600">
                                {translate("dashboard.Instructor")}: {instructor.name}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                  {events.filter((e) => new Date(e.date) <= new Date()).length === 0 && (
                    <div className="p-6 text-center text-gray-500">{translate("dashboard.No recent activities")}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
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
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
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

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        calendars={calendars}
        onCalendarToggle={handleCalendarToggle}
        onAddCalendar={handleAddCalendar}
        onCalendarColorChange={handleCalendarColorChange}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        {renderContent()}
        {showEventModal && (
          <EventModal
            date={selectedDate}
            event={selectedEvent}
            calendars={calendars}
            drivers={drivers}
            instructors={instructors}
            vehicles={vehicles}
            onClose={closeModal}
            onSave={selectedEvent ? updateEvent : addEvent}
            onDelete={deleteEvent}
          />
        )}
      </div>
    </div>
  )
}

