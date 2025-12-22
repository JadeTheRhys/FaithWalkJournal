const db = require('../db/database');

// Maximum content length
const MAX_CONTENT_LENGTH = 2000;

/**
 * Checks content against configured word filters
 * @param {string} content - The content to check
 * @returns {Object} - { isClean: boolean, flaggedWords: string[], highestSeverity: string }
 */
function checkContent(content) {
  if (!content || typeof content !== 'string') {
    return { isClean: true, flaggedWords: [], highestSeverity: null };
  }

  const lowerContent = content.toLowerCase();
  const filters = db.prepare('SELECT word, severity FROM word_filters').all();
  
  const flaggedWords = [];
  let highestSeverity = null;
  const severityRank = { low: 1, medium: 2, high: 3 };

  for (const filter of filters) {
    // Escape special regex characters to prevent ReDoS attacks
    const escapedWord = filter.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Check for whole word matches using word boundaries
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    if (regex.test(lowerContent)) {
      flaggedWords.push(filter.word);
      
      // Track highest severity
      if (!highestSeverity || severityRank[filter.severity] > severityRank[highestSeverity]) {
        highestSeverity = filter.severity;
      }
    }
  }

  return {
    isClean: flaggedWords.length === 0,
    flaggedWords,
    highestSeverity
  };
}

/**
 * Sanitize content for safe storage and display
 * @param {string} content - The content to sanitize
 * @returns {string} - Sanitized content
 */
function sanitizeContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove script tags and potentially harmful content
  let sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > MAX_CONTENT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_CONTENT_LENGTH);
  }

  return sanitized;
}

module.exports = {
  checkContent,
  sanitizeContent,
  MAX_CONTENT_LENGTH
};
