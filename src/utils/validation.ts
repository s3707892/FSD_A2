// check email format (e.g. xxx@gmail.com)
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) 
    return 'Email is required.';
  const emailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailformat.test(email)) 
    return 'Please enter a valid email address.';
  return null;
};

// password: min 6 chars, 1 uppercase, 1 lowercase, 1 special character
export const validatePassword = (password: string): string | null => {
  if (!password)
    return 'Password is required.';
  if (password.length < 6)
    return 'Password must be at least 6 characters.';
  if (!/[A-Z]/.test(password))
    return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password))
    return 'Password must contain at least one lowercase letter.';
  if (!/[^A-Za-z0-9]/.test(password))
    return 'Password must contain at least one special character.';
  return null;
};

// validate name (cant be too short"
export const validateName = (name: string): string | null => {
  if (!name.trim()) 
    return 'Name is required.';
  if (name.trim().length < 2) 
    return 'Name must be at least 2 characters.';
  return null;
};

// validate australian phone numbers only
export const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) 
    return 'Phone number is required.';

  const phoneformat = /^(\+?61|0)[2-478](\s?\d){8}$/;
  if (!phoneformat.test(phone.replace(/\s/g, ''))) 
    return 'Please enter a valid Australian phone number.';
  return null;
};

// guests must be positive and under venue limit
export const validateExpectedGuests = (
  value: string, 
  fieldName: string, 
  capacity: number
 ): string | null => {
  if (!value) 
    return `${fieldName} is required.`;
  const n = parseInt(value, 10);
  if (isNaN(n) || n <= 0) 
    return `${fieldName} must be a positive number.`;
  if (capacity && n > capacity) 
    return `${fieldName} cannot exceed venue capacity of ${capacity}.`;
  return null;
};

// event date has to be today or later
export const validateFutureDate = (date: string): string | null => {
  if (!date) 
    return 'Date is required.';
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selected < today) 
    return 'Event date must be in the future.';
  return null;
};

// empty field check
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value.trim()) 
    return `${fieldName} is required.`;
  return null;
};

// check for duration between 1 and 24 hours
export const validateDuration = (value: string): string | null => {
  if (!value) 
    return 'Duration is required.';
  const n = parseFloat(value);
  if (isNaN(n) || n < 1 || n > 24) 
    return 'Duration must be between 1 and 24 hours.';
  return null;
};

// abn must be 10 chars if filled in
export const validateABN = (abn: string): string | null => {
  if (abn.length !== 0) {
    if (abn.length !== 10) 
      return 'ABN must be exactly 10 characters.';
  }
  return null;
}