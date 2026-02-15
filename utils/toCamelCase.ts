/**
 * @description Function to convert NPM package name to camel case
 * @param packageName
 */
export const toCamelCase = (packageName: string): string => {
  return packageName
    .split('-')
    .map((namePart: string) => namePart[0].toLocaleUpperCase() + namePart.slice(1))
    .join('');
};
