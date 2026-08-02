#!/usr/bin/env python3
import json
import re
from pathlib import Path

import docx
from docx.table import Table
from docx.text.paragraph import Paragraph

SRC = Path(__file__).resolve().parent.parent / "imports/data/artist network + arts/artists/015GALLERY-Artists-Biographies.docx"
OUT = Path(__file__).resolve().parent.parent / "imports/parsed/artists.json"


def iter_block_items(parent):
    for child in parent.element.body.iterchildren():
        if child.tag.endswith('}p'):
            yield Paragraph(child, parent)
        elif child.tag.endswith('}tbl'):
            yield Table(child, parent)


def slugify(name):
    # transliteration left for later; use a normalized placeholder slug from index
    return re.sub(r'\s+', '-', name.strip())


def main():
    d = docx.Document(str(SRC))
    artists = []
    current = None
    state = None  # None | 'expect_bio_label' | 'in_bio'

    heading_re = re.compile(r'^\d+\.\s*(.+)$')

    for block in iter_block_items(d):
        if isinstance(block, Table):
            rows = {row.cells[0].text.strip(): row.cells[1].text.strip() for row in block.rows if len(row.cells) >= 2}
            if 'اسم الفنان' in rows:
                if current:
                    artists.append(current)
                current = {
                    'name_ar': rows.get('اسم الفنان', ''),
                    'nationality_ar': rows.get('الجنسية', ''),
                    'school_ar': rows.get('المدرسة الفنية', ''),
                    'birth_raw': rows.get('تاريخ الميلاد', ''),
                    'bio_ar_paragraphs': [],
                }
                state = 'expect_bio_label'
            continue

        text = block.text.strip()
        if not text:
            continue
        if current is None:
            continue
        if state == 'expect_bio_label':
            if text.startswith('النبذة'):
                state = 'in_bio'
            continue
        if state == 'in_bio':
            m = heading_re.match(text)
            if m and len(text) < 60:
                # next artist heading reached without a table yet seen? skip, handled by table detection
                continue
            current['bio_ar_paragraphs'].append(text)

    if current:
        artists.append(current)

    for i, a in enumerate(artists, start=1):
        a['index'] = i
        a['bio_ar'] = '\n\n'.join(a.pop('bio_ar_paragraphs'))
        birth_match = re.search(r'\d{4}', a['birth_raw'])
        a['birth_year'] = int(birth_match.group()) if birth_match else None
        a['slug_seed'] = slugify(a['name_ar'])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(artists, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Parsed {len(artists)} artists -> {OUT}")
    for a in artists:
        print(f"  {a['index']:>2}. {a['name_ar']} | {a['nationality_ar']} | born {a['birth_year']}")


if __name__ == '__main__':
    main()
