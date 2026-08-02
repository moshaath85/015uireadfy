#!/usr/bin/env python3
import json
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARSED = json.loads((ROOT / "imports/parsed/artists.json").read_text(encoding="utf-8"))
PHOTO_ROOT = ROOT / "imports/FOR EASY UPLOAD/ARTITSTS AND ARTWORKS"
PUBLIC_DIR = ROOT / "public/images/artists"

# index -> matched Drive folder name (manually verified; None = no photo found)
FOLDER_MATCH = {
    1: "فهد الحجيلان", 2: None, 3: None, 4: None,
    5: "عبدالرحمن سليمان", 6: "محمد سيام", 7: "محمد المنيف", 8: "د محمد الرصيص",
    9: None, 10: "سمير الدهام", 11: "عبدالله ادريس", 12: "عبدالله البراك",
    13: "خالد الفيصل", 14: None, 15: None, 16: "عليا البازعي",
    17: "محمد الاعجم", 18: "صالح الشهري", 19: "سليمان باجبع",
    20: "حسن ال رضوان عابد", 21: None, 22: "عمر النجدي", 23: "منى السعودي",
    24: "سلفادور دالي",
}

TRANSLATIONS = {
    1: {"name_en": "Fahad Al-Hijailan", "nationality_en": "Saudi", "bio_en": "Fahad Al-Hijailan is one of the established names in the modern Saudi visual art movement, known for the simplicity and clarity of his compositions and a striking ability to distill the human scene into line and color.\n\nBorn in Bilbeis, Egypt in 1957, he moved to Riyadh where he spent his youth and early adulthood, later settling in Jeddah in 1995. He earned a diploma in art education with distinction and worked in editorial illustration for nearly 17 years at Al-Jazirah and Al-Riyadh newspapers before dedicating himself fully to fine art in 1999.\n\nAmong his best-known exhibitions are \"The Weeping of Colors\" and \"Years of Tin,\" and he took part in numerous exhibitions inside and outside the Kingdom, earning wide critical acclaim. He passed away in 2018, mourned by artists across Saudi Arabia and the Arab world."},
    2: {"name_en": "Taha Al-Sabban", "nationality_en": "Saudi", "bio_en": "One of the pioneers of Saudi visual art and among the most influential figures in Jeddah's art scene, he devoted a career spanning more than half a century to the memory of place, evoking old houses and neighborhoods through distinctive expressive color treatments.\n\nBorn in Makkah in 1948, he was the first head of the Saudi Society of Visual Artists' house, head of the Fine Arts Department at the Jeddah Arts and Culture Society in 1992, and general supervisor of the Jeddah Atelier for Fine Arts since 1989.\n\nHe held numerous local and international exhibitions, with works in prominent public collections including King Abdulaziz International Airport and the Jeddah Chamber of Commerce. He received the Visual Arts Award from the National Cultural Awards initiative in 2024."},
    3: {"name_en": "Ahmad Falimban", "nationality_en": "Saudi", "bio_en": "A visual artist and writer among the pioneers of the Saudi art movement, combining artistic practice with critical documentation of the Kingdom's art scene over five decades.\n\nBorn in Makkah in 1951, he earned a bachelor's degree from the Academy of Fine Arts in Rome in 1971 — among the first Saudis to study art in Europe. He held 23 solo exhibitions in Saudi Arabia, Italy, Austria, and Syria.\n\nHe published six books on visual art, most notably \"Saudi Visual Artists\" and \"Art in Half a Century,\" and wrote more than 400 articles and art reviews published in several languages."},
    4: {"name_en": "Abdullah Nawawi", "nationality_en": "Saudi", "bio_en": "One of the foremost pioneers of Saudi visual art, his paintings documented, in a nostalgic expressive realism, the life and popular customs of the Hejaz — especially Makkah, where he was born in 1946.\n\nHe studied at the Teachers Institute in Makkah and the Institute of Art Education in Riyadh, earning a bachelor's degree from Indiana University and a master's in art education from the University of Colorado in 1980.\n\nHe represented the Kingdom in the Union of Arab Artists from 1981 to 1989, and chaired the Visual Arts Committee at the Jeddah Arts and Culture Society. He passed away in June 2023."},
    5: {"name_en": "Abdulrahman Al-Suleiman", "nationality_en": "Saudi", "bio_en": "An artist, critic, and art historian, considered a pillar of the Saudi art movement in both practice and theory, over a five-decade career shaping his own aesthetic sensibility between abstraction and local references.\n\nBorn in Al-Ahsa in 1954. He chaired the Visual Arts Department at the Dammam Arts and Culture Society from 1987 to 2000, and was the first chairman of the Saudi Arabian Society for Culture and Arts (Fine Arts, 2007-2012).\n\nHe held solo exhibitions in Dammam, Riyadh, Jeddah, Tangier, Cairo, Kuwait, Paris, and Doha, and received the Sharjah International Biennial Award in 1997. The gallery's team visited his studio and documented his practice."},
    6: {"name_en": "Mohammed Siam", "nationality_en": "Saudi", "bio_en": "A first-generation artist of the Saudi visual art movement, known for his distinctive use of pastel colors and a translucent realism wrapped in imagination.\n\nBorn in Makkah in 1954, he worked as an art education teacher and later as deputy head of the Visual Arts Committee at the Madinah Arts and Culture Society.\n\nHe was a founding member of the Madinah Artists Group in 1981 — one of the Kingdom's earliest pioneering art collectives — alongside Mansour Kurdi and Fouad Maghrabel. He passed away in 2011 at the age of 57."},
    7: {"name_en": "Mohammed Al-Muneef", "nationality_en": "Saudi", "bio_en": "An artist, critic, and researcher among the founding pioneers of Saudi art, his paintings belong to the impressionist style, depicting the simplicity of old heritage village houses and the transformations the Kingdom has witnessed.\n\nBorn in Hotat Sudair in 1952, he earned a diploma in art education from the Institute of Art Education in Riyadh in 1973.\n\nHe chaired the board of the Saudi Arabian Society for Culture and Arts from 2012 to 2017, and for decades wrote a press column on the art movement, most notably \"Drawing Has Meaning\" in Al-Jazirah newspaper."},
    8: {"name_en": "Mohammed Al-Rasees", "nationality_en": "Saudi", "bio_en": "One of the pioneers of abstraction in Saudi art and among its most prominent academics, he built his technique on intensive study, merging impressionist brushwork with cubist compositional structure to create a distinctive abstract language.\n\nBorn in 1950, he earned a diploma in art education in 1969, a bachelor's degree from Helwan University in 1977, a master's from Ohio University in 1982, and a doctorate in art education from the same university in 1989.\n\nHe held his first solo exhibition in Riyadh in 1973, worked as an art professor and head of the Art Department at King Saud University, and chaired the board of the Arts and Culture Society in 2010."},
    9: {"name_en": "Dr. Fouad Maghrabel", "nationality_en": "Saudi", "bio_en": "One of the most renowned Saudi visual artists and most closely tied to his city; Madinah — its architecture and spirit — forms the core of most of his paintings.\n\nBorn in Madinah in 1951. Together with Mohammed Siam and Mansour Kurdi, he founded the Madinah Artists Group, a pioneer among the Kingdom's art collectives.\n\nAlongside his artistic practice, he is known for his extensive efforts in promoting art culture and art education, and his name is considered foundational on the map of Saudi visual art."},
    10: {"name_en": "Samir Al-Doham", "nationality_en": "Saudi", "bio_en": "An artist and media figure from the generation that led the Saudi art movement after the founding generation, his art blended tradition and modernity, focused on capturing the Kingdom's social transformation.\n\nBorn in Jubail in 1955. He began in journalism in 1971 as a social caricature illustrator at Al-Jazirah newspaper, later supervising its arts section, and was appointed head of the Visual Arts Committee at the Arts and Culture Society in 1977.\n\nHis painting \"Hai Sha'bi\" won second prize from the Ministry of Culture and Information, and one of his works was selected for the VIP lounge at King Khalid International Airport in 1988. He passed away in December 2024."},
    11: {"name_en": "Abdullah Idris", "nationality_en": "Saudi", "bio_en": "A self-taught artist considered a pioneer of experimental art on the Saudi scene, starting from local heritage and the environment of Taif before achieving a qualitative shift in form, content, and technique through the manipulation of diverse materials.\n\nHe began painting in 1975 relying on self-taught ability without formal art education, and began his professional career as a journalist at the Okaz newspaper bureau in Taif.\n\nHe has held a number of solo exhibitions, participated in international forums, and won several awards, with a career now spanning roughly half a century."},
    12: {"name_en": "Abdullah Al-Barrak", "nationality_en": "Saudi", "bio_en": "A contemporary artist and art advisor, known for the project \"Salael Mu'izzi: Lineage of the Imam\" — the solo exhibition hosted by 015 GALLERY in 2022, which visually documented the founding history of the Kingdom of Saudi Arabia and received wide media coverage including Harper's Bazaar Arabia.\n\nHis work explores the impact of culture, religion, and history, aiming to inspire new generations to explore Saudi cultural heritage through a contemporary visual language.\n\nHe serves as an advisor to 015 GALLERY and is an active voice connecting contemporary art to the national narrative."},
    13: {"name_en": "Prince Khalid Al-Faisal bin Abdulaziz Al Saud", "nationality_en": "Saudi", "bio_en": "A prince, poet, and visual artist, among the most prominent figures to combine leadership and creativity in the Arab world; his paintings carry the poetry of color alongside the imagery of the desert, horses, and the human figure.\n\nHis poetry collections — beginning with \"Nabati Poems\" — included paintings by his own hand, in a continuous dialogue between poem and image.\n\nAmong his notable artistic milestones was a joint exhibition with Prince Charles (later King of the United Kingdom) as part of the \"Painting and Patronage\" initiative launched in 1999."},
    14: {"name_en": "Khaled Mourad", "nationality_en": "French / Egyptian", "bio_en": "A French artist of Egyptian origin who presented his solo exhibition \"Madad\" at 015 GALLERY in 2024 as part of the gallery's solo exhibition program.\n\nDetails of his biography (birth, academic training, major milestones) are to be completed from the exhibition file in the gallery archive or directly from the artist."},
    15: {"name_en": "Abdullah Al-Faisal Al-Rasheed", "nationality_en": "Saudi", "bio_en": "A visual artist whose work seeks to contain the human self and bring out its inner, emotional dimension; he paints the \"hidden human\" and depicts states of submission and supplication with a contemporary Saudi character.\n\nBorn in 1969, he specialized in psychology at King Saud University — a background that clearly informs his artistic project, built on excavating memory and emotion.\n\nHe began his artistic journey in 2017 and held his first solo exhibition, \"Mahra,\" in 2023."},
    16: {"name_en": "Alia Al-Bazei", "nationality_en": "Saudi", "bio_en": "An artist of the younger generation who made her mark with an unusual medium: coffee. She paints with what remains in her cup on the pages of old dictionaries, and blends poetry with painting.\n\nShe graduated from the Art Department at King Saud University in 2000 and worked in education, passing her artistic passion on to her students.\n\nHer milestones include the group exhibition \"Colored Corners\" at King Saud University, the exhibition \"Baynahuma\" in Kuwait, and her solo exhibition at 015 GALLERY in 2024."},
    17: {"name_en": "Mohammed Al-Ajam", "nationality_en": "Saudi", "bio_en": "A contemporary artist whose work is characterized by bold colors and varied techniques, blending abstraction and symbolism, with a focus on Saudi traditions and the local environment.\n\nHe expresses his personal experience through the interplay of color and composition, and has participated in local and international exhibitions.\n\nHis works are part of the 015 GALLERY collection featured on the website."},
    18: {"name_en": "Saleh Al-Shehri", "nationality_en": "Saudi", "bio_en": "A contemporary visual artist known for a style that blends traditional and modern techniques, with vivid colors and dynamic compositions reflecting Saudi heritage and culture.\n\nBorn in 1979, his works show an interest in expressing human experience and social issues, giving his paintings multiple layers of meaning.\n\nHe has participated in local and international exhibitions and received awards and recognition; his works are part of the 015 GALLERY collection."},
    19: {"name_en": "Suleiman Bajubair", "nationality_en": "Saudi", "bio_en": "A visual artist considered among the figures contributing to the advancement of the Kingdom's art and cultural movement, blending traditional and modern techniques with bold colors and dynamic compositions.\n\nHis works focus on Saudi heritage and culture, drawing inspiration from the local environment and social customs; personal pieces attributed to him date back to 1977.\n\nHe has participated in local and international exhibitions and earned critical recognition; his works are part of the 015 GALLERY collection."},
    20: {"name_en": "Hassan Al Radhwan (\"Abed\")", "nationality_en": "Saudi", "bio_en": "A calligrapher and contemporary letterist artist who signs his work under the name \"Abed,\" a presence in the Saudi calligraphy scene and its specialized platforms.\n\nHe works with the Arabic letter as a contemporary aesthetic structure, in line with 015 GALLERY's specialization in Arabic calligraphy art.\n\nDetails of his biography (birth, training, calligraphy licenses, exhibitions) to be completed directly from the artist."},
    21: {"name_en": "Suroor Al-Alwani", "nationality_en": "Syrian (unverified)", "bio_en": "A contemporary visual artist who uses varied techniques combining traditional drawing with modern methods, with bold colors and dynamic compositions.\n\nPer the biography published on the gallery website, his works focus on identity and deep human experiences.\n\nHis works are part of the 015 GALLERY collection featured on the website."},
    22: {"name_en": "Omar El-Nagdi", "nationality_en": "Egyptian", "bio_en": "One of the most prominent figures of Egyptian and Arab modernism, his presence as both artist and teacher was a cornerstone in the development of Egyptian art after the 1952 revolution; internationally known for his epic works, foremost among them \"The Sarajevo Painting.\"\n\nBorn in the historic Bab Al-Sha'reya district of Cairo in 1931, he graduated from the Faculty of Fine Arts in 1953 and later studied in Italy, the Netherlands, and the Soviet Union.\n\nHe held his first solo exhibition at the Museum of Modern Egyptian Art in 1957, and went on to hold more than forty solo exhibitions in Cairo, Rome, Beirut, London, Paris, and Japan."},
    23: {"name_en": "Mona Saudi", "nationality_en": "Jordanian", "bio_en": "One of the greatest sculptors in the Arab world, she devoted her life to a long dialogue with stone, producing abstract sculptures that read as silent poems about land, fertility, and life.\n\nBorn in Amman in 1945, she studied at the École des Beaux-Arts in Paris in the 1960s and lived in Beirut until her passing in 2022.\n\nHer works have been exhibited across the Arab world, Europe, the United States, and Asia, and are held in major institutional and museum collections. The 015 GALLERY team visited her studio and documented her practice."},
    24: {"name_en": "Salvador Dalí", "nationality_en": "Spanish", "bio_en": "One of the greatest artists of the twentieth century and a global icon of Surrealism; he transformed dreams and the unconscious into meticulously crafted visual scenes, foremost among them \"The Persistence of Memory\" (1931).\n\nBorn in Figueres, Catalonia, in 1904, he studied at the Royal Academy of Fine Arts of San Fernando in Madrid, and joined the Surrealist movement in Paris in the late 1920s to become its most famous face.\n\nHis works are held by the world's leading museums, from MoMA in New York to the Dalí Theatre-Museum in Figueres. The presence of a documented work by him within the 015 GALLERY collection is an exceptional event in the Saudi art market."},
}


