"use client"

import { useState } from "react"
import { CreditCard, DollarSign, ArrowUp, ArrowDown, Filter, Download, Plus } from "lucide-react"

export default function FinanceManagement({ transactions, onAddTransaction }) {
  const [period, setPeriod] = useState("month")
  const [filter, setFilter] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "income",
    category: "lesson",
    amount: "",
    description: "",
    paymentMethod: "cash",
  })

  // Calculate summary statistics
  const calculateSummary = () => {
    const filteredTransactions = transactions.filter((transaction) => {
      if (filter !== "all" && transaction.type !== filter) return false

      const transactionDate = new Date(transaction.date)
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

  // Get transactions for display
  const getFilteredTransactions = () => {
    return transactions
      .filter((transaction) => {
        if (filter !== "all" && transaction.type !== filter) return false

        const transactionDate = new Date(transaction.date)
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

  const handleAddTransaction = (e) => {
    e.preventDefault()
    onAddTransaction({
      ...newTransaction,
      id: Date.now(),
      amount: Number(newTransaction.amount),
    })
    setNewTransaction({
      date: new Date().toISOString().split("T")[0],
      type: "income",
      category: "lesson",
      amount: "",
      description: "",
      paymentMethod: "cash",
    })
    setShowAddForm(false)
  }

  const getCategoryLabel = (category) => {
    const categories = {
      lesson: "Driving Lesson",
      exam: "Driving Exam",
      theory: "Theory Class",
      vehicle: "Vehicle Expense",
      salary: "Salary",
      rent: "Rent",
      utilities: "Utilities",
      other: "Other",
    }
    return categories[category] || category
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Management</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              <span>Export</span>
              <Download className="w-4 h-4 ml-1" />
            </button>
          </div>

          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Income</h3>
            <ArrowUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">${summary.income.toFixed(2)}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Expenses</h3>
            <ArrowDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">${summary.expenses.toFixed(2)}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Balance</h3>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${summary.balance.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
            <CreditCard className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{summary.count}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <select
            className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <select
            className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showAddForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">Add New Transaction</h3>
          <form onSubmit={handleAddTransaction}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newTransaction.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={newTransaction.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {newTransaction.type === "income" ? (
                    <>
                      <option value="lesson">Driving Lesson</option>
                      <option value="exam">Driving Exam</option>
                      <option value="theory">Theory Class</option>
                      <option value="other">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="vehicle">Vehicle Expense</option>
                      <option value="salary">Salary</option>
                      <option value="rent">Rent</option>
                      <option value="utilities">Utilities</option>
                      <option value="other">Other Expense</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={newTransaction.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Transaction description"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Payment Method
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredTransactions().map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryLabel(transaction.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {transaction.paymentMethod}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </td>
                </tr>
              ))}

              {getFilteredTransactions().length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

