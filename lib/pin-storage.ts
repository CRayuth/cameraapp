// For development environment, use file-based storage
// For Vercel serverless, use a combination of global variable and temporary file storage
import fs from 'fs';
import path from 'path';

const PIN_FILE_PATH = path.join(process.cwd(), 'temp-pin-storage.json');

interface PinStorage {
  pin: string | null;
}

// Initialize PIN file if it doesn't exist
function initializePinFile(): void {
  if (!fs.existsSync(PIN_FILE_PATH)) {
    const initialData: PinStorage = { pin: null };
    fs.writeFileSync(PIN_FILE_PATH, JSON.stringify(initialData, null, 2));
  }
}

// For Vercel serverless environment, use a global variable as fallback
declare global {
  var __PIN_STORAGE__: string | null | undefined;
}

// Initialize global PIN storage
if (typeof global.__PIN_STORAGE__ === 'undefined') {
  global.__PIN_STORAGE__ = null;
  
  // Try to load from file as initial value
  try {
    initializePinFile();
    const data = JSON.parse(fs.readFileSync(PIN_FILE_PATH, 'utf8')) as PinStorage;
    global.__PIN_STORAGE__ = data.pin;
  } catch (e) {
    // If file read fails, keep as null
  }
}

export async function getPin(): Promise<string | null> {
  // Try to read from file first (for Vercel consistency)
  try {
    initializePinFile();
    const data = JSON.parse(fs.readFileSync(PIN_FILE_PATH, 'utf8')) as PinStorage;
    // Update global with file value
    global.__PIN_STORAGE__ = data.pin;
    return data.pin;
  } catch (e) {
    // If file read fails, fall back to global
    return global.__PIN_STORAGE__ ?? null;
  }
}

export async function setPin(pin: string): Promise<void> {
  // Update both global and file
  global.__PIN_STORAGE__ = pin;
  
  try {
    initializePinFile();
    const data: PinStorage = { pin };
    fs.writeFileSync(PIN_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    // If file write fails, just keep global
    console.error('Error writing PIN to file:', e);
  }
}

export async function clearPin(): Promise<void> {
  // Update both global and file
  global.__PIN_STORAGE__ = null;
  
  try {
    initializePinFile();
    const data: PinStorage = { pin: null };
    fs.writeFileSync(PIN_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    // If file write fails, just keep global
    console.error('Error clearing PIN in file:', e);
  }
}