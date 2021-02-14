const puppeteer = require('puppeteer');
const fs = require('fs');


(async() => {
	const businessType = 'trade'
	const postCode = '2560'
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

		let pageN = 0;
		const test = async (pageN) => {
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
						scrapedData.list.push([`"${name.innerHTML}", "${website.href || 'Not Found'}", "${email.title || 'Not Found'}", "${phone.href || 'Not Found'}"`])
						})
					return scrapedData
				})
				await page.goto(`https://www.yellowpages.com.au/search/listings?clue=${businessType}&locationClue=${postCode}&pageNumber=${pageN}&referredBy=www.yellowpages.com.au&selectedViewMode=list`, {
					waitUntil: 'load'
				});
				if(pageN < 5) {
					pageN++;
					return await test(pageN)
				} else {
					return grabData	
				}
			
		}

			const data = await test(pageN);
		
			const generateCSV =  data.header + data.list.map(e => e.join(",")).join("\n");

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

 
