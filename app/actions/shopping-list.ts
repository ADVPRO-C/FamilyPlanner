'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getShoppingList() {
  try {
    // In a real app, we would get the userId from the session
    // For this single-user app, we'll fetch all items or filter by a hardcoded user if needed
    // Assuming all items belong to "Arena" for now
    const items = await prisma.shoppingItem.findMany({
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
    // Hardcoded userId for "Arena"
    // In production, fetch this from the user table or session
    // For now, let's assume we need to find or create the user first if not exists?
    // Or just use a dummy UUID if foreign key constraints allow?
    // Prisma requires a valid foreign key.
    // We should probably ensure the user exists in the seed or init.
    // For this code, I'll assume a user exists or I'll create one on the fly?
    // Better: Find the user "Arena", if not found create it.
    
    let user = await prisma.user.findUnique({ where: { username: 'Arena' } })
    if (!user) {
      user = await prisma.user.create({
        data: { username: 'Arena', password: 'hashed_password_placeholder' }
      })
    }

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
