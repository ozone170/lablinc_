// URL validation utility
function isValidUrl(str) {
  if (!str) return false;
  try {
    const url = new URL(str);
    // Restrict to http/https protocols
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { isValidUrl };
