import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/auth'

// Mock user database - in production, this would be a real database
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@optibid.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    company: 'OptiBid Energy',
    organizationId: 'org_1',
    organization_id: 'org_1',
    permissions: [
      'dashboard.view', 'dashboard.create', 'dashboard.edit', 'dashboard.delete',
      'widget.view', 'widget.create', 'widget.edit', 'widget.delete',
      'data.view-energy', 'data.view-market', 'data.view-asset',
      'admin.users', 'admin.roles', 'admin.system'
    ]
  },
  {
    id: '2',
    email: 'demo@optibid.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    role: 'trader',
    company: 'Demo Company',
    organizationId: 'org_2',
    organization_id: 'org_2',
    permissions: [
      'dashboard.view', 'dashboard.create', 'dashboard.edit',
      'widget.view', 'widget.create', 'widget.edit',
      'data.view-energy', 'data.view-market'
    ]
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json(
        { detail: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // For demo purposes, accept specific passwords for each test account
    // In production, use: const isValidPassword = await bcrypt.compare(password, user.password)
    let isValidPassword = false
    
    if (user.email === 'admin@optibid.com' && password === 'admin123') {
      isValidPassword = true
    } else if (user.email === 'demo@optibid.com' && password === 'demo123') {
      isValidPassword = true
    }

    if (!isValidPassword) {
      console.log(`Login failed for ${email}: Invalid password`)
      return NextResponse.json(
        { detail: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    console.log(`Login successful for ${email}`)

    // Generate tokens with extended expiration
    const accessToken = generateToken(user.id, user.email, user.role, '7d')  // 7 days
    const refreshToken = generateToken(user.id, user.email, user.role, '30d')  // 30 days

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
