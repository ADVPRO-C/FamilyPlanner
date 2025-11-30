'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

export async function getBudget(month: string) {
  // month format: YYYY-MM
  try {
    const budget = await prisma.budget.findFirst({
      where: { month }, // Add userId check in real app
    })
    return { success: true, data: budget }
  } catch (error) {
    console.error('Failed to fetch budget:', error)
    return { success: false, error: 'Failed to fetch budget' }
  }
}

export async function setBudget(month: string, amount: number) {
  try {
    const user = await prisma.user.findUnique({ where: { username: 'Arena' } })
    if (!user) return { success: false, error: 'User not found' }

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

export async function getHistory(month: string) {
  try {
    const history = await prisma.historyItem.findMany({
      where: { month },
      orderBy: { date: 'desc' },
    })
    return { success: true, data: history }
  } catch (error) {
    console.error('Failed to fetch history:', error)
    return { success: false, error: 'Failed to fetch history' }
  }
}

export async function addToHistory(items: { name: string; quantity: string; price: number }[]) {
  try {
    const user = await prisma.user.findUnique({ where: { username: 'Arena' } })
    if (!user) return { success: false, error: 'User not found' }

    const month = format(new Date(), 'yyyy-MM')
    const totalSpent = items.reduce((acc, item) => acc + item.price, 0)

    // Create history items
    await prisma.$transaction(
      items.map(item => 
        prisma.historyItem.create({
          data: {
            month,
            product: item.name,
            quantity: item.quantity,
            price: item.price,
            userId: user.id,
          },
        })
      )
    )

    // Update budget
    const budget = await prisma.budget.findFirst({
      where: { userId: user.id, month },
    })

    if (budget) {
      await prisma.budget.update({
        where: { id: budget.id },
        data: { used: budget.used + totalSpent },
      })
    } else {
      // Create budget if not exists (optional, or just track usage)
      await prisma.budget.create({
        data: {
          userId: user.id,
          month,
          amount: 0, // Default 0 if not set
          used: totalSpent,
        },
      })
    }

    revalidatePath('/budget')
    revalidatePath('/storico')
    return { success: true }
  } catch (error) {
    console.error('Failed to add to history:', error)
    return { success: false, error: 'Failed to add to history' }
  }
}
