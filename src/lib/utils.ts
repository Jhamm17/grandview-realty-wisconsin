// Utility function to clean up property status text
export function cleanStatusText(status?: string | null): string {
  if (!status) return 'N/A';
  
  // Remove common prefixes and clean up the text
  let cleaned = status
    .replace(/^MRD\s*/i, '') // Remove MRD prefix
    .replace(/^Active\s+Under\s+Contract/i, 'Under Contract') // Standardize "Active Under Contract"
    .replace(/^ActiveUnderContract/i, 'Under Contract') // Standardize "ActiveUnderContract"
    .replace(/^Pending/i, 'Under Contract') // Standardize "Pending"
    .replace(/^Contingent/i, 'Under Contract') // Standardize "Contingent"
    .trim();
  
  // Capitalize first letter of each word
  cleaned = cleaned.replace(/\b\w/g, l => l.toUpperCase());
  
  return cleaned;
}

// Helper function to get property status (StandardStatus or MlsStatus fallback)
export function getPropertyStatus(property: { StandardStatus?: string; MlsStatus?: string }): string {
  return property.StandardStatus || property.MlsStatus || 'Unknown';
} 