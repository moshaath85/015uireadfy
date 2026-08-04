# Museum Schema Proposal

**Status: PROPOSAL ONLY. No migration has been generated or applied.**
Per the production-blockers brief's own instruction ("if a schema migration
is required, stop first"), this document is the stop. Nothing in
`prisma/schema.prisma` or the database has changed as a result of this
document.

## Why a schema is needed at all

Confirmed in `docs/PRODUCTION_FUNCTIONAL_AUDIT.md` §4: the Museum has **no
database representation whatsoever**. Today:

- `src/app/museum/page.tsx` hardcodes which 8 artworks appear as a literal
  array of artwork IDs (`EXHIBITION.heroes`, `.secondary`, `.all`).
- `src/components/museum/config/museum-artworks.config.ts` hardcodes where
  each one hangs — `wallId` + `[x, y, z]` — as a **second**, independent
  array, keyed by position order, not by artwork ID.
- Room geometry (`museum-room.config.ts`), lighting, and camera behaviour
  are further static files.

Changing the exhibition means editing three TypeScript files and
redeploying. There is nothing for a dashboard to read, write, or validate
against. This is not a bug to patch — it is the absence of a data model,
and "connect the Museum to the dashboard" is only meaningful once one
exists.

## Design principles this proposal follows

1. **Structure is relational; presentation stays JSON.** Rooms, walls, and
   *which artwork is on which wall* are the facts a curator edits and a
   dashboard must validate (uniqueness, bounds, collisions) — these become
   real columns and foreign keys. Lighting rigs, camera easing constants,
   and material tuning are numbers nobody outside a 3D artist will ever
   want a form for — these stay as JSON, exactly the way `Service.price_info`
   and `CertificateTemplate.label_schema` already do elsewhere in this
   schema. This matches the brief's own instruction: "room lighting or
   visual settings only if already supported" — it already is, as code; the
   proposal keeps it as data in the same shape, not as twelve new tables.
2. **Every model follows the conventions already in this schema.** cuid PK,
   `organizationId` scoping (`@@unique([organizationId, id])`), soft delete
   via `archivedAt`, `visibilityStatus` for draft/published, bilingual
   `_en`/`_ar` text columns, `createdAt`/`updatedAt`. Nothing new is
   invented at the schema-design level — this is the same shape as
   `Exhibition` or `Project`.
3. **No physical-dimension guessing.** `ArtworkPlacement` stores its own
   `widthCm`/`heightCm` snapshot rather than always deriving from
   `Artwork.dimensions` live — because 245 of 268 works currently have no
   parseable dimensions (per the metadata audit), and a placement without a
   known size needs to be flagged, not silently defaulted. A curator sets
   the physical size once when placing a work; if the artwork's own record
   is later corrected, the placement is not silently resized underneath a
   composition someone approved.

## Proposed models

```prisma
model MuseumRoom {
  id               String              @id @default(cuid())
  organizationId   String              @map("organization_id")
  organization     Organization        @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  slug             String
  nameEn           String              @map("name_en")
  nameAr           String              @map("name_ar")
  descriptionEn    String              @map("description_en")
  descriptionAr    String              @map("description_ar")

  // Metres, matching the existing Three.js scene's units exactly
  // (see museum-room.config.ts ROOM = {width:15, height:4.8, depth:11}).
  widthM           Float               @map("width_m")
  heightM          Float               @map("height_m")
  depthM           Float               @map("depth_m")

  coverMediaId     String?             @map("cover_media_id")
  coverMedia       Media?              @relation("MuseumRoomCoverMedia", fields: [organizationId, coverMediaId], references: [organizationId, id], onDelete: SetNull)

  exhibitionId     String?             @map("exhibition_id")
  exhibition       Exhibition?         @relation(fields: [organizationId, exhibitionId], references: [organizationId, id], onDelete: SetNull)

  // Lighting rig, camera pose, material tuning: read verbatim by the
  // renderer as MuseumSceneConfig's shape. Not normalized — see principle 1.
  sceneConfig      Json                @map("scene_config")

  displayOrder     Int                 @default(0) @map("display_order")
  visibilityStatus String              @default("draft") @map("visibility_status")
  walls            MuseumWall[]
  createdAt        DateTime            @default(now()) @map("created_at")
  updatedAt        DateTime            @updatedAt @map("updated_at")
  archivedAt       DateTime?           @map("archived_at")

  @@unique([organizationId, id])
  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([exhibitionId])
  @@index([visibilityStatus])
}

model MuseumWall {
  id             String            @id @default(cuid())
  organizationId String            @map("organization_id")
  roomId         String            @map("room_id")
  room           MuseumRoom        @relation(fields: [organizationId, roomId], references: [organizationId, id], onDelete: Cascade)

  /** Matches WallDefinition.id today ('back' | 'left' | 'right' | ...) —
      a stable slug within the room, not a free label. */
  wallKey        String            @map("wall_key")
  label          String

  widthM         Float             @map("width_m")
  heightM        Float             @map("height_m")

  // [x, y, z] and [rx, ry, rz], stored as JSON pairs rather than six
  // separate float columns — always read and written together, never
  // queried individually, exactly like ArtworkPlacement.position today.
  position       Json
  rotation       Json

  placements     ArtworkPlacement[]
  createdAt      DateTime          @default(now()) @map("created_at")
  updatedAt      DateTime          @updatedAt @map("updated_at")

  @@unique([organizationId, id])
  @@unique([organizationId, roomId, wallKey])
  @@index([organizationId])
  @@index([roomId])
}

model ArtworkPlacement {
  id              String       @id @default(cuid())
  organizationId  String       @map("organization_id")
  wallId          String       @map("wall_id")
  wall            MuseumWall   @relation(fields: [organizationId, wallId], references: [organizationId, id], onDelete: Cascade)
  artworkId       String       @map("artwork_id")
  artwork         Artwork      @relation(fields: [organizationId, artworkId], references: [organizationId, id], onDelete: Restrict)

  // Offset from wall centre, metres — matches ArtworkPlacement.position
  // today (position: [number,number,number], read as an offset not a
  // world coordinate).
  offsetXM        Float        @map("offset_x_m")
  offsetYM        Float        @default(0) @map("offset_y_m")

  // A snapshot, not a live join — see design principle 3.
  widthCm         Float?       @map("width_cm")
  heightCm        Float?       @map("height_cm")
  framed          Boolean      @default(false)

  isHero          Boolean      @default(false) @map("is_hero")
  displayOrder    Int          @default(0) @map("display_order")
  curatorialNote  String?      @map("curatorial_note")

  visibilityStatus String      @default("draft") @map("visibility_status")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")
  archivedAt      DateTime?    @map("archived_at")

  @@unique([organizationId, id])
  // One artwork hangs in one place at a time — prevents the exact class of
  // bug the current two-hardcoded-arrays setup has no defence against.
  @@unique([organizationId, wallId, artworkId])
  @@index([organizationId])
  @@index([wallId])
  @@index([artworkId])
  @@index([visibilityStatus])
}
```

