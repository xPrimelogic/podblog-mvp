import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// In-memory storage (for testing - use database in production)
const users = new Map<string, { username: string; password: string }>();

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    if (users.has(username)) {
      return NextResponse.json(
        { error: 'User exists' },
        { status: 400 }
      );
    }
    
    const hash = await bcrypt.hash(password, 10);
    users.set(username, { username, password: hash });
    
    return NextResponse.json({ message: 'User created' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
