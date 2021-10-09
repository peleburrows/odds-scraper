const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')

exports.handler = async (event, context) => {
  let theTitle = null
  let browser = null
  let el_value = null;

  console.log('spawning chrome headless')
  try {

    // its currently a string so parse it so we can access it
    const eventBody = JSON.parse(event.body);
    // note selectors are based on the mobile version of the site
    const skv_config = {
        'psg' : {
            'url': 'https://www.oddschecker.com/football/france/ligue-1/winner',
            'str_selector': "#current-market-tab [data-bname='PSG'] .beta-best-odds-cell span"
        },
        'arsenal' : {
            'url': 'https://www.oddschecker.com/football/english/premier-league/arsenal/to-finish-higher-than',
            'str_selector': "#current-market-tab [data-bname='Arsenal to finish higher than Leeds'] .beta-best-odds-cell span" 
        }
    }
    
    // need to specify where chromium is as it doesn't work with the one in local/temp
    // that is wants to use
    let executablePath = 'C:/Program Files/chrome-win/chrome-win/chrome.exe'
    
    // if we're not on local use the chromium package to determine the executable path
    if (!process.env.deploy_url) { //.search('localhost') === -1
        executablePath = await chromium.executablePath
    }

    // setup
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreDefaultArgs: ['--disable-extensions'],
    })

    // Do stuff with headless chrome
    const page = await browser.newPage()
    const targetUrl = skv_config[eventBody.team].url;

    // Emulates an iPhone X
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1')
    await page.setViewport({ width: 375, height: 812 })

    // Goto page and then do stuff
    await page.goto(targetUrl, {
      waitUntil: ['domcontentloaded', 'networkidle0']
    })

    await page.waitForSelector('#current-market-tab')

    
    const elementHandle = await page.$(skv_config[eventBody.team].str_selector);
    
    const jsHandle = await elementHandle.getProperty('innerHTML');

    // Deserialize our value from the JS handle
    el_value = await jsHandle.jsonValue();

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
      current_odds: el_value,
    })
  }
}