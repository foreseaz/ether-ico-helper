#!/usr/bin/env python3
# ICO Addr Crawler
from bs4 import BeautifulSoup
import json
import logging
import requests
import os
import sys


def get_ico_list(ico_logo_dir):
    # <tr>
    #     <td>
    #        <span class="asset-status asset-status-ico-coming">
    #           <i class="fa fa-hourglass"></i>&nbsp;ICO&nbsp;coming
    #        </span>
    #     </td>
    #     <td>
    #        <a href="https://tokenmarket.net/blockchain/ethereum/assets/akasha/">
    #            Akasha
    #        </a>
    #     </td>
    #     <td>
    #        Akasha
    #     </td>
    #     <td>
    #        Ethereum based social network using IPFS for storage
    #     </td>
    #     <td>
    #        <a href="https://tokenmarket.net/blockchain/ethereum/">
    #           Ethereum
    #        </a>
    #     </td>
    # </tr>
    ico_list = []
    ico_tokenmarket_page_list = []
    ico_url = 'https://tokenmarket.net/blockchain/ethereum/assets'
    ico_list_page = requests.get(ico_url)
    if ico_list_page.status_code != 200:
        logging.error('Fail to connect %s with status code %d', ico_url, ico_list_page.status_code)
        sys.exit()

    ico_list_soup = BeautifulSoup(ico_list_page.content, 'lxml')
    for row in ico_list_soup.find('tbody').find_all('tr'):
        cols = row.find_all('td')
        status = cols[0].span.getText()
        if status is not None:
            status = status.replace('\xa0', ' ').strip()
        name = cols[1].a.getText().strip()
        symbol = cols[2].getText().strip()
        description = cols[3].getText().strip()
        ico_tokenmarket_page = cols[1].a.get('href')
        (official_website, start_time, end_time) = get_ico_info(ico_tokenmarket_page)
        smart_contract_address = get_ico_address(name, symbol, ico_tokenmarket_page)
        # download logo
        logo_path = os.path.join(ico_logo_dir, symbol.replace(' ', '_') + '.png')
        logo_url = ico_tokenmarket_page + 'logo_big.png'
        logo_request = requests.get(logo_url, stream=True)
        with open(logo_path, 'wb') as image:
            for chunk in logo_request.iter_content(chunk_size=2048):
                image.write(chunk)
        ico = {
            'name': name,
            'symbol': symbol,
            'status': status,
            'description': description,
            'official_website': official_website,
            'start_time': start_time,
            'end_time': end_time,
            'address': smart_contract_address,
            'logo': logo_path
        }
        logging.info(ico)
        ico_list.append(ico)
    return ico_list


def get_ico_info(ico_tokenmarket_page):
    ico_info = requests.get(ico_tokenmarket_page)
    if ico_info.status_code != 200:
        logging.error('Fail to connect %s with status code %d', ico_tokenmarket_page, ico_info.status_code)
        sys.exit()

    ico_info_soup = BeautifulSoup(ico_info.content, 'lxml')
    official_website_a = ico_info_soup.find('a', {'class': 'btn btn-primary btn-block btn-lg'})
    official_website = ''
    if official_website_a is not None:
        official_website = official_website_a.get('href')
    start_time = ''
    end_time = ''
    for row in ico_info_soup.find('table', {'class': 'table table-asset-data'}).find_all('tr'):
        th = row.find('th')
        td = row.find_all('p')
        if len(td) > 0:
            if th.getText().strip() == 'Crowdsale opening date':
                start_time = td[0].getText().strip()
            elif th.getText().strip() == 'Crowdsale closing date':
                end_time = td[0].getText().strip()
            else:
                pass
    return official_website, start_time, end_time


