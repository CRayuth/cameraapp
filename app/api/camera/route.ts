import { NextResponse } from 'next/server';
import { EncryptionService } from '@/lib/crypt';
import { keyStore } from '@/lib/ks';
import { getPin } from '@/lib/pin-storage';

// Mock storage for latest frame in memory
let latestFrame: Buffer | null = null;

export async function GET() {
    if (!latestFrame) {
        return new NextResponse('No frame available', { status: 404 });
    }

    // Return the latest frame as an image
    return new NextResponse(new Uint8Array(latestFrame), {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Key Registration Handling
        if (body.type === 'register_key') {
            const { version, key, accessKey: receivedAccessKey } = body;

            if (!version || !key) {
                return NextResponse.json({ error: 'Missing version or key' }, { status: 400 });
            }

            // Validate PIN if provided
            const currentPin = await getPin();
            console.log('Camera API - Current stored PIN:', currentPin);
            console.log('Camera API - Received PIN:', receivedAccessKey);
            
            if (receivedAccessKey) {
                
                // Check if PIN exists and matches
                if (currentPin === null) {
                    console.log('Camera API - No PIN set on web interface');
                    return NextResponse.json({ error: 'PIN not set on web interface' }, { status: 401 });
                } else if (currentPin !== receivedAccessKey) {
                    // PIN doesn't match the stored one
                    console.log('Camera API - PIN mismatch. Stored:', currentPin, 'Received:', receivedAccessKey);
                    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
                } else {
                    console.log('Camera API - PIN validation successful');
                }
            } else {
                if (currentPin !== null) {
                    // PIN is required but wasn't provided
                    console.log('Camera API - PIN required but not provided');
                    return NextResponse.json({ error: 'PIN required' }, { status: 401 });
                }
            }

            keyStore[version] = key;

            return NextResponse.json({ success: true, message: 'Key registered successfully' });
        }

        // 2. Encrypted Data Handling
        if (body.type === 'data') {
            const { encryptedContent, keyVersion, encryptionDate, iv } = body;

            if (!encryptedContent || !keyVersion || !iv) {
                return NextResponse.json({ error: 'Invalid encrypted data format' }, { status: 400 });
            }

            const storedKey = keyStore[keyVersion];
            if (!storedKey) {
                return NextResponse.json({ error: `Key not found for version: ${keyVersion}` }, { status: 404 });
            }

            // console.log(`[API] Received data encrypted with version: ${keyVersion}`);

            try {
                const decryptedData = EncryptionService.decryptAES(encryptedContent, storedKey, iv);

                // Store the decrypted data as the latest frame
                // Assuming the decrypted data is a raw image buffer string
                latestFrame = Buffer.from(decryptedData, 'base64');

                // Also store in global for media route access
                (global as any).latestFrame = latestFrame;


                return NextResponse.json({
                    success: true,
                    message: 'Data received and decrypted',
                    decryptedLength: decryptedData.length
                });

            } catch (error) {
                return NextResponse.json({ error: 'Decryption failed' }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Unknown request type' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}