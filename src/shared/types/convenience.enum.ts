export const conveniences = [
  'Breakfast',
  'Air conditioning',
  'Laptop friendly workspace',
  'Baby seat',
  'Washer',
  'Towels',
  'Fridge'
] as const;
export type Convenience = typeof conveniences[number];

export function isConvenience(str: string): Convenience | undefined {
  const foundStr = conveniences.find((val) => val === str);

  if (!foundStr) {
    return undefined;
  }

  return foundStr;
}
