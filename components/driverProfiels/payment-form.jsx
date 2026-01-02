"use client"

import { useEffect, useState } from "react"
import { addPayment, deletePayment } from "@/app/actions/payment-actions"
import { CreditCard, Calendar, DollarSign, FileText, Plus, Trash2, AlertCircle } from "lucide-react"
import PaymentSchedule from "./payment-schedule"
import { useRouter } from "next/navigation"

export default function PaymentForm({ driver, userId, onClose }) {
  const router = useRouter()
  const { id: driver_id } = driver
  const [varDriver, setVarDriver] = useState(driver)
  const [payments, setPayments] = useState(varDriver.payments || [])
  const [totalPaid, setTotalPaid] = useState(varDriver.total_paid || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [selectedInstallment, setSelectedInstallment] = useState(null)
  const [newPayment, setNewPayment] = useState({
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    description: "",
    installment_id: null,
  })
  console.log("driver id", driver_id)
  console.log("driver asd", driver)
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewPayment({
      ...newPayment,
      [name]: value,
    })
  }

  useEffect(() => {
    setVarDriver(driver);
    setPayments(driver.payments || []);
    setTotalPaid(driver.total_paid || 0);
  }, [driver]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await addPayment({
        driver_id: driver_id,
        ...newPayment,
        created_by: userId,
      })

      if (result.success) {
        setPayments([result.payment, ...payments])
        setTotalPaid((prev) => prev + parseFloat(result.payment.amount))

        setNewPayment({
          amount: "",
          payment_date: new Date().toISOString().split("T")[0],
          payment_method: "cash",
          description: "",
          installment_id: null,
        })
        setShowForm(false)
        setSelectedInstallment(null)
      } else {
        alert(`Błąd podczas dodawania płatności: ${result.error}`)
      }
    } catch (error) {
      console.error("Error adding payment:", error)
      alert("Wystąpił błąd podczas dodawania płatności")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePayment = async (paymentId) => {
    setIsSubmitting(true)

    try {
      const result = await deletePayment(paymentId)

      if (result.success) {
        const deletedPayment = payments.find((p) => p.id === paymentId)
        setPayments(payments.filter((p) => p.id !== paymentId))
        setTotalPaid((prev) => Math.max(0, prev - parseFloat(deletedPayment.amount)))
        setConfirmDelete(null)
      } else {
        alert(`Błąd podczas usuwania płatności: ${result.error}`)
      }
    } catch (error) {
      console.error("Error deleting payment:", error)
      alert("Wystąpił błąd podczas usuwania płatności")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInstallmentPayment = (installment) => {
    setSelectedInstallment(installment)
    setNewPayment({
      ...newPayment,
      amount: installment.amount,
      description: `Płatność za ${installment.hours} godzin kursu`,
      installment_id: installment.id,
    })
    setShowForm(true)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pl-PL")
  }

  return (
    <div className="space-y-6">
      <PaymentSchedule driver={varDriver} onPaymentClick={handleInstallmentPayment} />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Historia Płatności</h3>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setSelectedInstallment(null)
              setNewPayment({
                amount: "",
                payment_date: new Date().toISOString().split("T")[0],
                payment_method: "cash",
                description: "",
                installment_id: null,
              })
            }}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Dodaj Płatność
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Łącznie zapłacone: <span className="font-semibold">{varDriver.total_paid
          } PLN</span>
        </p>

        {showForm && (
          <div className="border rounded-md p-4 bg-gray-50">
            <h4 className="text-md font-medium mb-3">
              {selectedInstallment ? `Płatność za ${selectedInstallment.hours} godzin kursu` : "Nowa Płatność"}
            </h4>
            {selectedInstallment && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
                <p className="text-sm text-blue-700">
                  Realizujesz płatność za {selectedInstallment.hours} godzin kursu w wysokości{" "}
                  {selectedInstallment.amount} PLN.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kwota (PLN)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      min="0"
                      value={newPayment.amount}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Płatności</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="payment_date"
                      value={newPayment.payment_date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metoda Płatności</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <select
                      name="payment_method"
                      value={newPayment.payment_method}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="cash">Gotówka</option>
                      <option value="card">Karta</option>
                      <option value="transfer">Przelew</option>
                      <option value="other">Inne</option>
                    </select>
                  </div>
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                <textarea
                  name="description"
                  value={newPayment.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedInstallment(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Dodawanie..." : "Dodaj Płatność"}
                </button>
              </div>
            </form>
          </div>
        )}

        {payments.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kwota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metoda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opis</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.payment_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {parseFloat(payment.amount).toFixed(2)} PLN
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.payment_method === "cash" && "Gotówka"}
                      {payment.payment_method === "card" && "Karta"}
                      {payment.payment_method === "transfer" && "Przelew"}
                      {payment.payment_method === "other" && "Inne"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {payment.description || (payment.receipt_number ? `Paragon: ${payment.receipt_number}` : "-")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {confirmDelete === payment.id ? (
                        <div className="flex justify-end items-center space-x-2">
                          <button onClick={() => setConfirmDelete(null)} className="text-gray-500 hover:text-gray-700">
                            Anuluj
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Usuwanie..." : "Potwierdź"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(payment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border rounded-md">Brak historii płatności</div>
        )}
      </div>
    </div>
  )
}
