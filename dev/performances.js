const puppeteer = require('puppeteer')

const getScriptDuration = async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('http://10.100.31.92/tileview/')

    const metrics = await page.metrics()

    console.log(metrics.ScriptDuration)


    await browser.close()
}

getScriptDuration()