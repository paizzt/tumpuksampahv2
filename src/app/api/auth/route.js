import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'super-secret-tumpuk-sampah-key'; // In prod, use environment variable

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, password } = body;

    if (action === 'login') {
      const stmt = db.prepare('SELECT id, email, role FROM staff_users WHERE email = ? AND password = ?');
      const user = stmt.get(email, password);

      if (user) {
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        
        cookies().set('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24, // 1 day
          path: '/',
        });

        return NextResponse.json({ data: { user, session: { user, role: user.role } }, error: null });
      }

      return NextResponse.json({ data: null, error: { message: 'Email atau Password salah.' } }, { status: 401 });
    }

    if (action === 'logout') {
      cookies().delete('auth_token');
      return NextResponse.json({ error: null });
    }

    if (action === 'session') {
      const token = cookies().get('auth_token')?.value;
      if (!token) return NextResponse.json({ data: { session: null } });

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return NextResponse.json({ data: { session: { user: { id: decoded.id, email: decoded.email }, role: decoded.role } } });
      } catch (err) {
        cookies().delete('auth_token');
        return NextResponse.json({ data: { session: null } });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
