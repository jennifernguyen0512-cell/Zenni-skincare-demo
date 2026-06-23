'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Product } from '@/lib/types'
import { saveProduct } from '@/lib/storage'
import ProductForm from '@/components/ProductForm'
import Link from 'next/link'

const PREFILL_KEY = 'zenni_barcode_prefill'

export default function AddProductPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [prefill, setPrefill] = useState<Partial<Product> | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem(PREFILL_KEY)
    if (raw) {
      try { setPrefill(JSON.parse(raw)) }
      catch { /* ignore */ }
      sessionStorage.removeItem(PREFILL_KEY)
    }
    setMounted(true)
  }, [])

  const handleSave = (product: Product) => {
    setSubmitting(true)
    saveProduct(product)
    router.push(`/products/${product.id}`)
  }

  if (!mounted) return null

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-skin-muted hover:text-skin-text mb-6 transition-colors">
        ← Back to library
      </Link>
      <h1 className="font-display text-3xl text-skin-text mb-2">Add Product</h1>
      {prefill?.name ? (
        <p className="text-skin-muted text-sm mb-8">
          Pre-filled from barcode scan. Review and complete the details below.
        </p>
      ) : (
        <p className="text-skin-muted text-sm mb-8">Fill in the details for your new skincare product.</p>
      )}
      <ProductForm onSave={handleSave} submitting={submitting} prefillData={prefill} />
    </div>
  )
}
