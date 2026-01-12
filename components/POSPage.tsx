'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, Minus, Trash2, CreditCard, DollarSign, Smartphone, X, CheckCircle, AlertCircle, Printer } from 'lucide-react'
import { useCartStore, CartItem } from '@/store/cart-store'

interface Product {
  _id: string
  name: string
  barcode: string
  category: string
  price: number
  stock: number
  abv?: number
  image?: any
}

interface TransactionResult {
  transactionId: string
  items: { productName: string; quantity: number; price: number; subtotal: number }[]
  paymentMethod: string
  total: number
  createdAt: string
}

const categories = ['all', 'beer', 'wine', 'spirits', 'cider', 'other']

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash')
  const [isProcessing, setIsProcessing] = useState(false)
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore()

  // Modal states
  const [showMpesaModal, setShowMpesaModal] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [lastTransaction, setLastTransaction] = useState<TransactionResult | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.barcode.includes(query)
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.error) {
        console.error('API Error:', data.error, data.details)
        return
      }
      console.log('Fetched products:', data.products?.length || 0)
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleCheckoutClick = () => {
    if (items.length === 0) return

    if (paymentMethod === 'mobile') {
      setShowMpesaModal(true)
    } else {
      processCheckout()
    }
  }

  const handleMpesaSubmit = () => {
    if (!mpesaPhone || mpesaPhone.length < 9) {
      setErrorMessage('Please enter a valid phone number')
      setShowErrorModal(true)
      return
    }
    setShowMpesaModal(false)
    processCheckout(mpesaPhone)
  }

  const processCheckout = async (phoneNumber?: string) => {
    if (items.length === 0) return

    setIsProcessing(true)
    try {
      const checkoutItems = items.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }))

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          paymentMethod,
          total: getTotal(),
          ...(phoneNumber && { mpesaPhone: phoneNumber }),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLastTransaction({
          transactionId: data.transaction?.transactionId || `SALE-${Date.now()}`,
          items: checkoutItems,
          paymentMethod,
          total: getTotal(),
          createdAt: new Date().toISOString(),
        })
        clearCart()
        setMpesaPhone('')
        setShowSuccessModal(true)
      } else {
        setErrorMessage(data.error || 'Failed to process transaction')
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setErrorMessage('An error occurred during checkout')
      setShowErrorModal(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handlePrintReceipt = () => {
    if (!lastTransaction) return

    const receiptContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${lastTransaction.transactionId}</title>
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
    <p>Transaction: ${lastTransaction.transactionId}</p>
    <p>${formatDate(lastTransaction.createdAt)}</p>
  </div>
  <div class="items">
    ${lastTransaction.items.map(item => `
      <div class="item">
        <span>${item.productName} x${item.quantity}</span>
        <span>KSh ${item.subtotal.toLocaleString()}</span>
      </div>
    `).join('')}
  </div>
  <div class="total">
    <span>TOTAL:</span>
    <span>KSh ${lastTransaction.total.toLocaleString()}</span>
  </div>
  <p style="text-align: center; margin-top: 10px;">Payment: ${lastTransaction.paymentMethod.toUpperCase()}</p>
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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Products</h2>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or barcode..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} {cat === 'all' ? 'Products' : ''}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  No products found. Try adjusting your search or category filter.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-xs text-gray-500 uppercase">{product.category}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        {product.stock} in stock
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <p className="text-lg font-bold text-gray-900">KSh {product.price}</p>
                        {product.abv && (
                          <p className="text-xs text-gray-500">{product.abv}% ABV</p>
                        )}
                      </div>
                      <button
                        onClick={() => addItem({
                          id: product._id,
                          name: product.name,
                          price: product.price,
                          category: product.category,
                          abv: product.abv,
                        })}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Cart ({getItemCount()})</h2>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-24 w-24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">Cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500">KSh {item.price}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-semibold text-sm">
                          KSh {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>KSh {getTotal().toLocaleString()}</span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex items-center justify-center space-x-1 px-3 py-2 border rounded-md text-sm ${paymentMethod === 'cash'
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Cash</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`flex items-center justify-center space-x-1 px-3 py-2 border rounded-md text-sm ${paymentMethod === 'card'
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Card</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('mobile')}
                        className={`flex items-center justify-center space-x-1 px-3 py-2 border rounded-md text-sm ${paymentMethod === 'mobile'
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Mobile</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutClick}
                    disabled={isProcessing || items.length === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Complete Sale'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* M-Pesa Phone Number Modal */}
      {showMpesaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-white" />
                <h3 className="text-lg font-semibold text-white">M-Pesa Payment</h3>
              </div>
              <button
                onClick={() => setShowMpesaModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Enter your M-Pesa phone number to receive the STK push prompt.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm">
                    +254
                  </span>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="7XXXXXXXX"
                    maxLength={9}
                    className="flex-1 border border-gray-300 rounded-r-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount to pay:</span>
                  <span className="font-bold text-gray-900">KSh {getTotal().toLocaleString()}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMpesaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMpesaSubmit}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Sending...' : 'Send STK Push'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal with Receipt */}
      {showSuccessModal && lastTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-white" />
                <h3 className="text-lg font-semibold text-white">Transaction Successful!</h3>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
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
                  <p className="text-xs text-gray-500">{lastTransaction.transactionId}</p>
                  <p className="text-xs text-gray-500">{formatDate(lastTransaction.createdAt)}</p>
                </div>
                <div className="space-y-2 mb-3">
                  {lastTransaction.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{item.productName} x{item.quantity}</span>
                      <span>KSh {item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between font-bold text-gray-900">
                  <span>TOTAL:</span>
                  <span>KSh {lastTransaction.total.toLocaleString()}</span>
                </div>
                <div className="text-center mt-3 text-xs text-gray-500">
                  Payment: {lastTransaction.paymentMethod.toUpperCase()}
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
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-white" />
                <h3 className="text-lg font-semibold text-white">Transaction Failed</h3>
              </div>
              <button
                onClick={() => setShowErrorModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
