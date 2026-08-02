#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CERTS = json.loads(Path('/tmp/certs.json').read_text(encoding='utf-8'))

# cert artist-name variants -> our artist slug (only names we can confidently confirm
# against an existing artist we already have real photos for)
NAME_TO_SLUG = {
    "ABDULAZIZ TAHER": "abdulaziz-taher",
    "ABDULLAH AL AHMARI": "abdullah-al-ahmari",
    "ABDULLAH BARAK": "abdullah-al-barrak",
    "Abdullah Barak": "abdullah-al-barrak",
    "FAHAD GHORMAN": "fahad-gharman",
    "KHALID AL MUTLAQ": "khaled-al-mutlaq",
    "KHALID AL MWTLAQ": "khaled-al-mutlaq",
    "KHALID MORAD": "khaled-mourad",
    "MOHAMMAD AJMAN": "mohammed-al-ajam",
    "SAROR ALWANI": "suroor-al-alwani",
}


def main():
    artists = json.loads((ROOT / "data/artists.json").read_text(encoding="utf-8"))
    artworks = json.loads((ROOT / "data/artworks.json").read_text(encoding="utf-8"))
    certificates = json.loads((ROOT / "data/certificates.json").read_text(encoding="utf-8"))

    by_slug = {a['slug']: a for a in artists}
    next_cert_num = 1
    if certificates:
        next_cert_num = max(int(c['id'].split('-')[1]) for c in certificates) + 1

    # artworks still carrying an "Untitled, <Name> (n)" placeholder title, grouped by artist_id
    placeholders_by_artist = {}
    for aw in artworks:
        if aw['title_en'].startswith('Untitled, '):
            placeholders_by_artist.setdefault(aw['artist_id'], []).append(aw)
    for lst in placeholders_by_artist.values():
        lst.sort(key=lambda a: a['id'])

    matched, unmatched = [], []
    new_certificates = []

    for cert_num, title, artist_name, size, medium in CERTS:
        slug = NAME_TO_SLUG.get(artist_name)
        if not slug or slug not in by_slug:
            unmatched.append((cert_num, title, artist_name, size, medium))
            continue
        artist = by_slug[slug]
        pool = placeholders_by_artist.get(artist['id'], [])
        if not pool:
            unmatched.append((cert_num, title, artist_name, size, medium))
            continue
        aw = pool.pop(0)  # claim one placeholder artwork photo for this certified piece
        aw['title_en'] = title.title()
        aw['title_ar'] = title.title()
        aw['medium_en'] = medium
        aw['medium_ar'] = medium
        aw['dimensions'] = size
        aw['description_en'] = (
            f"Certified work (certificate #{cert_num}). Title, medium, and dimensions confirmed "
            f"by the gallery's certificate of authenticity; the specific photograph pairing with "
            f"this certificate has not been independently verified."
        )
        aw['description_ar'] = f"عمل موثق بشهادة رقم {cert_num}. العنوان والخامة والأبعاد مؤكدة من شهادة الأصالة؛ اقتران هذه الصورة تحديداً بالشهادة غير مؤكد بشكل مستقل."
        aw['price_status'] = 'price_on_request'
        aw['availability_status'] = 'not_for_sale'
        aw['visibility_status'] = 'private'

        cert_id = f"cert-{next_cert_num:03d}"
        next_cert_num += 1
        new_certificates.append({
            "id": cert_id,
            "certificate_number": cert_num,
            "artwork_id": aw['id'],
            "issued_date": "2026-01-01",
            "verification_url": f"https://015gallery.com/verify/{cert_num}",
            "status": "draft",
            "issued_by": "gallery-archive-import",
            "approved_by": "pending-review",
            "issued_version": 1,
            "issued_at": "2026-01-01T00:00:00Z",
        })
        matched.append((cert_num, title, artist_name, slug))

    (ROOT / "data/artworks.json").write_text(json.dumps(artworks, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "data/certificates.json").write_text(
        json.dumps(certificates + new_certificates, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"Matched & applied: {len(matched)} certificates")
    for m in matched:
        print(" ", m)
    print(f"\nUnmatched (no photo on file for this artist, left untouched): {len(unmatched)}")
    unmatched_names = sorted(set(u[2] for u in unmatched))
    for n in unmatched_names:
        print(" ", n)


if __name__ == '__main__':
    main()
