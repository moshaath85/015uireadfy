#!/usr/bin/env python3
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTO_ROOT = ROOT / "imports/FOR EASY UPLOAD/ARTITSTS AND ARTWORKS"
PUBLIC_ARTISTS_DIR = ROOT / "public/images/artists"
PUBLIC_ARTWORKS_DIR = ROOT / "public/images/artworks"

# folder (Arabic) -> transliterated English name. Excludes the 17 already imported
# from the bio doc, and "مجهول المصدر" (literally "unknown source" -- not a real name).
REMAINING = {
    "ابتسام ال ابراهيم": "Ibtisam Al-Ibrahim",
    "ابتهاج فخرو": "Ibtihaj Fakhro",
    "احمد عنان": "Ahmed Anan",
    "الشيخ ادريس": "Al-Sheikh Idris",
    "المعز العجيمي": "Al-Muizz Al-Ajimi",
    "انوار": "Anwar",
    "جورج بهجوري": "George Bahgory",
    "حاتم المطلق": "Hatem Al-Mutlaq",
    "حسن مسعودي": "Hassan Massoudy",
    "خالد الغنام": "Khaled Al-Ghannam",
    "خالد المطلق": "Khaled Al-Mutlaq",
    "خليل حسن": "Khalil Hassan",
    "رائدة عاشور": "Raeda Ashour",
    "رافع الناصري": "Rafa Nasiri",
    "ركان دبدوب": "Rakan Debdoub",
    "ريم الفيصل": "Reem Al-Faisal",
    "سبهان ادم": "Sabhan Adam",
    "سعد الكعبي": "Saad Al-Kaabi",
    "سعيد الاحمري": "Saeed Al-Ahmari",
    "صالح القرني": "Saleh Al-Qarni",
    "صالح النجار": "Saleh Al-Najjar",
    "صالح خطاب": "Saleh Khattab",
    "صفية بن زقر": "Safeya Binzagr",
    "ضياء غزاوي": "Diaa Ghazawi",
    "عبدالعزيز طاهر": "Abdulaziz Taher",
    "عبدالله الاحمري": "Abdullah Al-Ahmari",
    "عبدالله حماس": "Abdullah Hammas",
    "عبدالهادي": "Abdulhadi",
    "عثمان خزيم": "Othman Khuzaim",
    "عثمان طه": "Othman Taha",
    "عقيل الاوسي": "Aqeel Al-Awsi",
    "علي الصفار": "Ali Al-Saffar",
    "عمر الشهابي": "Omar Al-Shihabi",
    "فهد النعيمه": "Fahad Al-Nuaimah",
    "فهد غرمان": "Fahad Gharman",
    "فيصل العبدالله": "Faisal Al-Abdullah",
    "قيس السندي": "Qais Al-Sindi",
    "محمد الزهراني": "Mohammed Al-Zahrani",
    "محمد صبري": "Mohammed Sabry",
    "مريم الجمعة": "Maryam Al-Jumaa",
    "نوال مصلي": "Nawal Musalli",
    "وليد الروبيعة": "Waleed Al-Rubaiah",
}


