/**
 * Converts a string (e.g. role name or enum value) into a display-friendly label.
 * Examples: "ADMIN" -> "Admin", "user" -> "User", "some_role" -> "Some Role"
 */
export function parseMessage(value: unknown) {
  if (value == null || value === '') return '';
  const str = String(value);
  return str
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
