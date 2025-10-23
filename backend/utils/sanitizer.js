export function sanitizeInput(value) {
  if (!value || typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim();
}
