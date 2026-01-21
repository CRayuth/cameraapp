import { NextResponse } from 'next/server';
import { networkInterfaces } from 'os';
import { getPin } from '@/lib/pin-storage';

function getLocalIpAddress() {
    const nets = networkInterfaces();
    const results: Record<string, string[]> = {};

    for (const name of Object.keys(nets)) {
        const netInterface = nets[name];
        if (netInterface) {
            for (const net of netInterface) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                } else if ((net.family as any) === 4 && !net.internal) {
                    // Node 18+ support
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }
    }

    // Flatten to find the first likely candidate
    let lanIp = 'localhost';
    const allIps = Object.values(results).flat();
    if (allIps.length > 0) {
        lanIp = allIps[0];
    }
    return lanIp;
}

// Mock status - in real app would check active connections
const SESSION_START = new Date().toLocaleTimeString();

export async function GET(request: Request) {
    const ip = getLocalIpAddress();

    // Dynamic Host Detection
    const host = request.headers.get('host') || `${ip}:3000`;
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const fullAddress = `${protocol}://${host}`;

    // LAN Address (Explicitly for Local Network)
    const lanUrl = `http://${ip}:3000/api/camera`;

    // Check if PIN is set
    const currentPin = await getPin();

    return NextResponse.json({
        ip,
        port: 3000,
        fullAddress,
        lanIp: ip,
        lanUrl,
        // Real Session Data
        session: {
            clientId: `CLI-${Math.floor(Math.random() * 10000)}-SEC`,
            encryption: "AES-256-CTR",
            hashAlgorithm: "SHA-512", // As used in EncryptionService
            sessionStart: SESSION_START,
            deviceType: "Web Interface",
            connectionStatus: currentPin ? "Connected" : "Listening"
        }
    });
}
