'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function InteractivePainting({ 
  setControlsEnabled, 
  color 
}: { 
  setControlsEnabled: (val: boolean) => void, 
  color: string 
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const newTexture = new THREE.CanvasTexture(canvas);
    newTexture.colorSpace = THREE.SRGBColorSpace;
    
    canvasRef.current = canvas;
    setTexture(newTexture);
  }, []);

  const startDrawing = (e: any) => {
    e.stopPropagation();
    isDrawing.current = true;
    setControlsEnabled(false);

    const uv = e.uv;
    const canvas = canvasRef.current;
    if (uv && canvas) {
      lastPos.current = {
        x: uv.x * canvas.width,
        y: (1 - uv.y) * canvas.height
      };
    }
  };

  const draw = (e: any) => {
    if (!isDrawing.current) return;
    
    const uv = e.uv;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (uv && canvas && ctx && texture) {
      const x = uv.x * canvas.width;
      const y = (1 - uv.y) * canvas.height;

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      lastPos.current = { x, y };
      texture.needsUpdate = true;
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    setControlsEnabled(true);
  };

  if (!texture) return null;

  return (
    <mesh
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerOut={stopDrawing}
    >
      <boxGeometry args={[3, 4, 0.1]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function GalleryCanvas() {
  const [controlsEnabled, setControlsEnabled] = useState(true);
  
  const [activeColor, setActiveColor] = useState('#000000');
  
  const colors = [
    '#000000', '#ef4444', '#f97316', '#eab308', 
    '#22c55e', '#3b82f6', '#a855f7', '#ffffff'
  ];

  return (
    <div className="relative w-full h-screen bg-gray-900">
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl flex gap-3 shadow-xl border border-white/20">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setActiveColor(c)}
            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
              activeColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
            title={c === '#ffffff' ? 'Goma de borrar' : 'Pincel'}
          />
        ))}
      </div>

      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        
        <InteractivePainting 
          setControlsEnabled={setControlsEnabled} 
          color={activeColor} 
        />
        
        <OrbitControls enabled={controlsEnabled} enableZoom={true} />
      </Canvas>
    </div>
  );
}