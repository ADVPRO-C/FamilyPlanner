'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getHistory } from '@/app/actions/budget'

type HistoryItem = {
  id: string
  date: Date
  product: string
  quantity: string
  price: number
}

export function HistoryList({ initialHistory, initialMonth }: { initialHistory: HistoryItem[], initialMonth: string }) {
  const [history, setHistory] = useState(initialHistory)
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)

  // Generate last 24 months options
  const months = []
  for (let i = 0; i < 24; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push(format(d, 'yyyy-MM'))
  }

  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month)
    const result = await getHistory(month)
    if (result.success && result.data) {
      setHistory(result.data)
    }
  }

  const totalSpent = history.reduce((acc, item) => acc + item.price, 0)

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleziona mese" />
          </SelectTrigger>
          <SelectContent>
            {months.map(m => (
              <SelectItem key={m} value={m}>
                {format(new Date(m + '-01'), 'MMMM yyyy', { locale: it })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Totale</p>
          <p className="font-bold text-lg">€{totalSpent.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex flex-col">
              <span className="font-medium">{item.product}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(item.date), 'dd MMM', { locale: it })} • {item.quantity}
              </span>
            </div>
            <span className="font-bold">€{item.price.toFixed(2)}</span>
          </div>
        ))}
        {history.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p>Nessuna spesa in questo mese</p>
          </div>
        )}
      </div>
    </div>
  )
}
