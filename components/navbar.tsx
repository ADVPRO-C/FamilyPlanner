'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, CalendarDays, Package, PieChart, ChefHat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function Navbar() {
  const pathname = usePathname()

  // Hide navbar on login page
  if (pathname === '/login') return null

  const navItems = [
    { href: '/lista-spesa', icon: ShoppingCart, label: 'Spesa' },
    { href: '/dispensa', icon: Package, label: 'Dispensa' },
    { href: '/budget', icon: PieChart, label: 'Budget' },
    { href: '/pianificazione', icon: CalendarDays, label: 'Pianificazione' },
    { href: '/ricette', icon: ChefHat, label: 'Ricette' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-safe shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 -z-10 bg-primary/10 rounded-xl mx-1 my-2"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-6 h-6 z-10" />
              <span className="text-[10px] font-medium z-10">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
