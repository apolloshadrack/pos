'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CreditCard, DollarSign, Calendar, X, Printer } from 'lucide-react'

interface TransactionItem {
  id: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

interface Transaction {
  id: string
  transactionId: string
  paymentMethod: string
  total: number
  createdAt: string
  items: TransactionItem[]
}

export default function SalesHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
  })
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [selectedDate])

  useEffect(() => {
    calculateStats()
  }, [transactions])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const url = selectedDate
        ? `/api/transactions?date=${selectedDate}`
        : '/api/transactions'
      const response = await fetch(url)
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0)
    const totalTransactions = transactions.length
    setStats({ totalRevenue, totalTransactions })
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm')
  }

  const getPaymentIcon = (method: string) => {
    return <CreditCard className="w-4 h-4 inline mr-1" />
  }

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowReceiptModal(true)
  }

  const handlePrintReceipt = () => {
    if (!selectedTransaction) return

    const receiptContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${selectedTransaction.transactionId}</title>
  <style>
    body { font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
    .items { margin: 10px 0; }
    .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
    .total { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; display: flex; justify-content: space-between; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Liquor Store POS</h2>
    <p>Transaction: ${selectedTransaction.transactionId}</p>
    <p>${formatDate(selectedTransaction.createdAt)}</p>
  </div>
  <div class="items">
    ${selectedTransaction.items.map(item => `
      <div class="item">
        <span>${item.productName} x${item.quantity}</span>
        <span>KSh ${item.subtotal.toLocaleString()}</span>
      </div>
    `).join('')}
  </div>
  <div class="total">
    <span>TOTAL:</span>
    <span>KSh ${selectedTransaction.total.toLocaleString()}</span>
  </div>
  <p style="text-align: center; margin-top: 10px;">Payment: ${selectedTransaction.paymentMethod.toUpperCase()}</p>
  <div class="footer">
    <p>Thank you for your purchase!</p>
  </div>
</body>
</html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(receiptContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  KSh {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalTransactions}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales History Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sales History</h2>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.transactionId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.items.length} items
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 capitalize">
                          {getPaymentIcon(transaction.paymentMethod)}
                          {transaction.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          KSh {transaction.total.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewReceipt(transaction)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Transaction Receipt</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Receipt */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm">
                <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                  <h4 className="font-bold text-gray-900">Liquor Store POS</h4>
                  <p className="text-xs text-gray-500">{selectedTransaction.transactionId}</p>
                  <p className="text-xs text-gray-500">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div className="space-y-2 mb-3">
                  {selectedTransaction.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{item.productName} x{item.quantity}</span>
                      <span>KSh {item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between font-bold text-gray-900">
                  <span>TOTAL:</span>
                  <span>KSh {selectedTransaction.total.toLocaleString()}</span>
                </div>
                <div className="text-center mt-3 text-xs text-gray-500">
                  Payment: {selectedTransaction.paymentMethod.toUpperCase()}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
