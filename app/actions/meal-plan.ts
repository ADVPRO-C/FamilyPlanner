'use server'

import prisma from '@/lib/prisma'
import { getOrCreateArenaUser } from '@/lib/user'
import { revalidatePath } from 'next/cache'
import { startOfWeek, endOfWeek, startOfDay } from 'date-fns'

export type MealPlan = {
  id: string
  date: Date
  breakfast: string | null
  snack1: string | null
  lunch: string | null
  snack2: string | null
  dinner: string | null
}

// Normalize date to start of day (remove hours/minutes/seconds)
function normalizeDate(date: Date): Date {
  return startOfDay(date)
}

export async function getWeeklyMealPlan(date: Date) {
  try {
    const user = await getOrCreateArenaUser()
    const start = normalizeDate(startOfWeek(date, { weekStartsOn: 1 }))
    const end = normalizeDate(endOfWeek(date, { weekStartsOn: 1 }))

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
    const normalizedDate = normalizeDate(date)
    
    // Check if plan exists for this date
    const existing = await prisma.mealPlan.findFirst({
      where: {
        userId: user.id,
        date: normalizedDate,
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
          date: normalizedDate,
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
    const sourceStart = normalizeDate(startOfWeek(sourceDate, { weekStartsOn: 1 }))
    const sourceEnd = normalizeDate(endOfWeek(sourceDate, { weekStartsOn: 1 }))
    
    const sourceMeals = await prisma.mealPlan.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sourceStart,
          lte: sourceEnd,
        },
      },
    })

    const targetStart = normalizeDate(startOfWeek(targetDate, { weekStartsOn: 1 }))
    
    for (const meal of sourceMeals) {
      // Calculate day offset from source week start
      const dayOffset = Math.floor((meal.date.getTime() - sourceStart.getTime()) / (1000 * 60 * 60 * 24))
      const newDate = new Date(targetStart)
      newDate.setDate(targetStart.getDate() + dayOffset)
      const normalizedNewDate = normalizeDate(newDate)

      const existing = await prisma.mealPlan.findFirst({
        where: { userId: user.id, date: normalizedNewDate }
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
            date: normalizedNewDate,
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
