import { getBudget } from '@/app/actions/budget'
import { BudgetView } from '@/components/budget/budget-view'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function BudgetPage() {
  const currentMonth = format(new Date(), 'yyyy-MM')
  const displayMonth = format(new Date(), 'MMMM yyyy', { locale: it })
  
  const { data: budget } = await getBudget(currentMonth)

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold capitalize">{displayMonth}</h1>
        <p className="text-sm text-muted-foreground">Gestione Budget</p>
      </header>
      
      <BudgetView initialBudget={budget || null} month={currentMonth} />
    </div>
  )
}
