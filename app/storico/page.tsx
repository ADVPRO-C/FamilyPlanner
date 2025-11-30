import { getHistory } from '@/app/actions/budget'
import { HistoryList } from '@/components/history/history-list'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const currentMonth = format(new Date(), 'yyyy-MM')
  const { data: history } = await getHistory(currentMonth)

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Storico Acquisti</h1>
        <p className="text-sm text-muted-foreground">Monitora le tue spese</p>
      </header>
      
      <HistoryList initialHistory={history || []} initialMonth={currentMonth} />
    </div>
  )
}
