import { Product } from './types'
import { SAMPLE_PRODUCTS } from './sampleData'

const KEY = 'zenni_skincare_library'

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SAMPLE_PRODUCTS))
      return SAMPLE_PRODUCTS
    }
    return JSON.parse(raw) as Product[]
  } catch {
    return []
  }
}

export function saveProduct(product: Product): void {
  if (typeof window === 'undefined') return
  const products = getProducts()
  const idx = products.findIndex(p => p.id === product.id)
  if (idx >= 0) {
    products[idx] = product
  } else {
    products.push(product)
  }
  localStorage.setItem(KEY, JSON.stringify(products))
}

export function deleteProduct(id: string): void {
  if (typeof window === 'undefined') return
  const products = getProducts().filter(p => p.id !== id)
  localStorage.setItem(KEY, JSON.stringify(products))
}

const ROUTINE_KEY = 'zenni_routine'

export interface SavedRoutine { am: string[]; pm: string[]; savedAt: string }

export function getRoutine(): SavedRoutine {
  if (typeof window === 'undefined') return { am: [], pm: [], savedAt: '' }
  try { return JSON.parse(localStorage.getItem(ROUTINE_KEY) ?? '{"am":[],"pm":[],"savedAt":""}') }
  catch { return { am: [], pm: [], savedAt: '' } }
}

export function saveRoutine(routine: SavedRoutine): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine))
}

export function exportLibrary(): void {
  const products = getProducts()
  const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'zenni-skincare-library.json'
  a.click()
  URL.revokeObjectURL(url)
}
