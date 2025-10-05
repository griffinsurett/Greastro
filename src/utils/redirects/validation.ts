// src/utils/redirects/validation.ts
/**
 * Redirect-Specific Validation
 * 
 * Validates redirect entries for security and correctness.
 * Checks for conflicts, circular redirects, and security issues.
 */

import { isValidPath, getPathValidationError } from '../pathValidation';
import type { RedirectEntry, ValidationResult } from './types';

/**
 * Validate a single redirect entry
 * 
 * @param to - Target path
 * @param from - Source path
 * @param source - Source file (for error reporting)
 * @returns Error message if invalid, null if valid
 */
export function validateRedirectTarget(
  to: string,
  from: string,
  source: string
): string | null {
  // Validate target path
  const targetError = getPathValidationError(to);
  if (targetError) {
    return `Invalid redirect target "${from}" -> "${to}" in ${source}: ${targetError}`;
  }
  
  // Validate source path
  const sourceError = getPathValidationError(from);
  if (sourceError) {
    return `Invalid redirect source "${from}" in ${source}: ${sourceError}`;
  }
  
  return null;
}

/**
 * Validate all redirects for conflicts and security issues
 * 
 * Checks for:
 * - Invalid/unsafe paths
 * - Duplicate source paths
 * - Circular redirects
 * - Self-redirects
 * 
 * @param redirects - Array of redirect entries
 * @returns Validation result with errors and warnings
 */
export function validateRedirects(redirects: RedirectEntry[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fromPaths = new Map<string, RedirectEntry[]>();
  
  // Validate each redirect target and source
  for (const redirect of redirects) {
    const error = validateRedirectTarget(redirect.to, redirect.from, redirect.source);
    if (error) {
      errors.push(error);
    }
  }
  
  // Group redirects by source path
  for (const redirect of redirects) {
    const existing = fromPaths.get(redirect.from) || [];
    existing.push(redirect);
    fromPaths.set(redirect.from, existing);
  }
  
  // Check for duplicate source paths
  for (const [from, entries] of fromPaths) {
    if (entries.length > 1) {
      const destinations = entries.map(e => e.to);
      const sources = entries.map(e => e.source);
      
      // If all redirect to same place, it's just a warning
      if (new Set(destinations).size === 1) {
        warnings.push(
          `Duplicate redirect from "${from}" defined in: ${sources.join(', ')}`
        );
      } else {
        errors.push(
          `Conflicting redirects from "${from}":\n` +
          entries.map(e => `  - ${e.source} -> ${e.to}`).join('\n')
        );
      }
    }
  }
  
  // Check for self-redirects
  for (const redirect of redirects) {
    if (redirect.from === redirect.to) {
      errors.push(
        `Self-redirect detected: "${redirect.from}" -> "${redirect.to}" in ${redirect.source}`
      );
    }
  }
  
  // Check for circular redirects
  const visited = new Set<string>();
  const checkCircular = (from: string, path: string[] = []): boolean => {
    if (path.includes(from)) {
      errors.push(`Circular redirect detected: ${[...path, from].join(' -> ')}`);
      return true;
    }
    
    if (visited.has(from)) return false;
    
    visited.add(from);
    const redirect = redirects.find(r => r.from === from);
    
    if (redirect) {
      return checkCircular(redirect.to, [...path, from]);
    }
    
    return false;
  };
  
  for (const redirect of redirects) {
    if (!visited.has(redirect.from)) {
      checkCircular(redirect.from);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}