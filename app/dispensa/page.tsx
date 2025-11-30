import { getPantryItems } from '@/app/actions/pantry'
import { PantryList } from '@/components/pantry/pantry-list'

export const dynamic = 'force-dynamic'

export default async function PantryPage() {
  const { data: items } = await getPantryItems()

  return (
    <div className="p-4 w-full max-w-full lg:max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dispensa</h1>
        <p className="text-sm text-muted-foreground">Gestisci i prodotti in casa</p>
      </header>
      
      <PantryList initialItems={items || []} />
    </div>
  )
}
