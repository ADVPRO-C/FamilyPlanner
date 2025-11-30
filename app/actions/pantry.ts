'use server'

import prisma from '@/lib/prisma'
import { getOrCreateArenaUser } from '@/lib/user'
import { revalidatePath } from 'next/cache'

export async function getPantryItems() {
  try {
    const user = await getOrCreateArenaUser()
    const items = await prisma.pantryItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: items }
  } catch (error) {
    console.error('Failed to fetch pantry items:', error)
    return { success: false, error: 'Failed to fetch items' }
  }
}

export async function addPantryItem(formData: FormData) {
  const name = formData.get('name') as string
  const quantity = formData.get('quantity') as string
  const category = formData.get('category') as string

  if (!name || !quantity) {
    return { success: false, error: 'Name and quantity are required' }
  }

  try {
    const user = await getOrCreateArenaUser()

    await prisma.pantryItem.create({
      data: {
        name,
        quantity,
        category: category || 'Altro',
        userId: user.id,
      },
    })

    revalidatePath('/dispensa')
    return { success: true }
  } catch (error) {
    console.error('Failed to add pantry item:', error)
    return { success: false, error: 'Failed to add item' }
  }
}

export async function deletePantryItem(id: string) {
  try {
    await prisma.pantryItem.delete({
      where: { id },
    })
    revalidatePath('/dispensa')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete pantry item:', error)
    return { success: false, error: 'Failed to delete item' }
  }
}

export async function moveToShoppingList(id: string) {
  try {
    const item = await prisma.pantryItem.findUnique({ where: { id } })
    if (!item) return { success: false, error: 'Item not found' }

    // Add to shopping list
    await prisma.shoppingItem.create({
      data: {
        name: item.name,
        quantity: item.quantity, // Default to 1 or keep quantity? Requirement says "sposta", implies moving the item.
        // Usually when moving to shopping list, we want to buy it, so maybe quantity 1?
        // Or keep the quantity from pantry (which might be 0 or low)?
        // Let's assume we want to buy the same item.
        category: item.category,
        userId: item.userId,
      },
    })

    // Optionally delete from pantry or keep it with 0 quantity?
    // Requirement: "Modifica quantità o elimina prodotti." "Funzione 'sposta su Lista della Spesa'".
    // Often pantry apps keep the item but mark as 0, or just add to shopping list without deleting.
    // "Sposta" implies moving. But usually you still have the empty container in pantry?
    // Let's just add to shopping list and maybe keep in pantry?
    // If I "move" it, maybe I ran out.
    // Let's just add to shopping list. The user can delete from pantry if they want, or maybe we update quantity to 0?
    // I'll just add to shopping list for now.
    
    revalidatePath('/lista-spesa')
    revalidatePath('/dispensa')
    return { success: true }
  } catch (error) {
    console.error('Failed to move item:', error)
    return { success: false, error: 'Failed to move item' }
  }
}

export async function updatePantryItem(id: string, quantity: string, category: string) {
  try {
    await prisma.pantryItem.update({
      where: { id },
      data: { quantity, category },
    })
    revalidatePath('/dispensa')
    return { success: true }
  } catch (error) {
    console.error('Failed to update pantry item:', error)
    return { success: false, error: 'Failed to update pantry item' }
  }
}
