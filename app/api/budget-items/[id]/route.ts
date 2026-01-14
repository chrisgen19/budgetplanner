import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const existingItem = await prisma.budgetItem.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const item = await prisma.budgetItem.update({
      where: { id },
      data: {
        type: body.type,
        name: body.name,
        amount: parseFloat(body.amount),
        category: body.category,
        frequency: body.frequency,
        startDate: body.startDate,
        endDate: body.endDate || null,
        selectedDays: body.selectedDays || [],
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating budget item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existingItem = await prisma.budgetItem.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await prisma.budgetItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
