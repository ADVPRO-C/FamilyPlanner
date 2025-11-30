import { getShoppingList } from '@/app/actions/shopping-list'
import { ShoppingList } from '@/components/shopping-list/shopping-list'

export const dynamic = 'force-dynamic'

export default async function ShoppingListPage() {
  const { data: items } = await getShoppingList()

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lista della Spesa</h1>
        <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {items?.filter((i: { checked: boolean }) => !i.checked).length || 0} da prendere
        </span>
      </header>
      
      <ShoppingList initialItems={items || []} />
    </div>
  )
}
