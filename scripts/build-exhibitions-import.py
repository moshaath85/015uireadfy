#!/usr/bin/env python3
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTO_ROOT = ROOT / "imports/FOR EASY UPLOAD/initiatives"
PUBLIC_DIR = ROOT / "public/images/exhibitions"

EXHIBITIONS = [
    {"folder": "VERNISSAGE NEW & OLD WORK (sama gallery)", "title_en": "Vernissage: New & Old Work (Sama Gallery)", "title_ar": "فرنيساج: أعمال جديدة وقديمة (صالة سما)"},
    {"folder": "المشاركة في فعالية اسبوع فن الرياض", "title_en": "Participation in Riyadh Art Week", "title_ar": "المشاركة في فعالية أسبوع فن الرياض"},
    {"folder": "مشاركة في ملتقى مسك ارت", "title_en": "Participation in Misk Art Forum", "title_ar": "مشاركة في ملتقى مسك آرت"},
    {"folder": "معرض اصالة حرف (sama gallery)", "title_en": "Asalat Harf Exhibition (Sama Gallery)", "title_ar": "معرض أصالة حرف (صالة سما)"},
    {"folder": "معرض الفن السعودي في اربعة عقود", "title_en": "Saudi Art in Four Decades", "title_ar": "معرض الفن السعودي في أربعة عقود"},
    {"folder": "معرض خاص بالتعاون مع المصرفية الخاصة للبنك السعودي", "title_en": "Special Exhibition in Collaboration with Saudi National Bank Private Banking", "title_ar": "معرض خاص بالتعاون مع المصرفية الخاصة للبنك السعودي"},
    {"folder": "معرض سحايب 2019", "title_en": "Sahayeb Exhibition 2019", "title_ar": "معرض سحايب 2019"},
    {"folder": "معرض شخصي  علياء البازعي", "title_en": "Alia Al-Bazei Solo Exhibition", "title_ar": "معرض شخصي — علياء البازعي"},
    {"folder": "معرض شخصي سلايل معزي نسل الامام الفنان عبدالله البراك", "title_en": "Salael Mu'izzi: Lineage of the Imam — Abdullah Al-Barrak Solo Exhibition", "title_ar": "معرض شخصي «سلايل معزي: نسل الإمام» للفنان عبدالله البراك"},
    {"folder": "معرض شخصي مدد للفنان خالد مراد", "title_en": "Madad — Khaled Mourad Solo Exhibition", "title_ar": "معرض شخصي «مدد» للفنان خالد مراد"},
    {"folder": "معرض علياء الفارسي", "title_en": "Alia Al-Farsi Exhibition", "title_ar": "معرض علياء الفارسي"},
    {"folder": "معرض كشف النقاب في لندن", "title_en": "Unveiling Exhibition, London", "title_ar": "معرض كشف النقاب في لندن"},
    {"folder": "معرض نواصي الخير في قطر", "title_en": "Nawasi Al-Khair Exhibition, Qatar", "title_ar": "معرض نواصي الخير في قطر"},
]


def slugify_en(name):
    s = name.lower()
    s = re.sub(r'["\'()«»:&]', '', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def find_photos(folder_path):
    return sorted(f for f in folder_path.rglob('*') if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp'))


def main():
    existing_media = json.loads((ROOT / "data/media.json").read_text(encoding="utf-8"))
    existing_exhibitions = json.loads((ROOT / "data/exhibitions.json").read_text(encoding="utf-8"))

    next_media_num = max(int(m['id'].split('-')[1]) for m in existing_media) + 1
    next_ex_num = max(int(e['id'].split('-')[1]) for e in existing_exhibitions) + 1

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    new_media = []
    new_exhibitions = []

    for e in EXHIBITIONS:
        folder = PHOTO_ROOT / e['folder']
        if not folder.exists():
            print(f"MISSING FOLDER: {e['folder']}")
            continue
        photos = find_photos(folder)
        if not photos:
            print(f"NO PHOTOS: {e['folder']}")
            continue
        slug = slugify_en(e['title_en'])
        cover_photo = photos[0]
        ext = cover_photo.suffix.lower()
        dest_name = f"{slug}-cover{ext}"
        dest_path = PUBLIC_DIR / dest_name
        shutil.copy2(cover_photo, dest_path)

        media_id = f"media-{next_media_num:03d}"
        next_media_num += 1
        new_media.append({
            "id": media_id,
            "url": f"/images/exhibitions/{dest_name}",
            "alt_en": f"{e['title_en']} cover image",
            "alt_ar": f"صورة غلاف {e['title_ar']}",
            "type": "image",
            "mime_type": "image/jpeg" if ext in ('.jpg', '.jpeg') else "image/png",
            "file_size": dest_path.stat().st_size,
            "storage_provider": "local",
            "storage_path": f"/images/exhibitions/{dest_name}",
            "created_at": "2026-08-01T00:00:00Z",
            "updated_at": "2026-08-01T00:00:00Z",
        })

        ex_id = f"ex-{next_ex_num:03d}"
        next_ex_num += 1
        new_exhibitions.append({
            "id": ex_id,
            "slug": slug,
            "title_en": e['title_en'],
            "title_ar": e['title_ar'],
            "description_en": "Imported from the gallery archive; exhibition description pending confirmation.",
            "description_ar": "مستورد من أرشيف الجاليري؛ وصف المعرض قيد التأكيد.",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "venue_en": "Venue to be confirmed",
            "venue_ar": "المكان قيد التأكيد",
            "status": "past",
            "featured": False,
            "cover_media_id": media_id,
            "visibility_status": "private",
            "display_order": next_ex_num,
            "created_at": "2026-08-01T00:00:00Z",
            "updated_at": "2026-08-01T00:00:00Z",
        })
        print(f"OK: {e['title_en']} ({len(photos)} photos found, cover set)")

    (ROOT / "data/media.json").write_text(
        json.dumps(existing_media + new_media, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (ROOT / "data/exhibitions.json").write_text(
        json.dumps(existing_exhibitions + new_exhibitions, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nAdded {len(new_exhibitions)} exhibitions, {len(new_media)} media entries")


if __name__ == '__main__':
    main()
