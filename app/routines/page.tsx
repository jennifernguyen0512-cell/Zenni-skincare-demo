'use client'
import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Product } from '@/lib/types'
import { getProducts, getRoutine, saveRoutine } from '@/lib/storage'
import { findAllConflictsInSet, ConflictResult } from '@/lib/conflicts'
import Link from 'next/link'

// ── Sortable item inside a routine column ─────────────────────────────────────

function SortableRoutineItem({
  id, product, step, onRemove,
}: { id: string; product: Product; step: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 bg-white border border-skin-border rounded-xl px-3 py-2.5 group"
    >
      <span className="text-xs text-skin-muted font-medium w-5 shrink-0 text-center">{step}</span>

      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing text-skin-border hover:text-skin-muted transition-colors shrink-0 touch-none"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-skin-muted uppercase tracking-wide truncate">{product.brand}</p>
        <p className="text-sm font-medium text-skin-text truncate">{product.name}</p>
      </div>

      <span className="text-xs text-skin-muted capitalize shrink-0">{product.category}</span>

      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-skin-muted hover:text-red-400 shrink-0 text-base leading-none"
        aria-label="Remove from routine"
      >
        ×
      </button>
    </div>
  )
}

// ── Conflict banner ───────────────────────────────────────────────────────────

function ConflictBanner({ conflicts, label }: { conflicts: ConflictResult[]; label: string }) {
  if (conflicts.length === 0) return null
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 mb-4">
      <p className="text-xs font-semibold text-orange-800 mb-2">Conflicts in {label} routine</p>
      <div className="space-y-2">
        {conflicts.map((c, i) => {
          const severity =
            c.severity === 'never'
              ? 'text-red-700 bg-red-50 border-red-200'
              : c.severity === 'avoid'
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-yellow-700 bg-yellow-50 border-yellow-200'
          const label = c.severity === 'never' ? 'Never' : c.severity === 'avoid' ? 'Avoid' : 'Caution'
          return (
            <div key={i} className={`rounded-lg border px-3 py-2 ${severity}`}>
              <span className="text-xs font-semibold">{label}: </span>
              <span className="text-xs">
                <strong>{c.triggerIngredientA}</strong> + <strong>{c.triggerIngredientB}</strong>{' '}
                ({c.conflictingProduct.name})
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Routine column ────────────────────────────────────────────────────────────

function RoutineColumn({
  label, ampm, ids, productMap, conflicts, onRemove, onDragEnd,
}: {
  label: string
  ampm: string
  ids: string[]
  productMap: Record<string, Product>
  conflicts: ConflictResult[]
  onRemove: (id: string) => void
  onDragEnd: (event: DragEndEvent) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ampm === 'AM' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
          {ampm}
        </span>
        <h2 className="font-display text-lg text-skin-text">{label}</h2>
        <span className="text-xs text-skin-muted">({ids.length} steps)</span>
      </div>

      <ConflictBanner conflicts={conflicts} label={label} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 min-h-[120px]">
            {ids.length === 0 ? (
              <div className="border-2 border-dashed border-skin-border rounded-xl p-6 text-center text-xs text-skin-muted">
                Add products from the library
              </div>
            ) : (
              ids.map((id, idx) =>
                productMap[id] ? (
                  <SortableRoutineItem
                    key={id}
                    id={id}
                    product={productMap[id]}
                    step={idx + 1}
                    onRemove={() => onRemove(id)}
                  />
                ) : null
              )
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RoutinesPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [amIds, setAmIds] = useState<string[]>([])
  const [pmIds, setPmIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const products = getProducts()
    const routine = getRoutine()
    setAllProducts(products)
    // Only keep IDs that still exist in the library
    const existingIds = new Set(products.map(p => p.id))
    setAmIds(routine.am.filter(id => existingIds.has(id)))
    setPmIds(routine.pm.filter(id => existingIds.has(id)))
    setMounted(true)
  }, [])

  if (!mounted) return null

  const productMap = Object.fromEntries(allProducts.map(p => [p.id, p]))

  const amProducts = amIds.map(id => productMap[id]).filter(Boolean) as Product[]
  const pmProducts = pmIds.map(id => productMap[id]).filter(Boolean) as Product[]

  const amConflicts = findAllConflictsInSet(amProducts)
  const pmConflicts = findAllConflictsInSet(pmProducts)

  const filteredLibrary = allProducts.filter(p => {
    const q = search.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
  })

  const handleAmDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setAmIds(prev => arrayMove(prev, prev.indexOf(String(active.id)), prev.indexOf(String(over.id))))
    }
  }

  const handlePmDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPmIds(prev => arrayMove(prev, prev.indexOf(String(active.id)), prev.indexOf(String(over.id))))
    }
  }

  const handleSave = () => {
    saveRoutine({ am: amIds, pm: pmIds, savedAt: new Date().toISOString() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-skin-text mb-1">Routine Builder</h1>
          <p className="text-skin-muted text-sm">Build your AM and PM routines. Drag items to reorder.</p>
        </div>
        <div className="flex items-center gap-3">
          {(amConflicts.length > 0 || pmConflicts.length > 0) && (
            <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-full font-medium">
              {amConflicts.length + pmConflicts.length} conflict{amConflicts.length + pmConflicts.length !== 1 ? 's' : ''} detected
            </span>
          )}
          <button
            onClick={handleSave}
            className={`text-sm px-5 py-2.5 rounded-full font-medium transition-all ${
              saved
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-blush text-white hover:opacity-90'
            }`}
          >
            {saved ? 'Saved!' : 'Save Routine'}
          </button>
        </div>
      </div>

      {allProducts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-skin-muted text-sm mb-4">Your library is empty. Add some products first.</p>
          <Link href="/products/add" className="inline-block bg-blush text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            Add Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Library panel */}
          <div>
            <h2 className="font-display text-lg text-skin-text mb-3">Library</h2>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-skin-border rounded-xl text-sm focus:outline-none focus:border-blush mb-3"
            />
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredLibrary.map(p => {
                const inAm = amIds.includes(p.id)
                const inPm = pmIds.includes(p.id)
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-skin-border rounded-xl px-3 py-2.5"
                  >
                    <p className="text-xs text-skin-muted uppercase tracking-wide">{p.brand}</p>
                    <p className="text-sm font-medium text-skin-text mb-2 truncate">{p.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { if (!inAm) setAmIds(prev => [...prev, p.id]) }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          inAm
                            ? 'bg-amber-100 text-amber-700 border-amber-200 cursor-default'
                            : 'border-skin-border text-skin-muted hover:border-amber-300 hover:text-amber-700'
                        }`}
                      >
                        {inAm ? 'In AM' : '+ AM'}
                      </button>
                      <button
                        onClick={() => { if (!inPm) setPmIds(prev => [...prev, p.id]) }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          inPm
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200 cursor-default'
                            : 'border-skin-border text-skin-muted hover:border-indigo-300 hover:text-indigo-700'
                        }`}
                      >
                        {inPm ? 'In PM' : '+ PM'}
                      </button>
                    </div>
                  </div>
                )
              })}
              {filteredLibrary.length === 0 && (
                <p className="text-xs text-skin-muted text-center py-4">No products match.</p>
              )}
            </div>
          </div>

          {/* Routine columns */}
          <div className="flex flex-col sm:flex-row gap-6">
            <RoutineColumn
              label="Morning"
              ampm="AM"
              ids={amIds}
              productMap={productMap}
              conflicts={amConflicts}
              onRemove={id => setAmIds(prev => prev.filter(i => i !== id))}
              onDragEnd={handleAmDragEnd}
            />
            <RoutineColumn
              label="Evening"
              ampm="PM"
              ids={pmIds}
              productMap={productMap}
              conflicts={pmConflicts}
              onRemove={id => setPmIds(prev => prev.filter(i => i !== id))}
              onDragEnd={handlePmDragEnd}
            />
          </div>
        </div>
      )}

      {/* Layering tips */}
      {(amIds.length > 0 || pmIds.length > 0) && (
        <div className="mt-10 bg-white border border-skin-border rounded-2xl p-6">
          <h3 className="font-display text-base text-skin-text mb-3">Layering Tips</h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {[
              'Apply thinnest-to-thickest: toners before serums before moisturisers.',
              'Wait 30–60 seconds between actives to allow absorption.',
              'SPF always goes last in your AM routine.',
              'Oils seal in moisture — apply after water-based products.',
              'Eye creams can go before or after moisturiser, depending on texture.',
              'Let retinol absorb for 20–30 min before applying moisturiser.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-skin-muted">
                <span className="text-blush mt-0.5 shrink-0">·</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
