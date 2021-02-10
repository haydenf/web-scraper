const puppeteer = require('puppeteer');


(async() => {
	let businessType = 'trade'
	let postOrSub = '2560'
	const link = 'https://www.yellowpages.com.au/';  
	const browser = await puppeteer.launch({ devtools: true });
  
	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1680, height: 947 })
		await page.goto(link, {
			waitUntil: 'load'
		});

		await page.waitForSelector('.search-field-layout-cell #clue')
		await page.click('.search-field-layout-cell #clue')
		await page.keyboard.type(businessType);
		await page.waitForSelector('.search-field-layout > .search-field-layout-cell > .search-field-layout-inner-cell > .where > .liquid-input-text')
		await page.click('.search-field-layout > .search-field-layout-cell > .search-field-layout-inner-cell > .where > .liquid-input-text')
		await page.keyboard.type(postOrSub);
		await page.keyboard.press('Enter');
	
		await page.waitForTimeout(3000);
	
		const grabData = await page.evaluate(() => {
			const scrapedData = {
				header:  'Business Name, Email, Website, Phone\r\n',
				list: []
			}
			const table = document.querySelectorAll('.search-contact-card')

			table.forEach((el) => {
				let name = el.querySelector('.listing-name')
				let website = el.querySelector('.contact-url') || ' '
				let email = el.querySelector('.contact-email') || ' '
				let phone = el.querySelector('.click-to-call') || ' '
				scrapedData.list.push(`"${name.innerHTML}", "${website.href}", "${email.title}", "${phone.href}"`)
			})
			return scrapedData
		})
	
		console.log(grabData)
		await page.close();
		await browser.close();
		} catch (error) {
		console.log(error);
		await browser.close();
		}
  })();

