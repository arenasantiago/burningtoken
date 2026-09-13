const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export const INPUT_LIMITS = {
  claimMin: 8,
  claimMax: 1000,
  titleMax: 80,
  nicknameMin: 2,
  nicknameMax: 24,
  aiRequestsPerMinute: 5,
} as const;

function boundedText(value: string, label: string, min: number, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (CONTROL_CHARACTERS.test(value)) throw new Error(`${label} contiene caracteres no permitidos.`);
  if (clean.length < min) throw new Error(`${label} debe tener al menos ${min} caracteres.`);
  if (clean.length > max) throw new Error(`${label} no puede superar ${max} caracteres.`);
  return clean;
}

export function validateClaimText(value: string): string {
  return boundedText(value, "La afirmación", INPUT_LIMITS.claimMin, INPUT_LIMITS.claimMax);
}

export function validateRoomTitle(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean) return "Truth Tribunal";
  return boundedText(clean, "El título", 1, INPUT_LIMITS.titleMax);
}

export function validateNickname(value: string): string {
  return boundedText(value, "El apodo", INPUT_LIMITS.nicknameMin, INPUT_LIMITS.nicknameMax);
}

export function validateVoterId(value: string): string {
  if (!/^voter_(?:[a-z0-9]{6}|[a-f0-9]{32})$/.test(value)) {
    throw new Error("La identidad del jurado no es válida. Recarga la página.");
  }
  return value;
}

export function validateRoomCode(value: string): string {
  let clean = value.toUpperCase().trim();
  if (!clean.startsWith("HYPE-") && /^[A-Z0-9]+$/.test(clean)) clean = `HYPE-${clean}`;
  if (!/^HYPE-(?:\d{3}|[A-HJ-NP-Z2-9]{6})$/.test(clean)) throw new Error("El código de sala no es válido.");
  return clean;
}

export function validateSourceUrl(value?: string): string | undefined {
  if (value === undefined || !value.trim()) return undefined;
  if (value.length > 2048) throw new Error("La URL de origen es demasiado larga.");
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error("La URL de origen debe usar HTTP o HTTPS y no incluir credenciales.");
  }
  return parsed.href;
}
