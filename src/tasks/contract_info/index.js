const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')

function file_callback(error){
	if (error)
		return console.log(error)
	console.log(`parsing done`)
}

function getContracts(ico_file_path){
	fs.readFile(ico_file_path, 'utf-8', function(err, data){
		if (err)
			return console.log(err)
		let icoList = JSON.parse(data)
		for (var i = 0; i < icoList.length; i++){
			let icoItem = icoList[i]
			let addr = icoItem['address']
			//console.log(`${icoItem['name']}\t${addr}\t${icoItem['status']}`)
			if (addr.length === 0 || icoItem['status'] === 'ICO coming'){
				continue
			}else {
				for (var j = 0; j < addr.length; j++){
					console.log(`fetching ${addr[j]}`)
					fetchContract(addr)
				}
			}
		}
	})
}


// fetch contract information by address
function fetchContract(addr){
	if (fs.existsSync(`./bak/${addr}`))
		return false
	let url = `https://etherscan.io/readContract?a=${addr}&v=${addr}`
	request({url: url, headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
	}}, function(error, response, body){
		if (error){
			return console.error(error)
		}
		let $ = cheerio.load(body.toString())
		let contract = ''
		let contract_info = {}
		$('tbody tr td').each(function(idx, elem){
			if (!$(this).children().is('input') && !$(this).children().is('img')){
				$(this).children().remove('i')
				contract += $(this).text() + '\n'
				let entry = $(this).text().split('.')[1].trim().replace(/\s+/, '\x01').split('\x01')
				contract_info[entry[0]]=entry[1]
			}
		})
		// console.log(contract_info)
		if (contract_info.length === 0){
			console.log('no info for ' + addr)
		}else {
			fs.writeFile(`./bak/${addr}`, contract, file_callback)
			fs.writeFile(`./info/${addr}`, JSON.stringify(contract_info), file_callback)
			console.log(`fetching ${addr} done`)
		}
		
	})
}

getContracts('./ico.json')
// fetchContract('0x0D8775F648430679A709E98d2b0Cb6250d2887EF')

// fetch the top 100 rich list for finished ICO and running ICO
// finished in JAVA
// function fetchRichList(addr) {
// 	let richList = {}
// 	let count = 0
// 	let page = 1
// 	let url = `https://etherscan.io/txs?a=${addr}&sort=value&order=desc&p=${page}`
// 	request({url: url, headers: {
// 		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
// 	}}, function(err, response, body){
// 		if (err) return console.error(err)
// 		let $ = cheerio.load(body.toString())
// 		$('.table-hover tbody tr').each(function(idx, elem){
// 			if ($(this).children().first().text() === '')
// 				return false;
// 			if (!$(this).children().is('font')){
// 				//0-tx hash, 1-block, 2-age, 3-from addr, 4-in or out, 5-to addr, 6-amount, 7-tx fee
// 				let tds = $(this).children()
// 				if (tds.get(4).text().indexOf('IN') > -1){
// 					let senderAddr = tds.get(3).text()
// 					let amout = parseFloat(tds.get(6).text())
// 					if (senderAddr.indexOf('0x') === -1){
// 						senderAddr = tds.get(3).children('a').attr('href').replace('/address/', '')
// 					}
// 					if (richList[senderAddr] == undefined){
// 						richList[senderAddr] = amount 
// 						count++
// 					} else
// 						richList[senderAddr] += amount
// 				}
// 			}
// 		})
// 		page++
// 	})
// }