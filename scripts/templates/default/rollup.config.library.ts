export default (): string => {
  return `import typescript from 'rollup-plugin-typescript2';
import clear from 'rollup-plugin-clear'

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/index.esm.js',
        format: 'esm',
      },
    ],
    plugins: [
      typescript(),
      clear({
        targets: ['./dist'],
      }),
    ],
    external: ['fs', 'url', 'path', 'chalk'],
  },
];
`;
};
