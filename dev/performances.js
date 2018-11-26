const puppeteer = require('puppeteer')

const getScriptDuration = async () => {

    /* start host */
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    /* connect to homepage for performance test */
    await page.goto('http://10.100.31.92/tileview/')

    const metrics = await page.metrics()

    console.log(metrics.ScriptDuration)


    await browser.close()
}

getScriptDuration()
