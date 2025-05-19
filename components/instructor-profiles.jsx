"use client"

import { useEffect, useState } from "react"
import { Search, User, Phone, Calendar, Plus, Mail, BookOpen } from "lucide-react"

export default function InstructorProfiles({ instructors, drivers, onSelectInstructor, onAddInstructor }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInstructor, setSelectedInstructor] = useState(null)

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}.${month}.${year}`;
  }
  
  function calculateDuration(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
  
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
  
    const durationMinutes = endTotal - startTotal;
    const durationHours = durationMinutes / 60;
  
    return durationHours.toFixed(1); // np. 1.5
  }

  useEffect(() => {
    const insturctorId = selectedInstructor?.id
    if (insturctorId) {
      const selected = instructors.find((instructor) => instructor.id === insturctorId)
      setSelectedInstructor(selected)
    }
  }, [instructors, selectedInstructor?.id])

  // Filtruj instruktorów na podstawie zapytania wyszukiwania
  const filteredInstructors = instructors.filter(
    (instructor) =>
      instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.phone.includes(searchQuery) ||
      instructor.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleInstructorSelect = (instructor) => {
    setSelectedInstructor(instructor)
    if (onSelectInstructor) {
      onSelectInstructor(instructor)
    }
  }



  // Pobierz przypisanych kursantów dla instruktora
  const getAssignedDrivers = (instructor_id) => {
    return drivers.filter((driver) => driver.instructor_id === instructor_id)
  }
  console.log("Selected instructor:", selectedInstructor)
  return (
    <div className="h-full flex">
      {/* Lista instruktorów */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj instruktorów..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

        </div>

        <div className="divide-y">
          {filteredInstructors.map((instructor) => {
            const assignedDrivers = getAssignedDrivers(instructor.id)

            return (
              <div
                key={instructor.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedInstructor?.id === instructor.id ? "bg-blue-50" : ""}`}
                onClick={() => {
                  handleInstructorSelect(instructor)
                  console.log("Selected instructor:", instructor)
                }}
              >
                <div className="font-medium">{instructor.name + " " + instructor.surname}</div>
                <div className="text-sm text-gray-500">{instructor.phone}</div>
                <div className="text-sm text-gray-500">{instructor.email}</div>
                <div className="mt-1 flex items-center">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      instructor.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {instructor.status === "active" ? "Aktywny" : "Nieaktywny"}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">{assignedDrivers.length} kursantów</span>
                </div>
              </div>
            )
          })}

          {filteredInstructors.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Nie znaleziono instruktorów pasujących do "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Szczegóły instruktora */}
      <div className="w-2/3 overflow-y-auto">
        {selectedInstructor ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedInstructor.name + " " + selectedInstructor.surname}</h2>
                <p className="text-gray-500">Kategorie prawa jazdy: {selectedInstructor.instructors.category}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedInstructor.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedInstructor.status === "active" ? "Aktywny" : "Nieaktywny"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Telefon</div>
                  <div>{selectedInstructor.phone}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div>{selectedInstructor.email}</div>
                </div>
              </div>

          

            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Przypisani kursanci</h3>
                <span className="text-sm text-gray-500">
                  {selectedInstructor.drivers.length} kursantów
                </span>
              </div>

              {selectedInstructor.drivers.length > 0 ? (
                <div className="space-y-2">
                  {selectedInstructor.drivers.map((driver) => (
                    <div key={driver.id} className="p-3 border rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-3 text-blue-500" />
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-gray-500">
                            Kategoria: {driver.license_type} •
                            {(driver.remaining_hours - driver.completed_hours) > 0
                              ? ` ${(driver.remaining_hours - driver.completed_hours)} godzin pozostało`
                              : " Szkolenie ukończone"}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          (driver.remaining_hours - driver.completed_hours) === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {(driver.remaining_hours - driver.completed_hours) === 0 ? "Ukończone" : "W trakcie"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 p-4 text-center border rounded-md">
                  Brak kursantów przypisanych do tego instruktora.
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Harmonogram</h3>
              {selectedInstructor.events && selectedInstructor.events.length > 0 ? (
                <div className="space-y-2">
                  {selectedInstructor.events.map((lesson, index) => (
                    <div key={index} className="p-3 border rounded-md flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                      <div>
                        <div className="font-medium">
                          {formatDate(lesson.date)} o {lesson.start_time}
                        </div>
                        <div className="text-sm text-gray-500">
                          {calculateDuration(lesson.start_time, lesson.end_time)} godzin z {lesson.driver.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 p-4 text-center border rounded-md">Brak zaplanowanych lekcji.</div>
              )}
            </div>
          </div>
        ) 
          
        : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Wybierz instruktora, aby zobaczyć szczegóły lub dodaj nowego instruktora.
          </div>
        )}
      </div>
    </div>
  )
}

