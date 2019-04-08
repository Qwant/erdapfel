module.exports = function (mode) {
  const plugins = [
    "@babel/plugin-syntax-dynamic-import"
  ]

  const production = {
    presets :
      [["@babel/preset-env", {
        "targets": {
          "browsers": [
            "Chrome >= 60",
            "Firefox >= 44",
            "Safari >= 7",
            "Explorer 11",
            "Edge >= 17"
          ]
        },
        "useBuiltIns": "entry"
      }]],
  }

  const development = {
    presets : [
      [
        "@babel/preset-env",
        {
          "useBuiltIns": "entry"
        }
      ]
    ]
  }

  const conf = mode === 'production' ? production : development

  return {
    "presets": conf.presets,
    "ignore": [
      "node_modules"
    ],
    "plugins": plugins
  }
}
