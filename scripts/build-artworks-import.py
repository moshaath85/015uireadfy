#!/usr/bin/env python3
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTO_ROOT = ROOT / "imports/FOR EASY UPLOAD/ARTITSTS AND ARTWORKS"
PUBLIC_DIR = ROOT / "public/images/artworks"

# artist_id -> (folder name, name_en) for the 17 matched artists imported earlier
ARTIST_FOLDERS = {
    "فهد الحجيلان": "Fahad Al-Hijailan",
    "عبدالرحمن سليمان": "Abdulrahman Al-Suleiman",
    "محمد سيام": "Mohammed Siam",
    "محمد المنيف": "Mohammed Al-Muneef",
    "د محمد الرصيص": "Mohammed Al-Rasees",
    "سمير الدهام": "Samir Al-Doham",
    "عبدالله ادريس": "Abdullah Idris",
    "عبدالله البراك": "Abdullah Al-Barrak",
    "خالد الفيصل": "Prince Khalid Al-Faisal bin Abdulaziz Al Saud",
    "عليا البازعي": "Alia Al-Bazei",
    "محمد الاعجم": "Mohammed Al-Ajam",
    "صالح الشهري": "Saleh Al-Shehri",
    "سليمان باجبع": "Suleiman Bajubair",
    "حسن ال رضوان عابد": 'Hassan Al Radhwan ("Abed")',
    "عمر النجدي": "Omar El-Nagdi",
    "منى السعودي": "Mona Saudi",
    "سلفادور دالي": "Salvador Dalí",
}


def slugify_en(name):
    import re
    s = name.lower()
    s = re.sub(r'["\'()«»]', '', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def main():
    artists = json.loads((ROOT / "data/artists.json").read_text(encoding="utf-8"))
    by_name_en = {a['name_en']: a for a in artists}

    existing_media = json.loads((ROOT / "data/media.json").read_text(encoding="utf-8"))
    existing_artworks = json.loads((ROOT / "data/artworks.json").read_text(encoding="utf-8"))

    next_media_num = max(int(m['id'].split('-')[1]) for m in existing_media) + 1
    next_artwork_num = max(int(a['id'].split('-')[1]) for a in existing_artworks) + 1

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    new_media = []
    new_artworks = []

    for folder_ar, name_en in ARTIST_FOLDERS.items():
        artist = by_name_en.get(name_en)
        if not artist:
            print(f"SKIP (no artist record): {name_en}")
            continue
        folder = PHOTO_ROOT / folder_ar
        if not folder.exists():
            continue
        # Exclude "WhatsApp Image..." files -- those are artist portraits, not artwork photos.
        photos = sorted(
            f for f in folder.iterdir()
            if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp') and not f.name.startswith('WhatsApp')
        )
        artist_slug = artist['slug']
        for i, photo in enumerate(photos, start=1):
            ext = photo.suffix.lower()
            dest_name = f"{artist_slug}-{i:02d}{ext}"
            dest_path = PUBLIC_DIR / dest_name
            shutil.copy2(photo, dest_path)

            media_id = f"media-{next_media_num:03d}"
            next_media_num += 1
            new_media.append({
                "id": media_id,
                "url": f"/images/artworks/{dest_name}",
                "alt_en": f"Untitled work by {name_en}, image {i}",
                "alt_ar": f"عمل بدون عنوان للفنان {artist['name_ar']}، صورة {i}",
                "type": "image",
                "mime_type": "image/jpeg" if ext in ('.jpg', '.jpeg') else "image/png",
                "file_size": dest_path.stat().st_size,
                "storage_provider": "local",
                "storage_path": f"/images/artworks/{dest_name}",
                "created_at": "2026-08-01T00:00:00Z",
                "updated_at": "2026-08-01T00:00:00Z",
            })

            artwork_id = f"aw-{next_artwork_num:03d}"
            next_artwork_num += 1
            slug = f"{artist_slug}-untitled-{i:02d}"
            new_artworks.append({
                "id": artwork_id,
                "slug": slug,
                "title_en": f"Untitled, {name_en} ({i})",
                "title_ar": f"بدون عنوان، {artist['name_ar']} ({i})",
                "artist_id": artist['id'],
                "collection_id": None,
                "year": 2020,
                "medium_en": "Medium to be confirmed",
                "medium_ar": "الخامة قيد التأكيد",
                "dimensions": "Dimensions to be confirmed",
                "description_en": "Imported from the gallery archive; title, medium, and dimensions pending confirmation.",
                "description_ar": "مستورد من أرشيف الجاليري؛ العنوان والخامة والأبعاد قيد التأكيد.",
                "price": None,
                "currency": "SAR",
                "price_status": "price_on_request",
                "availability_status": "not_for_sale",
                "visibility_status": "private",
                "primary_image_id": media_id,
                "featured": False,
                "display_order": i,
                "is_featured_homepage": False,
                "created_at": "2026-08-01T00:00:00Z",
                "updated_at": "2026-08-01T00:00:00Z",
            })

    (ROOT / "data/media.json").write_text(
        json.dumps(existing_media + new_media, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (ROOT / "data/artworks.json").write_text(
        json.dumps(existing_artworks + new_artworks, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"Added {len(new_artworks)} artworks across {len(ARTIST_FOLDERS)} artists")
    print(f"Added {len(new_media)} media entries")


if __name__ == '__main__':
    main()
