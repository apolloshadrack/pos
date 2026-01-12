'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SeedProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleSeed = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/seed-products', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setResult({ error: data.error || 'Failed to seed products' })
        return
      }

      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Seed Sample Products</h1>
          <p className="text-gray-600 mb-6">
            This will add 14 sample products to your MongoDB database. Products that already exist will be skipped.
          </p>

          <button
            onClick={handleSeed}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Seeding products...' : 'Seed Products'}
          </button>

          {result && (
            <div className={`mt-6 p-4 rounded-md ${
              result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            }`}>
              {result.error ? (
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">Error</h3>
                  <p className="text-red-700">{result.error}</p>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Success!</h3>
                  <div className="text-green-700 space-y-1">
                    <p>Total products: {result.summary?.total}</p>
                    <p>Created: {result.summary?.created}</p>
                    <p>Skipped (already exist): {result.summary?.skipped}</p>
                    {result.summary?.errors > 0 && (
                      <p className="text-red-600">Errors: {result.summary.errors}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Sample Products:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Tusker Lager 500ml (Beer)</li>
              <li>White Cap 500ml (Beer)</li>
              <li>Pilsner 500ml (Beer)</li>
              <li>Guinness 500ml (Beer)</li>
              <li>Heineken 330ml (Beer)</li>
              <li>4th Street Sweet Red 750ml (Wine)</li>
              <li>Drostdy-Hof Cabernet 750ml (Wine)</li>
              <li>Nederburg Sauvignon Blanc (Wine)</li>
              <li>Jambo Wine Red 750ml (Wine)</li>
              <li>Smirnoff Vodka 750ml (Spirits)</li>
              <li>Johnnie Walker Red Label 750ml (Spirits)</li>
              <li>Captain Morgan Spiced Rum 750ml (Spirits)</li>
              <li>Savanna Dry Cider 500ml (Cider)</li>
              <li>Hunter's Gold Cider 500ml (Cider)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

