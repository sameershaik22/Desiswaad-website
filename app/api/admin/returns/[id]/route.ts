import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// PATCH /api/admin/returns/[id] — approve or reject a return request (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${API_BASE}/api/admin/returns/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': ADMIN_SECRET,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Update return error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
