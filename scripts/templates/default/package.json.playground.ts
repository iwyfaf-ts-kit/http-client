export default ({ playgroundName }: { playgroundName: string }): string => {
  return `{
  "name": "${playgroundName}",
  "description": "Just another playground",
  "version": "0.0.0",
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
    "registry": ""
  },
  "scripts": {
    "dev": "echo test"
  },
  "dependencies": {
    "@test/ts-example-library": "file:../../libraries/ts-example-library"
  },
  "devDependencies": {
    "@types/node": "^18.11.18",
    "prettier": "^2.8.1",
    "typescript": "^4.9.4"
  }
}`;
};
