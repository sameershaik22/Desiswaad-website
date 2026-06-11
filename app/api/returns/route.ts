import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// POST /api/returns — submit a return/issue request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(`${API_BASE}/api/returns`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Submit return error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/returns — fetch return requests (for user)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const url = orderId
      ? `${API_BASE}/api/returns?order_id=${orderId}`
      : `${API_BASE}/api/returns`;

    const response = await fetch(url, { method: 'GET', headers });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Get returns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
