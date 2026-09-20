import importlib.util
import pathlib
import shutil
import tempfile
import unittest
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('source_import', ROOT / 'scripts/import_sources.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SourceImportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = module.build_data(ROOT / 'sources')

    def test_all_28_places_and_six_weights(self):
        self.assertEqual(len(self.data['places']), 28)
        self.assertEqual(len({p['id'] for p in self.data['places']}), 28)
        self.assertEqual(self.data['weights'], {'Silver Shop': .8, 'Crafthouse': 1, 'Workshop': .8, 'Temple': .3, 'Market Night': 1.2, 'Museum': .2})
        self.assertEqual(len(self.data['sounds']), 5)

    def test_positions_cover_every_place_without_inventing_places(self):
        markers = self.data['markers']
        self.assertEqual(len(markers), 60)  # 59 points, plus one route
        self.assertEqual({m['placeId'] for m in markers}, {p['id'] for p in self.data['places']})
        self.assertEqual(len({m['id'] for m in markers}), len(markers))
        p25 = next(m for m in markers if m['placeId'] == 'P25')
        self.assertEqual((p25['x'], p25['y']), (838, 249))
        self.assertEqual(sum(m['placeId'] == 'P20' for m in markers), 7)

    def test_schedules_and_secondary_role_are_preserved(self):
        market = next(p for p in self.data['places'] if p['id'] == 'P14')
        self.assertEqual(market['hours'], [None, None, None, None, None, [960, 1380], None])
        self.assertEqual(market['soundTypes'], ['Market', 'Culture'])
        self.assertEqual(len(self.data['roads']), 8)

    def test_time_parser_rejects_bad_data(self):
        self.assertEqual(module.parse_hours('16.00–23:00'), [960, 1380])
        self.assertIsNone(module.parse_hours('Close'))
        for value in ['unknown', '25:00–26:00', '09:70–17:00', '17:00–09:00', '']:
            with self.assertRaises(ValueError):
                module.parse_hours(value)

    def test_import_rejects_marker_or_road_geometry_drift(self):
        mutations = [('M436.5 465', 'M437.5 465'), ('M560.5 498.5', 'M561.5 498.5')]
        for old, new in mutations:
            with self.subTest(old=old), tempfile.TemporaryDirectory() as temporary:
                copied = pathlib.Path(temporary) / 'sources'
                shutil.copytree(ROOT / 'sources', copied)
                svg = copied / 'positions.svg'
                content = svg.read_text(encoding='utf-8')
                self.assertIn(old, content)
                svg.write_text(content.replace(old, new, 1), encoding='utf-8')
                with self.assertRaises(ValueError):
                    module.build_data(copied)

    def test_import_rejects_a_valid_but_substituted_road(self):
        with tempfile.TemporaryDirectory() as temporary:
            copied = pathlib.Path(temporary) / 'sources'
            shutil.copytree(ROOT / 'sources', copied)
            svg_path = copied / 'positions.svg'
            tree = ET.parse(svg_path)
            root = tree.getroot()
            root[1].set('d', root[2].attrib['d'])
            tree.write(svg_path, encoding='utf-8', xml_declaration=True)
            with self.assertRaises(ValueError):
                module.build_data(copied)


if __name__ == '__main__':
    unittest.main()
