import { getWeeklyMealPlan } from '@/app/actions/meal-plan'
import { MealPlanner } from '@/components/meal-plan/meal-planner'

export const dynamic = 'force-dynamic'

export default async function PianificazionePage() {
  const today = new Date()
  const { data: meals } = await getWeeklyMealPlan(today)

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Pianificazione Pasti</h1>
        <p className="text-sm text-muted-foreground">Organizza la tua dieta settimanale</p>
      </header>
      
      <MealPlanner initialMeals={meals || []} />
    </div>
  )
}
