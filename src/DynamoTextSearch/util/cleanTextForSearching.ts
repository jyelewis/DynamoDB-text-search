const regexCache = new Map<string, RegExp>();

function regexForString(str: string): RegExp {
  const existingRegex = regexCache.get(str);
  if (existingRegex) {
    return existingRegex;
  }

  const newRegex = new RegExp(`[${str}]`, "g");
  regexCache.set(str, newRegex);
  return newRegex;
}

export function cleanTextForSearching(text: string, ignoreChars: string): string {
  return text.toLocaleLowerCase().replace(regexForString(ignoreChars), "");
}
