// Checks if a title is valid — non-empty after trimming and within max length
export const isValidTitle = (title: string, maxLen: number = 50): boolean => {
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= maxLen;
};

// Checks if content has at least 1 character
export const isValidContent = (content: string): boolean => {
  return content.trim().length > 0;
};