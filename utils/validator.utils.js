export class Validator {
  //====================================================
  //  PUBLIC VALIDATION METHODS
  //====================================================

  static validateEmail(email) {
    if (!email) return false

    // RFC 5322–lite (safe, practical)
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/

    return emailRegex.test(email)
  }

  static validatePhone(phone, options = {}) {
    if (!phone) return false

    const {
      minLength = 10,
      maxLength = 15
    } = options

    // digits only
    const digitsOnly = /^\d+$/

    if (!digitsOnly.test(phone)) return false
    if (phone.length < minLength || phone.length > maxLength) return false

    return true
  }

  static validateDob(dob) {
    if (!dob) return false

    // Accepts: YYYY-MM-DD or ISO strings
    const date = new Date(dob)

    if (Number.isNaN(date.getTime())) return false

    // DOB must be in the past
    const now = new Date()
    if (date >= now) return false

    return true
  }

  static validateGender(gender, allowed = ['male', 'female', 'other']) {
    if (!gender) return false

    return allowed.includes(gender.toLowerCase())
  }

  //====================================================
  //  COMPOSITE VALIDATION
  //====================================================

  static validateUserPayload(payload) {
    const errors = []

    if (payload.email && !this.validateEmail(payload.email)) {
      errors.push('Invalid email format')
    }

    if (payload.phone && !this.validatePhone(payload.phone)) {
      errors.push('Invalid phone number')
    }

    if (payload.dob && !this.validateDob(payload.dob)) {
      errors.push('Invalid date of birth')
    }

    if (payload.gender && !this.validateGender(payload.gender)) {
      errors.push('Invalid gender value')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
