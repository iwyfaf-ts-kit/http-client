import chalk from 'chalk';
import {
  LIBRARY_NAME_IS_NOT_VALID,
  PLAYGROUND_NAME_IS_NOT_VALID,
} from '../scripts/locales/en/main';

/**
 * @description Function to validate NPM package name
 * @param {string} packageName
 */
export const isValidNameNpmPackage = (packageName: string): string | true => {
  const validNMPPackageName = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
  if (!validNMPPackageName.test(packageName)) {
    if (process.env.npm_lifecycle_event === 'library:new') {
      console.log(chalk.red(LIBRARY_NAME_IS_NOT_VALID));
    } else if (process.env.npm_lifecycle_event === 'playground:new') {
      console.log(chalk.red(PLAYGROUND_NAME_IS_NOT_VALID));
    }
    process.exit(0);
  }

  return true;
};
