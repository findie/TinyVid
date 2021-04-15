module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true,
          electron: "9"
        }
      },
    ],
    '@babel/preset-react',
    ['@babel/preset-typescript', {
      allowNamespaces: true,
    }],
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', {}]
  ]
}
