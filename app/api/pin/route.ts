import { NextResponse } from 'next/server';
import { setPin } from '@/lib/pin-storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string' || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be a 4-digit number' }, { status: 400 });
    }

    await setPin(pin);

    return NextResponse.json({ success: true, message: 'PIN set successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}