import json
import tempfile
import unittest
from pathlib import Path
import agent

class AgentTests(unittest.TestCase):
    def test_planner_routes(self):
        for idea,theme in [('森林狐狸','forest'),('宇宙飞船','space'),('海洋海龟','ocean')]:
            self.assertEqual(agent.planner({'idea':idea,'log':[]})['theme'],theme)
    def test_review_regenerates_story(self):
        with tempfile.TemporaryDirectory() as folder:
            state={'idea':'森林','name':'小月','age':7,'setting':'森林','theme':'forest','out':folder,'mode':'automatic','review':{'name':'小星','setting':'山谷'},'log':[]}
            state.update(agent.writing_tool(state));changed=agent.review_node(state)
            self.assertIn('小星',changed['story']['title']);self.assertIn('山谷',changed['story']['scenes'][0]['text'])
            self.assertEqual(json.loads((Path(folder)/'story.json').read_text(encoding='utf-8'))['title'],changed['story']['title'])
    def test_review_rejects_unexpected_fields(self):
        state={'review':{'out':'invalid'},'mode':'automatic','story':{'title':'x','scenes':[{'text':'y'}]}}
        with self.assertRaises(ValueError):agent.review_node(state)

if __name__=='__main__':unittest.main()
