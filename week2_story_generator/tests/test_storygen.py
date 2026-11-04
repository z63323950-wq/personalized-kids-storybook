import json
import tempfile
import unittest
from pathlib import Path
import storygen

class StoryTests(unittest.TestCase):
    def test_all_themes_have_distinct_plots_and_valid_schema(self):
        stories = [storygen.make_story('小月',7,'水晶谷',t,'中',7) for t in storygen.THEMES]
        self.assertEqual(len({s['moral'] for s in stories}),3)
        for s in stories:
            storygen.validate(json.loads(json.dumps(s,ensure_ascii=False)))
            self.assertEqual(len(s['scenes']),4)
            self.assertTrue(all('小月' in scene['visual_prompt'] for scene in s['scenes']))
    def test_age_audience_length_and_name_change_content(self):
        a=storygen.make_story('小月',7,'山谷','space','短',4)
        b=storygen.make_story('小星',9,'花园','space','长',10)
        self.assertIn('小月',a['title']); self.assertIn('小星',b['title'])
        self.assertNotEqual(a['scenes'][0]['text'],b['scenes'][0]['text'])
        self.assertGreater(len(b['scenes'][1]['text']),len(a['scenes'][1]['text']))
    def test_rejects_invalid_input(self):
        for args in [('',7,'山','space','短',4),('小星',2,'山','space','短',4),('小星',7,' ','space','短',4),('小星',7,'山','bad','短',4)]:
            with self.assertRaises(ValueError): storygen.make_story(*args)
    def test_rejects_missing_fields(self):
        story=storygen.make_story('小月',7,'山','forest','中',7)
        del story['scenes'][0]['visual_prompt']
        with self.assertRaises(ValueError): storygen.validate(story)
    def test_cli_writes_once_without_overwriting(self):
        with tempfile.TemporaryDirectory() as folder:
            target=Path(folder)/'story.json'
            args=['--name','小月','--age','7','--setting','星球','--theme','space','--length','短','--audience','7','--output',str(target)]
            self.assertEqual(storygen.main(args),0)
            result=json.loads(target.read_text(encoding='utf-8'))
            self.assertIn('小月',result['title'])
            self.assertEqual(storygen.main(args),1)
            self.assertEqual(json.loads(target.read_text(encoding='utf-8')),result)

if __name__ == '__main__': unittest.main()
