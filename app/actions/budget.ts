'use server'

import prisma from '@/lib/prisma'
import { getOrCreateArenaUser } from '@/lib/user'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { upsertPantryItem } from './pantry'

export async function getBudget(month: string) {
  // month format: YYYY-MM
  try {
    const user = await getOrCreateArenaUser()
    const budget = await prisma.budget.findFirst({
      where: { month, userId: user.id }, // Add userId check in real app
    })
    return { success: true, data: budget }
  } catch (error) {
    console.error('Failed to fetch budget:', error)
    return { success: false, error: 'Failed to fetch budget' }
  }
}

export async function setBudget(month: string, amount: number) {
  try {
    const user = await getOrCreateArenaUser()

    const budget = await prisma.budget.upsert({
      where: {
        userId_month: {
          userId: user.id,
          month,
        },
      },
      update: { amount },
      create: {
        userId: user.id,
        month,
        amount,
        used: 0,
      },
    })
    revalidatePath('/budget')
    return { success: true, data: budget }
  } catch (error) {
    console.error('Failed to set budget:', error)
    return { success: false, error: 'Failed to set budget' }
  }
}

export async function updateBudgetUsage(month: string, used: number) {
  try {
    const user = await getOrCreateArenaUser()
    const existing = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        month,
      },
    })

    const budget = existing
      ? await prisma.budget.update({
          where: { id: existing.id },
          data: { used },
        })
      : await prisma.budget.create({
          data: {
            userId: user.id,
            month,
            amount: 0,
            used,
          },
        })

    revalidatePath('/budget')
    return { success: true, data: budget }
  } catch (error) {
    console.error('Failed to update budget usage:', error)
    return { success: false, error: 'Failed to update budget usage' }
  }
}

export async function getHistory(month: string) {
  try {
    const user = await getOrCreateArenaUser()
    const history = await prisma.historyItem.findMany({
      where: { month, userId: user.id },
      orderBy: { date: 'desc' },
    })
    return { success: true, data: history }
  } catch (error) {
    console.error('Failed to fetch history:', error)
    return { success: false, error: 'Failed to fetch history' }
  }
}

type HistoryItemInput = { name: string; quantity: string; price: number; category?: string }

export async function addToHistory(items: HistoryItemInput[], totalOverride?: number) {
  try {
    const user = await getOrCreateArenaUser()

    const month = format(new Date(), 'yyyy-MM')
    const totalFromItems = items.reduce((acc, item) => acc + (item.price || 0), 0)
    const totalSpent =
      typeof totalOverride === 'number' && !Number.isNaN(totalOverride) && totalOverride > 0
        ? totalOverride
        : totalFromItems

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        items.map((item) =>
          tx.historyItem.create({
            data: {
              month,
              product: item.name,
              quantity: item.quantity,
              price: item.price || 0,
              userId: user.id,
            },
          })
        )
      )

      const budget = await tx.budget.findFirst({
        where: { userId: user.id, month },
      })

      if (budget) {
        await tx.budget.update({
          where: { id: budget.id },
          data: { used: budget.used + totalSpent },
        })
      } else {
        await tx.budget.create({
          data: {
            userId: user.id,
            month,
            amount: 0,
            used: totalSpent,
          },
        })
      }
    })

    // Sync purchased items with pantry
    for (const item of items) {
      await upsertPantryItem(user.id, item.name, item.quantity, item.category || 'Altro')
    }

    revalidatePath('/budget')
    revalidatePath('/storico')
    revalidatePath('/dispensa')
    return { success: true }
  } catch (error) {
    console.error('Failed to add to history:', error)
    return { success: false, error: 'Failed to add to history' }
  }
}
