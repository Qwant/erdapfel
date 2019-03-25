module.exports = function (mode) {
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
    ],
    plugins : []
  }

  const conf = mode === 'production' ? production : development

  return {
    "presets": conf.presets,
    "ignore": [
      "node_modules"
    ],
    "plugins": conf.plugins
  }
}
