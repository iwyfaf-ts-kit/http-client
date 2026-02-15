export default (): string => {
  return `{
  "compilerOptions": {
    "module": "esnext",
    "target": "es5",
    "outDir": "./dist",
    "sourceMap": true,
    "strict": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "declaration": true,
    "esModuleInterop": true,
    "moduleResolution": "Node"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
`;
};
