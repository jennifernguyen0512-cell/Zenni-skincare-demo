import { Ingredient } from '@/lib/types'

const riskConfig = {
  safe:        { text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', label: 'Safe' },
  moderate:    { text: 'text-amber-600',   bg: 'bg-amber-50',    border: 'border-amber-200',   label: 'Moderate' },
  active:      { text: 'text-orange-600',  bg: 'bg-orange-50',   border: 'border-orange-200',  label: 'Active' },
  'high-risk': { text: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-200',     label: 'High Risk' },
}

const typeConfig = {
  active:     { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Active Ingredient' },
  functional: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Functional' },
  botanical:  { bg: 'bg-amber-100',  text: 'text-amber-800',  label: 'Botanical' },
  standard:   { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Standard' },
}

interface Props {
  ingredient: Ingredient
  compact?: boolean
}

export default function IngredientBadge({ ingredient, compact = false }: Props) {
  const risk = riskConfig[ingredient.riskLevel]
  const type = typeConfig[ingredient.type]

  if (compact) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${risk.bg} ${risk.text} ${risk.border}`}>
        {ingredient.name}
      </span>
    )
  }

  return (
    <div className={`p-4 rounded-xl border ${risk.border} ${risk.bg}`}>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className={`text-sm font-semibold ${risk.text}`}>{ingredient.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type.bg} ${type.text}`}>{type.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${risk.border} ${risk.text} font-medium`}>{risk.label}</span>
      </div>
      {ingredient.function && (
        <p className="text-xs text-skin-muted mb-1">{ingredient.function}</p>
      )}
      {ingredient.benefit && (
        <p className="text-sm text-skin-text mb-2 leading-relaxed">{ingredient.benefit}</p>
      )}
      <div className="flex items-center gap-1">
        <span className="text-xs text-skin-muted">Frequency:</span>
        <span className="text-xs font-medium text-skin-text">{ingredient.frequencyGuidance}</span>
      </div>
      {ingredient.notes && (
        <p className="text-xs text-skin-muted mt-1.5 italic border-t border-current/10 pt-1.5">{ingredient.notes}</p>
      )}
    </div>
  )
}
