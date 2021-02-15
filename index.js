const puppeteer = require('puppeteer');
const fs = require('fs');

(async() => {
	const businessType = 'cafe'
	const postCode = '2000'
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
		await page.keyboard.type(postCode);
		await page.keyboard.press('Enter');
		await page.waitForTimeout(3000);

		let pageN = 1;
		const scrapedData = {
			header:  'Business Name, Website, Email, Phone\r\n',
			list: []
		}

		const dataFetch = async (pageN, scrapedData) => {
				const eachPage = await page.evaluate(() => {
					const list = []
					const table = document.querySelectorAll('.search-contact-card')
					table.forEach((el) => {
						let name = el.querySelector('.listing-name')
						let website = el.querySelector('.contact-url') || ' '
						let email = el.querySelector('.contact-email') || ' '
						let phone = el.querySelector('.click-to-call') || ' '
						list.push([`"${name.innerHTML}", "${website.href || 'Not Found'}", "${email.title || 'Not Found'}", "${phone.href || 'Not Found'}"`])
						})
					return list
				})

				await page.goto(`https://www.yellowpages.com.au/search/listings?clue=${businessType}&locationClue=${postCode}&pageNumber=${pageN}&referredBy=www.yellowpages.com.au&selectedViewMode=list`, {
					waitUntil: 'load'
				});

				if(pageN < 10) {
					pageN++;
					scrapedData.list.push(eachPage)
					return await dataFetch(pageN, scrapedData)
				} 
			return
		}

			await dataFetch(pageN, scrapedData);
			const data = [].concat(...scrapedData.list)
			const generateCSV =  scrapedData.header + data.map(e => e.join(",")).join("\n");

			fs.writeFile(`./${businessType + postCode + '--' + Date.now()}.csv`, generateCSV, function(err) {
			if(err) {
				console.log(err)
				return
			}
			console.log('file was saved')
		})

		await page.close();
		await browser.close();
		} catch (error) {
		console.log(error);
		await browser.close();
		}
  })();

 
