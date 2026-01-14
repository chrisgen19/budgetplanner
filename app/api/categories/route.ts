import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

// Default categories to seed for new users
export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Housing', color: 'indigo', order: 0 },
  { name: 'Food', color: 'orange', order: 1 },
  { name: 'Transport', color: 'amber', order: 2 },
  { name: 'Utilities', color: 'cyan', order: 3 },
  { name: 'Entertainment', color: 'rose', order: 4 },
  { name: 'Other', color: 'slate', order: 5 },
]

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', color: 'emerald', order: 0 },
  { name: 'Business', color: 'teal', order: 1 },
  { name: 'Freelance', color: 'green', order: 2 },
  { name: 'Investment', color: 'lime', order: 3 },
  { name: 'Other', color: 'gray', order: 4 },
]

export async function GET() {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: [{ type: 'asc' }, { order: 'asc' }],
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, color } = body

    if (!name || !type || !color) {
      return NextResponse.json({ error: 'Name, type, and color are required' }, { status: 400 })
    }

    // Get the highest order for this type
    const maxOrder = await prisma.category.aggregate({
      where: { userId: session.user.id, type },
      _max: { order: true },
    })

    const category = await prisma.category.create({
      data: {
        name,
        type,
        color,
        order: (maxOrder._max.order ?? -1) + 1,
        userId: session.user.id,
        isDefault: false,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
