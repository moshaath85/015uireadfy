# Gallery 015 — Homepage Client Showcase

## Implemented

- Complete homepage visual rebuild based on the approved White Cube / Hauser & Wirth / Apple editorial direction.
- Responsive split-screen hero carousel with autoplay, dots, keyboard navigation, swipe gestures, and pause on interaction.
- Official Gallery 015 black logo in the global header and refined institutional navigation.
- Featured artists, selected artworks, exhibition, projects, editorial news, and private advisory CTA sections.
- Improved responsive behavior for desktop, tablet, and mobile.
- Rebuilt footer with institutional contact, exploration links, and certificate verification.
- Existing repository and PostgreSQL data flow retained for public content sections.

## Files changed

- `src/app/page.tsx`
- `src/components/public/HomeHero.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/styles/globals.css`

## Validation

- `npm ci --ignore-scripts`: PASS
- New homepage/header/footer TypeScript errors: none
- Full TypeScript remains blocked by the existing ungenerated Prisma Client and pre-existing bulk import typing errors.
