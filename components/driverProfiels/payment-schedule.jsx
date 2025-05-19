"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react"

export default function PaymentSchedule({ driver, onPaymentClick }) {

  if (driver.paymentInstallments.length === 0) {
    return null
  }

  // Funkcja pomocnicza do obliczania wymaganej sumy do danej raty
  const calculateExpectedPayment = (installments, index) => {
    return installments
      .slice(0, index + 1)
      .reduce((sum, i) => sum + i.amount, 0)
  }

  return (
    <div className="border rounded-md shadow-sm mb-6">
      <div className="px-4 py-3 border-b">
        <h3 className="text-lg font-medium">Harmonogram Płatności</h3>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Po Godzinach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kwota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcja
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {driver.paymentInstallments.map((installment, index) => {
                const requiredPayment = calculateExpectedPayment(driver.paymentInstallments, index)
                const isDue = driver.completed_hours >= installment.hours
                const isPaid = driver.total_paid >= requiredPayment

                let status
                if (!isDue) {
                  status = "pending"
                } else if (isPaid) {
                  status = "paid"
                } else {
                  status = "overdue"
                }

                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{installment.hours}h</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{installment.amount} PLN</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {status === "paid" ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center w-fit">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Opłacone
                        </span>
                      ) : status === "overdue" ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center w-fit">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Zaległa płatność
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 flex items-center w-fit">
                          <Clock className="w-3 h-3 mr-1" />
                          Oczekujące
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {status === "overdue" && (
                        <button
                          onClick={() => onPaymentClick(installment)}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center ml-auto"
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          Zapłać
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Ukończone godziny</p>
            <p className="text-lg font-medium">{driver.completed_hours}h</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Suma wpłat</p>
            <p className="text-lg font-medium">{driver.total_paid} PLN</p>
          </div>
        </div>
      </div>
    </div>
  )
}
