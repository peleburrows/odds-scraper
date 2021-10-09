const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')

exports.handler = async (event, context) => {
  let theTitle = null
  let browser = null
  console.log('spawning chrome headless')
  try {
    // need to specify where chromium is as it doesn't work with the one in local/temp
    // that is wants to use
    const executablePath = 'C:/Program Files/chrome-win/chrome-win/chrome.exe'

    // setup
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreDefaultArgs: ['--disable-extensions'],
    })

    // Do stuff with headless chrome
    const page = await browser.newPage()
    const targetUrl = 'https://www.google.com/'

    // Goto page and then do stuff
    await page.goto(targetUrl, {
      waitUntil: ['domcontentloaded', 'networkidle0']
    })

    await page.waitForSelector('.lnXdpd')

    theTitle = await page.title()

    console.log('done on page', theTitle)
  } catch (error) {
    console.log('error', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error
      })
    }
  } finally {
    // close browser
    if (browser !== null) {
      await browser.close()
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      title: theTitle,
    })
  }
}