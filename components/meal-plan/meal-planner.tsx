'use client'

import { useState, useTransition } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { it } from 'date-fns/locale/it'
import { ChevronLeft, ChevronRight, Copy, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { updateMeal, duplicateWeek, type MealPlan } from '@/app/actions/meal-plan'
import { toast } from 'sonner'

type MealType = 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Colazione',
  snack1: 'Spuntino',
  lunch: 'Pranzo',
  snack2: 'Merenda',
  dinner: 'Cena',
}

export function MealPlanner({ initialMeals }: { initialMeals: MealPlan[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isPending, startTransition] = useTransition()
  const [meals, setMeals] = useState(initialMeals)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const handlePrevWeek = () => setCurrentDate(d => subWeeks(d, 1))
  const handleNextWeek = () => setCurrentDate(d => addWeeks(d, 1))

  const getMealForDate = (date: Date) => {
    return meals.find(m => isSameDay(new Date(m.date), date))
  }

  const handleUpdateMeal = async (date: Date, type: MealType, value: string) => {
    // Optimistic update
    const existingMeal = getMealForDate(date)
    const newMeals = [...meals]
    
    if (existingMeal) {
      existingMeal[type] = value
      setMeals(newMeals) // Update local state
    } else {
      // Create temp meal if not exists locally
      // For simplicity, we wait for server revalidation for new meals creation
      // or we could push a temp object to newMeals
    }

    startTransition(async () => {
      const result = await updateMeal(date, type, value)
      if (result.success) {
        toast.success('Pasto aggiornato')
      } else {
        toast.error('Errore aggiornamento')
      }
    })
  }

  const handleDuplicateWeek = async () => {
    if (confirm('Vuoi copiare il menu di questa settimana nella prossima?')) {
      startTransition(async () => {
        const result = await duplicateWeek(currentDate, addWeeks(currentDate, 1))
        if (result.success) {
          toast.success('Settimana duplicata con successo')
          handleNextWeek()
        } else {
          toast.error('Errore duplicazione')
        }
      })
    }
  }

  const selectedDayMeal = getMealForDate(selectedDate)

  return (
    <div className="space-y-6 pb-24">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h2 className="font-semibold capitalize">
            {format(weekStart, 'MMMM yyyy', { locale: it })}
          </h2>
          <p className="text-xs text-muted-foreground">
            Settimana {format(weekStart, 'w', { locale: it })}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handleDuplicateWeek} title="Duplica settimana">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Week Grid (Day Selector) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())
          const hasMeals = getMealForDate(day)
          
          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-colors
                ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'}
                ${isToday && !isSelected ? 'border-2 border-primary' : ''}
              `}
            >
              <span className="text-[10px] uppercase font-bold">
                {format(day, 'EEE', { locale: it })}
              </span>
              <span className={`text-lg font-semibold ${isSelected ? '' : 'text-foreground'}`}>
                {format(day, 'd')}
              </span>
              {hasMeals && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-primary mt-1" />
              )}
            </button>
          )
        })}
      </div>

      {/* Daily Focus View */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="capitalize flex items-center gap-2">
            {format(selectedDate, 'EEEE d MMMM', { locale: it })}
            {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(MEAL_LABELS) as MealType[]).map((type) => (
            <div key={type} className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                {MEAL_LABELS[type]}
              </label>
              <Textarea
                placeholder={`Cosa mangi per ${MEAL_LABELS[type].toLowerCase()}?`}
                defaultValue={selectedDayMeal?.[type] || ''}
                className="resize-none min-h-[60px] bg-muted/30 focus:bg-background transition-colors"
                onBlur={(e) => {
                  if (e.target.value !== (selectedDayMeal?.[type] || '')) {
                    handleUpdateMeal(selectedDate, type, e.target.value)
                  }
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
