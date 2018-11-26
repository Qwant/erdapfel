const puppeteer = require('puppeteer')

const getScriptDuration = async () => {

    /* start host */
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    /* connect to homepage for performance test */
    await page.goto('localhost:8080')


    await page.evaluate(() => {
        listen('init')
    })






    await browser.close()
}

getScriptDuration()
