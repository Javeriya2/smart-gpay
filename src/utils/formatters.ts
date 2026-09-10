/**
 * Formats a number into Indian Rupee currency standard (₹)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats date into readable format e.g. "Sep 6, 2026 • 2:45 PM"
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return 'Recently';

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

/**
 * Extracts initials from a contact name (e.g., "Rahul Sharma" -> "RS")
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

/**
 * Masks VPA for security e.g. "rahul.blr@okaxis" -> "rah***@okaxis"
 */
export const maskVpa = (vpa: string): string => {
  if (!vpa || !vpa.includes('@')) return vpa;
  const [handle, provider] = vpa.split('@');
  if (handle.length <= 3) return `${handle}***@${provider}`;
  return `${handle.substring(0, 3)}***@${provider}`;
};
