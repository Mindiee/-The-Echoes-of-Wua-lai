"""Download the six individually verified CC0 Freesound preview encodings."""
import hashlib
import json
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
directory = ROOT / 'public/audio'
manifest = json.loads((directory / 'manifest.json').read_text(encoding='utf-8'))
checksums = {}
for item in manifest:
    path = directory / item['file']
    if not path.exists():
        req = urllib.request.Request(item['download'], headers={'User-Agent': 'WualaiPrototype/0.1 (CC0 asset download)'})
        with urllib.request.urlopen(req, timeout=60) as response:
            blob = response.read()
        if len(blob) < 1000 or b'<html' in blob[:100].lower():
            raise ValueError(f'Not an audio response: {item["file"]}')
        path.write_bytes(blob)
    checksums[item['file']] = hashlib.sha256(path.read_bytes()).hexdigest()
    print(item['file'], path.stat().st_size)
(ROOT / 'docs/audio-hashes.json').write_text(json.dumps(checksums, indent=2)+'\n', encoding='utf-8')
