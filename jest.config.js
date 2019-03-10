module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'^lib/(.*)$': '<rootDir>/lib/$1',
  },
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
}
