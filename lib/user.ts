import prisma from '@/lib/prisma'

/**
 * Returns the default single-user account ("Arena") creating it if needed.
 */
export async function getOrCreateArenaUser() {
  let user = await prisma.user.findUnique({ where: { username: 'Arena' } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'Arena',
        password: 'hashed_password_placeholder',
      },
    })
  }

  return user
}
