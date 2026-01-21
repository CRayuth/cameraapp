import { promises as fs } from 'fs';
import path from 'path';

const PIN_FILE_PATH = path.join(process.cwd(), 'temp-pin-storage.json');

interface PinStorage {
  pin: string | null;
}

// Initialize PIN file if it doesn't exist
async function initializePinFile(): Promise<void> {
  try {
    await fs.access(PIN_FILE_PATH);
  } catch {
    // File doesn't exist, create it
    const initialData: PinStorage = { pin: null };
    await fs.writeFile(PIN_FILE_PATH, JSON.stringify(initialData, null, 2));
  }
}

export async function getPin(): Promise<string | null> {
  try {
    await initializePinFile();
    const data = await fs.readFile(PIN_FILE_PATH, 'utf8');
    const parsed = JSON.parse(data) as PinStorage;
    return parsed.pin;
  } catch (error) {
    console.error('Error reading PIN:', error);
    return null;
  }
}

export async function setPin(pin: string): Promise<void> {
  try {
    await initializePinFile();
    const data: PinStorage = { pin };
    await fs.writeFile(PIN_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error setting PIN:', error);
  }
}

export async function clearPin(): Promise<void> {
  try {
    await initializePinFile();
    const data: PinStorage = { pin: null };
    await fs.writeFile(PIN_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error clearing PIN:', error);
  }
}