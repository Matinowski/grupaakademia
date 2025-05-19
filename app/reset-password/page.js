"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Save, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [tempPassword, setTempPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showTempPassword, setShowTempPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword, isAuthenticated } = useAuth()

  const router = useRouter()

  // Sprawdzenie, czy użytkownik jest zalogowany
  useEffect(() => {
    if (isAuthenticated && !success) {
      // Jeśli użytkownik jest już zalogowany, ale nie zresetował hasła
      // pozostajemy na stronie resetowania
    } else if (isAuthenticated && success) {
      // Jeśli użytkownik zresetował hasło, przekierowanie do panelu
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    }
  }, [isAuthenticated, router, success])

  const validatePassword = (password) => {
    // Minimum 8 znaków, co najmniej jedna duża litera, jedna mała litera, jedna cyfra i jeden znak specjalny
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return regex.test(password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Walidacja haseł
    if (newPassword !== confirmPassword) {
      setError("Nowe hasło i potwierdzenie hasła nie są identyczne.")
      setIsLoading(false)
      return
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Hasło musi zawierać minimum 8 znaków, co najmniej jedną dużą literę, jedną małą literę, jedną cyfrę i jeden znak specjalny.",
      )
      setIsLoading(false)
      return
    }

    // Symulacja resetowania hasła
    try {
      const response = await resetPassword(tempPassword, newPassword)
      if (response.success) {
        // Resetowanie udane
        setSuccess(true)
      } else {
        // Resetowanie nieudane
        setError("Wystąpił błąd podczas zmiany hasła. Sprawdź czy tymczasowe hasło jest poprawne.")
      }
    } catch (err) {
      setError("Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie później.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Lewa strona - obraz */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/ak.jpg')",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/50"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6">GRUPA AKADEMIA</h1>
            <p className="text-xl mb-8">
              Profesjonalne szkolenia dla kierowców. Dołącz do nas i zdobądź nowe umiejętności.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p>Doświadczeni instruktorzy</p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p>Nowoczesna flota pojazdów</p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p>Wysokie wyniki zdawalności</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prawa strona - formularz zmiany hasła */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Ustaw nowe hasło</h1>
            <p className="text-gray-600">Przy pierwszym logowaniu musisz zmienić hasło tymczasowe</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <span className="text-green-800 font-medium">Hasło zostało zmienione pomyślnie!</span>
                <p className="text-green-700 mt-1">Za chwilę zostaniesz przekierowany do panelu administracyjnego.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="temp-password" className="block text-sm font-medium text-gray-700 mb-1">
                Hasło tymczasowe
              </label>
              <div className="relative">
                <input
                  id="temp-password"
                  type={showTempPassword ? "text" : "password"}
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Wprowadź hasło tymczasowe"
                  required
                  disabled={success}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowTempPassword(!showTempPassword)}
                  disabled={success}
                >
                  {showTempPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                Nowe hasło
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Wprowadź nowe hasło"
                  required
                  disabled={success}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={success}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Hasło musi zawierać minimum 8 znaków, co najmniej jedną dużą literę, jedną małą literę, jedną cyfrę i
                jeden znak specjalny.
              </p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Potwierdź nowe hasło
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Potwierdź nowe hasło"
                  required
                  disabled={success}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={success}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoading || success ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={isLoading || success}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Ustaw nowe hasło
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <div className="text-sm text-gray-600">
              Potrzebujesz pomocy?{" "}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Skontaktuj się z administratorem
              </a>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center">
              <img src="/placeholder.svg?height=40&width=150" alt="Logo Grupa Akademia" className="h-10" />
            </div>
            <p className="mt-4 text-xs text-center text-gray-500">
              &copy; {new Date().getFullYear()} Grupa Akademia. Wszelkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
