import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../route'

export async function POST() {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has categories
    const existingCategories = await prisma.category.findFirst({
      where: { userId: session.user.id },
    })

    if (existingCategories) {
      return NextResponse.json(
        { error: 'Categories already exist for this user' },
        { status: 400 }
      )
    }

    // Create default expense categories
    const expenseCategories = DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
      ...cat,
      type: 'expense',
      isDefault: true,
      userId: session.user.id,
    }))

    // Create default income categories
    const incomeCategories = DEFAULT_INCOME_CATEGORIES.map((cat) => ({
      ...cat,
      type: 'income',
      isDefault: true,
      userId: session.user.id,
    }))

    await prisma.category.createMany({
      data: [...expenseCategories, ...incomeCategories],
    })

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: [{ type: 'asc' }, { order: 'asc' }],
    })

    return NextResponse.json(categories, { status: 201 })
  } catch (error) {
    console.error('Error seeding categories:', error)
    return NextResponse.json({ error: 'Failed to seed categories' }, { status: 500 })
  }
}
