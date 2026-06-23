import type { RiskLevel, IngredientType } from './types'

export interface IngredientTemplate {
  name: string          // canonical name — must include conflict-rule keywords
  category: string      // used for grouping in the dropdown
  riskLevel: RiskLevel
  type: IngredientType
  function: string
  benefit: string
  frequencyGuidance: string
  notes?: string
}

// Conflict-rule keywords (from lib/conflicts.ts) that must appear in ingredient names:
//   retinol · retinoid · tretinoin · adapalene · retinal
//   aha · glycolic acid · lactic acid · mandelic acid
//   bha · salicylic acid · pha · gluconolactone
//   vitamin c · l-ascorbic acid · ascorbic acid · 3-o-ethyl ascorbic acid
//   niacinamide · benzoyl peroxide · hydroquinone
//   peptide · palmitoyl · matrixyl

export const INGREDIENT_DATABASE: IngredientTemplate[] = [

  // ── VITAMIN A (RETINOIDS) ────────────────────────────────────────────────────
  {
    name: 'Retinol',
    category: 'Vitamin A (Retinoids)',
    riskLevel: 'high-risk', type: 'active',
    function: 'Cell turnover accelerator, anti-aging',
    benefit: 'Reduces fine lines, wrinkles, and hyperpigmentation; improves skin texture and tone',
    frequencyGuidance: '2–3x per week',
    notes: 'Start at 0.025–0.05% and build tolerance. PM use only. Avoid during pregnancy.',
  },
  {
    name: 'Tretinoin (Retinoic Acid)',
    category: 'Vitamin A (Retinoids)',
    riskLevel: 'high-risk', type: 'active',
    function: 'Prescription retinoid — direct retinoic acid',
    benefit: 'Most potent retinoid for anti-aging, acne, and hyperpigmentation',
    frequencyGuidance: '2–3x per week',
    notes: 'Requires prescription. Significant purging period expected. PM use only. Avoid during pregnancy.',
  },
  {
    name: 'Adapalene',
    category: 'Vitamin A (Retinoids)',
    riskLevel: 'high-risk', type: 'active',
    function: 'Third-generation retinoid, regulates skin cell differentiation',
    benefit: 'Treats acne and comedones; gentler retinoid option with less irritation than tretinoin',
    frequencyGuidance: 'Daily',
    notes: 'Available OTC at 0.1%. More stable and less irritating than retinol. PM use only.',
  },
  {
    name: 'Retinal (Retinaldehyde)',
    category: 'Vitamin A (Retinoids)',
    riskLevel: 'high-risk', type: 'active',
    function: 'One conversion step closer to retinoic acid than retinol',
    benefit: 'Faster visible results than retinol; also has anti-bacterial properties',
    frequencyGuidance: '2–3x per week',
    notes: 'More potent than retinol; less irritating than tretinoin. PM use only.',
  },
  {
    name: 'Bakuchiol',
    category: 'Vitamin A (Retinoids)',
    riskLevel: 'safe', type: 'botanical',
    function: 'Plant-based functional retinol alternative from babchi seeds',
    benefit: 'Retinol-like anti-aging and brightening benefits without irritation; pregnancy-safe',
    frequencyGuidance: 'Daily',
    notes: 'Can be used AM and PM. Well-tolerated by sensitive skin. Safe during pregnancy.',
  },

  // ── EXFOLIATING ACIDS (AHA / BHA / PHA) ─────────────────────────────────────
  {
    name: 'Glycolic Acid (AHA)',
    category: 'Exfoliating Acids',
    riskLevel: 'active', type: 'active',
    function: 'Chemical exfoliant — smallest AHA for deepest penetration',
    benefit: 'Resurfaces skin, improves texture and tone, fades hyperpigmentation and fine lines',
    frequencyGuidance: '2–3x per week',
    notes: 'Increases sun sensitivity — always follow with SPF. Start at 5–7%.',
  },
  {
    name: 'Lactic Acid (AHA)',
    category: 'Exfoliating Acids',
    riskLevel: 'moderate', type: 'active',
    function: 'Gentle chemical exfoliant and humectant',
    benefit: 'Exfoliates, brightens, and hydrates simultaneously; suitable for sensitive skin',
    frequencyGuidance: '2–3x per week',
    notes: 'More gentle than glycolic acid. Also acts as a humectant. Increases sun sensitivity.',
  },
  {
    name: 'Mandelic Acid (AHA)',
    category: 'Exfoliating Acids',
    riskLevel: 'moderate', type: 'active',
    function: 'Gentle AHA from bitter almonds with anti-bacterial properties',
    benefit: 'Exfoliates, brightens, and helps with acne; suitable for sensitive and darker skin tones',
    frequencyGuidance: '2–3x per week',
    notes: 'Gentlest AHA. Particularly good for hyperpigmentation in deeper skin tones.',
  },
  {
    name: 'Salicylic Acid (BHA)',
    category: 'Exfoliating Acids',
    riskLevel: 'active', type: 'active',
    function: 'Oil-soluble chemical exfoliant, pore-clearing',
    benefit: 'Clears pores, reduces blackheads and acne, controls excess oil',
    frequencyGuidance: '2–3x per week',
    notes: 'Oil-soluble — penetrates into pores. Avoid if allergic to aspirin. Increases sun sensitivity.',
  },
  {
    name: 'Gluconolactone (PHA)',
    category: 'Exfoliating Acids',
    riskLevel: 'moderate', type: 'active',
    function: 'Gentle polyhydroxy acid exfoliant with antioxidant properties',
    benefit: 'Exfoliates without irritation; suitable for very sensitive and eczema-prone skin',
    frequencyGuidance: 'Daily',
    notes: 'Gentlest of all exfoliating acids. Also acts as an antioxidant and humectant.',
  },
  {
    name: 'Azelaic Acid',
    category: 'Exfoliating Acids',
    riskLevel: 'moderate', type: 'active',
    function: 'Brightener, anti-inflammatory, and anti-bacterial acid',
    benefit: 'Fades hyperpigmentation, reduces rosacea redness, treats acne; pregnancy-safe',
    frequencyGuidance: 'Daily',
    notes: 'Pregnancy-safe. Well-tolerated. Available OTC at 10% or prescription at 15–20%.',
  },

  // ── VITAMIN C ────────────────────────────────────────────────────────────────
  {
    name: 'L-Ascorbic Acid (Vitamin C)',
    category: 'Vitamin C',
    riskLevel: 'active', type: 'active',
    function: 'Potent antioxidant, collagen synthesis stimulator',
    benefit: 'Brightens skin, fades dark spots, boosts collagen, protects against UV-induced damage',
    frequencyGuidance: 'Daily',
    notes: 'Most effective Vitamin C form. Requires low pH (~3.5). AM use recommended. Oxidises quickly — store away from light.',
  },
  {
    name: 'Vitamin C (3-O-Ethyl Ascorbic Acid)',
    category: 'Vitamin C',
    riskLevel: 'moderate', type: 'active',
    function: 'Stable vitamin C derivative that converts to ascorbic acid in skin',
    benefit: 'Brightening and antioxidant benefits; more stable and less irritating than L-ascorbic acid',
    frequencyGuidance: 'Daily',
    notes: 'Good for those who find L-ascorbic acid too irritating.',
  },
  {
    name: 'Ascorbyl Glucoside (Vitamin C)',
    category: 'Vitamin C',
    riskLevel: 'safe', type: 'active',
    function: 'Gentle, highly stable vitamin C derivative',
    benefit: 'Brightening effects with minimal irritation; suitable for very sensitive skin',
    frequencyGuidance: 'Daily',
    notes: 'Slowest-acting but most stable Vitamin C form. Great entry point for sensitive skin.',
  },

  // ── NIACINAMIDE & B VITAMINS ─────────────────────────────────────────────────
  {
    name: 'Niacinamide (Vitamin B3)',
    category: 'Vitamins & Antioxidants',
    riskLevel: 'safe', type: 'active',
    function: 'Multi-functional active: brightening, pore-minimising, barrier-supporting',
    benefit: 'Minimises pores, evens skin tone, controls oil, and strengthens the skin barrier',
    frequencyGuidance: 'Daily',
    notes: 'Extremely versatile and well-tolerated. Effective at 2–10%. Can be used AM and PM.',
  },
  {
    name: 'Panthenol (Vitamin B5)',
    category: 'Vitamins & Antioxidants',
    riskLevel: 'safe', type: 'functional',
    function: 'Humectant and skin-conditioning agent that converts to pantothenic acid',
    benefit: 'Deeply hydrates, soothes irritation, and supports wound healing',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Vitamin E (Tocopherol)',
    category: 'Vitamins & Antioxidants',
    riskLevel: 'safe', type: 'functional',
    function: 'Fat-soluble antioxidant and emollient',
    benefit: 'Protects against free radical damage, moisturises, and supports skin healing',
    frequencyGuidance: 'Daily',
    notes: 'Works synergistically with Vitamin C. May be comedogenic for some oily skin types.',
  },
  {
    name: 'Coenzyme Q10 (Ubiquinone)',
    category: 'Vitamins & Antioxidants',
    riskLevel: 'safe', type: 'active',
    function: 'Antioxidant that supports cellular energy production',
    benefit: 'Reduces fine lines, firms skin, and protects against oxidative stress',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Resveratrol',
    category: 'Vitamins & Antioxidants',
    riskLevel: 'safe', type: 'active',
    function: 'Polyphenol antioxidant found in grape skins',
    benefit: 'Neutralises free radicals, has anti-aging and brightening effects',
    frequencyGuidance: 'Daily',
    notes: 'Works synergistically with other antioxidants. PM use preferred.',
  },

  // ── HYDRATORS & HUMECTANTS ───────────────────────────────────────────────────
  {
    name: 'Hyaluronic Acid',
    category: 'Hydrators & Humectants',
    riskLevel: 'safe', type: 'functional',
    function: 'Humectant — attracts and holds up to 1000× its weight in water',
    benefit: 'Intensely hydrates, plumps fine lines, and improves skin texture',
    frequencyGuidance: 'Daily',
    notes: 'Apply to damp skin for best results. Multiple molecular weights hydrate at different depths.',
  },
  {
    name: 'Glycerin',
    category: 'Hydrators & Humectants',
    riskLevel: 'safe', type: 'functional',
    function: 'Humectant and skin-conditioning agent',
    benefit: 'Attracts moisture, softens skin, and helps maintain the skin barrier',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Beta-Glucan',
    category: 'Hydrators & Humectants',
    riskLevel: 'safe', type: 'functional',
    function: 'Powerful humectant with immunomodulating properties',
    benefit: 'Deeply hydrates, calms irritation, and supports barrier repair',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Sodium PCA',
    category: 'Hydrators & Humectants',
    riskLevel: 'safe', type: 'functional',
    function: 'Natural humectant — component of the skin\'s Natural Moisturising Factor (NMF)',
    benefit: 'Maintains hydration levels, softens skin',
    frequencyGuidance: 'Daily',
  },

  // ── BARRIER REPAIR ───────────────────────────────────────────────────────────
  {
    name: 'Ceramides',
    category: 'Barrier Repair',
    riskLevel: 'safe', type: 'functional',
    function: 'Skin barrier lipids — reinforce the stratum corneum',
    benefit: 'Restores and strengthens the skin barrier, prevents transepidermal water loss',
    frequencyGuidance: 'Daily',
    notes: 'Most effective when combined with cholesterol and fatty acids for complete barrier repair.',
  },
  {
    name: 'Squalane',
    category: 'Barrier Repair',
    riskLevel: 'safe', type: 'functional',
    function: 'Emollient — stable form of squalene that mimics skin\'s natural sebum',
    benefit: 'Non-comedogenic moisturising oil that softens and protects without greasiness',
    frequencyGuidance: 'Daily',
    notes: 'Suitable for all skin types including oily. Plant-derived (olive or sugarcane).',
  },
  {
    name: 'Allantoin',
    category: 'Barrier Repair',
    riskLevel: 'safe', type: 'functional',
    function: 'Soothing agent and mild keratolytic',
    benefit: 'Calms irritation, promotes skin renewal, and softens rough texture',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Centella Asiatica (Cica)',
    category: 'Barrier Repair',
    riskLevel: 'safe', type: 'botanical',
    function: 'Anti-inflammatory and wound-healing botanical complex',
    benefit: 'Soothes redness and irritation, promotes wound healing, and strengthens the skin barrier',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Madecassoside',
    category: 'Barrier Repair',
    riskLevel: 'safe', type: 'botanical',
    function: 'Active fraction of Centella Asiatica for targeted barrier repair',
    benefit: 'Soothes, promotes healing, and strengthens the skin barrier',
    frequencyGuidance: 'Daily',
  },

  // ── PEPTIDES ─────────────────────────────────────────────────────────────────
  {
    name: 'Matrixyl (Palmitoyl Tripeptide-1)',
    category: 'Peptides',
    riskLevel: 'safe', type: 'active',
    function: 'Signal peptide — stimulates collagen and elastin synthesis',
    benefit: 'Reduces the appearance of fine lines and wrinkles, improves firmness',
    frequencyGuidance: 'Daily',
    notes: 'Most researched peptide for anti-aging. Avoid layering directly with strong acids.',
  },
  {
    name: 'Argireline (Acetyl Hexapeptide-3)',
    category: 'Peptides',
    riskLevel: 'safe', type: 'active',
    function: 'Neuropeptide — inhibits muscle contractions that form expression lines',
    benefit: 'Reduces the depth of forehead lines and crow\'s feet with consistent use',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Copper Peptide (GHK-Cu)',
    category: 'Peptides',
    riskLevel: 'safe', type: 'active',
    function: 'Growth factor peptide — promotes tissue remodelling',
    benefit: 'Stimulates collagen and elastin synthesis, accelerates wound healing and skin repair',
    frequencyGuidance: 'Daily',
    notes: 'Avoid combining with direct acids or Vitamin C as these may deactivate the copper complex.',
  },

  // ── BRIGHTENERS ──────────────────────────────────────────────────────────────
  {
    name: 'Alpha Arbutin',
    category: 'Brighteners',
    riskLevel: 'safe', type: 'active',
    function: 'Tyrosinase inhibitor — reduces melanin production',
    benefit: 'Fades dark spots and hyperpigmentation without irritation',
    frequencyGuidance: 'Daily',
    notes: 'More effective and stable than beta-arbutin. Effective at 0.5–2%.',
  },
  {
    name: 'Tranexamic Acid',
    category: 'Brighteners',
    riskLevel: 'safe', type: 'active',
    function: 'Tyrosinase inhibitor and anti-inflammatory brightener',
    benefit: 'Fades hyperpigmentation and melasma; well-tolerated by most skin types',
    frequencyGuidance: 'Daily',
    notes: 'Works on multiple pigmentation pathways. Suitable for melasma. Can be used AM and PM.',
  },
  {
    name: 'Kojic Acid',
    category: 'Brighteners',
    riskLevel: 'moderate', type: 'active',
    function: 'Tyrosinase inhibitor derived from fungi',
    benefit: 'Fades dark spots and brightens overall skin tone',
    frequencyGuidance: '2–3x per week',
    notes: 'Can cause contact dermatitis. Use at 1% or lower. Not recommended for continuous long-term daily use.',
  },
  {
    name: 'Hydroquinone',
    category: 'Brighteners',
    riskLevel: 'high-risk', type: 'active',
    function: 'Strong tyrosinase inhibitor — most potent topical brightening agent',
    benefit: 'Effectively treats melasma, age spots, and stubborn hyperpigmentation',
    frequencyGuidance: '2–3x per week',
    notes: 'Prescription at 4%+. Use in 3-month cycles with breaks. Avoid sun exposure. Never combine with benzoyl peroxide.',
  },
  {
    name: 'Licorice Root (Glabridin)',
    category: 'Brighteners',
    riskLevel: 'safe', type: 'botanical',
    function: 'Brightening and anti-inflammatory botanical extract',
    benefit: 'Fades dark spots and reduces redness without irritation',
    frequencyGuidance: 'Daily',
  },

  // ── ACNE TREATMENTS ──────────────────────────────────────────────────────────
  {
    name: 'Benzoyl Peroxide',
    category: 'Acne Treatments',
    riskLevel: 'high-risk', type: 'active',
    function: 'Anti-bacterial and keratolytic acne treatment',
    benefit: 'Kills acne-causing bacteria, reduces inflammation, and clears pores',
    frequencyGuidance: '2–3x per week',
    notes: 'Start at 2.5%. Can bleach fabric and towels. Oxidises retinol — never use together.',
  },
  {
    name: 'Tea Tree Oil',
    category: 'Acne Treatments',
    riskLevel: 'moderate', type: 'botanical',
    function: 'Natural anti-bacterial and anti-inflammatory essential oil',
    benefit: 'Treats acne and blemishes; reduces inflammation and redness',
    frequencyGuidance: 'Daily',
    notes: 'Always dilute — pure tea tree oil causes irritation. Use formulations at 5% or below.',
  },
  {
    name: 'Zinc (PCA Zinc)',
    category: 'Acne Treatments',
    riskLevel: 'safe', type: 'active',
    function: 'Sebum regulator and anti-inflammatory mineral',
    benefit: 'Controls oiliness, reduces acne and redness, soothes inflammation',
    frequencyGuidance: 'Daily',
  },

  // ── BOTANICALS & SOOTHING ────────────────────────────────────────────────────
  {
    name: 'Green Tea (EGCG)',
    category: 'Botanicals & Soothing',
    riskLevel: 'safe', type: 'botanical',
    function: 'Potent polyphenol antioxidant and anti-inflammatory',
    benefit: 'Protects against UV-induced damage, reduces inflammation, controls sebum',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Aloe Vera',
    category: 'Botanicals & Soothing',
    riskLevel: 'safe', type: 'botanical',
    function: 'Soothing botanical with anti-inflammatory and hydrating properties',
    benefit: 'Calms redness and irritation, hydrates, soothes sunburn and breakouts',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Chamomile (Bisabolol)',
    category: 'Botanicals & Soothing',
    riskLevel: 'safe', type: 'botanical',
    function: 'Anti-inflammatory and soothing botanical derived from chamomile',
    benefit: 'Calms redness, sensitivity, and post-procedure irritation',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Rosehip Oil',
    category: 'Botanicals & Soothing',
    riskLevel: 'safe', type: 'botanical',
    function: 'Plant oil rich in Vitamin A, C, and essential fatty acids',
    benefit: 'Brightens, fades scars and hyperpigmentation, and anti-ages',
    frequencyGuidance: 'Daily',
    notes: 'Contains natural retinoids — may cause mild sensitivity for some. PM use preferred.',
  },
  {
    name: 'Jojoba Oil',
    category: 'Botanicals & Soothing',
    riskLevel: 'safe', type: 'botanical',
    function: 'Plant wax ester that closely mimics the skin\'s natural sebum',
    benefit: 'Balances oil production, moisturises, and is non-comedogenic',
    frequencyGuidance: 'Daily',
  },

  // ── EMOLLIENTS & OCCLUSIVES ──────────────────────────────────────────────────
  {
    name: 'Shea Butter',
    category: 'Emollients & Occlusives',
    riskLevel: 'safe', type: 'functional',
    function: 'Rich emollient and occlusive from the shea tree nut',
    benefit: 'Deeply nourishes and softens dry skin; soothes eczema and dry patches',
    frequencyGuidance: 'Daily',
    notes: 'Best applied as the final step to seal in moisture. May be comedogenic for oily skin types.',
  },
  {
    name: 'Dimethicone',
    category: 'Emollients & Occlusives',
    riskLevel: 'safe', type: 'functional',
    function: 'Silicone-based emollient and skin protectant',
    benefit: 'Smooths texture, provides a protective barrier, and temporarily fills fine lines',
    frequencyGuidance: 'Daily',
  },

  // ── SUNSCREEN FILTERS ────────────────────────────────────────────────────────
  {
    name: 'Zinc Oxide',
    category: 'Sunscreen Filters',
    riskLevel: 'safe', type: 'functional',
    function: 'Mineral UV filter — reflects and scatters both UVA and UVB',
    benefit: 'Broad-spectrum sun protection; reef-safe; suitable for sensitive and acne-prone skin',
    frequencyGuidance: 'AM only',
    notes: 'Physical sunscreen filter. Higher concentrations may leave a white cast.',
  },
  {
    name: 'Titanium Dioxide',
    category: 'Sunscreen Filters',
    riskLevel: 'safe', type: 'functional',
    function: 'Mineral UV filter — primarily reflects and absorbs UVB',
    benefit: 'Broad-spectrum sun protection; gentle and non-irritating',
    frequencyGuidance: 'AM only',
    notes: 'Physical sunscreen filter. Often combined with zinc oxide for full broad-spectrum protection.',
  },

  // ── ADDITIONAL (needed for synergistic combos) ───────────────────────────────
  {
    name: 'Manganese PCA',
    category: 'Acne Treatments',
    riskLevel: 'safe', type: 'functional',
    function: 'Mineral cofactor for enzymatic skin repair and barrier support',
    benefit: 'Works synergistically with copper and zinc to provide antibacterial properties and assist optimal barrier recovery',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Ferulic Acid',
    category: 'Vitamins & Antioxidants',
    riskLevel: 'safe', type: 'active',
    function: 'Plant-derived antioxidant that stabilises and amplifies Vitamins C and E',
    benefit: 'Doubles the photo-protective efficacy of Vitamins C and E when combined; neutralises free radicals',
    frequencyGuidance: 'Daily',
    notes: 'Most effective when combined with Vitamin C + E. Increases UV protection from the antioxidant trio.',
  },
  {
    name: 'Cholesterol',
    category: 'Barrier Repair',
    riskLevel: 'safe', type: 'functional',
    function: 'Essential skin barrier lipid — maintains membrane fluidity and integrity',
    benefit: 'Part of the "golden ratio" barrier repair trio; restores lipid bilayer structure alongside ceramides and fatty acids',
    frequencyGuidance: 'Daily',
  },
  {
    name: 'Linoleic Acid (Omega-6)',
    category: 'Barrier Repair',
    riskLevel: 'safe', type: 'functional',
    function: 'Essential omega-6 fatty acid and key barrier lipid',
    benefit: 'Restores barrier integrity, balances sebum composition, and is anti-inflammatory',
    frequencyGuidance: 'Daily',
    notes: 'Essential fatty acid — cannot be synthesised by the body. Often deficient in acne-prone skin.',
  },
]

// Flat list of all ingredient names for quick lookup
export const INGREDIENT_NAMES = INGREDIENT_DATABASE.map(i => i.name)

export function findIngredientTemplate(name: string): IngredientTemplate | undefined {
  const lower = name.toLowerCase()
  return INGREDIENT_DATABASE.find(i => i.name.toLowerCase() === lower)
}
