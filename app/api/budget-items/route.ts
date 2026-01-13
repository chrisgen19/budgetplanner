import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.budgetItem.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching budget items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const item = await prisma.budgetItem.create({
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

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating budget item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
