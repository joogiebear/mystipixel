// Basic profanity filter - extend this list as needed
const profanityList = [
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'crap', 'piss', 'dick', 'cock',
  'pussy', 'asshole', 'bastard', 'slut', 'whore', 'fag', 'nigger', 'chink'
];

// Common spam patterns
const spamPatterns = [
  /\b(viagra|cialis|pharmacy)\b/i,
  /\b(buy now|click here|limited time)\b/i,
  /\b(make money fast|work from home)\b/i,
  /(https?:\/\/.+){5,}/i, // More than 5 URLs
];

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

export function isSpam(text: string): boolean {
  return spamPatterns.some(pattern => pattern.test(text));
}

export function validateResourceTitle(title: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }

  if (title.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }

  if (title.length > 100) {
    return { valid: false, error: 'Title must be less than 100 characters' };
  }

  if (containsProfanity(title)) {
    return { valid: false, error: 'Title contains inappropriate language' };
  }

  if (isSpam(title)) {
    return { valid: false, error: 'Title appears to be spam' };
  }

  return { valid: true };
}

export function validateResourceDescription(description: string): { valid: boolean; error?: string } {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Description is required' };
  }

  if (description.length < 10) {
    return { valid: false, error: 'Description must be at least 10 characters' };
  }

  if (description.length > 500) {
    return { valid: false, error: 'Description must be less than 500 characters' };
  }

  if (containsProfanity(description)) {
    return { valid: false, error: 'Description contains inappropriate language' };
  }

  if (isSpam(description)) {
    return { valid: false, error: 'Description appears to be spam' };
  }

  return { valid: true };
}

export function validateZipFile(file: File): { valid: boolean; error?: string } {
  // Check file extension
  if (!file.name.endsWith('.zip')) {
    return { valid: false, error: 'File must be a ZIP archive' };
  }

  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' };
  }

  if (file.size < 100) {
    return { valid: false, error: 'File appears to be empty or corrupted' };
  }

  return { valid: true };
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Image must be JPG, PNG, GIF, or WebP' };
  }

  // Check file size (5MB limit for images)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  return { valid: true };
}

// Simple duplicate detection based on title similarity
export function checkSimilarTitle(newTitle: string, existingTitles: string[]): boolean {
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const newNormalized = normalize(newTitle);

  return existingTitles.some(existing => {
    const existingNormalized = normalize(existing);
    // Check if 80% similar
    const similarity = calculateSimilarity(newNormalized, existingNormalized);
    return similarity > 0.8;
  });
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Rate limiting helper
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, maxAttempts: number = 5, windowMs: number = 300000): { allowed: boolean; remainingTime?: number } {
  const now = Date.now();
  const userAttempts = uploadAttempts.get(userId);

  if (!userAttempts || now > userAttempts.resetTime) {
    // First attempt or window expired
    uploadAttempts.set(userId, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (userAttempts.count >= maxAttempts) {
    const remainingTime = Math.ceil((userAttempts.resetTime - now) / 1000);
    return { allowed: false, remainingTime };
  }

  userAttempts.count++;
  return { allowed: true };
}
