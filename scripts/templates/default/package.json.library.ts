export default ({
  packageName,
  packagePrefix,
  packageDescription,
}: {
  packageName: string;
  packagePrefix: string;
  packageDescription: string;
}): string => {
  return `{
  "name": "${packagePrefix}${packageName}",
  "description": "${packageDescription}",
  "version": "0.0.0",
  "type": "module",
  "exports": "./dist/index.esm.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "main": "dist/lib.js",
  "files": [
    "dist",
    "package.json"
  ],
  "keywords": [
    "",
    "",
    ""
  ],
  "license": "ISC",
  "author": {
    "name": "iWatchYouFromAfar",
    "email": "tommy.riley@yandex.ru"
  },
  "repository": {
    "type": "git",
    "url": ""
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/"
  },
  "scripts": {
    "build": "rollup -c",
    "pushnpm": "./publish.sh"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^18.11.18",
    "prettier": "^2.8.1",
    "rollup": "^3.9.0",
    "rollup-plugin-clear": "^2.0.7",
    "rollup-plugin-typescript2": "^0.34.1",
    "typescript": "^4.9.4"
  }
}`;
};
