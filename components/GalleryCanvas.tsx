'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. Componente del Lienzo Interactivo
function InteractivePainting({ setControlsEnabled }: { setControlsEnabled: (val: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // EL FIX: Cambiamos useRef por useState para la textura
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
    
    // Al setear el estado, obligamos a React a renderizar la malla
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
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      lastPos.current = { x, y };
      
      // Actualizamos la textura que ahora vive en el estado
      texture.needsUpdate = true;
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    setControlsEnabled(true);
  };

  // Ahora esto reaccionará correctamente cuando el estado cambie
  if (!texture) return null;

  return (
    <mesh
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerOut={stopDrawing}
    >
      <boxGeometry args={[3, 4, 0.1]} />
      {/* Pasamos la textura del estado */}
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

// 6. El Escenario Principal
export default function GalleryCanvas() {
  // Estado para bloquear la rotación de la cámara mientras se pinta
  const [controlsEnabled, setControlsEnabled] = useState(true);

  return (
    <div className="w-full h-screen bg-gray-900">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        
        <InteractivePainting setControlsEnabled={setControlsEnabled} />
        
        <OrbitControls enabled={controlsEnabled} enableZoom={true} />
      </Canvas>
    </div>
  );
}