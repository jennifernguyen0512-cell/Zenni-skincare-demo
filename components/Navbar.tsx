'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-skin-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-skin-text tracking-wide">
          Zenni&apos;s Skincare Products
        </Link>
        <div className="flex items-center gap-5">
          {[
            { href: '/', label: 'Library' },
            { href: '/routines', label: 'Routines' },
            { href: '/products/import', label: 'Scan' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${pathname === href ? 'text-skin-text font-medium' : 'text-skin-muted hover:text-skin-text'}`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/products/add"
            className="text-sm bg-blush text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity font-medium"
          >
            + Add Product
          </Link>
        </div>
      </div>
    </nav>
  )
}
