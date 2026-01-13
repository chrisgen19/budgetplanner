import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

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
    const { id } = await params

    await prisma.budgetItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
