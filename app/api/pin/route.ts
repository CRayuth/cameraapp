import { NextResponse } from 'next/server';
import { setPin, getPin } from '@/lib/pin-storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;

    console.log('Setting PIN:', pin);
    
    if (!pin || typeof pin !== 'string' || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be a 4-digit number' }, { status: 400 });
    }

    await setPin(pin);
    
    // Verify the PIN was set
    const storedPin = await getPin();
    console.log('Stored PIN:', storedPin);

    return NextResponse.json({ 
      success: true, 
      message: 'PIN set successfully',
      debug: { storedPin }
    });
  } catch (error) {
    console.error('PIN API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}