import type { ArtworkPlacement } from './museum.types';

export const BACK_WALL_PLACEMENTS: ArtworkPlacement[] = [
  { wallId: 'back', position: [-3.8, 0, 0.06], hero: true },
  { wallId: 'back', position: [4.0, 0, 0.06], hero: true },
];

export const LEFT_WALL_PLACEMENTS: ArtworkPlacement[] = [
  { wallId: 'left', position: [1.0, 0, 0.06] },
];

export const RIGHT_WALL_PLACEMENTS: ArtworkPlacement[] = [
  { wallId: 'right', position: [-1.5, 0, 0.06] },
];

/* True to life: ROOM (museum-room.config.ts) is modelled in real metres —
   EYE_LEVEL is 1.52m, an actual human eye height — so an artwork's physical
   size in metres is its model size in metres. There is no hero/secondary
   scale tier any more: a small painting does not get inflated for being on
   the back wall, and a large one is not shrunk to fit a "secondary" cap.
   Tier still governs placement and lighting emphasis in GalleryHall.tsx —
   just never size. */
export const FRAME_SCALE = {
  /** Absolute safety clamp only — stops a mis-entered dimension (or a
      genuinely mural-sized work) from clipping the ceiling or a neighbour.
      Not a curatorial choice about how big a painting should look. */
  min: 0.3,
  max: 3.6,
  maxHeight: 3.0,
  /** The archive records real dimensions for most works but not all — see
      docs/UNTITLED_ARTWORK_METADATA_AUDIT.md and the museum's own EXHIBITION
      list in src/app/museum/page.tsx (aw-013, aw-006 currently have none).
      An undocumented work is sized modestly rather than guessed as heroic;
      this is a placeholder, not a claim about its real size. */
  unrecordedLongEdge: 0.9,
};
