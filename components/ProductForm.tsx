'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Product, Ingredient, RiskLevel, IngredientType, ProductCategory, AmPm } from '@/lib/types'
import { getProducts } from '@/lib/storage'
import { findConflictsForProduct, ConflictResult } from '@/lib/conflicts'
import { INGREDIENT_DATABASE, IngredientTemplate } from '@/lib/ingredientDatabase'
import { IngredientCombo, resolveComboIngredients, groupCombosByCategory } from '@/lib/ingredientCombos'

const SKIN_CONCERNS = [
  'Sebaceous Filaments', 'Blackheads', 'Whiteheads', 'Hormonal Acne',
  'Inflammatory Acne', 'Cystic Acne', 'Fungal Acne', 'Wrinkles & Fine Lines',
  'Hyperpigmentation', 'Dryness', 'Dehydration', 'Sensitivity & Redness',
  'Large Pores', 'Uneven Texture', 'Dark Circles', 'Sun Damage',
  'Oiliness', 'Skin Barrier Damage',
]

const USE_SCENARIOS = [
  'Sun Calming', 'Express Hydration', 'Chemical Exfoliation', 'Anti-Wrinkle',
  'Antibacterial', 'Brightening & Whitening', 'Skin Barrier Recovery',
  'Pore Reduction', 'Overnight Treatment', 'Weekly Deep Treatment',
]

const FREQ_OPTIONS = ['Daily', 'AM only', 'PM only', '2–3x per week', 'Weekly max', 'Introduce slowly']

function toSlug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-skin-border bg-white text-skin-text text-sm focus:outline-none focus:ring-2 focus:ring-blush/30 focus:border-blush transition-colors'
const labelClass = 'block text-xs font-medium text-skin-muted uppercase tracking-wide mb-1'
const sectionClass = 'bg-white rounded-2xl border border-skin-border p-6'

interface IngredientRow {
  name: string
  riskLevel: RiskLevel
  type: IngredientType
  function: string
  benefit: string
  frequencyGuidance: string
  notes: string
  fromDatabase?: boolean
}

const emptyIngredient = (): IngredientRow => ({
  name: '', riskLevel: 'safe', type: 'functional',
  function: '', benefit: '', frequencyGuidance: 'Daily', notes: '',
  fromDatabase: false,
})

// ── Ingredient search combobox ────────────────────────────────────────────────

const RISK_DOT: Record<RiskLevel, string> = {
  safe: 'bg-emerald-500',
  moderate: 'bg-amber-500',
  active: 'bg-orange-500',
  'high-risk': 'bg-red-500',
}
const TYPE_CHIP: Record<string, string> = {
  active: 'bg-purple-50 text-purple-700',
  functional: 'bg-blue-50 text-blue-700',
  botanical: 'bg-amber-50 text-amber-700',
  standard: 'bg-gray-50 text-gray-600',
}

