'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getRecipes() {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: recipes }
  } catch (error) {
    console.error('Failed to fetch recipes:', error)
    return { success: false, error: 'Failed to fetch recipes' }
  }
}

export async function addRecipe(data: { name: string; ingredients: string; instructions: string; category: string }) {
  try {
    const user = await prisma.user.findUnique({ where: { username: 'Arena' } })
    if (!user) return { success: false, error: 'User not found' }

    await prisma.recipe.create({
      data: {
        ...data,
        userId: user.id,
      },
    })
    revalidatePath('/ricette')
    return { success: true }
  } catch (error) {
    console.error('Failed to add recipe:', error)
    return { success: false, error: 'Failed to add recipe' }
  }
}

export async function deleteRecipe(id: string) {
  try {
    await prisma.recipe.delete({
      where: { id },
    })
    revalidatePath('/ricette')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete recipe:', error)
    return { success: false, error: 'Failed to delete recipe' }
  }
}
