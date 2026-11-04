import unittest
from search import AssetSearch
class SearchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.engine=AssetSearch()
    def test_three_queries(self):
        for query,theme in [('小狐狸在森林寻找风铃','forest'),('机器人恐龙探索太空星球','space'),('保护海洋珊瑚和海龟','ocean')]:
            with self.subTest(query=query):
                result=self.engine.recommend(query)
                for kind in result:
                    self.assertTrue(result[kind]);self.assertEqual(result[kind][0]['theme'],theme)
                self.assertEqual(self.engine.suggestions(query)['suggested_theme'],theme)
    def test_invalid_and_unknown(self):
        for q in ('',' '*4,'长'*201):
            with self.assertRaises(ValueError):self.engine.search(q)
        self.assertEqual(self.engine.search('xyzzyqwerty'),[])
    def test_type_filter_and_sort(self):
        found=self.engine.search('森林', 'image', 5)
        self.assertTrue(all(x['type']=='image' for x in found))
        self.assertEqual([x['score'] for x in found],sorted([x['score'] for x in found],reverse=True))
if __name__=='__main__':unittest.main()
