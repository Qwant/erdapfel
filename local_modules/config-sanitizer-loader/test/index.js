const sanitize = require('../src/sanitize')

const tests = [
  {testString : '"_()"', expected : ''}, /* empty */
  {testString : '"_(\'test\')"', expected: '\'test\''}, /* test */
  {testString : '"_n(\'test string\')" yet another "_(\'test\')"', expected: '\'test string\' yet another \'test\''}
]
let isSucess = true
const results = tests.map((test) => {
  const sanitized = sanitize(test.testString)
  if(test.expected === sanitized) {
    return {success : true, test : test}
  } else {
    isSucess = false
    return {success : false, test : test, get : sanitized}
  }
})



if(isSucess) {
  console.log('Sanitize ok')
} else {
  console.error('Sanaitize not ok')
  results.forEach((result, i) => {
    if(result.success) {
      console.log(`✓\t ${i}/${results.length} on ${result.test.testString}`)
    } else {
      console.error(`✗\t ${i}/${results.length} get : ${result.get} | expected : ${result.test.expected}`)
    }
  })
}
