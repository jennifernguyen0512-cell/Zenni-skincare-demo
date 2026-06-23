'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Product } from '@/lib/types'
import { getProducts, saveProduct } from '@/lib/storage'
import ProductForm from '@/components/ProductForm'
import Link from 'next/link'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [product, setProduct] = useState<Product | undefined>(undefined)
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const found = getProducts().find(p => p.id === id)
    setProduct(found)
    setMounted(true)
  }, [id])

  const handleSave = (updated: Product) => {
    setSubmitting(true)
    saveProduct(updated)
    router.push(`/products/${updated.id}`)
  }

  if (!mounted) return null
  if (!product) return (
    <div className="text-center py-24 text-skin-muted text-sm">
      Product not found.{' '}
      <Link href="/" className="text-blush underline">Back to library</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/products/${id}`} className="inline-flex items-center gap-1 text-sm text-skin-muted hover:text-skin-text mb-6 transition-colors">
        ← Back to product
      </Link>
      <h1 className="font-display text-3xl text-skin-text mb-2">Edit Product</h1>
      <p className="text-skin-muted text-sm mb-8">{product.brand} · {product.name}</p>
      <ProductForm initialData={product} onSave={handleSave} submitting={submitting} />
    </div>
  )
}