def slugify_en(name):
    s = name.lower()
    s = re.sub(r'["\'()«»]', '', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def pick_photo(folder_name):
    # Portrait photos are the "WhatsApp Image..." files (headshots on white background).
    # Coded files (e.g. FHG-1.png) are artwork photos, not portraits — never use them here.
    folder = PHOTO_ROOT / folder_name
    if not folder.exists():
        return None
    files = [f for f in folder.iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')]
    portraits = [f for f in files if f.name.startswith('WhatsApp')]
    if not portraits:
        return None
    return sorted(portraits)[0]


def main():
    existing_artists = json.loads((ROOT / "data/artists.json").read_text(encoding="utf-8"))
    existing_media = json.loads((ROOT / "data/media.json").read_text(encoding="utf-8"))

    next_artist_num = max(int(a['id'].split('-')[1]) for a in existing_artists) + 1
    next_media_num = max(int(m['id'].split('-')[1]) for m in existing_media) + 1

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    new_artists = []
    new_media = []

    for a in PARSED:
        idx = a['index']
        tr = TRANSLATIONS[idx]
        artist_id = f"art-{next_artist_num:03d}"
        slug = slugify_en(tr['name_en'])
        next_artist_num += 1

        profile_image_id = None
        folder_name = FOLDER_MATCH.get(idx)
        if folder_name:
            src_photo = pick_photo(folder_name)
            if src_photo:
                ext = src_photo.suffix.lower()
                dest_name = f"{slug}-profile{ext}"
                dest_path = PUBLIC_DIR / dest_name
                shutil.copy2(src_photo, dest_path)
                media_id = f"media-{next_media_num:03d}"
                next_media_num += 1
                new_media.append({
                    "id": media_id,
                    "url": f"/images/artists/{dest_name}",
                    "alt_en": f"{tr['name_en']} profile photo",
                    "alt_ar": f"صورة الفنان {a['name_ar']}",
                    "type": "image",
                    "mime_type": "image/jpeg" if ext in ('.jpg', '.jpeg') else "image/png",
                    "file_size": dest_path.stat().st_size,
                    "storage_provider": "local",
                    "storage_path": f"/images/artists/{dest_name}",
                    "created_at": "2026-08-01T00:00:00Z",
                    "updated_at": "2026-08-01T00:00:00Z",
                })
                profile_image_id = media_id

        new_artists.append({
            "id": artist_id,
            "slug": slug,
            "name_en": tr['name_en'],
            "name_ar": a['name_ar'],
            "bio_en": tr['bio_en'],
            "bio_ar": a['bio_ar'],
            "birth_year": a['birth_year'] or 1900,
            "nationality_en": tr['nationality_en'],
            "nationality_ar": a['nationality_ar'],
            "profile_image_id": profile_image_id,
            "featured": False,
            "display_order": idx,
            "representation_status": "collection",
            "visibility_status": "public",
            "created_at": "2026-08-01T00:00:00Z",
            "updated_at": "2026-08-01T00:00:00Z",
        })

    (ROOT / "data/artists.json").write_text(
        json.dumps(existing_artists + new_artists, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (ROOT / "data/media.json").write_text(
        json.dumps(existing_media + new_media, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    with_photo = sum(1 for a in new_artists if a['profile_image_id'])
    print(f"Added {len(new_artists)} artists ({with_photo} with profile photo, {len(new_artists) - with_photo} without)")
    print(f"Added {len(new_media)} media entries")


if __name__ == '__main__':
    main()
