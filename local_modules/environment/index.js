module.exports = (function () {
  const ENVIRONMENTS = ['local', 'development', 'production', 'test']
  const env = process.env.ENV || 'local'
  let environment = ''
  if (ENVIRONMENTS.includes(env)) {
    environment = env
  } else {
    throw `Typo in your environment : ${env}. environment must be ${ENVIRONMENTS.join(', ')}`
  }
  return environment
})()