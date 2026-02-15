import { execSync } from 'child_process';
import chalk from 'chalk';
import {
  DEFAULT_TS_DEPENDENCIES_NOT_UPDATED,
  DEFAULT_TS_PROJECT_CREATED,
  DEFAULT_TS_PROJECT_NOT_CREATED,
  LIBRARY_CREATED,
  PROJECT_DEPENDENCIES_UPDATED,
} from '../locales/en/main';
import packageJsonLibrary from '../templates/default/package.json.library';
import packageJsonPlayground from '../templates/default/package.json.playground';
import prettierrc from '../templates/default/prettierrc';
import publish from '../templates/default/publish';
import gitignore from '../templates/default/gitignore';
import rollupConfig from '../templates/default/rollup.config.library';
import editorConfig from '../templates/default/editorconfig';
import changelog from '../templates/default/CHANGELOG.md';
import tsConfig from '../templates/default/tsconfig.json';
import fs from 'fs';

export const defaultBuilder = (
  name: string,
  description: string,
  prefix: string,
  packageType: string,
  path: string,
  update: boolean,
) => {
  try {
    fs.mkdirSync(path);
    console.log(chalk.green(DEFAULT_TS_PROJECT_CREATED));
  } catch (err) {
    console.log(chalk.red(DEFAULT_TS_PROJECT_NOT_CREATED));
    process.exit(0);
  }

  let files;
  switch (packageType) {
    case 'libraries':
      files = [
        {
          filepath: '/.editorconfig',
          content: editorConfig(),
        },
        {
          filepath: '/package.json',
          content: packageJsonLibrary({
            packageName: name,
            packagePrefix: prefix,
            packageDescription: description,
          }),
        },
        {
          filepath: '/publish.sh',
          content: publish({
            packageName: name,
          }),
        },
        {
          filepath: '/.gitignore',
          content: gitignore(),
        },
        {
          filepath: '/.prettierrc',
          content: prettierrc(),
        },
        {
          filepath: '/rollup.config.js',
          content: rollupConfig(),
        },
        {
          filepath: '/tsconfig.json',
          content: tsConfig(),
        },
        {
          filepath: '/CHANGELOG.md',
          content: changelog(),
        },
      ];
      break;
    case 'playgrounds':
      files = [
        {
          filepath: '/package.json',
          content: packageJsonPlayground({
            playgroundName: name,
          }),
        },
        {
          filepath: '/.gitignore',
          content: gitignore(),
        },
        {
          filepath: '/.prettierrc',
          content: prettierrc(),
        },
      ];
      break;
    default:
      files = [
        {
          filepath: '/package.json',
          content: packageJsonLibrary({
            packageName: name,
            packagePrefix: prefix,
            packageDescription: description,
          }),
        },
        {
          filepath: '/publish.sh',
          content: publish({
            packageName: name,
          }),
        },
        {
          filepath: '/.gitignore',
          content: gitignore(),
        },
        {
          filepath: '/.prettierrc',
          content: prettierrc(),
        },
      ];
  }

  if (files) {
    files.forEach((file: { filepath: string; content: string }) => {
      const fileBuffer = new Uint8Array(Buffer.from(file.content));
      fs.writeFileSync(path + file.filepath, fileBuffer);
    });
  }

  if (update) {
    try {
      execSync('ncu -u', {
        cwd: `${packageType}/${name}`,
      });
      console.log(chalk.green(PROJECT_DEPENDENCIES_UPDATED));
    } catch (err) {
      console.log(chalk.red(DEFAULT_TS_DEPENDENCIES_NOT_UPDATED));
    }
  }

  console.log(chalk.green(`✅ ${name} ${LIBRARY_CREATED}`));
};
