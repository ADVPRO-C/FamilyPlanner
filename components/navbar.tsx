'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Package, PieChart, History, ChefHat } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()

  // Hide navbar on login page
  if (pathname === '/login') return null

  const navItems = [
    { href: '/lista-spesa', icon: ShoppingCart, label: 'Spesa' },
    { href: '/dispensa', icon: Package, label: 'Dispensa' },
    { href: '/budget', icon: PieChart, label: 'Budget' },
    { href: '/storico', icon: History, label: 'Storico' },
    { href: '/ricette', icon: ChefHat, label: 'Ricette' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
