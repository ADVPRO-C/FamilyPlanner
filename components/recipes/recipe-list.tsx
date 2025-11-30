'use client'

import { useState } from 'react'
import { Trash2, ChefHat, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteRecipe } from '@/app/actions/recipes'
import { toast } from 'sonner'
import { RecipeImporter } from './recipe-importer'

type Recipe = {
  id: string
  name: string
  ingredients: string
  instructions: string
  category: string
}

export function RecipeList({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Sei sicuro di voler eliminare questa ricetta?')) return

    const result = await deleteRecipe(id)
    if (result.success) {
      toast.success('Ricetta eliminata')
      setRecipes(recipes.filter(r => r.id !== id))
    } else {
      toast.error('Errore eliminazione')
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-end">
        <RecipeImporter />
      </div>

      <div className="space-y-4">
        {recipes.map((recipe) => (
          <Card 
            key={recipe.id} 
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <ChefHat className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-base">{recipe.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive/90"
                  onClick={(e) => handleDelete(recipe.id, e)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {expandedId === recipe.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </CardHeader>
            {expandedId === recipe.id && (
              <CardContent className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2">
                <div className="bg-muted/50 p-3 rounded-md text-sm whitespace-pre-wrap">
                  <p className="font-semibold mb-1">Ingredienti:</p>
                  {recipe.ingredients}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  <p className="font-semibold mb-1">Preparazione:</p>
                  {recipe.instructions}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        {recipes.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p>Nessuna ricetta salvata 📖</p>
          </div>
        )}
      </div>
    </div>
  )
}
