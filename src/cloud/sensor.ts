import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import type { SensorMethod } from './types';

export type SensorOutcome =
  | { ok: true; method: SensorMethod }
  | { ok: false; reason: string; unavailable: boolean };

const cancelled = new Set(['user_cancel', 'app_cancel', 'system_cancel']);

function methodFromTypes(types: LocalAuthentication.AuthenticationType[]): SensorMethod {
  const facial = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  const finger = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
  const iris = types.includes(LocalAuthentication.AuthenticationType.IRIS);
  if (facial && !finger && !iris) return 'rostro';
  if (iris && !finger && !facial) return 'iris';
  if (finger && !facial) return 'huella';
  if (Platform.OS === 'ios' && facial) return 'rostro';
  if (finger) return 'huella';
  if (facial) return 'rostro';
  return 'huella';
}

export async function confirmWithSensor(purpose: string): Promise<SensorOutcome> {
  if (Platform.OS === 'web') {
    return { ok: false, reason: 'Este navegador no tiene sensor biométrico.', unavailable: true };
  }

  const hardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = hardware ? await LocalAuthentication.isEnrolledAsync() : false;
  if (!hardware || !enrolled) {
    return {
      ok: false,
      reason: hardware
        ? 'No hay huella ni rostro registrados en el teléfono.'
        : 'Este aparato no tiene sensor de huella ni de rostro.',
      unavailable: true,
    };
  }

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: purpose,
    promptSubtitle: 'Faro confirma la checada con el sensor del teléfono',
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Código del teléfono',
    disableDeviceFallback: false,
  });

  if (!result.success) {
    const reason = result.error ?? 'authentication_failed';
    return {
      ok: false,
      reason: cancelled.has(reason) ? 'Se canceló la confirmación.' : 'El sensor no reconoció la identidad.',
      unavailable: reason === 'not_available' || reason === 'not_enrolled' || reason === 'passcode_not_set',
    };
  }

  return { ok: true, method: methodFromTypes(types) };
}
