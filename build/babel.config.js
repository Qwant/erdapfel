module.exports = function (mode) {
  mode = 'dev'
  const production = {
    presets :
      [["@babel/preset-env", {
        "targets": {
          "browsers": [
            "last 2 Chrome versions",
            "FireFox >= 44",
            "Safari >= 7",
            "Explorer 11",
            "last 4 Edge versions"
          ]
        },
        "useBuiltIns": "entry"
      }]],
    plugins:["@babel/plugin-transform-parameters", "@babel/plugin-transform-template-literals"]
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
