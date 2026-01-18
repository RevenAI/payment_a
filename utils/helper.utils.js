
export class Helpers {

static sanitizeAndEscape(input) {
  if (typeof input !== 'string') {
    throw new Error('Expected a string')
  }

  // Step 1: Trim whitespace
  let sanitized = input.trim()

  // Step 2: Collapse multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ')

  // Step 3: Remove control characters (non-printable)
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

  // Step 4: Escape HTML special characters
  sanitized = sanitized.replace(/[&<>"']/g, (char) => {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return escapeMap[char]
  })

  return sanitized
}

}