def get_ico_address(name, symbol, ico_tokenmarket_page):
    address = []
    # step 1: try to get address from tokenmarket
    # e.g. ico_tokenmarket_page = 'https://tokenmarket.net/blockchain/ethereum/assets/monaco/'
    # then ico_tokenmarket_sale_page = 'https://tokenmarket.net/crowdsale/monaco/deposit/'
    ico_tokenmarket_sale_page = 'https://tokenmarket.net/crowdsale/' \
                                + ico_tokenmarket_page.rsplit('/', 2)[1] \
                                + '/deposit/'
    sale_page = requests.get(ico_tokenmarket_sale_page)
    if sale_page.status_code == 200:
        # <div class="col-md-6 col-sm-5">
        #     <p>
        #         Any deposits before May 18th, 2017, 9:30 UTC are rejected.
        #     </p>
        #     <p>
        #         <a target="_blank" href="https://tokenmarket.net/what-is/how-to-participate-ethereum-token-crowdsale/"><i class="fa fa-question-circle"></i> See payment instructions</a>
        #     </p>
        #     <p><strong>Do NOT send ETH from an exchange</strong>, Use MyEtherWallet, imToken, Mist or Parity wallets or other compatible wallets. <a target="_blank" href="https://tokenmarket.net/what-is/how-to-participate-ethereum-token-crowdsale/">See the full list of compatible wallets.</a></p>
        #     <p>
        #         <a target="_blank" rel=noopener href="https://etherscan.io/address/0xace62f87abe9f4ee9fd6e115d91548df24ca0943"><i class="fa fa-rocket"></i> Watch token sale live on Ethereum blockchain</a>.
        #     </p>
        # </div>
        sale_page_soup = BeautifulSoup(sale_page.content, 'lxml')
        div = sale_page_soup.find('div', {'class': 'col-md-6 col-sm-5'})
        if div is not None:
            ps = div.find_all('p')
            address.append(ps[3].a.get('href'))

    # step 2: try to find address from etherscan
    # etherscan cannot search '0x' project correctly
    if name == '0x':
        return address
    # search by name
    etherscan_search_url = 'https://etherscan.io/searchHandler?term=' + '+'.join(name.split(' '))
    return_address = etherscan_search(etherscan_search_url)
    if return_address == '':
        # if there is no address record by searching by name, search by symbol
        etherscan_search_url = 'https://etherscan.io/searchHandler?term=' + symbol
        return_address = etherscan_search(etherscan_search_url)
    if return_address != '':
        address.append(return_address)
    return address


def etherscan_search(url):
    ico_etherscan = requests.get(url)
    if ico_etherscan.status_code != 200:
        logging.error('Fail to connect %s with status code %d', url, ico_etherscan.status_code)
        sys.exit()
    # if success, the server will response like
    # `["Monaco (MCO)\t0xb04cfa8a26d602fb50232cee0daf29060264e04b\tERC20: 0xb04cfa8a26d602fb50232cee0da...\t2"]`
    # and we can get url "https://etherscan.io/token/0xb04cfa8a26d602fb50232cee0daf29060264e04b"
    # otherwise, it will response `[]`
    ico_etherscan_content = ico_etherscan.content.decode("utf-8")
    if ico_etherscan_content != '[]':
        token_address_or_name = ico_etherscan_content.split('\\t')[1]
        if len(token_address_or_name) < 42:
            # the address have a name
            token_url = 'https://etherscan.io/token/' + ico_etherscan_content.split('\\t')[1]
            token_etherscan_page = requests.get(token_url)
            if token_etherscan_page.status_code != 200:
                sys.exit()
            token_etherscan_soup = BeautifulSoup(token_etherscan_page.content, 'lxml')
            tr = token_etherscan_soup.find('tr', {'id': 'ContentPlaceHolder1_trContract'})
            return tr.a.getText().strip()
        else:
            return token_address_or_name
    else:
        return ''


if __name__ == '__main__':
    if len(sys.argv) != 4:
        logging.error('Wrong arguments number')
        print('Usage: crawler.py output.json crawler.log')
        sys.exit(1)
    ico_file = sys.argv[1]
    ico_log_file = sys.argv[2]
    ico_logo_dir = sys.argv[3]
    logging.basicConfig(filename=ico_log_file, level=logging.DEBUG)
    logging.info('Start crawler...')
    ico_list = get_ico_list(ico_logo_dir)
    with open(ico_file, 'w') as outfile:
        json.dump(ico_list, outfile)

