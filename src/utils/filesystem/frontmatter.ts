// src/utils/filesystem/frontmatter.ts
/**
 * Frontmatter Parsing Utilities
 * 
 * Reusable utilities for parsing frontmatter from MDX/Markdown files.
 * Uses simple regex parsing to extract YAML frontmatter without dependencies.
 */

import fs from 'node:fs';

/**
 * Parse frontmatter from a file
 * 
 * Extracts and parses YAML frontmatter between --- markers.
 * Supports both string and array values.
 * 
 * @param filePath - Path to MDX/Markdown file
 * @returns Parsed frontmatter data
 */
export function parseFrontmatter(filePath: string): Record<string, any> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseFrontmatterFromString(content);
  } catch (error) {
    console.warn(`Failed to read file ${filePath}:`, error);
    return {};
  }
}

/**
 * Parse frontmatter from a string
 * 
 * @param content - File content as string
 * @returns Parsed frontmatter data
 */
export function parseFrontmatterFromString(content: string): Record<string, any> {
  try {
    // Extract frontmatter block between --- markers
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return {};
    }
    
    const frontmatter = frontmatterMatch[1];
    const result: Record<string, any> = {};
    
    // Parse each field
    const fieldRegex = /(\w+):\s*(.+?)(?=\n\w+:|$)/gs;
    let match;
    
    while ((match = fieldRegex.exec(frontmatter)) !== null) {
      const key = match[1];
      const value = match[2].trim();
      
      result[key] = parseYamlValue(value);
    }
    
    return result;
  } catch (error) {
    console.warn('Failed to parse frontmatter:', error);
    return {};
  }
}

/**
 * Parse a YAML value (string, boolean, number, or array)
 * 
 * @param value - Raw YAML value string
 * @returns Parsed value
 */
function parseYamlValue(value: string): any {
  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  }
  
  // Array (flow style or block style)
  if (value.startsWith('[') || value.startsWith('-')) {
    return parseYamlArray(value);
  }
  
  // String (remove quotes if present)
  return value.replace(/^["']|["']$/g, '');
}

/**
 * Parse a YAML array
 * 
 * Supports both:
 * - Flow style: [item1, item2, item3]
 * - Block style:
 *   - item1
 *   - item2
 * 
 * @param value - Raw YAML array string
 * @returns Array of parsed values
 */
function parseYamlArray(value: string): any[] {
  const items: any[] = [];
  
  if (value.startsWith('[')) {
    // Flow array: ["/contact", "/contact-us"]
    const arrayContent = value.match(/\[(.*?)\]/s)?.[1] || '';
    items.push(
      ...arrayContent
        .split(',')
        .map(s => s.trim().replace(/['"]/g, ''))
        .filter(Boolean)
    );
  } else {
    // Block array:
    // - "/contact"
    // - "/contact-us"
    const lines = value.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*-\s*["']?([^"'\n]+)["']?/);
      if (match) {
        items.push(match[1].trim());
      }
    }
  }
  
  return items;
}

/**
 * Extract specific fields from frontmatter
 * 
 * @param filePath - Path to file
 * @param fields - Array of field names to extract
 * @returns Object with only requested fields
 */
export function extractFrontmatterFields(
  filePath: string,
  fields: string[]
): Record<string, any> {
  const data = parseFrontmatter(filePath);
  const result: Record<string, any> = {};
  
  for (const field of fields) {
    if (data[field] !== undefined) {
      result[field] = data[field];
    }
  }
  
  return result;
}

/**
 * Check if a file has frontmatter
 * 
 * @param filePath - Path to file
 * @returns True if file contains frontmatter
 */
export function hasFrontmatter(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return /^---\s*\n[\s\S]*?\n---/.test(content);
  } catch {
    return false;
  }
}