import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validations/auth'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, email, password } = registerSchema
      .omit({ confirmPassword: true })
      .parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-Mail bereits registriert' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        hashedPassword,
      },
    })

    // Create default team with welcome credits
    const slug = `team-${user.id.slice(0, 8)}`
    const team = await db.team.create({
      data: {
        name: `${name}s Team`,
        slug,
        ownerId: user.id,
        credits: 50, // Welcome credits
      },
    })

    // Add user as team owner
    await db.teamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: 'OWNER',
      },
    })

    // Log welcome credits
    await db.creditLedger.create({
      data: {
        teamId: team.id,
        userId: user.id,
        amount: 50,
        balance: 50,
        type: 'BONUS',
        description: 'Willkommensbonus',
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungueltige Eingabe', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registrierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}
