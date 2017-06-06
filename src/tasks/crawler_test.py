import unittest
import crawler


class CrawlerTestCase(unittest.TestCase):
    def test_get_ico_info(self):
        self.assertEqual(crawler.get_ico_info('https://tokenmarket.net/blockchain/ethereum/assets/21-million/')
                         , ('https://www.21million.co.uk/', '12. Jun 2017', '28. Jun 2017'))
        self.assertEqual(crawler.get_ico_info('https://tokenmarket.net/blockchain/ethereum/assets/0x-project/')
                         , ('https://www.0xproject.com/#home', '', ''))
        self.assertEqual(crawler.get_ico_info('https://tokenmarket.net/blockchain/ethereum/assets/wagerr/')
                         , ('', '1. Jun 2017', '25. Jun 2017'))

    def test_ico_address(self):
        self.assertEqual(crawler.get_ico_address('Aragon'
                                                 , 'ANT'
                                                 , 'https://tokenmarket.net/blockchain/ethereum/assets/aragon/')
                         , ['0x960b236A07cf122663c4303350609A66A7B288C0'])
        self.assertEqual(crawler.get_ico_address('Mysterium Network'
                                                 , 'MYST'
                                                 , 'https://tokenmarket.net/blockchain/ethereum/assets/mysterium-network/')
                         , ['0x4f529990b7f3d1fb4152736155e431c96fd86294'])
        self.assertEqual(crawler.get_ico_address('21 Million'
                                                 , '21MCoin'
                                                 , 'https://tokenmarket.net/blockchain/ethereum/assets/21-million/')
                         , [])
        self.assertEqual(crawler.get_ico_address('Augur'
                                                 , 'REP'
                                                 , 'https://tokenmarket.net/blockchain/ethereum/assets/augur/')
                         , ['https://etherscan.io/address/0x48c80F1f4D53D5951e5D5438B54Cba84f29F32a5'])


if __name__ == '__main__':
    unittest.main()
