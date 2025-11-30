'use client'

import { useState, useTransition } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { setBudget } from '@/app/actions/budget'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type BudgetData = {
  id: string
  month: string
  amount: number
  used: number
}

export function BudgetView({ initialBudget, month }: { initialBudget: BudgetData | null, month: string }) {
  const [budget, setBudgetState] = useState(initialBudget)
  const [newAmount, setNewAmount] = useState(initialBudget?.amount?.toString() || '')
  const [isPending, startTransition] = useTransition()

  const amount = budget?.amount || 0
  const used = budget?.used || 0
  const percentage = amount > 0 ? Math.min((used / amount) * 100, 100) : 0
  
  let color = 'text-green-500'
  let strokeColor = '#22c55e'
  if (percentage >= 70 && percentage < 90) {
    color = 'text-yellow-500'
    strokeColor = '#eab308'
  } else if (percentage >= 90) {
    color = 'text-red-500'
    strokeColor = '#ef4444'
  }

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(newAmount)
    if (isNaN(val)) return

    startTransition(async () => {
      const result = await setBudget(month, val)
      if (result.success && result.data) {
        setBudgetState(result.data as BudgetData)
        toast.success('Budget aggiornato')
      } else {
        toast.error('Errore aggiornamento budget')
      }
    })
  }

  // Circular Progress SVG
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="15"
            fill="transparent"
            className="text-muted/20"
          />
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke={strokeColor}
            strokeWidth="15"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-sm text-muted-foreground">Speso</span>
          <span className={`text-4xl font-bold ${color}`}>€{used.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">su €{amount.toFixed(2)}</span>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Imposta Budget
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imposta Budget Mensile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetBudget} className="space-y-4">
            <Input
              type="number"
              step="0.01"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Importo budget"
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              Salva
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
