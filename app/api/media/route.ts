import { NextResponse } from 'next/server';
import { EncryptionService } from '@/lib/crypt';
import fs from 'fs';
import path from 'path';

// Directory for saved media
const RECORDINGS_DIR = path.join(process.cwd(), 'public', 'recordings');

// Ensure recordings directory exists
if (!fs.existsSync(RECORDINGS_DIR)) {
    fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action } = body;

        if (action === 'save_frame') {
            // Get the latest frame from global storage
            const latestFrame = (global as any).latestFrame;

            if (!latestFrame) {
                return NextResponse.json({ error: 'No frame available' }, { status: 404 });
            }

            // Generate SHA-512 hash for integrity
            const frameBase64 = latestFrame.toString('base64');
            const hash = EncryptionService.hashSHA512(frameBase64);
            const shortHash = hash.substring(0, 16);

            // Generate filename
            const filename = `frame_${Date.now()}_${shortHash}.jpg`;
            const filepath = path.join(RECORDINGS_DIR, filename);

            // Save frame to disk
            fs.writeFileSync(filepath, latestFrame);


            return NextResponse.json({
                success: true,
                filename,
                hash,
                size: latestFrame.length,
                url: `/recordings/${filename}`
            });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Get list of saved recordings
        const files = fs.readdirSync(RECORDINGS_DIR);

        const recordings = files.map(file => {
            const stats = fs.statSync(path.join(RECORDINGS_DIR, file));
            return {
                filename: file,
                size: stats.size,
                created: stats.birthtime.getTime(),
                url: `/recordings/${file}`
            };
        }).sort((a, b) => b.created - a.created); // Sort by newest first

        return NextResponse.json({ recordings });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
