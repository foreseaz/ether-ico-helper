Please run `./scripts/setup.sh` to install required packages first.

To start ico crawler, use `./scripts/run.sh`.

The log will save in `crawler.log` and the result (include `<name, symbol, official_website, status, start_time, end_time, address>`) is stored in `ico.json` as follows:

```
~ cat ico.json
[...,
{"end_time": "", "address": [], "symbol": "Akasha", "status": "ICO coming", "description": "Ethereum based social network using IPFS for storage", "start_time": "", "name": "Akasha", "official_website": "https://bittrex.com/Market/Index?MarketName=BTC-AGRS"},
{"end_time": "", "address": ["0x960b236A07cf122663c4303350609A66A7B288C0"], "symbol": "ANT", "status": "Trading", "description": "Create value without borders or intermediaries", "start_time": "", "name": "Aragon", "official_website": "https://aragon.one/"},
...]
```
