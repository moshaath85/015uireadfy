#!/usr/bin/env python3
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTO_ROOT = ROOT / "imports/FOR EASY UPLOAD/projects"
PUBLIC_DIR = ROOT / "public/images/projects"

PROJECTS = [
    {
        "folder": "امارة الحدود الشمالية",
        "title_en": "Northern Borders Region Emirate",
        "title_ar": "إمارة منطقة الحدود الشمالية",
        "client_en": "Northern Borders Region Emirate",
        "client_ar": "إمارة منطقة الحدود الشمالية",
    },
    {
        "folder": "ديوانية القلم الذهبي",
        "title_en": "Golden Pen Diwaniya",
        "title_ar": "ديوانية القلم الذهبي",
        "client_en": "Golden Pen Diwaniya",
        "client_ar": "ديوانية القلم الذهبي",
    },
    {
        "folder": "مركز الأمير محمد بن سلمان العالمي للخط العربي",
        "title_en": "Prince Mohammed bin Salman International Center for Arabic Calligraphy",
        "title_ar": "مركز الأمير محمد بن سلمان العالمي للخط العربي",
        "client_en": "Prince Mohammed bin Salman International Center for Arabic Calligraphy",
        "client_ar": "مركز الأمير محمد بن سلمان العالمي للخط العربي",
    },
    {
        "folder": "مستشفى الرياض الجامعي",
        "title_en": "Riyadh University Hospital",
        "title_ar": "مستشفى الرياض الجامعي",
        "client_en": "Riyadh University Hospital",
        "client_ar": "مستشفى الرياض الجامعي",
    },
    {
        "folder": "مستشفى الموسى في الدمام",
        "title_en": "Al-Mousa Hospital, Dammam",
        "title_ar": "مستشفى الموسى في الدمام",
        "client_en": "Al-Mousa Hospital",
        "client_ar": "مستشفى الموسى",
    },
    {
        "folder": "مشروع تطوير التعليم القابضة",
        "title_en": "Tatweer Education Holding Project",
        "title_ar": "مشروع تطوير التعليم القابضة",
        "client_en": "Tatweer Education Holding",
        "client_ar": "تطوير التعليم القابضة",
    },
    {
        "folder": "مشروع مجسم المؤسس “سيرة وقامة”",
        "title_en": "Founder Monument Project — \"A Life and a Legacy\"",
        "title_ar": "مشروع مجسم المؤسس «سيرة وقامة»",
        "client_en": None,
        "client_ar": None,
    },
]


def slugify_en(name):
    s = name.lower()
    s = re.sub(r'["\'()«»—]', '', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def find_photos(folder_path):
    return sorted(f for f in folder_path.rglob('*') if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp'))


def main():
    existing_media = json.loads((ROOT / "data/media.json").read_text(encoding="utf-8"))
    existing_projects = json.loads((ROOT / "data/projects.json").read_text(encoding="utf-8"))

    next_media_num = max(int(m['id'].split('-')[1]) for m in existing_media) + 1
    next_project_num = max(int(p['id'].split('-')[1]) for p in existing_projects) + 1

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    new_media = []
    new_projects = []

    for p in PROJECTS:
        folder = PHOTO_ROOT / p['folder']
        if not folder.exists():
            print(f"MISSING FOLDER: {p['folder']}")
            continue
        photos = find_photos(folder)
        if not photos:
            print(f"NO PHOTOS: {p['folder']}")
            continue
        slug = slugify_en(p['title_en'])
        cover_photo = photos[0]
        ext = cover_photo.suffix.lower()
        dest_name = f"{slug}-cover{ext}"
        dest_path = PUBLIC_DIR / dest_name
        shutil.copy2(cover_photo, dest_path)

        media_id = f"media-{next_media_num:03d}"
        next_media_num += 1
        new_media.append({
            "id": media_id,
            "url": f"/images/projects/{dest_name}",
            "alt_en": f"{p['title_en']} cover image",
            "alt_ar": f"صورة غلاف {p['title_ar']}",
            "type": "image",
            "mime_type": "image/jpeg" if ext in ('.jpg', '.jpeg') else "image/png",
            "file_size": dest_path.stat().st_size,
            "storage_provider": "local",
            "storage_path": f"/images/projects/{dest_name}",
            "created_at": "2026-08-01T00:00:00Z",
            "updated_at": "2026-08-01T00:00:00Z",
        })

        project_id = f"proj-{next_project_num:03d}"
        next_project_num += 1
        new_projects.append({
            "id": project_id,
            "slug": slug,
            "title_en": p['title_en'],
            "title_ar": p['title_ar'],
            "description_en": "Imported from the gallery archive; project description pending confirmation.",
            "description_ar": "مستورد من أرشيف الجاليري؛ وصف المشروع قيد التأكيد.",
            "client_en": p['client_en'],
            "client_ar": p['client_ar'],
            "type": "commission",
            "year": 2024,
            "status": "completed",
            "featured": False,
            "cover_media_id": media_id,
            "visibility_status": "private",
            "display_order": next_project_num,
            "created_at": "2026-08-01T00:00:00Z",
            "updated_at": "2026-08-01T00:00:00Z",
        })
        print(f"OK: {p['title_en']} ({len(photos)} photos found, cover set)")

    (ROOT / "data/media.json").write_text(
        json.dumps(existing_media + new_media, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (ROOT / "data/projects.json").write_text(
        json.dumps(existing_projects + new_projects, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nAdded {len(new_projects)} projects, {len(new_media)} media entries")


if __name__ == '__main__':
    main()
