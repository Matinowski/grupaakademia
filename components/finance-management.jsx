"use client"

import { useState, useEffect } from "react"
import { CreditCard, DollarSign, ArrowUp, ArrowDown, Filter, Download, Plus, Trash2 } from "lucide-react"
import { useNotification } from "@/hooks/use-notification"
import { LoadingProvider, useLoadingScreen, LoadingIndicator } from "@/components/loader/loading-screen"

  function FinanceManagement({}) {
  const [period, setPeriod] = useState("month")
  const [filter, setFilter] = useState("all")
  const [transactions, setTransactions] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newTransaction, setNewTransaction] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    type: "income",
    category: "lesson",
    amount: "",
    description: "",
    payment_method: "cash",
  })
  const notification = useNotification()


  const { showLoading, updateLoading, hideLoading } = useLoadingScreen()

  // Oblicz statystyki podsumowujące
  const calculateSummary = () => {
    const filteredTransactions = transactions.filter((transaction) => {
      if (filter !== "all" && transaction.type !== filter) return false

      const transactionDate = new Date(transaction.payment_date)
      const today = new Date()

      if (period === "month") {
        return transactionDate.getMonth() === today.getMonth() && transactionDate.getFullYear() === today.getFullYear()
      } else if (period === "quarter") {
        const currentQuarter = Math.floor(today.getMonth() / 3)
        const transactionQuarter = Math.floor(transactionDate.getMonth() / 3)
        return transactionQuarter === currentQuarter && transactionDate.getFullYear() === today.getFullYear()
      } else if (period === "year") {
        return transactionDate.getFullYear() === today.getFullYear()
      }

      return true
    })

    const income = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return {
      income,
      expenses,
      balance: income - expenses,
      count: filteredTransactions.length,
    }
  }

  const summary = calculateSummary()

  useEffect(() => {
    const fetchPayments = async () => {
      showLoading("Ładowanie płatności...", 10)
      try {
        const res = await fetch("/api/payments")
        const data = await res.json()
        setTransactions(data)
        updateLoading("Płatności załadowane", 100)
        notification.success("Sukces", "Pobrano transakcje")
        setIsLoading(false)
        hideLoading()

      } catch (err) {
        notification.error("Błąd", "Nie udało się pobrać transakcji")
      }
    }

    fetchPayments()
  }, [])

  // Pobierz transakcje do wyświetlenia
  const getFilteredTransactions = () => {
    return transactions
      .filter((transaction) => {
        if (filter !== "all" && transaction.type !== filter) return false

        const transactionDate = new Date(transaction.payment_date)
        const today = new Date()

        if (period === "month") {
          return (
            transactionDate.getMonth() === today.getMonth() && transactionDate.getFullYear() === today.getFullYear()
          )
        } else if (period === "quarter") {
          const currentQuarter = Math.floor(today.getMonth() / 3)
          const transactionQuarter = Math.floor(transactionDate.getMonth() / 3)
          return transactionQuarter === currentQuarter && transactionDate.getFullYear() === today.getFullYear()
        } else if (period === "year") {
          return transactionDate.getFullYear() === today.getFullYear()
        }

        return true
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTransaction({
      ...newTransaction,
      [name]: value,
    })
  }

  const onAddTransaction = async (transactionData) => {
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      })

      if (!res.ok) throw new Error("Błąd API")

      const newPayment = await res.json()
      setTransactions((prev) => [...prev, newPayment])
      notification.success("Dodano", "Transakcja zapisana w Supabase")
    } catch (err) {
      console.error("Error adding transaction:", err)
      notification.error("Błąd", "Nie udało się zapisać transakcji")
    }
  }

  const handleAddTransaction = (e) => {
    e.preventDefault()
    onAddTransaction({
      ...newTransaction,
      amount: Number(newTransaction.amount),
    })
    setNewTransaction({
      payment_date: new Date().toISOString().split("T")[0],
      type: "income",
      category: "lesson",
      amount: "",
      description: "",
      payment_method: "cash",
    })
    setShowAddForm(false)
  }

  // Funkcja do usuwania transakcji
  const handleDeleteTransaction = async (id) => {
    if (!confirm("Czy na pewno chcesz usunąć tę transakcję?")) {
      return
    }

    try {
      const res = await fetch(`/api/payments/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) throw new Error("Błąd API")

      // Usuń transakcję z lokalnego stanu
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
      notification.success("Usunięto", "Transakcja została usunięta")
    } catch (err) {
      console.error("Error deleting transaction:", err)
      notification.error("Błąd", "Nie udało się usunąć transakcji")
    }
  }

  const getCategoryLabel = (category) => {
    const categories = {
      lesson: "Lekcja jazdy",
      exam: "Egzamin na prawo jazdy",
      theory: "Zajęcia teoretyczne",
      vehicle: "Wydatki na pojazd",
      salary: "Wynagrodzenie",
      rent: "Czynsz",
      utilities: "Media",
      other: "Inne",
    }
    return categories[category] || category
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Zarządzanie Finansami</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              <span>Eksportuj</span>
              <Download className="w-4 h-4 ml-1" />
            </button>
          </div>

          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Dodaj Transakcję
          </button>
        </div>
      </div>

      {/* Karty podsumowujące */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Przychody</h3>
            <ArrowUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">${summary.income.toFixed(2)}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Wydatki</h3>
            <ArrowDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">${summary.expenses.toFixed(2)}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Bilans</h3>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${summary.balance.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Transakcje</h3>
            <CreditCard className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{summary.count}</div>
        </div>
      </div>

      {/* Filtry */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <select
            className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="month">Ten Miesiąc</option>
            <option value="quarter">Ten Kwartał</option>
            <option value="year">Ten Rok</option>
            <option value="all">Cały Okres</option>
          </select>

          <select
            className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Wszystkie Transakcje</option>
            <option value="income">Tylko Przychody</option>
            <option value="expense">Tylko Wydatki</option>
          </select>
        </div>
      </div>

      {/* Formularz dodawania transakcji */}
      {showAddForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">Dodaj Nową Transakcję</h3>
          <form onSubmit={handleAddTransaction}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  name="payment_date"
                  value={newTransaction.payment_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="income">Przychód</option>
                  <option value="expense">Wydatek</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kwota</label>
                <input
                  type="number"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
                <select
                  name="category"
                  value={newTransaction.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {newTransaction.type === "income" ? (
                    <>
                      <option value="Inne">Inny przychód</option>
                    </>
                  ) : (
                    <>
                      <option value="vehicle">Wydatki na pojazd</option>
                      <option value="salary">Wynagrodzenie</option>
                      <option value="rent">Czynsz</option>
                      <option value="utilities">Media</option>
                      <option value="other">Inny wydatek</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metoda płatności</label>
                <select
                  name="payment_method"
                  value={newTransaction.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="cash">Gotówka</option>
                  <option value="card">Karta kredytowa/debetowa</option>
                  <option value="transfer">Przelew bankowy</option>
                  <option value="other">Inna</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opis transakcji"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setShowAddForm(false)}
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Zapisz Transakcję
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela transakcji */}
      {isLoading ? (
              <LoadingIndicator className=" mt-20" />
            ) : (
      <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 ">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Data
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Opis
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kategoria
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Metoda płatności
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kwota
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredTransactions().map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.payment_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryLabel(transaction.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {transaction.payment_method === "cash"
                      ? "Gotówka"
                      : transaction.payment_method === "card"
                        ? "Karta"
                        : transaction.payment_method === "transfer"
                          ? "Przelew"
                          : "Inna"}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-900 focus:outline-none"
                      title="Usuń transakcję"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {getFilteredTransactions().length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nie znaleziono transakcji dla wybranego okresu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  )
}



export default function FinanceManagementPage() {
  return (
    <LoadingProvider>
      <FinanceManagement />
    </LoadingProvider>
  )
}