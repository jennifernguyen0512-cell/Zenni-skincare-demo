import Link from 'next/link'
import { Product } from '@/lib/types'

const categoryGradients: Record<string, string> = {
  cleanser:    'from-pink-100 to-rose-200',
  toner:       'from-purple-100 to-violet-200',
  serum:       'from-amber-100 to-yellow-200',
  moisturiser: 'from-sky-100 to-blue-200',
  spf:         'from-orange-100 to-amber-200',
  exfoliant:   'from-red-100 to-pink-200',
  mask:        'from-green-100 to-emerald-200',
  'eye-cream': 'from-violet-100 to-purple-200',
  oil:         'from-yellow-100 to-amber-200',
  mist:        'from-cyan-100 to-sky-200',
  other:       'from-gray-100 to-slate-200',
}

const riskTextColors: Record<string, string> = {
  safe:        'text-emerald-700',
  moderate:    'text-amber-600',
  active:      'text-orange-600',
  'high-risk': 'text-red-600',
}

const ampmBadge: Record<string, string> = {
  AM:   'bg-amber-100 text-amber-700',
  PM:   'bg-indigo-100 text-indigo-700',
  Both: 'bg-purple-100 text-purple-700',
}

export default function ProductCard({ product }: { product: Product }) {
  const gradient = categoryGradients[product.category] || categoryGradients.other
  const topIngredients = product.featuredIngredients.slice(0, 3)

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-skin-border overflow-hidden hover:shadow-lg hover:shadow-pink-100/60 transition-all duration-200 group-hover:-translate-y-0.5">
        {/* Photo */}
        <div className="aspect-square w-full overflow-hidden">
          {product.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-sm text-gray-500 capitalize font-medium">{product.category.replace('-', ' ')}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-skin-muted uppercase tracking-widest mb-0.5">{product.brand}</p>
          <h3 className="font-display text-sm font-semibold text-skin-text leading-tight mb-3 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="text-xs bg-lilac/30 text-purple-800 px-2 py-0.5 rounded-full capitalize font-medium border border-lilac/40">
              {product.category.replace('-', ' ')}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ampmBadge[product.amPm] || ampmBadge.Both}`}>
              {product.amPm}
            </span>
          </div>

          {topIngredients.length > 0 && (
            <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
              {topIngredients.map((ing, i) => (
                <span key={ing.name} className={`text-xs font-medium ${riskTextColors[ing.riskLevel]}`}>
                  {ing.name}{i < topIngredients.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
