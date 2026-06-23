'use client'
import { useState, useEffect } from 'react'
import { Product } from '@/lib/types'
import { getProducts, exportLibrary } from '@/lib/storage'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'cleanser', label: 'Cleanser' },
  { value: 'toner', label: 'Toner' },
  { value: 'serum', label: 'Serum' },
  { value: 'moisturiser', label: 'Moisturiser' },
  { value: 'spf', label: 'SPF' },
  { value: 'exfoliant', label: 'Exfoliant' },
  { value: 'mask', label: 'Mask' },
  { value: 'eye-cream', label: 'Eye Cream' },
  { value: 'oil', label: 'Oil' },
  { value: 'mist', label: 'Mist' },
  { value: 'other', label: 'Other' },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [ampm, setAmpm] = useState('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setProducts(getProducts())
    setMounted(true)
  }, [])

  if (!mounted) return null

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.featuredIngredients.some(i => i.name.toLowerCase().includes(q))
    const matchCategory = category === 'all' || p.category === category
    const matchAmpm = ampm === 'all' || p.amPm === ampm || (ampm !== 'Both' && p.amPm === 'Both')
    return matchSearch && matchCategory && matchAmpm
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-skin-text mb-1">My Skincare Library</h1>
          <p className="text-skin-muted text-sm">{products.length} products owned</p>
        </div>
        {products.length > 0 && (
          <button
            onClick={exportLibrary}
            className="text-sm text-skin-muted border border-skin-border px-4 py-2 rounded-full hover:border-blush hover:text-blush transition-colors"
          >
            Export backup
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by product, brand, or ingredient..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-skin-border bg-white text-skin-text placeholder-skin-muted focus:outline-none focus:ring-2 focus:ring-blush/30 focus:border-blush transition-colors text-sm"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`text-sm px-3 py-1.5 rounded-full transition-colors font-medium ${
              category === cat.value
                ? 'bg-blush text-white'
                : 'bg-white border border-skin-border text-skin-muted hover:border-blush hover:text-skin-text'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* AM/PM filters */}
      <div className="flex gap-2 mb-8">
        {[
          { value: 'all', label: 'All Routines' },
          { value: 'AM', label: 'AM' },
          { value: 'PM', label: 'PM' },
          { value: 'Both', label: 'AM + PM' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setAmpm(opt.value)}
            className={`text-sm px-3 py-1.5 rounded-full transition-colors font-medium ${
              ampm === opt.value
                ? 'bg-lilac text-purple-900'
                : 'bg-white border border-skin-border text-skin-muted hover:border-lilac hover:text-skin-text'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-skin-muted mb-4 text-sm">
            {products.length === 0 ? 'No products yet — add your first one.' : 'No products match your filters.'}
          </p>
          {products.length === 0 && (
            <Link
              href="/products/add"
              className="inline-block bg-blush text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity text-sm"
            >
              Add your first product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
