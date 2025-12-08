export const cityNames = [
  'Paris',
  'Cologne',
  'Brussels',
  'Amsterdam',
  'Hamburg',
  'Dusseldorf'
] as const;
export type CityName = typeof cityNames[number];

export function isCityName(str: string): CityName | undefined {
  const foundStr = cityNames.find((val) => val === str);

  if (!foundStr) {
    return undefined;
  }

  return foundStr;
}
