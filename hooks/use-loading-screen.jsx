"use client"

import { useState, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Car } from "lucide-react"

// Kontekst dla ekranu ładowania
const LoadingContext = createContext(undefined)

// Provider komponentu
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
    // Reset po zamknięciu
    setTimeout(() => {
      setMessage("Ładowanie...")
      setProgress(0)
    }, 300)
  }

  return (
    <LoadingContext.Provider value={{ showLoading, updateLoading, hideLoading }}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          >
            <div className="w-full max-w-md p-8 rounded-lg bg-white shadow-xl">
              <div className="flex flex-col items-center space-y-8">
                <div className="relative w-40 h-40">
                  {/* Outer spinning circle */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />

                  {/* Inner spinning circle - opposite direction */}
                  <motion.div
                    className="absolute inset-2 rounded-full border-4 border-blue-100 border-b-blue-500"
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
                    <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center shadow-inner">
                      <Car className="w-12 h-12 text-blue-600" />
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
                  <h3 className="text-2xl font-bold text-blue-800 mb-3">AutoSzkoła</h3>
                  <motion.p
                    className="text-blue-600 mb-5 font-medium"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    {message}
                  </motion.p>

                  <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
                    <motion.div
                      className="bg-blue-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                          animate={{
                            y: [-3, 3, -3],
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
                    <p className="text-sm font-medium text-blue-700">{progress}%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  )
}

// Hook do używania ekranu ładowania
export function useLoadingScreen() {
  const context = useContext(LoadingContext)

  if (context === undefined) {
    throw new Error("useLoadingScreen musi być używany wewnątrz LoadingProvider")
  }

  return context
}
