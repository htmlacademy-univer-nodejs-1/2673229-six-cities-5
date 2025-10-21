export const housingTypes = ['apartment', 'house', 'room', 'hotel'] as const;
export type HousingType = typeof housingTypes[number];

export function isHousingType(str: string): HousingType | undefined {
  const foundStr = housingTypes.find((val) => val === str);

  if (!foundStr) {
    return;
  }

  return foundStr;
}
