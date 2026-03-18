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

export const getInitials = (name: string) => {
  return name
    ?.split(' ')
    ?.map((word) => word.charAt(0).toUpperCase())
    ?.join('')
    ?.slice(0, 2)
    ?.toUpperCase();
};

export const deepTrim = (obj: unknown): unknown => {
  if (typeof obj === 'string') {
    return obj.trim();
  } else if (Array.isArray(obj)) {
    return obj.map(deepTrim);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, deepTrim(value)]));
  }
  return obj;
};

export const linkify = (input: string) => {
  const combinedRegex =
    /(\bhttps?:\/\/[^\s<\]]+|\bwww\.[^\s<\]]+|\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\b[a-zA-Z0-9-]+\.(com|net|org|co\.in|in|io|dev|ai|app|me|xyz|info|edu|gov|us|uk)\b)/gi;

  return input.replace(combinedRegex, (match) => {
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(match)) {
      return `<a href="mailto:${match}" class="text-blue-500 underline">${match}</a>`;
    }

    if (/^https?:\/\//.test(match)) {
      return `<a href="${match}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">${match}</a>`;
    }

    if (/^www\./.test(match)) {
      return `<a href="http://${match}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">${match}</a>`;
    }

    return `<a href="http://${match}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });
};
