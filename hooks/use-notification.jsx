"use client"

import { useState, createContext, useContext, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Kontekst dla powiadomień
const NotificationContext = createContext(undefined)

// Provider komponentu
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const notificationTimers = useRef({})

  // Czyszczenie timerów przy odmontowaniu
  useEffect(() => {
    return () => {
      Object.values(notificationTimers.current).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  // Generowanie unikalnego ID
  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Dodawanie nowego powiadomienia
  const showNotification = useCallback((type, title, message, duration = 5000) => {
    const id = generateId()

    setNotifications((prev) => [...prev, { id, type, title, message, duration }])

    if (duration > 0) {
      notificationTimers.current[id] = setTimeout(() => {
        dismissNotification(id)
      }, duration)
    }

    return id
  }, [])

  // Usuwanie powiadomienia
  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))

    if (notificationTimers.current[id]) {
      clearTimeout(notificationTimers.current[id])
      delete notificationTimers.current[id]
    }
  }, [])

  // Funkcje pomocnicze dla różnych typów powiadomień
  const success = useCallback(
    (title, message, duration) => {
      return showNotification("success", title, message, duration)
    },
    [showNotification],
  )

  const error = useCallback(
    (title, message, duration) => {
      return showNotification("error", title, message, duration)
    },
    [showNotification],
  )

  const info = useCallback(
    (title, message, duration) => {
      return showNotification("info", title, message, duration)
    },
    [showNotification],
  )

  const warning = useCallback(
    (title, message, duration) => {
      return showNotification("warning", title, message, duration)
    },
    [showNotification],
  )

  // Ikony dla różnych typów powiadomień
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-500" />
      case "info":
        return <Info className="w-6 h-6 text-blue-500" />
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-500" />
    }
  }

  // Kolory dla różnych typów powiadomień
  const getStyles = (type) => {
    switch (type) {
      case "success":
        return "border-l-4 border-green-500 bg-green-50"
      case "error":
        return "border-l-4 border-red-500 bg-red-50"
      case "info":
        return "border-l-4 border-blue-500 bg-blue-50"
      case "warning":
        return "border-l-4 border-amber-500 bg-amber-50"
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        dismissNotification,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn("rounded-lg shadow-lg p-4 pr-10 relative", getStyles(notification.type))}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
              </div>

              <button
                onClick={() => dismissNotification(notification.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Zamknij powiadomienie"
              >
                <X className="w-5 h-5" />
              </button>

              {notification.duration && notification.duration > 0 && (
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: notification.duration / 1000, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-1 bg-gray-300 bg-opacity-50 rounded-b-lg"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

// Hook do używania powiadomień
export function useNotification() {
  const context = useContext(NotificationContext)

  if (context === undefined) {
    throw new Error("useNotification musi być używany wewnątrz NotificationProvider")
  }

  return context
}
