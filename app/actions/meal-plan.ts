'use server'

import prisma from '@/lib/prisma'
import { getOrCreateArenaUser } from '@/lib/user'
import { revalidatePath } from 'next/cache'
import { startOfWeek, endOfWeek } from 'date-fns'

export type MealPlan = {
  id: string
  date: Date
  breakfast: string | null
  snack1: string | null
  lunch: string | null
  snack2: string | null
  dinner: string | null
}

export async function getWeeklyMealPlan(date: Date) {
  try {
    const user = await getOrCreateArenaUser()
    const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday start
    const end = endOfWeek(date, { weekStartsOn: 1 })

    const meals = await prisma.mealPlan.findMany({
      where: {
        userId: user.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    })

    return { success: true, data: meals }
  } catch (error) {
    console.error('Failed to get meal plan:', error)
    return { success: false, error: 'Failed to get meal plan' }
  }
}

export async function updateMeal(date: Date, type: keyof Omit<MealPlan, 'id' | 'date' | 'userId' | 'createdAt' | 'updatedAt'>, value: string) {
  try {
    const user = await getOrCreateArenaUser()
    
    // Check if plan exists for this date
    const existing = await prisma.mealPlan.findFirst({
      where: {
        userId: user.id,
        date: date,
      },
    })

    if (existing) {
      await prisma.mealPlan.update({
        where: { id: existing.id },
        data: { [type]: value },
      })
    } else {
      await prisma.mealPlan.create({
        data: {
          userId: user.id,
          date: date,
          [type]: value,
        },
      })
    }

    revalidatePath('/pianificazione')
    return { success: true }
  } catch (error) {
    console.error('Failed to update meal:', error)
    return { success: false, error: 'Failed to update meal' }
  }
}

export async function duplicateWeek(sourceDate: Date, targetDate: Date) {
  try {
    const user = await getOrCreateArenaUser()
    const sourceStart = startOfWeek(sourceDate, { weekStartsOn: 1 })
    const sourceEnd = endOfWeek(sourceDate, { weekStartsOn: 1 })
    
    const sourceMeals = await prisma.mealPlan.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sourceStart,
          lte: sourceEnd,
        },
      },
    })

    const targetStart = startOfWeek(targetDate, { weekStartsOn: 1 })
    
    // Delete existing target week meals? Or overwrite? 
    // Let's overwrite/upsert.
    
    for (const meal of sourceMeals) {
      // const dayDiff = meal.date.getDay() - sourceStart.getDay()
      // Actually simpler: just add difference in weeks
      // But we need to map Monday to Monday etc.
      
      // Calculate offset in milliseconds
      const timeDiff = meal.date.getTime() - sourceStart.getTime()
      const newDate = new Date(targetStart.getTime() + timeDiff)

      const existing = await prisma.mealPlan.findFirst({
        where: { userId: user.id, date: newDate }
      })

      if (existing) {
        await prisma.mealPlan.update({
          where: { id: existing.id },
          data: {
            breakfast: meal.breakfast,
            snack1: meal.snack1,
            lunch: meal.lunch,
            snack2: meal.snack2,
            dinner: meal.dinner,
          }
        })
      } else {
        await prisma.mealPlan.create({
          data: {
            userId: user.id,
            date: newDate,
            breakfast: meal.breakfast,
            snack1: meal.snack1,
            lunch: meal.lunch,
            snack2: meal.snack2,
            dinner: meal.dinner,
          }
        })
      }
    }

    revalidatePath('/pianificazione')
    return { success: true }
  } catch (error) {
    console.error('Failed to duplicate week:', error)
    return { success: false, error: 'Failed to duplicate week' }
  }
}