function IngredientCombobox({
  value, fromDatabase, onNameChange, onSelect,
}: {
  value: string
  fromDatabase: boolean
  onNameChange: (name: string) => void
  onSelect: (t: IngredientTemplate) => void
}) {
  const [open, setOpen] = useState(false)

  const grouped = useMemo(() => {
    const q = value.toLowerCase().trim()
    const list = q
      ? INGREDIENT_DATABASE.filter(ing => ing.name.toLowerCase().includes(q) || ing.category.toLowerCase().includes(q))
      : INGREDIENT_DATABASE
    const groups: Record<string, IngredientTemplate[]> = {}
    for (const ing of list) {
      if (!groups[ing.category]) groups[ing.category] = []
      groups[ing.category].push(ing)
    }
    return groups
  }, [value])

  const hasResults = Object.keys(grouped).length > 0

  return (
    <div className="relative">
      <input
        value={value}
        onChange={e => onNameChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        placeholder="Search database (e.g. Retinol, Niacinamide, Glycolic Acid…) or type custom"
        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blush/30 focus:border-blush transition-colors bg-white text-skin-text ${
          fromDatabase ? 'border-emerald-300' : 'border-skin-border'
        }`}
      />
      {fromDatabase && (
        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
          Auto-filled from database — all fields are still editable
        </p>
      )}

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-skin-border rounded-xl shadow-2xl max-h-72 overflow-y-auto">
          {/* hint when showing unfiltered full list */}
          {!value.trim() && (
            <p className="px-3 pt-2.5 pb-1 text-[10px] text-skin-muted">
              Start typing to filter, or scroll to browse all ingredients
            </p>
          )}

          {hasResults ? (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-skin-muted uppercase tracking-widest sticky top-0 bg-white/95 backdrop-blur-sm">
                  {category}
                </p>
                {items.map(ing => (
                  <button
                    key={ing.name}
                    type="button"
                    onMouseDown={e => {
                      e.preventDefault()
                      onSelect(ing)
                      setOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-skin-bg flex items-center gap-2.5 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${RISK_DOT[ing.riskLevel]}`} />
                    <span className="flex-1 text-sm text-skin-text">{ing.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium ${TYPE_CHIP[ing.type] ?? TYPE_CHIP.standard}`}>
                      {ing.type}
                    </span>
                  </button>
                ))}
              </div>
            ))
          ) : (
            <div className="px-3 py-3">
              <p className="text-sm text-skin-muted mb-0.5">No match found.</p>
              <p className="text-xs text-skin-muted">
                This ingredient will be saved as a custom entry — fill in the details below manually.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Ingredient Combo Picker ───────────────────────────────────────────────────

const COMBO_GROUPS = groupCombosByCategory()

function ComboPicker({ onSelect }: { onSelect: (combo: IngredientCombo) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filteredGroups = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return COMBO_GROUPS
    const out: Record<string, IngredientCombo[]> = {}
    for (const [cat, combos] of Object.entries(COMBO_GROUPS)) {
      const matches = combos.filter(
        c => c.name.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q) || c.benefit.toLowerCase().includes(q)
      )
      if (matches.length > 0) out[cat] = matches
    }
    return out
  }, [query])

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setQuery('') }}
        className="text-sm border border-lilac/50 bg-lilac/10 text-purple-800 px-4 py-2 rounded-full hover:bg-lilac/20 transition-colors font-medium"
      >
        + Add Combination
      </button>

      {open && (
        <div className="absolute z-50 right-0 top-full mt-2 w-[520px] max-w-[calc(100vw-2rem)] bg-white border border-skin-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-skin-border">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search combinations…"
              className="w-full px-3 py-2 text-sm border border-skin-border rounded-lg focus:outline-none focus:border-blush"
            />
          </div>

          {/* Combo list */}
          <div className="overflow-y-auto max-h-[440px]">
            {Object.keys(filteredGroups).length === 0 ? (
              <p className="px-4 py-6 text-sm text-skin-muted text-center">No combinations match.</p>
            ) : (
              Object.entries(filteredGroups).map(([category, combos]) => (
                <div key={category}>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-skin-muted uppercase tracking-widest sticky top-0 bg-white/95 backdrop-blur-sm">
                    {category}
                  </p>
                  {combos.map(combo => (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => { onSelect(combo); setOpen(false) }}
                      className="w-full text-left px-4 py-3 hover:bg-skin-bg transition-colors border-t border-skin-border/50 first:border-t-0 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-skin-text group-hover:text-blush transition-colors">
                            {combo.name}
                          </p>
                          <p className="text-xs text-lilac font-medium mb-1">{combo.tagline}</p>
                          <p className="text-xs text-skin-muted leading-relaxed line-clamp-2">{combo.benefit}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {combo.ingredientNames.map(n => (
                              <span key={n} className="text-[10px] bg-cream border border-skin-border text-skin-muted px-2 py-0.5 rounded-full">
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-skin-muted shrink-0 mt-0.5 whitespace-nowrap">
                          {combo.ingredientNames.length} ingredient{combo.ingredientNames.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  initialData?: Product
  prefillData?: Partial<Product>
  onSave: (product: Product) => void
  submitting?: boolean
}

export default function ProductForm({ initialData, prefillData, onSave, submitting = false }: Props) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState<ProductCategory>('serum')
  const [photo, setPhoto] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('AUD')
  const [seller, setSeller] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [amPm, setAmPm] = useState<AmPm>('Both')
  const [usageFrequency, setUsageFrequency] = useState('')
  const [howToUse, setHowToUse] = useState('')
  const [notes, setNotes] = useState('')
  const [benefits, setBenefits] = useState('')
  const [skinConcerns, setSkinConcerns] = useState<string[]>([])
  const [useScenarios, setUseScenarios] = useState<string[]>([])
  const [ingredients, setIngredients] = useState<IngredientRow[]>([])
  const [liveConflicts, setLiveConflicts] = useState<ConflictResult[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Re-run conflict check whenever ingredients change
  useEffect(() => {
    const named = ingredients.filter(i => i.name.trim())
    if (named.length === 0) { setLiveConflicts([]); return }
    const library = getProducts()
    const tempId = initialData?.id ?? '__conflict_preview__'
    const temp: Product = {
      id: tempId, name: '', brand: '', category, photo: '', description: '',
      purchasedPrice: 0, currency: 'AUD', seller: '', amPm,
      usageFrequency: '', howToUse: '', useScenarios: [], skinConcerns: [], benefits: [],
      featuredIngredients: named.map(i => ({
        name: i.name.trim(), riskLevel: i.riskLevel, type: i.type,
        function: i.function, benefit: i.benefit,
        frequencyGuidance: i.frequencyGuidance, notes: i.notes || undefined,
      } as Ingredient)),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    setLiveConflicts(findConflictsForProduct(temp, library.filter(p => p.id !== tempId)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredients])

  useEffect(() => {
    if (!initialData) return
    setName(initialData.name)
    setBrand(initialData.brand)
    setCategory(initialData.category)
    setPhoto(initialData.photo)
    setDescription(initialData.description)
    setPrice(initialData.purchasedPrice > 0 ? String(initialData.purchasedPrice) : '')
    setCurrency(initialData.currency)
    setSeller(initialData.seller)
    setPurchaseDate(initialData.purchaseDate ?? '')
    setAmPm(initialData.amPm)
    setUsageFrequency(initialData.usageFrequency)
    setHowToUse(initialData.howToUse)
    setNotes(initialData.notes ?? '')
    setBenefits(initialData.benefits.join('\n'))
    setSkinConcerns(initialData.skinConcerns)
    setUseScenarios(initialData.useScenarios)
    setIngredients(initialData.featuredIngredients.map(i => ({
      name: i.name, riskLevel: i.riskLevel, type: i.type,
      function: i.function, benefit: i.benefit,
      frequencyGuidance: i.frequencyGuidance, notes: i.notes ?? '',
    })))
  }, [initialData])

  // Apply barcode scan pre-fill (name, brand, photo, description) when provided
  useEffect(() => {
    if (!prefillData || initialData) return
    if (prefillData.name) setName(prefillData.name)
    if (prefillData.brand) setBrand(prefillData.brand)
    if (prefillData.photo) setPhoto(prefillData.photo)
    if (prefillData.description) setDescription(prefillData.description)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillData])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5MB'); return }
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const toggleConcern = (label: string) => {
    const slug = toSlug(label)
    setSkinConcerns(prev => prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug])
  }

  const toggleScenario = (label: string) => {
    const slug = toSlug(label)
    setUseScenarios(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug])
  }

  const addIngredient = () => setIngredients(prev => [...prev, emptyIngredient()])

  const removeIngredient = (i: number) => setIngredients(prev => prev.filter((_, idx) => idx !== i))

  const updateIngredient = <K extends keyof IngredientRow>(i: number, field: K, value: IngredientRow[K]) => {
    setIngredients(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  const applyIngredientTemplate = (index: number, t: IngredientTemplate) => {
    setIngredients(prev => prev.map((row, i) =>
      i !== index ? row : {
        name: t.name, riskLevel: t.riskLevel, type: t.type,
        function: t.function, benefit: t.benefit,
        frequencyGuidance: t.frequencyGuidance, notes: row.notes, fromDatabase: true,
      }
    ))
  }

  const [comboMsg, setComboMsg] = useState('')

  const handleAddCombo = (combo: IngredientCombo) => {
    const templates = resolveComboIngredients(combo)
    const currentNames = new Set(ingredients.map(r => r.name.toLowerCase()))
    let added = 0, skipped = 0
    const toAdd: IngredientRow[] = []
    for (const t of templates) {
      if (currentNames.has(t.name.toLowerCase())) { skipped++; continue }
      toAdd.push({ name: t.name, riskLevel: t.riskLevel, type: t.type, function: t.function, benefit: t.benefit, frequencyGuidance: t.frequencyGuidance, notes: '', fromDatabase: true })
      added++
    }
    setIngredients(prev => [...prev, ...toAdd])
    const msg = skipped > 0
      ? `Added ${added} ingredient${added !== 1 ? 's' : ''}. ${skipped} already in list — skipped.`
      : `Added ${added} ingredient${added !== 1 ? 's' : ''} from "${combo.name}".`
    setComboMsg(msg)
    setTimeout(() => setComboMsg(''), 4000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const product: Product = {
      id: initialData?.id ?? crypto.randomUUID(),
      name, brand, category, photo, description,
      purchasedPrice: parseFloat(price) || 0,
      currency, seller,
      purchaseDate: purchaseDate || undefined,
      amPm, usageFrequency, howToUse,
      notes: notes || undefined,
      skinConcerns,
      useScenarios,
      benefits: benefits.split('\n').map(b => b.trim()).filter(Boolean),
      featuredIngredients: ingredients
        .filter(i => i.name.trim())
        .map(i => ({
          name: i.name.trim(),
          riskLevel: i.riskLevel,
          type: i.type,
          function: i.function.trim(),
          benefit: i.benefit.trim(),
          frequencyGuidance: i.frequencyGuidance,
          notes: i.notes.trim() || undefined,
        } as Ingredient)),
      createdAt: initialData?.createdAt ?? now,
      updatedAt: now,
    }
    onSave(product)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className={sectionClass}>
        <h2 className="font-display text-lg text-skin-text mb-5">Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Product Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. Advanced Snail 96 Mucin Power Essence" />
          </div>
          <div>
            <label className={labelClass}>Brand *</label>
            <input required value={brand} onChange={e => setBrand(e.target.value)} className={inputClass} placeholder="e.g. COSRX" />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value as ProductCategory)} className={inputClass}>
              {['cleanser','toner','serum','moisturiser','spf','eye-cream','exfoliant','mask','oil','mist','other'].map(c => (
                <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClass} placeholder="Brief description of what this product does..." />
          </div>
        </div>

        {/* Photo */}
        <div className="mt-4">
          <label className={labelClass}>Product Photo (max 5MB)</label>
          <div className="flex items-start gap-4">
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-skin-border" />
            )}
            <div className="flex-1">
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} className="text-sm border border-skin-border px-4 py-2 rounded-lg text-skin-muted hover:border-blush hover:text-blush transition-colors">
                {photo ? 'Change photo' : 'Upload photo'}
              </button>
              {photo && (
                <button type="button" onClick={() => setPhoto('')} className="ml-3 text-sm text-red-400 hover:text-red-600">
                  Remove
                </button>
              )}
              <p className="text-xs text-skin-muted mt-2">Or paste an image URL:</p>
              <input
                type="url"
                value={photo.startsWith('data:') ? '' : photo}
                onChange={e => setPhoto(e.target.value)}
                placeholder="https://..."
                className={`${inputClass} mt-1`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Info */}
      <div className={sectionClass}>
        <h2 className="font-display text-lg text-skin-text mb-5">Purchase Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price</label>
            <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} placeholder="0.00" />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClass}>
              {['AUD','USD','KRW','GBP','EUR','SGD','NZD'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Seller / Retailer</label>
            <input value={seller} onChange={e => setSeller(e.target.value)} className={inputClass} placeholder="e.g. YesStyle, Priceline" />
          </div>
          <div>
            <label className={labelClass}>Purchase Date</label>
            <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className={sectionClass}>
        <h2 className="font-display text-lg text-skin-text mb-5">Usage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>AM / PM</label>
            <select value={amPm} onChange={e => setAmPm(e.target.value as AmPm)} className={inputClass}>
              <option value="AM">AM (Morning)</option>
              <option value="PM">PM (Evening)</option>
              <option value="Both">Both AM + PM</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Usage Frequency</label>
            <input value={usageFrequency} onChange={e => setUsageFrequency(e.target.value)} className={inputClass} placeholder="e.g. Daily, 2–3x per week" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>How to Use</label>
            <textarea value={howToUse} onChange={e => setHowToUse(e.target.value)} rows={3} className={inputClass} placeholder="Application method and steps..." />
          </div>
        </div>
      </div>

      {/* Skin Concerns */}
      <div className={sectionClass}>
        <h2 className="font-display text-lg text-skin-text mb-1">Skin Concerns Addressed</h2>
        <p className="text-xs text-skin-muted mb-4">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {SKIN_CONCERNS.map(label => {
            const slug = toSlug(label)
            const selected = skinConcerns.includes(slug)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleConcern(label)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                  selected
                    ? 'bg-lilac border-lilac/50 text-purple-900'
                    : 'bg-white border-skin-border text-skin-muted hover:border-lilac hover:text-purple-800'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Use Scenarios */}
      <div className={sectionClass}>
        <h2 className="font-display text-lg text-skin-text mb-1">Use Scenarios</h2>
        <p className="text-xs text-skin-muted mb-4">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {USE_SCENARIOS.map(label => {
            const slug = toSlug(label)
            const selected = useScenarios.includes(slug)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleScenario(label)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                  selected
                    ? 'bg-blush border-blush/50 text-white'
                    : 'bg-white border-skin-border text-skin-muted hover:border-blush hover:text-blush'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Benefits */}
      <div className={sectionClass}>
        <h2 className="font-display text-lg text-skin-text mb-1">Benefits</h2>
        <p className="text-xs text-skin-muted mb-3">One benefit per line</p>
        <textarea
          value={benefits}
          onChange={e => setBenefits(e.target.value)}
          rows={4}
          className={inputClass}
          placeholder={"Hydrates and plumps skin\nReduces redness\nStrengthens the moisture barrier"}
        />
      </div>

      {/* Ingredients */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-lg text-skin-text">Key Ingredients</h2>
            <p className="text-xs text-skin-muted mt-0.5">Used for colour coding and conflict detection</p>
          </div>
          <div className="flex items-center gap-2">
            <ComboPicker onSelect={handleAddCombo} />
            <button
              type="button"
              onClick={addIngredient}
              className="text-sm bg-cream border border-skin-border px-4 py-2 rounded-full text-skin-text hover:border-blush transition-colors"
            >
              + Add Single
            </button>
          </div>
        </div>

        {comboMsg && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-2">
            {comboMsg}
          </p>
        )}

        {ingredients.length === 0 && (
          <p className="text-sm text-skin-muted text-center py-6 border border-dashed border-skin-border rounded-xl">
            No ingredients added yet. Use &ldquo;+ Add Combination&rdquo; for synergistic pairs, or &ldquo;+ Add Single&rdquo; for one ingredient at a time.
          </p>
        )}

        <div className="space-y-4">
          {ingredients.map((ing, i) => (
            <div key={i} className="p-4 bg-skin-bg rounded-xl border border-skin-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-skin-muted uppercase tracking-wide">Ingredient {i + 1}</span>
                <button type="button" onClick={() => removeIngredient(i)} className="text-xs text-red-400 hover:text-red-600">
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Ingredient Name *</label>
                  <IngredientCombobox
                    value={ing.name}
                    fromDatabase={ing.fromDatabase ?? false}
                    onNameChange={name =>
                      setIngredients(prev => prev.map((r, j) =>
                        j === i ? { ...r, name, fromDatabase: false } : r
                      ))
                    }
                    onSelect={t => applyIngredientTemplate(i, t)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Irritation Risk</label>
                  <select value={ing.riskLevel} onChange={e => updateIngredient(i, 'riskLevel', e.target.value as RiskLevel)} className={inputClass}>
                    <option value="safe">Safe / Gentle</option>
                    <option value="moderate">Moderate / Caution</option>
                    <option value="active">Active Ingredient</option>
                    <option value="high-risk">High Risk</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Ingredient Type</label>
                  <select value={ing.type} onChange={e => updateIngredient(i, 'type', e.target.value as IngredientType)} className={inputClass}>
                    <option value="active">Active Ingredient</option>
                    <option value="functional">Functional / Supporting</option>
                    <option value="botanical">Botanical / Natural</option>
                    <option value="standard">Standard / Emollient</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Function</label>
                  <input value={ing.function} onChange={e => updateIngredient(i, 'function', e.target.value)} className={inputClass} placeholder="e.g. Humectant, Exfoliant" />
                </div>
                <div>
                  <label className={labelClass}>Frequency Guidance</label>
                  <select value={ing.frequencyGuidance} onChange={e => updateIngredient(i, 'frequencyGuidance', e.target.value)} className={inputClass}>
                    {FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Benefit (1 sentence)</label>
                  <input value={ing.benefit} onChange={e => updateIngredient(i, 'benefit', e.target.value)} className={inputClass} placeholder="What does this ingredient do for skin?" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Notes (optional)</label>
                  <input value={ing.notes} onChange={e => updateIngredient(i, 'notes', e.target.value)} className={inputClass} placeholder="e.g. Do not combine with Retinol" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Notes */}
      <div className={sectionClass}>
        <h2 className="font-display text-lg text-skin-text mb-3">Personal Notes</h2>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={inputClass} placeholder="Any personal observations, tips, or reminders..." />
      </div>

      {/* Live conflict preview */}
      {liveConflicts.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <h2 className="font-display text-base text-orange-800 mb-1">Potential conflicts with your library</h2>
          <p className="text-xs text-orange-600 mb-4">These ingredients conflict with products you already own. Review before saving.</p>
          <div className="space-y-3">
            {liveConflicts.map((c, i) => {
              const color = c.severity === 'never' ? 'text-red-600 bg-red-50 border-red-200' : c.severity === 'avoid' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'
              const label = c.severity === 'never' ? 'Do not combine' : c.severity === 'avoid' ? 'Avoid same day' : 'Use with caution'
              return (
                <div key={i} className={`rounded-xl border p-3 ${color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="text-xs font-medium mb-0.5">
                    <span className="font-semibold">{c.triggerIngredientA}</span>
                    {' + '}
                    <span className="font-semibold">{c.triggerIngredientB}</span>
                    {' (in '}<span className="font-semibold">{c.conflictingProduct.name}</span>{')'}
                  </p>
                  <p className="text-xs opacity-80">{c.message}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blush text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
        >
          {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Product'}
        </button>
        <a href="/" className="text-sm text-skin-muted hover:text-skin-text transition-colors">
          Cancel
        </a>
      </div>
    </form>
  )
}
