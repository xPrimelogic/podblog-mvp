import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token' },
        { status: 401 }
      );
    }
    
    const user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    return NextResponse.json({
      message: 'Access granted',
      user
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
