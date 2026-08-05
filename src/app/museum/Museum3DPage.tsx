'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

interface ArtworkData {
  id: string; slug: string; title: string; artist: string;
  year: number; medium: string; dimensions: string; imageUrl: string;
  sceneRole: 'hero' | 'secondary';
}

const LOCAL_EXHIBITION_FALLBACK: ArtworkData[] = [
  { id: 'aw-013', slug: 'mohammed-siam-01', title: 'Untitled', artist: 'Mohammed Siam', year: 2020, medium: 'Mixed media', dimensions: 'Dimensions available on request', imageUrl: '/images/artworks/mohammed-siam-01.webp', sceneRole: 'hero' },
  { id: 'aw-128', slug: 'khaled-al-mutlaq-untitled-02', title: 'Untitled', artist: 'Khaled Al-Mutlaq', year: 2020, medium: 'Mixed media', dimensions: '135 × 110 cm', imageUrl: '/images/artworks/khaled-al-mutlaq-02.webp', sceneRole: 'hero' },
  { id: 'aw-175', slug: 'abdullah-al-ahmari-untitled-01', title: 'Women', artist: 'Abdullah Al-Ahmari', year: 2020, medium: 'Oil on Canvas', dimensions: '100 × 100 cm', imageUrl: '/images/artworks/abdullah-al-ahmari-01.webp', sceneRole: 'secondary' },
  { id: 'aw-029', slug: 'abdullah-al-barrak-untitled-01', title: 'The Souq', artist: 'Abdullah Al-Barrak', year: 2020, medium: 'Oil on Canvas', dimensions: '97 × 80 cm', imageUrl: '/images/artworks/abdullah-al-barrak-01.webp', sceneRole: 'secondary' },
  { id: 'aw-006', slug: 'abdulrahman-al-suleiman-01', title: 'Untitled', artist: 'Abdulrahman Al-Suleiman', year: 2020, medium: 'Mixed media', dimensions: 'Dimensions available on request', imageUrl: '/images/artworks/abdulrahman-al-suleiman-01.webp', sceneRole: 'secondary' },
  { id: 'aw-030', slug: 'abdullah-al-barrak-02', title: 'The Horse Riders', artist: 'Abdullah Al-Barrak', year: 2020, medium: 'Oil on Canvas', dimensions: '55 × 45 cm', imageUrl: '/images/artworks/abdullah-al-barrak-02.webp', sceneRole: 'secondary' },
  { id: 'aw-037', slug: 'mohammed-al-ajam-01', title: 'When Thankful', artist: 'Mohammed Al-Ajam', year: 2020, medium: 'Ink on Paper', dimensions: '70 × 40 cm', imageUrl: '/images/artworks/mohammed-al-ajam-01.webp', sceneRole: 'secondary' },
  { id: 'aw-038', slug: 'mohammed-al-ajam-02', title: 'Letter و', artist: 'Mohammed Al-Ajam', year: 2020, medium: 'Ink on Paper', dimensions: '85 × 75 cm', imageUrl: '/images/artworks/mohammed-al-ajam-02.webp', sceneRole: 'secondary' },
];

const MuseumCanvas3D = dynamic(() => import('@/components/museum/canvas/MuseumCanvas3D'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', letterSpacing: '.12em', textTransform: 'uppercase' }}>Preparing the museum...</div>,
});

export default function Museum3DPage({ artworks }: { artworks: ArtworkData[] }) {
  const [ok, setOk] = useState(true);
  useEffect(() => { try { const c = document.createElement('canvas'); if (!c.getContext('webgl2') && !c.getContext('webgl')) setOk(false); } catch { setOk(false); } }, []);

  if (!ok) return <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem' }}><p style={{ fontSize: '1.2rem', fontWeight: 300 }}>WebGL is not available.</p><a href="/artworks" style={{ color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', fontSize: '.75rem', letterSpacing: '.1em', borderBottom: '1px solid rgba(255,255,255,.25)', paddingBottom: '4px', textDecoration: 'none' }}>Browse the collection</a></div>;

  return <MuseumCanvas3D artworks={artworks.length >= 4 ? artworks : LOCAL_EXHIBITION_FALLBACK} />;
}
