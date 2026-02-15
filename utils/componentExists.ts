import fs from 'fs';
import chalk from 'chalk';
import { LIBRARY_ALREADY_EXISTS, PLAYGROUND_ALREADY_EXISTS } from '../scripts/locales/en/main';

/**
 * @description Function to check component is already exists or not
 * @param packagePath
 */
export const isComponentExists = (packagePath: string): string | true => {
  if (fs.existsSync(packagePath)) {
    if (process.env.npm_lifecycle_event === 'library:new') {
      console.log(chalk.red(LIBRARY_ALREADY_EXISTS));
    } else if (process.env.npm_lifecycle_event === 'playground:new') {
      console.log(chalk.red(PLAYGROUND_ALREADY_EXISTS));
    }
    process.exit(0);
  }

  return true;
};
