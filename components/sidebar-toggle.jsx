"use client"

import { Menu } from "lucide-react"

export default function SidebarToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50"
      aria-label="Otwórz menu"
    >
      <Menu className="w-6 h-6 text-gray-700" />
    </button>
  )
}
