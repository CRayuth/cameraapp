import { NextResponse } from 'next/server';
import { EncryptionService } from '@/lib/crypt';
import { keyStore } from '@/lib/ks';
import { getPin } from '@/lib/pin-storage';

// In-memory queue for pending commands
let commandQueue: Array<{
    commandId: string;
    encryptedContent: string;
    keyVersion: string;
    iv: string;
    timestamp: number;
}> = [];

// Clean up old commands (older than 5 seconds)
function cleanupOldCommands() {
    const now = Date.now();
    commandQueue = commandQueue.filter(cmd => (now - cmd.timestamp) < 5000);
}

// POST: Receive command from website and encrypt it
export async function POST(request: Request) {
    try {
        // Check if there's an active connection by verifying PIN exists
        const currentPin = await getPin();
        if (!currentPin) {
            return NextResponse.json({ error: 'No active connection. Please connect from the mobile app first.' }, { status: 401 });
        }
        
        const body = await request.json();
        const { action, commandId } = body;

        if (!action || !commandId) {
            return NextResponse.json({ error: 'Missing action or commandId' }, { status: 400 });
        }

        // Get the latest key version (assuming 'v1' for now)
        const keyVersion = 'v1';
        const storedKey = keyStore[keyVersion];

        if (!storedKey) {
            return NextResponse.json({ error: 'No encryption key registered' }, { status: 400 });
        }

        // Encrypt the command
        const iv = EncryptionService.generateIV();
        const commandData = JSON.stringify({ action, timestamp: Date.now(), commandId });
        const encryptedContent = EncryptionService.encryptAES(commandData, storedKey, iv);

        // Add encrypted command to queue
        commandQueue.push({
            commandId,
            encryptedContent,
            keyVersion,
            iv,
            timestamp: Date.now()
        });


        return NextResponse.json({
            success: true,
            message: 'Command queued',
            commandId
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET: Phone polls for pending commands
export async function GET() {
    try {
        cleanupOldCommands();

        if (commandQueue.length === 0) {
            return NextResponse.json({ commands: [] });
        }

        // Return all pending commands and clear queue
        const commands = [...commandQueue];
        commandQueue = [];


        return NextResponse.json({ commands });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
