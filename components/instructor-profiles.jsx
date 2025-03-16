"use client"

import { useState } from "react"
import { Search, User, Phone, Calendar, Plus, Mail, BookOpen } from "lucide-react"

// Podobne zmiany jak w driver-profiles.jsx, ale z odpowiednimi tłumaczeniami dla instruktorów
// ...

export default function InstructorProfiles({ instructors, drivers, onSelectInstructor, onAddInstructor }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInstructor, setSelectedInstructor] = useState(null)
  const [showAddInstructorForm, setShowAddInstructorForm] = useState(false)
  const [newInstructor, setNewInstructor] = useState({
    name: "",
    phone: "",
    email: "",
    licenseTypes: ["B"],
    hireDate: "",
    specialization: "",
    bio: "",
    status: "active",
  })

  // Filter instructors based on search query
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

  const handleAddInstructorSubmit = (e) => {
    e.preventDefault()
    onAddInstructor(newInstructor)
    setNewInstructor({
      name: "",
      phone: "",
      email: "",
      licenseTypes: ["B"],
      hireDate: "",
      specialization: "",
      bio: "",
      status: "active",
    })
    setShowAddInstructorForm(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewInstructor({
      ...newInstructor,
      [name]: value,
    })
  }

  const handleLicenseTypeChange = (e) => {
    const { value, checked } = e.target
    if (checked) {
      setNewInstructor({
        ...newInstructor,
        licenseTypes: [...newInstructor.licenseTypes, value],
      })
    } else {
      setNewInstructor({
        ...newInstructor,
        licenseTypes: newInstructor.licenseTypes.filter((type) => type !== value),
      })
    }
  }

  // Get assigned drivers for an instructor
  const getAssignedDrivers = (instructorId) => {
    return drivers.filter((driver) => driver.instructorId === instructorId)
  }

  return (
    <div className="h-full flex">
      {/* Instructor list */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search instructors..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="mt-3 flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => setShowAddInstructorForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add New Instructor
          </button>
        </div>

        <div className="divide-y">
          {filteredInstructors.map((instructor) => {
            const assignedDrivers = getAssignedDrivers(instructor.id)

            return (
              <div
                key={instructor.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedInstructor?.id === instructor.id ? "bg-blue-50" : ""}`}
                onClick={() => handleInstructorSelect(instructor)}
              >
                <div className="font-medium">{instructor.name}</div>
                <div className="text-sm text-gray-500">{instructor.phone}</div>
                <div className="text-sm text-gray-500">{instructor.email}</div>
                <div className="mt-1 flex items-center">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      instructor.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {instructor.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">{assignedDrivers.length} students</span>
                </div>
              </div>
            )
          })}

          {filteredInstructors.length === 0 && (
            <div className="p-8 text-center text-gray-500">No instructors found matching "{searchQuery}"</div>
          )}
        </div>
      </div>

      {/* Instructor details */}
      <div className="w-2/3 overflow-y-auto">
        {selectedInstructor ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedInstructor.name}</h2>
                <p className="text-gray-500">License Types: {selectedInstructor.licenseTypes.join(", ")}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedInstructor.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedInstructor.status === "active" ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
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

              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Hire Date</div>
                  <div>{selectedInstructor.hireDate}</div>
                </div>
              </div>

              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Specialization</div>
                  <div>{selectedInstructor.specialization}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Bio</h3>
              <div className="p-4 bg-gray-50 rounded-md">{selectedInstructor.bio || "No bio available."}</div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Assigned Students</h3>
                <span className="text-sm text-gray-500">
                  {getAssignedDrivers(selectedInstructor.id).length} students
                </span>
              </div>

              {getAssignedDrivers(selectedInstructor.id).length > 0 ? (
                <div className="space-y-2">
                  {getAssignedDrivers(selectedInstructor.id).map((driver) => (
                    <div key={driver.id} className="p-3 border rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-3 text-blue-500" />
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-gray-500">
                            License Type: {driver.licenseType} •
                            {driver.remainingHours > 0
                              ? ` ${driver.remainingHours} hours remaining`
                              : " Training completed"}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          driver.remainingHours === 0 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {driver.remainingHours === 0 ? "Completed" : "In Training"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 p-4 text-center border rounded-md">
                  No students assigned to this instructor.
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Upcoming Schedule</h3>
              {selectedInstructor.upcomingLessons && selectedInstructor.upcomingLessons.length > 0 ? (
                <div className="space-y-2">
                  {selectedInstructor.upcomingLessons.map((lesson, index) => (
                    <div key={index} className="p-3 border rounded-md flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                      <div>
                        <div className="font-medium">
                          {lesson.date} at {lesson.time}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lesson.duration} hours with {lesson.student}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 p-4 text-center border rounded-md">No upcoming lessons scheduled.</div>
              )}
            </div>
          </div>
        ) : showAddInstructorForm ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Add New Instructor</h2>
            <form onSubmit={handleAddInstructorSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newInstructor.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={newInstructor.phone}
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
                    value={newInstructor.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={newInstructor.hireDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={newInstructor.specialization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={newInstructor.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">License Types</label>
                <div className="grid grid-cols-5 gap-2">
                  {["A", "B", "C", "D", "E"].map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`license-${type}`}
                        value={type}
                        checked={newInstructor.licenseTypes.includes(type)}
                        onChange={handleLicenseTypeChange}
                        className="mr-2"
                      />
                      <label htmlFor={`license-${type}`} className="text-sm">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={newInstructor.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setShowAddInstructorForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add Instructor
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select an instructor to view details or add a new instructor.
          </div>
        )}
      </div>
    </div>
  )
}

