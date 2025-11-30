import { getRecipes } from '@/app/actions/recipes'
import { RecipeList } from '@/components/recipes/recipe-list'

export const dynamic = 'force-dynamic'

export default async function RecipesPage() {
  const { data: recipes } = await getRecipes()

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Le tue Ricette</h1>
        <p className="text-sm text-muted-foreground">Importa e gestisci le ricette</p>
      </header>
      
      <RecipeList initialRecipes={recipes || []} />
    </div>
  )
}
