'use server'

import prisma from '@/lib/prisma'
import { getOrCreateArenaUser } from '@/lib/user'
import { revalidatePath } from 'next/cache'
import { upsertPantryItem } from './pantry'

export async function getShoppingList() {
  try {
    const user = await getOrCreateArenaUser()
    const items = await prisma.shoppingItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: items }
  } catch (error) {
    console.error('Failed to fetch shopping list:', error)
    return { success: false, error: 'Failed to fetch items' }
  }
}

export async function addShoppingItem(formData: FormData) {
  const name = formData.get('name') as string
  const quantity = formData.get('quantity') as string
  const category = formData.get('category') as string

  if (!name || !quantity) {
    return { success: false, error: 'Name and quantity are required' }
  }

  try {
    const user = await getOrCreateArenaUser()

    await prisma.shoppingItem.create({
      data: {
        name,
        quantity,
        category: category || 'Altro',
        userId: user.id,
      },
    })

    revalidatePath('/lista-spesa')
    return { success: true }
  } catch (error) {
    console.error('Failed to add item:', error)
    return { success: false, error: 'Failed to add item' }
  }
}

export async function toggleShoppingItem(id: string, checked: boolean) {
  try {
    await prisma.shoppingItem.update({
      where: { id },
      data: { checked },
    })
    revalidatePath('/lista-spesa')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle item:', error)
    return { success: false, error: 'Failed to toggle item' }
  }
}

export async function deleteShoppingItem(id: string) {
  try {
    await prisma.shoppingItem.delete({
      where: { id },
    })
    revalidatePath('/lista-spesa')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete item:', error)
    return { success: false, error: 'Failed to delete item' }
  }
}

export async function updateShoppingItem(id: string, name: string, quantity: string, category: string) {
  try {
    await prisma.shoppingItem.update({
      where: { id },
      data: { name, quantity, category },
    })
    revalidatePath('/lista-spesa')
    return { success: true }
  } catch (error) {
    console.error('Failed to update shopping item:', error)
    return { success: false, error: 'Failed to update item' }
  }
}
export async function moveShoppingItemToPantry(id: string) {
  try {
    const item = await prisma.shoppingItem.findUnique({ where: { id } })
    if (!item) return { success: false, error: 'Item not found' }

    await upsertPantryItem(item.userId, item.name, item.quantity, item.category)
    await prisma.shoppingItem.delete({ where: { id } })

    revalidatePath('/lista-spesa')
    revalidatePath('/dispensa')
    return { success: true }
  } catch (error) {
    console.error('Failed to move item to pantry:', error)
    return { success: false, error: 'Failed to move item' }
  }
}
