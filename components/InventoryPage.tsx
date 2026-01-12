'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Box } from 'lucide-react'

interface Product {
  _id: string
  name: string
  barcode: string
  category: string
  price: number
  stock: number
  abv?: number
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    inventoryValue: 0,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const totalProducts = products.length
    const lowStockItems = products.filter((p) => p.stock < 10).length
    const inventoryValue = products.reduce(
      (sum, p) => sum + p.price * p.stock,
      0
    )

    setStats({ totalProducts, lowStockItems, inventoryValue })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalProducts}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Box className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.lowStockItems}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Box className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                KSh {stats.inventoryValue.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Box className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Inventory Management</h2>
          <button
            onClick={() => {
              const name = prompt('Product Name:')
              if (!name) return
              const barcode = prompt('Barcode:')
              if (!barcode) return
              const category = prompt('Category (beer/wine/spirits/cider/other):')
              if (!category) return
              const price = prompt('Price (KSh):')
              if (!price) return
              const stock = prompt('Stock Quantity:')
              if (!stock) return
              const abv = prompt('ABV % (optional, press Enter to skip):')

              fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name,
                  barcode,
                  category: category.toLowerCase(),
                  price: parseFloat(price),
                  stock: parseInt(stock),
                  abv: abv ? parseFloat(abv) : null,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.error) {
                    alert('Error: ' + data.error)
                  } else {
                    alert('Product added successfully!')
                    fetchProducts()
                  }
                })
                .catch((err) => {
                  alert('Error adding product: ' + err.message)
                })
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {product.barcode}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      KSh {product.price}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.stock < 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => alert('Edit functionality coming soon!')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

