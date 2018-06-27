export const wait = async function wait (t = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(t)
    }, t)
  })
}

export const getText = async function (page, selector) {
  return await page.evaluate(selector => {
    return document.querySelector(selector).textContent
  }, selector)
}
