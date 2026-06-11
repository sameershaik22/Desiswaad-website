import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authHeader) headers.Authorization = authHeader

    const response = await fetch(`${API_BASE}/api/orders/user/my-orders`, {
      method: 'GET',
      headers,
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Get orders list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}