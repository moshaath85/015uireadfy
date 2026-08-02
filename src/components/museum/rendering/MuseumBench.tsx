'use client';

import { RoundedBox } from '@react-three/drei';

export function MuseumBench({
  position = [0, 0, 2.8],
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[2.45, 0.085, 0.64]} radius={0.025} smoothness={3} position={[0, 0.50, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#5a301b" roughness={0.36} metalness={0} />
      </RoundedBox>
      <RoundedBox args={[0.075, 0.48, 0.37]} radius={0.012} smoothness={2} position={[-0.88, 0.24, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#171513" roughness={0.42} metalness={0.72} />
      </RoundedBox>
      <RoundedBox args={[0.075, 0.48, 0.37]} radius={0.012} smoothness={2} position={[0.88, 0.24, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#171513" roughness={0.42} metalness={0.72} />
      </RoundedBox>
      <RoundedBox args={[1.76, 0.055, 0.065]} radius={0.01} smoothness={2} position={[0, 0.18, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#171513" roughness={0.42} metalness={0.72} />
      </RoundedBox>
    </group>
  );
}
