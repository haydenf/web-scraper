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
		const grabNameData = await page.evaluate(() => {
			const businessNamesList = []
			const name = document.querySelectorAll('.listing-name')
			name.forEach((el) => {
				businessNamesList.push(el.innerHTML)
			})
			return businessNamesList
		})
		const grabPhoneData = await page.evaluate(() => {
			const phoneList = []
			const phones = document.querySelectorAll('.click-to-call .contact .contact-text')
			phones.forEach((el) => {
				phoneList.push(el.innerHTML)
			})
			return phoneList
		})
		const grabEmailData = await page.evaluate(() => {
			const emailList = []
			const emails = document.querySelectorAll('.contact-email')
			emails.forEach((el) => {
				emailList.push(el.title)
			})
			return emailList
		})
		const grabWebsiteData = await page.evaluate(() => {
			const websiteList = []
			const websites = document.querySelectorAll('.contact-url')
			websites.forEach((el) => {
				websiteList.push(el.href)
			})
			return websiteList
		})
		console.log(grabEmailData)
		await page.close();
		await browser.close();
		} catch (error) {
		console.log(error);
		await browser.close();
		}
  })();
