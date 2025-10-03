// src/utils/references.ts

/**
 * Normalizes a reference to extract its ID
 * Handles both string IDs and reference objects
 */
export function normalizeRef(ref: any): string {
  if (typeof ref === 'string') return ref;
  if (ref?.id) return ref.id;
  return String(ref);
}

/**
 * Checks if a value is a collection reference
 */
export function isCollectionReference(value: any): value is { collection: string; id: string } {
  return (
    value &&
    typeof value === 'object' &&
    'collection' in value &&
    'id' in value &&
    typeof value.collection === 'string' &&
    typeof value.id === 'string'
  );
}