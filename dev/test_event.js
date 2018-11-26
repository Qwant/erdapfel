const puppeteer = require('puppeteer')

const getScriptDuration = async () => {

    /* start host */
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    /* debug */
    page.on('console', msg => {
        for (let i = 0; i < msg.args().length; ++i)
            console.log(`${i}: ${msg.args()[i]}`);
    });

    /* connect to homepage for performance test */



    let initPromise = page.evaluate(() => {
        return new Promise((resolve, reject) => {
            listen('init', () => {
                console.log("event init ok")
                resolve('init ok')
            })
        })
    })


    let s3Promise = page.evaluate(() => {
        return new Promise((resolve, reject) => {
            listen('3s', () => {
                resolve('3s ok')
            })
        })

    })

    await page.goto('http://localhost:8080/test_event.html')



    Promise.all([s3Promise],  async (resolves) => {
        console.log(resolves)
        await browser.close()

    })





}

getScriptDuration()
