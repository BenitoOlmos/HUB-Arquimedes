import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import ExplodedPump from './ExplodedPump';

const CanvasViewer = ({
  modelName,
  explodeFactor,
  autoRotate,
  selectedPartId,
  onSelectPart,
  onModelLoaded
}) => {
  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ position: [5, 4, 6], fov: 45 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={['#ffffff']} />
        
        {/* Lights Setup */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <pointLight position={[-10, -5, -10]} intensity={0.5} />
        <spotLight
          position={[0, 8, 0]}
          intensity={0.8}
          angle={Math.PI / 4}
          penumbra={1}
          castShadow
        />

        {/* 3D Model with Stage for Auto-Centering and Premium Lighting */}
        <Suspense fallback={null}>
          <Center>
            <ExplodedPump
              modelName={modelName}
              explodeFactor={explodeFactor}
              selectedPartId={selectedPartId}
              onSelectPart={onSelectPart}
              onModelLoaded={onModelLoaded}
            />
          </Center>
        </Suspense>

        {/* Orbit Controls for full 360 view, pan, and dynamic zoom */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          enablePan={true}
          panSpeed={1.2}
          minDistance={0.1}
          maxDistance={40}
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
          makeDefault
        />
      </Canvas>
    </div>
  );
};

export default CanvasViewer;
