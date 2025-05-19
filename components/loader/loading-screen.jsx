"use client"

import { useState, createContext, useContext, forwardRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Car } from "lucide-react"

// Context for loading state
const LoadingContext = createContext(undefined)

// Provider component
export function LoadingProvider({ children }) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState("Ładowanie...")
  const [progress, setProgress] = useState(0)

  const showLoading = (newMessage, newProgress) => {
    setIsVisible(true)
    if (newMessage) setMessage(newMessage)
    if (newProgress !== undefined) setProgress(newProgress)
  }

  const updateLoading = (newMessage, newProgress) => {
    if (newMessage) setMessage(newMessage)
    if (newProgress !== undefined) setProgress(newProgress)
  }

  const hideLoading = () => {
    setIsVisible(false)
    // Reset after closing
    setTimeout(() => {
      setMessage("Ładowanie...")
      setProgress(0)
    }, 300)
  }

  return (
    <LoadingContext.Provider value={{ showLoading, updateLoading, hideLoading, isVisible, message, progress }}>
      {children}
    </LoadingContext.Provider>
  )
}

// Hook to use loading screen
export function useLoadingScreen() {
  const context = useContext(LoadingContext)

  if (context === undefined) {
    throw new Error("useLoadingScreen musi być używany wewnątrz LoadingProvider")
  }

  return context
}

// Inline loading component that can be placed anywhere
export const LoadingIndicator = forwardRef(
  ({ className = "", size = "md", isVisible, message, progress, useContextState = true }, ref) => {
    const context = useContext(LoadingContext)

    // Use either provided props or context values
    const visible = useContextState ? context?.isVisible : isVisible
    const loadingMessage = useContextState ? context?.message : message
    const loadingProgress = useContextState ? context?.progress : progress

    // Size mappings
    const sizeMap = {
      sm: {
        container: "p-4",
        outer: "w-20 h-20",
        inner: "inset-1",
        center: "w-12 h-12",
        icon: "w-6 h-6",
        text: "text-sm",
        heading: "text-lg",
      },
      md: {
        container: "p-6",
        outer: "w-32 h-32",
        inner: "inset-2",
        center: "w-20 h-20",
        icon: "w-10 h-10",
        text: "text-base",
        heading: "text-xl",
      },
      lg: {
        container: "p-8",
        outer: "w-40 h-40",
        inner: "inset-2",
        center: "w-24 h-24",
        icon: "w-12 h-12",
        text: "text-lg",
        heading: "text-2xl",
      },
    }

    const s = sizeMap[size]

    return (
      <div ref={ref} className={`relative ${className}`}>
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center bg-white/90 rounded-lg shadow-md"
            >
              <div className={`w-full max-w-md ${s.container} rounded-lg bg-white`}>
                <div className="flex flex-col items-center space-y-6">
                  <div className={`relative ${s.outer}`}>
                    {/* Outer spinning circle */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />

                    {/* Inner spinning circle - opposite direction */}
                    <motion.div
                      className={`absolute ${s.inner} rounded-full border-4 border-blue-100 border-b-blue-500`}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />

                    {/* Pulsing center */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: [0.9, 1.1, 0.9] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                      <div
                        className={`bg-blue-50 rounded-full ${s.center} flex items-center justify-center shadow-inner`}
                      >
                        <Car className={`${s.icon} text-blue-600`} />
                      </div>
                    </motion.div>

                    {/* Orbiting elements */}
                    <motion.div
                      className="absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                      animate={{
                        x: [0, 20, 0, -20, 0],
                        y: [-20, 0, 20, 0, -20],
                        scale: [1, 1.2, 1, 1.2, 1],
                      }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                      <span className="text-white text-xs font-bold">L</span>
                    </motion.div>
                  </div>

                  <div className="text-center w-full">
                    <h3 className={`${s.heading} font-bold text-blue-800 mb-2`}>AutoSzkoła</h3>
                    <motion.p
                      className={`${s.text} text-blue-600 mb-4 font-medium`}
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      {loadingMessage}
                    </motion.p>

                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${loadingProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-1">
                        {[0, 1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                            animate={{
                              y: [-2, 2, -2],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.2,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                      <p className={`${s.text} font-medium text-blue-700`}>{loadingProgress}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

LoadingIndicator.displayName = "LoadingIndicator"
