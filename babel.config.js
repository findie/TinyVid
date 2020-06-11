module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true,
          electron: "9"
        },
      },
    ],
    '@babel/preset-react',
    ['@babel/preset-typescript', {
      allowNamespaces: true
    }]
  ]
}