def slugify_en(name):
    s = name.lower()
    s = re.sub(r'["\'()«»]', '', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def pick_portrait(folder):
    files = [f for f in folder.iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')]
    portraits = [f for f in files if f.name.startswith('WhatsApp')]
    return sorted(portraits)[0] if portraits else None


def pick_artworks(folder):
    return sorted(
        f for f in folder.iterdir()
        if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp') and not f.name.startswith('WhatsApp')
    )


def main():
    artists = json.loads((ROOT / "data/artists.json").read_text(encoding="utf-8"))
    media = json.loads((ROOT / "data/media.json").read_text(encoding="utf-8"))
    artworks = json.loads((ROOT / "data/artworks.json").read_text(encoding="utf-8"))

    next_artist_num = max(int(a['id'].split('-')[1]) for a in artists) + 1
    next_media_num = max(int(m['id'].split('-')[1]) for m in media) + 1
    next_artwork_num = max(int(a['id'].split('-')[1]) for a in artworks) + 1

    PUBLIC_ARTISTS_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_ARTWORKS_DIR.mkdir(parents=True, exist_ok=True)

    new_artists, new_media, new_artworks = [], [], []

    for folder_ar, name_en in REMAINING.items():
        folder = PHOTO_ROOT / folder_ar
        if not folder.exists():
            print(f"MISSING: {folder_ar}")
            continue

        artist_id = f"art-{next_artist_num:03d}"
        slug = slugify_en(name_en)
        next_artist_num += 1

        profile_image_id = None
        portrait = pick_portrait(folder)
        if portrait:
            ext = portrait.suffix.lower()
            dest_name = f"{slug}-profile{ext}"
            dest_path = PUBLIC_ARTISTS_DIR / dest_name
            shutil.copy2(portrait, dest_path)
            media_id = f"media-{next_media_num:03d}"
            next_media_num += 1
            new_media.append({
                "id": media_id, "url": f"/images/artists/{dest_name}",
                "alt_en": f"{name_en} profile photo", "alt_ar": f"صورة الفنان {folder_ar}",
                "type": "image", "mime_type": "image/jpeg" if ext in ('.jpg', '.jpeg') else "image/png",
                "file_size": dest_path.stat().st_size, "storage_provider": "local",
                "storage_path": f"/images/artists/{dest_name}",
                "created_at": "2026-08-01T00:00:00Z", "updated_at": "2026-08-01T00:00:00Z",
            })
            profile_image_id = media_id

        new_artists.append({
            "id": artist_id, "slug": slug, "name_en": name_en, "name_ar": folder_ar,
            "bio_en": "Biography pending confirmation from the gallery archive.",
            "bio_ar": "السيرة الذاتية قيد التأكيد من أرشيف الجاليري.",
            "birth_year": 1900, "nationality_en": "To be confirmed", "nationality_ar": "قيد التأكيد",
            "profile_image_id": profile_image_id, "featured": False, "display_order": next_artist_num,
            "representation_status": "collection", "visibility_status": "private",
            "created_at": "2026-08-01T00:00:00Z", "updated_at": "2026-08-01T00:00:00Z",
        })

        artwork_photos = pick_artworks(folder)
        for i, photo in enumerate(artwork_photos, start=1):
            ext = photo.suffix.lower()
            dest_name = f"{slug}-{i:02d}{ext}"
            dest_path = PUBLIC_ARTWORKS_DIR / dest_name
            shutil.copy2(photo, dest_path)
            media_id = f"media-{next_media_num:03d}"
            next_media_num += 1
            new_media.append({
                "id": media_id, "url": f"/images/artworks/{dest_name}",
                "alt_en": f"Untitled work by {name_en}, image {i}", "alt_ar": f"عمل بدون عنوان للفنان {folder_ar}، صورة {i}",
                "type": "image", "mime_type": "image/jpeg" if ext in ('.jpg', '.jpeg') else "image/png",
                "file_size": dest_path.stat().st_size, "storage_provider": "local",
                "storage_path": f"/images/artworks/{dest_name}",
                "created_at": "2026-08-01T00:00:00Z", "updated_at": "2026-08-01T00:00:00Z",
            })
            artwork_id = f"aw-{next_artwork_num:03d}"
            next_artwork_num += 1
            new_artworks.append({
                "id": artwork_id, "slug": f"{slug}-untitled-{i:02d}",
                "title_en": f"Untitled, {name_en} ({i})", "title_ar": f"بدون عنوان، {folder_ar} ({i})",
                "artist_id": artist_id, "collection_id": None, "year": 2020,
                "medium_en": "Medium to be confirmed", "medium_ar": "الخامة قيد التأكيد",
                "dimensions": "Dimensions to be confirmed",
                "description_en": "Imported from the gallery archive; title, medium, and dimensions pending confirmation.",
                "description_ar": "مستورد من أرشيف الجاليري؛ العنوان والخامة والأبعاد قيد التأكيد.",
                "price": None, "currency": "SAR", "price_status": "price_on_request",
                "availability_status": "not_for_sale", "visibility_status": "private",
                "primary_image_id": media_id, "featured": False, "display_order": i,
                "is_featured_homepage": False,
                "created_at": "2026-08-01T00:00:00Z", "updated_at": "2026-08-01T00:00:00Z",
            })

    (ROOT / "data/artists.json").write_text(json.dumps(artists + new_artists, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "data/media.json").write_text(json.dumps(media + new_media, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "data/artworks.json").write_text(json.dumps(artworks + new_artworks, ensure_ascii=False, indent=2), encoding="utf-8")

    with_photo = sum(1 for a in new_artists if a['profile_image_id'])
    print(f"Added {len(new_artists)} artists ({with_photo} with portrait, {len(new_artists) - with_photo} without)")
    print(f"Added {len(new_artworks)} artworks, {len(new_media)} media entries")


if __name__ == '__main__':
    main()
