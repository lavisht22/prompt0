// Function to extract {{VARIABLES}} from a string
export function extractVariables(string: string): string[] {
    const regex = /{{(.*?)}}/g;
    const matches = [...string.matchAll(regex)];
    return matches.map((match) => match[1]);
}
