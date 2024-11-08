/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/singleton.ts'],
  testLocationInResults: true,
  reporters: [
    'default',
    '/home/yuri/.vscode-server/extensions/orta.vscode-jest-6.4.0/out/reporter.js',
  ],
};
