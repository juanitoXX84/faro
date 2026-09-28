import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { DeviceLink } from './types';

const LINK_KEY = 'faro.device.link';
const LABEL_KEY = 'faro.device.label';

function isLink(value: unknown): value is DeviceLink {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DeviceLink>;
  return typeof candidate.employeeId === 'string' && typeof candidate.at === 'number';
}

async function secureAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function readLink(): Promise<DeviceLink | null> {
  try {
    if (await secureAvailable()) {
      const raw = await SecureStore.getItemAsync(LINK_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return isLink(parsed) ? parsed : null;
    }
  } catch {
    return null;
  }
  const raw = await AsyncStorage.getItem(LINK_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isLink(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeLink(link: DeviceLink | null): Promise<void> {
  if (await secureAvailable()) {
    if (!link) {
      await SecureStore.deleteItemAsync(LINK_KEY);
      return;
    }
    await SecureStore.setItemAsync(LINK_KEY, JSON.stringify(link));
    return;
  }
  if (!link) {
    await AsyncStorage.removeItem(LINK_KEY);
    return;
  }
  await AsyncStorage.setItem(LINK_KEY, JSON.stringify(link));
}

export async function saveLink(employeeId: string): Promise<DeviceLink> {
  const link = { employeeId, at: Date.now() };
  await writeLink(link);
  return link;
}

export async function deviceLabel(): Promise<string> {
  const existing = await AsyncStorage.getItem(LABEL_KEY);
  if (existing) return existing;
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const label = Platform.OS === 'web' ? `Navegador ${suffix}` : `Teléfono ${suffix}`;
  await AsyncStorage.setItem(LABEL_KEY, label);
  return label;
}