Three additions to existing models (both nullable/optional, so existing
rows and code are unaffected):

```prisma
model Organization {
  // ...existing fields...
  museumRooms MuseumRoom[]
}

model Media {
  // ...existing fields...
  museumRoomCovers MuseumRoom[] @relation("MuseumRoomCoverMedia")
}

model Artwork {
  // ...existing fields...
  museumPlacements ArtworkPlacement[]
}

model Exhibition {
  // ...existing fields...
  museumRooms MuseumRoom[]
}
```

## Backward compatibility

- **Purely additive.** Three new tables, zero changed columns, zero changed
  types on any existing table. No existing query, repository function, or
  page breaks.
- **The public Museum keeps working unmodified until it's switched over.**
  `src/app/museum/page.tsx` is not touched by the migration itself — the
  cutover (reading `MuseumRoom`/`ArtworkPlacement` instead of the hardcoded
  arrays) is a follow-up code change, done and tested separately, so the
  migration can land and be verified empty before any rendering logic
  depends on it.
- **Rollback is a plain `DROP TABLE` in reverse dependency order**
  (`ArtworkPlacement` → `MuseumWall` → `MuseumRoom`) with no data loss
  anywhere else, because nothing else references these tables until the
  Media/Artwork/Exhibition back-relations are populated, which won't happen
  until real rooms exist.

## Migration plan

1. `npx prisma migrate dev --name add_museum_rooms` generates the SQL from
   the schema above — reviewed before applying, per your team's normal
   process for this repo.
2. Apply to the Neon dev branch first; verify `prisma studio` shows the
   three empty tables and no existing query regresses (`npm run test`,
   `npm run typecheck`, `npm run build`).
3. **A seed step, not part of the schema migration**, populates one
   `MuseumRoom` + its `MuseumWall` rows from the current
   `museum-room.config.ts` / `museum-artworks.config.ts` values verbatim —
   so the very first room in the database is byte-for-byte the room that's
   live today. This is a data-migration script (`scripts/seed-museum.mjs`,
   following the pattern of `scripts/migrate-legacy-json.mjs`), reviewed
   and run separately from the schema change.
4. Only after that seed is verified does `src/app/museum/page.tsx` switch
   from the hardcoded arrays to reading `MuseumRoom`/`ArtworkPlacement` —
   a application-code change, not a migration, and a natural point to stop
   again for a look before it ships.
5. `/admin/museum` — list/create/edit for rooms and walls, plus the
   placement editor described in the original brief (select artwork, select
   wall, X/Y offset, boundary and overlap check against the wall's
   `widthM`/`heightM` and the placement's `widthCm`/`heightCm`, preview) —
   is new admin UI built against the now-real data, no different in shape
   from the Exhibitions or Projects modules already in this codebase.

## Rollback plan

- Before step 4 (the page cutover): drop the three tables, done — the
  public Museum never depended on them.
- After step 4: revert the `museum/page.tsx` commit to restore the
  hardcoded-array code path (kept, not deleted, until the cutover has been
  live and stable), then drop the tables. The live 3D experience is never
  down for longer than a deploy.

## What this proposal deliberately does not include

- **Collision/boundary validation logic** — that is application code in
  the placement editor (step 5), not a schema concern; the schema only
  stores what it needs to validate against (`MuseumWall.widthM/heightM`,
  `ArtworkPlacement.widthCm/heightCm`).
- **A generic "scale reference" (silhouette/bench/door) entity** — the
  brief asks for this to be "subtle and optional"; it's a rendering
  decision in the Three.js layer, not something that needs a database row.
- **Multi-room navigation/routing between rooms** — `museum-routes.config.ts`
  and `MuseumHotspots.tsx` already handle in-scene navigation; nothing here
  requires touching that system, only where a room's *content* comes from.

## What I need from you before I write a single line of migration SQL

1. Confirm the model shapes above are what you want, or tell me what to
   change.
2. Confirm the phased cutover (migrate → seed → verified → then switch the
   public page) rather than doing it in one commit.
3. Say go, and I'll generate the actual Prisma migration as its own,
   reviewable commit, separate from any code that reads the new tables.
