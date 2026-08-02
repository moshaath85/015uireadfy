'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

interface ArtworkData {
  id: string; slug: string; title: string; artist: string;
  year: number; medium: string; dimensions: string; imageUrl: string;
  sceneRole: 'hero' | 'secondary';
}

const MuseumCanvas3D = dynamic(() => import('@/components/gallery-os/MuseumCanvas3D'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', letterSpacing: '.12em', textTransform: 'uppercase' }}>Preparing the museum...</div>,
});

export default function Museum3DPage({ artworks }: { artworks: ArtworkData[] }) {
  const [ok, setOk] = useState(true);
  useEffect(() => { try { const c = document.createElement('canvas'); if (!c.getContext('webgl2') && !c.getContext('webgl')) setOk(false); } catch { setOk(false); } }, []);

  if (!ok) return <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem' }}><p style={{ fontSize: '1.2rem', fontWeight: 300 }}>WebGL is not available.</p><a href="/artworks" style={{ color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', fontSize: '.75rem', letterSpacing: '.1em', borderBottom: '1px solid rgba(255,255,255,.25)', paddingBottom: '4px', textDecoration: 'none' }}>Browse the collection</a></div>;

  return <MuseumCanvas3D artworks={artworks} />;
}
