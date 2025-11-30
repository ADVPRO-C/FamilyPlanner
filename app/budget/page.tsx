import { getBudget, getHistory } from '@/app/actions/budget'
import { BudgetView } from '@/components/budget/budget-view'
import { HistoryList } from '@/components/history/history-list'
import { format } from 'date-fns'
import { it } from 'date-fns/locale/it'

export const dynamic = 'force-dynamic'

export default async function BudgetPage() {
  const currentMonth = format(new Date(), 'yyyy-MM')
  const displayMonth = format(new Date(), 'MMMM yyyy', { locale: it })
  
  const { data: budget } = await getBudget(currentMonth)
  const { data: history } = await getHistory(currentMonth)

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold capitalize">{displayMonth}</h1>
        <p className="text-sm text-muted-foreground">Gestione Budget</p>
      </header>
      
      <BudgetView initialBudget={budget || null} month={currentMonth} />
      
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 px-2">Storico Acquisti</h2>
        <HistoryList initialHistory={history || []} initialMonth={currentMonth} />
      </div>
    </div>
  )
}
