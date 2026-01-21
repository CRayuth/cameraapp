// Access key storage with getter/setter functions
let _accessKey: string | null = null;

export function getAccessKey(): string | null {
  return _accessKey;
}

export function setAccessKey(key: string | null): void {
  _accessKey = key;
}