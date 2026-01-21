// For Vercel serverless environment, use a global variable to persist PIN during server lifetime
declare global {
  var __PIN_STORAGE__: string | null | undefined;
}

// Initialize global PIN storage
if (!global.__PIN_STORAGE__) {
  global.__PIN_STORAGE__ = null;
}

export async function getPin(): Promise<string | null> {
  return global.__PIN_STORAGE__ ?? null;
}

export async function setPin(pin: string): Promise<void> {
  global.__PIN_STORAGE__ = pin;
}

export async function clearPin(): Promise<void> {
  global.__PIN_STORAGE__ = null;
}