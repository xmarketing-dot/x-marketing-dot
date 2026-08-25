export function formatWhatsAppNumber(num: string): string {
  let clean = (num || '').replace(/\D/g, '');
  if (!clean) return '905000000000';
  // Standard Turkish mobile 05xx... -> 905xx...
  if (clean.startsWith('0') && clean.length === 11) {
    clean = '90' + clean.slice(1);
  } else if (clean.length === 10 && clean.startsWith('5')) {
    // Standard Turkish mobile 5xx... -> 905xx...
    clean = '90' + clean;
  }
  // International numbers or fallback
  return clean;
}
