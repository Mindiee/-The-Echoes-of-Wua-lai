"""Reproducibly import the supplied XLSX/SVG using Python 3 standard library only."""
import hashlib
import json
import pathlib
import re
import xml.etree.ElementTree as ET
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def read_workbook(path):
    with zipfile.ZipFile(path) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            strings = [''.join(si.itertext()) for si in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        rels = {r.attrib['Id']: r.attrib['Target'] for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        result = {}
        for sheet in ET.fromstring(z.read('xl/workbook.xml')).find('s:sheets', NS):
            target = rels[sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
            target = target.lstrip('/') if target.startswith('/') else 'xl/' + target
            cells = {}
            for c in ET.fromstring(z.read(target)).findall('.//s:sheetData/s:row/s:c', NS):
                if c.find('s:f', NS) is not None:
                    raise ValueError(f'Formula requires explicit recalculation: {sheet.attrib["name"]}!{c.attrib["r"]}')
                value = c.find('s:v', NS)
                if c.attrib.get('t') == 'inlineStr':
                    value = ''.join(c.find('s:is', NS).itertext())
                elif value is not None:
                    value = value.text
                    if c.attrib.get('t') == 's':
                        value = strings[int(value)]
                    elif c.attrib.get('t') == 'e':
                        raise ValueError(f'Excel error at {c.attrib["r"]}: {value}')
                    else:
                        value = float(value)
                else:
                    continue
                cells[c.attrib['r']] = value
            result[sheet.attrib['name']] = cells
        return result


def parse_hours(value):
    if value == 'Close':
        return None
    match = re.fullmatch(r'(\d{2})[:.](\d{2})[–-](\d{2})[:.](\d{2})', str(value))
    if not match:
        raise ValueError(f'Invalid opening hours: {value!r}')
    h, m, end_h, end_m = map(int, match.groups())
    if not (0 <= h <= 23 and 0 <= end_h <= 24 and m < 60 and end_m < 60 and (end_h != 24 or end_m == 0)):
        raise ValueError(f'Invalid clock time: {value}')
    start, end = h * 60 + m, end_h * 60 + end_m
    if end <= start:
        raise ValueError(f'Empty/overnight interval needs explicit handling: {value}')
    return [start, end]


# Direct-child indices in sources/positions.svg, verified against the rendered
# labels. These are source geometry references, not invented coordinates.
# Each tuple is (element index, place number, center x, center y).
POSITION_BINDINGS = [
    (9,12,436.5,471.5),(10,12,431,424.5),(11,13,602,730.5),
    (12,10,431.5,370.5),(14,11,467.5,409.5),(16,15,445.5,504.5),
    (17,17,428,443),(18,16,471,474),(19,13,582,646),
    (22,20,577.5,350),(25,20,574.5,388),(28,21,627.5,549),
    (31,22,697.5,667),(34,22,724.5,687),(37,22,716.5,716),
    (40,21,743.5,741),(43,21,757.5,730),(46,20,680.5,766),
    (49,20,620.5,762),(52,19,587.5,783),(55,19,549.5,784),
    (58,18,739.5,593),(61,22,741.5,527),(64,22,737.5,494),
    (67,21,761.5,467),(70,21,747.5,512),(73,20,794.5,416),
    (76,20,779.5,369),(79,19,789.5,350),(82,19,800.5,332),
    (85,18,857.5,343),(88,18,825.5,323),(91,22,834.5,327),
    (94,22,828.5,293),(97,21,863.5,257),(100,20,506.5,755),
    (103,19,486.5,686),(106,19,399.5,324),(109,18,655,587),
    (112,18,845,258),(114,3,557,486),(115,7,535,511),
    (116,8,525,519),(117,1,613,430),(118,1,621,422),
    (119,27,849,221),(120,25,838,249),(121,2,736,337),
    (122,2,752,322),(123,26,929,204),(124,5,664,698),
    (125,6,668,717),(126,23,665,659),(127,9,484,465),
    (128,9,451,488),(129,28,522,560),(130,24,541,624),
    (131,3,287,780),(132,4,794,257),
]


def build_data(source_dir):
    workbook = read_workbook(source_dir / 'data.xlsx')
    required = {'Place', 'Activity', 'Sound', 'ategory Weight'}
    if set(workbook) != required:
        raise ValueError(f'Unexpected workbook sheets: {set(workbook)}')
    wc = workbook['ategory Weight']
    weights = {wc[f'A{r}']: wc[f'B{r}'] for r in range(8,14)}
    if len(weights) != 6 or any(not isinstance(v, (float,int)) or v < 0 for v in weights.values()):
        raise ValueError('Invalid category weights')
    sounds = {workbook['Sound'][f'A{r}']: {
        'base': workbook['Sound'][f'B{r}'], 'role': workbook['Sound'][f'C{r}'],
        'character': workbook['Sound'][f'D{r}'], 'sourceRow': r
    } for r in range(2,7)}
    acts = workbook['Activity']
    activities = {}
    for r in range(2,30):
        key = acts[f'A{r}']
        if key in activities:
            raise ValueError(f'Duplicate activity: {key}')
        activities[key] = (acts[f'B{r}'], [acts[f'{col}{r}'] for col in 'CD' if f'{col}{r}' in acts])
    cells = workbook['Place']
    places = []
    for r in range(2,30):
        key, category = cells[f'A{r}'], cells[f'C{r}']
        act_category, roles = activities[key]
        if category != act_category or category not in weights or any(s not in sounds for s in roles):
            raise ValueError(f'Inconsistent mapping: {key}')
        raw = [cells[f'{col}{r}'] for col in 'DEFGHIJ']
        places.append({'id': key, 'name': cells[f'B{r}'], 'category': category,
                       'hours': [parse_hours(v) for v in raw], 'rawHours': raw,
                       'soundTypes': roles, 'sourceRow': r})
    if len({p['id'] for p in places}) != len(places) or set(activities) != {p['id'] for p in places}:
        raise ValueError('Duplicate or unmatched place IDs')
    svg = ET.parse(source_dir / 'positions.svg').getroot()
    if svg.attrib.get('viewBox') != '0 0 1440 1024':
        raise ValueError('Position viewBox changed; revalidate marker bindings')
    roads = [dict(svg[i].attrib) for i in range(1,9)]
    markers = []
    for index, number, x, y in POSITION_BINDINGS:
        e = svg[index]
        if e.tag.split('}')[-1] not in ('circle','path'):
            raise ValueError(f'Position source changed at element {index}')
        geometry = {k:v for k,v in e.attrib.items() if k in ('d','cx','cy','r')}
        markers.append({'id': f'm{index}', 'placeId': f'P{number:02}', 'x': x, 'y': y,
                        'shape': e.tag.split('}')[-1], 'geometry': geometry,
                        'sourceElement': index, 'frame': 22 <= index <= 112})
    markers.append({'id': 'walking-street', 'placeId': 'P14', 'x': 600, 'y': 470,
                    'shape': 'route', 'geometry': {'d': roads[7]['d']}, 'sourceElement': 8, 'frame': False})
    if {m['placeId'] for m in markers} != {p['id'] for p in places}:
        raise ValueError('Every place must have an approved position')
    return {'places': places, 'weights': weights, 'sounds': sounds, 'roads': roads, 'markers': markers}


def main():
    data = build_data(ROOT / 'sources')
    dest = ROOT / 'src/data/source-data.json'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    with zipfile.ZipFile(ROOT / 'sources/original-design.zip') as z:
        out = ROOT / 'public/references'
        out.mkdir(parents=True, exist_ok=True)
        for name in z.namelist():
            if pathlib.PurePosixPath(name).name != name or not name.endswith('.svg'):
                raise ValueError(f'Unexpected archive entry: {name}')
            (out / name).write_bytes(z.read(name))
    hashes = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((ROOT / 'sources').iterdir()) if p.is_file()}
    (ROOT / 'docs/source-hashes.json').write_text(json.dumps(hashes, indent=2)+'\n', encoding='utf-8')
    print(f'Imported {len(data["places"])} places, {len(data["markers"])} map bindings, {len(data["sounds"])} sound roles.')


if __name__ == '__main__':
    main()
