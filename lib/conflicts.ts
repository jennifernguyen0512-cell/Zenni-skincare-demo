import { Product } from './types'

export type Severity = 'never' | 'avoid' | 'caution'

export interface ConflictResult {
  conflictingProduct: Product
  severity: Severity
  message: string
  triggerIngredientA: string
  triggerIngredientB: string
}

interface ConflictRule {
  ingredientsA: string[]
  ingredientsB: string[]
  severity: Severity
  message: string
}

const RULES: ConflictRule[] = [
  {
    ingredientsA: ['retinol', 'retinoid', 'tretinoin', 'adapalene', 'retinal'],
    ingredientsB: ['aha', 'glycolic acid', 'lactic acid', 'mandelic acid', 'bha', 'salicylic acid', 'pha', 'gluconolactone'],
    severity: 'never',
    message: 'Very high irritation risk — never use in the same session.',
  },
  {
    ingredientsA: ['retinol', 'retinoid', 'tretinoin', 'adapalene', 'retinal'],
    ingredientsB: ['vitamin c', 'l-ascorbic acid', 'ascorbic acid', '3-o-ethyl ascorbic acid'],
    severity: 'never',
    message: 'pH incompatibility — use Vitamin C in AM, Retinol in PM on alternate days.',
  },
  {
    ingredientsA: ['retinol', 'retinoid', 'tretinoin'],
    ingredientsB: ['benzoyl peroxide'],
    severity: 'never',
    message: 'Benzoyl Peroxide oxidises Retinol and renders it ineffective. Use on alternating nights.',
  },
  {
    ingredientsA: ['benzoyl peroxide'],
    ingredientsB: ['hydroquinone'],
    severity: 'never',
    message: 'Can cause temporary skin staining when combined.',
  },
  {
    ingredientsA: ['vitamin c', 'l-ascorbic acid', 'ascorbic acid', '3-o-ethyl ascorbic acid'],
    ingredientsB: ['aha', 'glycolic acid', 'lactic acid', 'bha', 'salicylic acid', 'pha', 'gluconolactone'],
    severity: 'avoid',
    message: 'pH conflict — can over-sensitise skin. Use on different days.',
  },
  {
    ingredientsA: ['niacinamide'],
    ingredientsB: ['vitamin c', 'l-ascorbic acid', 'ascorbic acid'],
    severity: 'avoid',
    message: 'High-concentration Vitamin C may lose efficacy at the pH Niacinamide works best at. Apply 15–30 min apart or in separate sessions.',
  },
  {
    ingredientsA: ['glycolic acid'],
    ingredientsB: ['salicylic acid'],
    severity: 'avoid',
    message: 'Stacking two exfoliants — high irritation risk. Alternate days only.',
  },
  {
    ingredientsA: ['retinol', 'retinoid', 'tretinoin'],
    ingredientsB: ['peptide', 'palmitoyl', 'matrixyl'],
    severity: 'caution',
    message: 'Retinol may degrade certain peptides. Apply in separate layers or at different times.',
  },
]

// Maps clean ingredient name substrings → additional conflict keywords.
// This lets the conflict engine work with clean canonical names (no embedded
// parenthetical keywords) while still catching every relevant pairing.
const CONFLICT_ALIASES: Record<string, string[]> = {
  // AHA variants → also match 'aha'
  'glycolic acid':    ['aha'],
  'lactic acid':      ['aha'],
  'mandelic acid':    ['aha'],
  'malic acid':       ['aha'],
  'tartaric acid':    ['aha'],
  // BHA variants → also match 'bha'
  'salicylic acid':   ['bha'],
  // PHA variants → also match 'pha'
  'gluconolactone':   ['pha'],
  'lactobionic acid': ['pha'],
  // Vitamin C derivatives → also match 'vitamin c' and 'ascorbic acid'
  'ascorbyl glucoside':        ['vitamin c', 'ascorbic acid'],
  'sodium ascorbyl phosphate': ['vitamin c', 'ascorbic acid'],
  'magnesium ascorbyl phosphate': ['vitamin c', 'ascorbic acid'],
  'ascorbyl tetraisopalmitate':['vitamin c', 'ascorbic acid'],
  // Retinoid family → also match 'retinoid'
  'retinol':      ['retinoid'],
  'tretinoin':    ['retinoid'],
  'adapalene':    ['retinoid'],
  'retinal':      ['retinoid'],
  'retinaldehyde':['retinoid'],
  // Peptide forms → also match 'peptide'
  'acetyl hexapeptide': ['peptide'],
  'ghk-cu':            ['peptide'],
}

function matchIngredient(product: Product, keywords: string[]): string | null {
  for (const ing of product.featuredIngredients) {
    const nameLower = ing.name.toLowerCase()
    // Primary: keyword appears directly in the ingredient name
    if (keywords.some(k => nameLower.includes(k))) return ing.name
    // Secondary: alias map — clean names that don't embed every keyword
    for (const [fragment, extras] of Object.entries(CONFLICT_ALIASES)) {
      if (nameLower.includes(fragment) && keywords.some(k => extras.includes(k))) {
        return ing.name
      }
    }
  }
  return null
}

export function findAllConflictsInSet(products: Product[]): ConflictResult[] {
  const seen = new Set<string>()
  const results: ConflictResult[] = []
  for (const product of products) {
    for (const conflict of findConflictsForProduct(product, products)) {
      const key = [product.id, conflict.conflictingProduct.id].sort().join('|') +
        '|' + [conflict.triggerIngredientA, conflict.triggerIngredientB].sort().join('|')
      if (!seen.has(key)) { seen.add(key); results.push(conflict) }
    }
  }
  return results
}

export function findConflictsForProduct(target: Product, allProducts: Product[]): ConflictResult[] {
  const results: ConflictResult[] = []

  for (const other of allProducts) {
    if (other.id === target.id) continue

    for (const rule of RULES) {
      const aInTarget = matchIngredient(target, rule.ingredientsA)
      const bInOther = matchIngredient(other, rule.ingredientsB)
      if (aInTarget && bInOther) {
        results.push({ conflictingProduct: other, severity: rule.severity, message: rule.message, triggerIngredientA: aInTarget, triggerIngredientB: bInOther })
        continue
      }
      const bInTarget = matchIngredient(target, rule.ingredientsB)
      const aInOther = matchIngredient(other, rule.ingredientsA)
      if (bInTarget && aInOther) {
        results.push({ conflictingProduct: other, severity: rule.severity, message: rule.message, triggerIngredientA: bInTarget, triggerIngredientB: aInOther })
      }
    }
  }

  const seen = new Set<string>()
  return results.filter(r => {
    const key = `${r.conflictingProduct.id}|${r.triggerIngredientA}|${r.triggerIngredientB}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
