const presets = [
  [
    '@babel/env',
    {
      targets: 'ie >= 9',
      useBuiltIns: 'usage', // usage entry
      corejs: 3,
    },
  ],
];

module.exports = { presets };
