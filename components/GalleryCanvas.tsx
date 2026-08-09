'use client'; 

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function GalleryCanvas() {
  return (
    <div className="w-full h-screen bg-gray-900">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <mesh>
          <boxGeometry args={[3, 4, 0.1]} /> 
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>

        <OrbitControls enableZoom={true} />
        
      </Canvas>
    </div>
  );
}