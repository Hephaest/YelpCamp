module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 12,
  },
  'rules': {
    'max-len': ['error', 100],
    'new-cap': 0,
    'require-jsdoc': 0,
  },
};
