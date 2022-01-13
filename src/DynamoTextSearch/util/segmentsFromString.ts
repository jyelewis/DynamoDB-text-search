import {cleanTextForSearching} from "./cleanTextForSearching";

export function segmentsFromString(text: string, delimiters: string, stopChars: string, maxLength: number): string[] {
  const segments = new Set<string>();

  segments.add(cleanTextForSearching(text.slice(0, maxLength), stopChars));

  for (let i = 0; i < text.length - 1; i++) {
    if (delimiters.indexOf(text.charAt(i)) !== -1) {
      // found a delimiter, add from after here to the end of the string to our segments
      segments.add(cleanTextForSearching(text.slice(i + 1, i + maxLength), stopChars));
    }
  }

  return Array.from(segments);
}