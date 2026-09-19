# Source and data audit

Sources inspected: all four SVGs in original-design.zip, positions.svg, build-prompt.md and all four workbook sheets. Original bytes are preserved in sources; SHA-256 fingerprints are recorded in source-hashes.json.

| Category | Places | Weight | Sound roles |
|---|---:|---:|---|
| Silver Shop | 15 | 0.8 | Market |
| Crafthouse | 5 | 1.0 | Main Craft |
| Workshop | 3 | 0.8 | Soft Craft |
| Temple | 2 | 0.3 | Respect |
| Market Night | 1 | 1.2 | Market + Culture |
| Museum | 2 | 0.2 | Culture |

The workbook contains 28 unique place IDs, matching activity IDs/categories, five sound mappings, six numeric category weights, no formulas, no error cells, no coordinates and no separate activity-time schedule. The original weight sheet is spelled `ategory Weight`; importer preserves that source reference. Time strings use both colon and decimal separators; 15 weekly schedule cells contain `Close`.

## Approved spatial mapping
The annotated SVG has 58 labels for 26 distinct place IDs, one unlabeled point and a street route. User confirmed: P25=(838,249), P14=original blue street, multiple markers share a single activity. Bindings in scripts/import_sources.py record source SVG child index and source-coordinate center. Generated JSON retains actual source path data; it does not redraw roads.

Number of point markers by place: P01=2,P02=2,P03=2,P04=1,P05=1,P06=1,P07=1,P08=1,P09=2,P10=1,P11=1,P12=2,P13=2,P15=1,P16=1,P17=1,P18=5,P19=6,P20=7,P21=6,P22=7,P23=1,P24=1,P25=1,P26=1,P27=1,P28=1. Total: 59 points + P14 route.

All eight road paths have the same `d` geometry as Active Main map page.svg. Static text is outlined paths, with no font metadata. There are no supplied audio files. The displayed 24-active count is a mockup label, not a source-data result. Category colors follow Excel (P15 Workshop; both P13 points Temple), as approved.

## Calculation fixtures
Weekly intervals are start-inclusive/end-exclusive. No overnight interval is present.

| Day/time | Density | Intensity |
|---|---:|---:|
| Monday 12:00 | 27 | 20.4 |
| Thursday 12:00 | 26 | 19.4 |
| Saturday 12:00 | 25 | 18.4 |
| Saturday 19:00 | 9 | 6.8 |
| Sunday 12:00 | 20 | 14.2 |

P14 is active Saturday 16:00–23:00 only. Its two sound roles never double its 1.2 activity weight. The design's SUN-first day slider must map to the workbook's MON-first array.
