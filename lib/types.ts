export type RiskLevel = 'safe' | 'moderate' | 'active' | 'high-risk'
export type IngredientType = 'active' | 'functional' | 'botanical' | 'standard'
export type ProductCategory =
  | 'cleanser' | 'toner' | 'serum' | 'moisturiser' | 'spf'
  | 'eye-cream' | 'exfoliant' | 'mask' | 'oil' | 'mist' | 'other'
export type AmPm = 'AM' | 'PM' | 'Both'

export interface Ingredient {
  name: string
  riskLevel: RiskLevel
  type: IngredientType
  function: string
  benefit: string
  frequencyGuidance: string
  notes?: string
}

export interface Product {
  id: string
  name: string
  brand: string
  category: ProductCategory
  photo: string
  description: string
  purchasedPrice: number
  currency: string
  seller: string
  purchaseDate?: string
  amPm: AmPm
  usageFrequency: string
  howToUse: string
  notes?: string
  useScenarios: string[]
  skinConcerns: string[]
  benefits: string[]
  featuredIngredients: Ingredient[]
  createdAt: string
  updatedAt: string
}
