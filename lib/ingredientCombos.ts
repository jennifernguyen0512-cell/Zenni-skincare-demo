import { findIngredientTemplate, type IngredientTemplate } from './ingredientDatabase'

export interface IngredientCombo {
  id: string
  name: string          // display name shown in the picker
  tagline: string       // one-phrase summary of the synergy
  benefit: string       // full explanation of why these work together
  category: string      // used for grouping
  ingredientNames: string[]  // must match canonical names in INGREDIENT_DATABASE
}

export const INGREDIENT_COMBOS: IngredientCombo[] = [

  // ── HYDRATION ────────────────────────────────────────────────────────────────
  {
    id: 'moisture-lock-duo',
    name: 'Shea Butter + Glycerin',
    tagline: 'Moisture Lock Duo',
    benefit: 'Emollients and humectants that nourish the skin, restore its natural lipid barrier, and provide intense, lasting moisture. Glycerin draws water in; Shea Butter seals it there.',
    category: 'Hydration',
    ingredientNames: ['Shea Butter', 'Glycerin'],
  },
  {
    id: 'triple-hydration-trio',
    name: 'Hyaluronic Acid + Panthenol + Glycerin',
    tagline: 'Triple Hydration Trio',
    benefit: 'Three humectants working at complementary skin depths — Hyaluronic Acid binds surface water, Glycerin draws moisture in, and Panthenol soothes and supports barrier healing.',
    category: 'Hydration',
    ingredientNames: ['Hyaluronic Acid', 'Panthenol (Vitamin B5)', 'Glycerin'],
  },
  {
    id: 'hydrate-and-seal',
    name: 'Hyaluronic Acid + Ceramides',
    tagline: 'Hydrate & Seal Duo',
    benefit: 'Hyaluronic Acid floods the skin with moisture while Ceramides lock it in by reinforcing the lipid barrier. Addresses both hydration and water retention simultaneously.',
    category: 'Hydration',
    ingredientNames: ['Hyaluronic Acid', 'Ceramides'],
  },

  // ── BARRIER REPAIR ────────────────────────────────────────────────────────────
  {
    id: 'mineral-barrier-trio',
    name: 'Copper + Zinc + Manganese',
    tagline: 'Mineral Barrier Trio',
    benefit: 'A mineral trio that provides antibacterial properties and assists the skin in optimal barrier recovery. Copper supports collagen and elastin synthesis; Zinc regulates sebum and inflammation; Manganese activates enzymes critical to barrier repair.',
    category: 'Barrier Repair',
    ingredientNames: ['Copper Peptide (GHK-Cu)', 'Zinc (PCA Zinc)', 'Manganese PCA'],
  },
  {
    id: 'complete-barrier-trio',
    name: 'Ceramides + Cholesterol + Fatty Acids',
    tagline: 'Complete Barrier Repair Trio',
    benefit: 'The "golden ratio" of skin barrier lipids — ceramides, cholesterol, and fatty acids in their natural proportions. Together they fully restore the lipid bilayer structure and prevent transepidermal water loss.',
    category: 'Barrier Repair',
    ingredientNames: ['Ceramides', 'Cholesterol', 'Linoleic Acid (Omega-6)'],
  },
  {
    id: 'calm-and-repair',
    name: 'Centella Asiatica + Allantoin',
    tagline: 'Calm & Repair Duo',
    benefit: 'Centella Asiatica reduces inflammation and promotes wound healing; Allantoin soothes irritation and accelerates cell renewal. Together they rapidly calm compromised or post-active skin.',
    category: 'Barrier Repair',
    ingredientNames: ['Centella Asiatica (Cica)', 'Allantoin'],
  },
  {
    id: 'retinol-ceramides',
    name: 'Retinol + Ceramides',
    tagline: 'Strength & Soothe Duo',
    benefit: 'Ceramides offset the dryness and irritation Retinol can cause while it accelerates cell turnover. A buffering pair that allows consistent retinol use with less sensitivity.',
    category: 'Barrier Repair',
    ingredientNames: ['Retinol', 'Ceramides'],
  },

  // ── ANTIOXIDANTS ──────────────────────────────────────────────────────────────
  {
    id: 'antioxidant-shield-trio',
    name: 'Vitamin C + Vitamin E + Ferulic Acid',
    tagline: 'Antioxidant Shield Trio',
    benefit: 'The gold-standard antioxidant triple — Ferulic Acid stabilises both Vitamin C and Vitamin E and doubles their combined photo-protective efficacy. Together they neutralise free radicals, prevent UV damage, and boost collagen synthesis more effectively than any of the three alone.',
    category: 'Antioxidants',
    ingredientNames: ['L-Ascorbic Acid (Vitamin C)', 'Vitamin E (Tocopherol)', 'Ferulic Acid'],
  },
  {
    id: 'green-tea-vitamin-e',
    name: 'Green Tea + Vitamin E',
    tagline: 'Environmental Shield Duo',
    benefit: 'EGCG from Green Tea and Vitamin E are complementary antioxidants that protect against UV-induced free radical damage, reduce inflammation, and together maintain a stronger, more sustained antioxidant effect.',
    category: 'Antioxidants',
    ingredientNames: ['Green Tea (EGCG)', 'Vitamin E (Tocopherol)'],
  },

  // ── BRIGHTENING ───────────────────────────────────────────────────────────────
  {
    id: 'brightening-power-duo',
    name: 'Alpha Arbutin + Vitamin C',
    tagline: 'Brightening Power Duo',
    benefit: 'Alpha Arbutin inhibits melanin production at the source; Vitamin C brightens existing pigment and boosts collagen synthesis. A dual-action approach to fading dark spots and achieving a more even, luminous tone.',
    category: 'Brightening',
    ingredientNames: ['Alpha Arbutin', 'L-Ascorbic Acid (Vitamin C)'],
  },
  {
    id: 'redness-reduction-duo',
    name: 'Azelaic Acid + Niacinamide',
    tagline: 'Redness Reduction Duo',
    benefit: 'Azelaic Acid targets rosacea redness, pigmentation, and bacteria; Niacinamide reduces inflammation, minimises pores, and strengthens the barrier. Together they address the full spectrum of sensitive, redness-prone skin.',
    category: 'Brightening',
    ingredientNames: ['Azelaic Acid', 'Niacinamide (Vitamin B3)'],
  },

  // ── ACNE & OIL CONTROL ───────────────────────────────────────────────────────
  {
    id: 'pore-oil-control-duo',
    name: 'Niacinamide + Zinc',
    tagline: 'Pore & Oil Control Duo',
    benefit: 'Niacinamide minimises pore appearance and regulates sebum production; Zinc adds antibacterial protection and anti-inflammatory action. A gentle, non-irritating combination for oily and acne-prone skin.',
    category: 'Acne & Oil Control',
    ingredientNames: ['Niacinamide (Vitamin B3)', 'Zinc (PCA Zinc)'],
  },
  {
    id: 'acne-clear-duo',
    name: 'Salicylic Acid + Niacinamide',
    tagline: 'Acne Clear Duo',
    benefit: 'Salicylic Acid (BHA) clears pores and dissolves sebum plugs; Niacinamide calms the resulting redness and strengthens the barrier. A complete blemish approach — treat and soothe simultaneously.',
    category: 'Acne & Oil Control',
    ingredientNames: ['Salicylic Acid (BHA)', 'Niacinamide (Vitamin B3)'],
  },

  // ── ANTI-AGING ────────────────────────────────────────────────────────────────
  {
    id: 'tolerability-duo',
    name: 'Retinol + Niacinamide',
    tagline: 'Tolerability Duo',
    benefit: 'Niacinamide buffers Retinol\'s irritation, reduces the purging period, and adds its own anti-aging and brightening benefits. Allows more consistent retinol use, especially during the introduction phase.',
    category: 'Anti-Aging',
    ingredientNames: ['Retinol', 'Niacinamide (Vitamin B3)'],
  },
  {
    id: 'gentle-anti-aging-duo',
    name: 'Bakuchiol + Hyaluronic Acid',
    tagline: 'Gentle Anti-Aging Duo',
    benefit: 'Bakuchiol delivers retinol-like cell turnover and collagen stimulation without irritation; Hyaluronic Acid plumps and deeply hydrates. A pregnancy-safe, sensitive-skin-friendly anti-aging pair.',
    category: 'Anti-Aging',
    ingredientNames: ['Bakuchiol', 'Hyaluronic Acid'],
  },
]

// Resolve an IngredientCombo's ingredient names to their full IngredientTemplate objects.
// Returns only those templates found in the database (skips any unknown names gracefully).
export function resolveComboIngredients(combo: IngredientCombo): IngredientTemplate[] {
  return combo.ingredientNames
    .map(name => findIngredientTemplate(name))
    .filter((t): t is IngredientTemplate => t !== undefined)
}

// Group combos by category for display
export function groupCombosByCategory(): Record<string, IngredientCombo[]> {
  const groups: Record<string, IngredientCombo[]> = {}
  for (const combo of INGREDIENT_COMBOS) {
    if (!groups[combo.category]) groups[combo.category] = []
    groups[combo.category].push(combo)
  }
  return groups
}
