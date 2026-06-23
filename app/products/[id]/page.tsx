'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { getProducts, deleteProduct } from '@/lib/storage'
import { findConflictsForProduct, ConflictResult } from '@/lib/conflicts'
import IngredientBadge from '@/components/IngredientBadge'
import {
  CONCERN_PHOTO_DEFAULTS,
  getConcernPhotoUrl,
  setCustomPhoto,
  getConcernLabel,
} from '@/lib/skinConcernPhotos'

function SkinConcernPhoto({ concern }: { concern: string }) {
  const [photoUrl, setPhotoUrl] = useState('')
  const [imgError, setImgError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [inputUrl, setInputUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const label = getConcernLabel(concern)

  useEffect(() => {
    setPhotoUrl(getConcernPhotoUrl(concern))
    setImgError(false)
  }, [concern])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      setCustomPhoto(concern, url)
      setPhotoUrl(url)
      setImgError(false)
      setEditing(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveUrl = () => {
    if (!inputUrl.trim()) return
    setCustomPhoto(concern, inputUrl.trim())
    setPhotoUrl(inputUrl.trim())
    setImgError(false)
    setEditing(false)
    setInputUrl('')
  }

  const handleReset = () => {
    setCustomPhoto(concern, '')
    const defaultUrl = CONCERN_PHOTO_DEFAULTS[concern]?.url ?? ''
    setPhotoUrl(defaultUrl)
    setImgError(false)
    setEditing(false)
  }

  return (
    <div className="relative group">
      <div className="aspect-square rounded-xl overflow-hidden border border-skin-border bg-skin-bg">
        {photoUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`Clinical reference: ${label}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-3">
            <span className="text-xs text-skin-muted text-center">{label}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-skin-muted mt-1.5 text-center">{label}</p>

      {/* Edit photo button — shows on hover */}
      <button
        onClick={() => setEditing(v => !v)}
        className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full text-skin-muted hover:text-blush border border-skin-border opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
      >
        Edit
      </button>

      {/* Inline editor */}
      {editing && (
        <div className="absolute z-20 top-full mt-1.5 left-0 bg-white border border-skin-border rounded-xl p-4 shadow-xl w-64">
          <p className="text-xs font-medium text-skin-text mb-2">Update photo for {label}</p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full text-sm border border-skin-border text-skin-muted px-3 py-1.5 rounded-lg hover:border-blush hover:text-blush transition-colors mb-2"
          >
            Upload image
          </button>

          <p className="text-xs text-skin-muted mb-1">Or paste a URL:</p>
          <input
            type="url"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            placeholder="https://..."
            className="w-full text-xs px-2 py-1.5 border border-skin-border rounded-lg mb-2 focus:outline-none focus:border-blush"
            onKeyDown={e => e.key === 'Enter' && handleSaveUrl()}
          />

          <div className="flex gap-2 flex-wrap">
            <button onClick={handleSaveUrl} className="text-xs bg-blush text-white px-3 py-1 rounded-full">Save URL</button>
            <button onClick={handleReset} className="text-xs text-skin-muted hover:text-red-400 transition-colors">Reset</button>
            <button onClick={() => setEditing(false)} className="text-xs text-skin-muted">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

const categoryGradients: Record<string, string> = {
  cleanser:    'from-pink-100 to-rose-200',
  toner:       'from-purple-100 to-violet-200',
  serum:       'from-amber-100 to-yellow-200',
  moisturiser: 'from-sky-100 to-blue-200',
  spf:         'from-orange-100 to-amber-200',
  exfoliant:   'from-red-100 to-pink-200',
  mask:        'from-green-100 to-emerald-200',
  'eye-cream': 'from-violet-100 to-purple-200',
  oil:         'from-yellow-100 to-amber-200',
  mist:        'from-cyan-100 to-sky-200',
  other:       'from-gray-100 to-slate-200',
}

const ampmBadge: Record<string, string> = {
  AM:   'bg-amber-100 text-amber-700',
  PM:   'bg-indigo-100 text-indigo-700',
  Both: 'bg-purple-100 text-purple-700',
}

const severityConfig = {
  never:   { bg: 'bg-red-50',    border: 'border-red-200',    label: 'Never combine',     labelColor: 'bg-red-100 text-red-700' },
  avoid:   { bg: 'bg-amber-50',  border: 'border-amber-200',  label: 'Avoid same day',    labelColor: 'bg-amber-100 text-amber-700' },
  caution: { bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Use with caution',  labelColor: 'bg-yellow-100 text-yellow-700' },
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [conflicts, setConflicts] = useState<ConflictResult[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const all = getProducts()
    const found = all.find(p => p.id === id) ?? null
    setProduct(found)
    if (found) setConflicts(findConflictsForProduct(found, all))
    setMounted(true)
  }, [id])

  const handleDelete = () => {
    if (!product || !confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    deleteProduct(product.id)
    router.push('/')
  }

  if (!mounted) return null
  if (!product) return (
    <div className="text-center py-24 text-skin-muted text-sm">
      Product not found.{' '}
      <Link href="/" className="text-blush underline">Back to library</Link>
    </div>
  )

  const gradient = categoryGradients[product.category] || categoryGradients.other

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-skin-muted hover:text-skin-text mb-6 transition-colors">
        ← Back to library
      </Link>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-skin-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-full sm:w-52 h-52 flex-shrink-0 rounded-xl overflow-hidden">
            {product.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-sm text-gray-500 capitalize">{product.category.replace('-', ' ')}</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-skin-muted uppercase tracking-widest mb-1">{product.brand}</p>
            <h1 className="font-display text-2xl text-skin-text mb-3 leading-tight">{product.name}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-lilac/30 text-purple-800 px-3 py-1 rounded-full capitalize font-medium border border-lilac/40">
                {product.category.replace('-', ' ')}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${ampmBadge[product.amPm] || ampmBadge.Both}`}>
                {product.amPm}
              </span>
            </div>

            <div className="text-sm text-skin-muted space-y-1 mb-5">
              {product.purchasedPrice > 0 && (
                <p>
                  <span className="font-medium text-skin-text">${product.purchasedPrice.toFixed(2)} {product.currency}</span>
                  {product.seller && <> · {product.seller}</>}
                  {product.purchaseDate && <> · {product.purchaseDate}</>}
                </p>
              )}
              <p>Frequency: <span className="text-skin-text font-medium">{product.usageFrequency}</span></p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link
                href={`/products/${product.id}/edit`}
                className="text-sm border border-skin-border text-skin-muted px-4 py-2 rounded-full hover:border-blush hover:text-blush transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="text-sm text-red-400 hover:text-red-600 transition-colors px-2 py-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display text-lg text-skin-text mb-3">Combination Warnings</h2>
          <div className="space-y-3">
            {conflicts.map((c, i) => {
              const cfg = severityConfig[c.severity]
              return (
                <div key={i} className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${cfg.labelColor}`}>
                      {cfg.label.toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm text-skin-text mb-1">
                        <span className="text-orange-600 font-medium">{c.triggerIngredientA}</span>
                        {' + '}
                        <span className="text-orange-600 font-medium">{c.triggerIngredientB}</span>
                        {' in '}
                        <Link href={`/products/${c.conflictingProduct.id}`} className="underline hover:text-blush">
                          {c.conflictingProduct.name}
                        </Link>
                      </p>
                      <p className="text-sm text-skin-muted">{c.message}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          {product.description && (
            <section className="bg-white rounded-2xl border border-skin-border p-6">
              <h2 className="font-display text-lg text-skin-text mb-2">About</h2>
              <p className="text-sm text-skin-muted leading-relaxed">{product.description}</p>
            </section>
          )}

          {/* Ingredients */}
          {product.featuredIngredients.length > 0 && (
            <section className="bg-white rounded-2xl border border-skin-border p-6">
              <h2 className="font-display text-lg text-skin-text mb-4">Key Ingredients</h2>

              {/* Risk legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 pb-4 border-b border-skin-border">
                {[
                  { color: 'text-emerald-700', label: 'Safe' },
                  { color: 'text-amber-600',   label: 'Moderate' },
                  { color: 'text-orange-600',  label: 'Active' },
                  { color: 'text-red-600',     label: 'High Risk' },
                ].map(item => (
                  <span key={item.label} className={`text-xs font-medium ${item.color}`}>
                    {item.label}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                {product.featuredIngredients.map(ing => (
                  <IngredientBadge key={ing.name} ingredient={ing} />
                ))}
              </div>
            </section>
          )}

          {/* How to use */}
          {product.howToUse && (
            <section className="bg-white rounded-2xl border border-skin-border p-6">
              <h2 className="font-display text-lg text-skin-text mb-2">How to Use</h2>
              <p className="text-sm text-skin-muted leading-relaxed">{product.howToUse}</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Benefits */}
          {product.benefits.length > 0 && (
            <section className="bg-white rounded-2xl border border-skin-border p-6">
              <h2 className="font-display text-lg text-skin-text mb-3">Benefits</h2>
              <ul className="space-y-2">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-skin-muted">
                    <span className="text-blush mt-0.5 shrink-0">·</span>
                    {b}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Use Scenarios */}
          {product.useScenarios.length > 0 && (
            <section className="bg-white rounded-2xl border border-skin-border p-6">
              <h2 className="font-display text-lg text-skin-text mb-3">Best For</h2>
              <div className="flex flex-wrap gap-2">
                {product.useScenarios.map(s => (
                  <span key={s} className="text-xs bg-cream text-skin-text px-3 py-1 rounded-full capitalize border border-skin-border">
                    {s.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Skin Concerns — Clinical Photos */}
          {product.skinConcerns.length > 0 && (
            <section className="bg-white rounded-2xl border border-skin-border p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-lg text-skin-text">Skin Concerns</h2>
              </div>
              <p className="text-xs text-skin-muted mb-4">Hover a photo to update it with your own image.</p>
              <div className="grid grid-cols-2 gap-3">
                {product.skinConcerns.map(c => (
                  <SkinConcernPhoto key={c} concern={c} />
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {product.notes && (
            <section className="bg-white rounded-2xl border border-skin-border p-6">
              <h2 className="font-display text-lg text-skin-text mb-2">Notes</h2>
              <p className="text-sm text-skin-muted italic leading-relaxed">{product.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
