# Gallery 015 — Simple Visual Assets

Copy this folder into:

public/museum-assets/simple/

Expected URLs:
- /museum-assets/simple/textures/wall.jpg
- /museum-assets/simple/textures/floor.jpg
- /museum-assets/simple/textures/ceiling.jpg
- /museum-assets/simple/models/gallery015_bench.glb

## R3F usage

```tsx
import * as THREE from 'three'
import { useTexture, useGLTF } from '@react-three/drei'

const wallTexture = useTexture('/museum-assets/simple/textures/wall.jpg')
wallTexture.colorSpace = THREE.SRGBColorSpace
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping
wallTexture.repeat.set(3, 2)
wallTexture.anisotropy = 8

const floorTexture = useTexture('/museum-assets/simple/textures/floor.jpg')
floorTexture.colorSpace = THREE.SRGBColorSpace
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
floorTexture.repeat.set(5, 7)
floorTexture.anisotropy = 8

const ceilingTexture = useTexture('/museum-assets/simple/textures/ceiling.jpg')
ceilingTexture.colorSpace = THREE.SRGBColorSpace
ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping
ceilingTexture.repeat.set(3, 2)
ceilingTexture.anisotropy = 8
```

Recommended materials:

```tsx
<meshStandardMaterial map={wallTexture} color="#d9d3c7" roughness={0.72} />
<meshPhysicalMaterial
  map={floorTexture}
  color="#4e473e"
  roughness={0.42}
  metalness={0}
  clearcoat={0.08}
  clearcoatRoughness={0.68}
/>
<meshStandardMaterial map={ceilingTexture} color="#e8e4da" roughness={0.82} />
```

Canvas:

```tsx
<Canvas
  gl={{
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.05,
    outputColorSpace: THREE.SRGBColorSpace,
  }}
/>
```

Rules:
- Do not use displacement for these simple textures.
- Do not replace with flat colors.
- Do not add procedural noise on top.
- Keep existing room geometry, cameras, routes, and navigation.
- Replace only wall/floor/ceiling materials and the bench.
