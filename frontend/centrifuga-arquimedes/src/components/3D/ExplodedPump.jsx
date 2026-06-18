import React, { useState, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Error Boundary to gracefully handle GLB loading errors
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn(
      'Modelo GLB no encontrado o error al cargar. Usando modelo 3D procedimental como alternativa.'
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Procedural 3D Centrifugal Pump Component
const ProceduralPump = ({
  explodeFactor,
  selectedPartId,
  onSelectPart,
  motorPower = 2,
  activeDiameter = 2,
  isCavitating = false
}) => {
  const [hoveredId, setHoveredId] = useState(null);

  // Helper to construct mesh standard materials with dynamic glowing highlights
  const getMat = (partId, color, metalness = 0.5, roughness = 0.5) => {
    const isSelected = selectedPartId === partId;
    const isHovered = hoveredId === partId;

    let activeColor = color;
    let emissiveColor = isSelected ? '#38bdf8' : isHovered ? '#22d3ee' : '#000000';
    let emissiveIntensity = isSelected ? 0.8 : isHovered ? 0.45 : 0;

    // Cavitation causes suction and volute to turn red
    if (isCavitating && (partId === 'suction_flange' || partId === 'volute_casing')) {
      activeColor = '#ef4444';
      emissiveColor = '#ef4444';
      emissiveIntensity = 0.65;
    }

    return (
      <meshStandardMaterial
        color={activeColor}
        metalness={metalness}
        roughness={roughness}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
      />
    );
  };

  // Define parts of the pump with their relative explosion directions and base positions
  const parts = [
    {
      id: 'suction_flange',
      name: 'Suction Flange',
      explodeDir: [0, 0, -2.5], // Moves forward along Z
      render: () => {
        const diaScale = 0.5 + activeDiameter * 0.25;
        return (
          <group scale={[diaScale, diaScale, 1.0]}>
            {/* Suction Pipe Tube - rotated to Z-axis */}
            <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 1.2, 32]} />
              {getMat('suction_flange', '#475569', 0.2, 0.8)}
            </mesh>
            {/* Flange Collar - rotated to Z-axis */}
            <mesh position={[0, 0, -0.5]} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
              {getMat('suction_flange', '#334155', 0.2, 0.8)}
            </mesh>
          </group>
        );
      }
    },
    {
      id: 'volute_casing',
      name: 'Volute Casing',
      explodeDir: [0, 0, 0], // Stays central
      render: () => {
        const diaScale = 0.5 + activeDiameter * 0.25;
        return (
          <group>
            {/* Main Volute Ring */}
            <mesh castShadow receiveShadow>
              <torusGeometry args={[1.5, 0.4, 16, 100]} />
              {getMat('volute_casing', '#1e3a8a', 0.6, 0.3)}
            </mesh>
            {/* Backplate - rotated to Z-axis */}
            <mesh position={[0, 0, 0.2]} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.6, 1.6, 0.2, 32]} />
              {getMat('volute_casing', '#172554', 0.5, 0.5)}
            </mesh>
            {/* Discharge Pipe Outward (pointing up in Y) scaled radially in X and Z */}
            <group scale={[diaScale, 1.0, diaScale]}>
              <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
                {getMat('volute_casing', '#1e3a8a', 0.5, 0.5)}
              </mesh>
              {/* Discharge Flange Collar */}
              <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.7, 0.7, 0.15, 32]} />
                {getMat('volute_casing', '#172554', 0.5, 0.5)}
              </mesh>
            </group>
          </group>
        );
      }
    },
    {
      id: 'wear_rings',
      name: 'Wear Rings',
      explodeDir: [0, 0, -0.8], // Slides out forward
      render: () => (
        <mesh castShadow>
          <torusGeometry args={[0.6, 0.08, 8, 48]} />
          {getMat('wear_rings', '#d97706', 0.9, 0.2)}
        </mesh>
      )
    },
    {
      id: 'impeller',
      name: 'Impeller',
      explodeDir: [0, 0, -0.4], // Slides out slightly forward
      render: () => (
        <group>
          {/* Impeller Hub */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.5, 0.5, 32]} />
            {getMat('impeller', '#ea580c', 0.9, 0.2)}
          </mesh>
          {/* Impeller Blades */}
          {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
            <mesh
              key={idx}
              position={[
                Math.cos(THREE.MathUtils.degToRad(angle)) * 0.7,
                Math.sin(THREE.MathUtils.degToRad(angle)) * 0.7,
                0
              ]}
              rotation={[0, 0, THREE.MathUtils.degToRad(angle + 30)]}
              castShadow
            >
              <boxGeometry args={[0.2, 0.8, 0.1]} />
              {getMat('impeller', '#ea580c', 0.9, 0.2)}
            </mesh>
          ))}
          {/* Impeller Shroud Rim */}
          <mesh castShadow>
            <torusGeometry args={[1.1, 0.05, 8, 64]} />
            {getMat('impeller', '#c2410c', 0.9, 0.2)}
          </mesh>
        </group>
      )
    },
    {
      id: 'mechanical_seal',
      name: 'Mechanical Seal',
      explodeDir: [0, 0, 1.2], // Slides backward along Z
      render: () => (
        <group>
          {/* Stationary face - rotated to Z-axis */}
          <mesh castShadow position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.3, 32]} />
            {getMat('mechanical_seal', '#18181b', 0.2, 0.7)}
          </mesh>
          {/* Rotating spring / bellows - rotated to Z-axis */}
          <mesh castShadow position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.3, 32]} />
            {getMat('mechanical_seal', '#71717a', 0.9, 0.1)}
          </mesh>
        </group>
      )
    },
    {
      id: 'shaft_sleeve',
      name: 'Shaft Sleeve',
      explodeDir: [0, 0, 2.2], // Slides further backward
      render: () => (
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.8, 32]} />
          {getMat('shaft_sleeve', '#cbd5e1', 1.0, 0.05)}
        </mesh>
      )
    },
    {
      id: 'bearings',
      name: 'Bearings',
      explodeDir: [0, 0, 3.2], // Slides far backward
      render: () => (
        <group>
          {/* Outer Ring */}
          <mesh castShadow>
            <torusGeometry args={[0.45, 0.08, 12, 48]} />
            {getMat('bearings', '#a16207', 0.9, 0.2)}
          </mesh>
          {/* Inner Ring */}
          <mesh castShadow>
            <torusGeometry args={[0.3, 0.05, 12, 48]} />
            {getMat('bearings', '#a16207', 0.9, 0.2)}
          </mesh>
          {/* Steel balls */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
            <mesh
              key={idx}
              position={[
                Math.cos(THREE.MathUtils.degToRad(angle)) * 0.38,
                Math.sin(THREE.MathUtils.degToRad(angle)) * 0.38,
                0
              ]}
              castShadow
            >
              <sphereGeometry args={[0.06, 16, 16]} />
              {getMat('bearings', '#e4e4e7', 1.0, 0.05)}
            </mesh>
          ))}
        </group>
      )
    },
    {
      id: 'shaft',
      name: 'Shaft',
      explodeDir: [0, 0, 4.2], // Slides furthest backward
      render: () => (
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 4.8, 32]} />
          {getMat('shaft', '#64748b', 0.9, 0.15)}
        </mesh>
      )
    },
    {
      id: 'motor',
      name: 'Electric Motor',
      explodeDir: [0, 0, 5.2], // Slides furthest backward
      render: () => {
        const motorLength = 1.6 + (motorPower - 2) * 0.4;
        const motorRadius = 0.8 + (motorPower - 2) * 0.15;
        return (
          <group>
            {/* Motor Stator Body - rotated to Z-axis */}
            <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[motorRadius, motorRadius, motorLength, 32]} />
              {getMat('motor', '#1e293b', 0.7, 0.3)}
            </mesh>

            {/* Cooling Fins (ribs around the motor) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <mesh
                key={idx}
                rotation={[0, 0, THREE.MathUtils.degToRad(angle)]}
                position={[0, 0, 0]}
                castShadow
              >
                <boxGeometry args={[motorRadius * 2 + 0.1, 0.04, motorLength - 0.2]} />
                {getMat('motor', '#334155', 0.6, 0.4)}
              </mesh>
            ))}

            {/* Terminal Connection Box on top */}
            <mesh position={[0, motorRadius + 0.1, 0]} castShadow>
              <boxGeometry args={[0.4, 0.3, 0.4]} />
              {getMat('motor', '#475569', 0.8, 0.2)}
            </mesh>
          </group>
        );
      }
    }
  ];

  return (
    <group rotation={[0, -Math.PI / 4, 0]}>
      {parts.map((part) => {
        const isSelected = selectedPartId === part.id;
        const isHovered = hoveredId === part.id;

        // Calculate dynamic position based on explosion factor
        const position = part.explodeDir.map((coord) => coord * explodeFactor);

        // Highlight colors
        let emissiveColor = new THREE.Color(0, 0, 0);
        if (isSelected) {
          emissiveColor = new THREE.Color(0x3b82f6); // Glowing blue for selection
        } else if (isHovered) {
          emissiveColor = new THREE.Color(0x06b6d4); // Glowing cyan for hover
        }

        return (
          <group
            key={part.id}
            position={position}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId(part.id);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              if (hoveredId === part.id) setHoveredId(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart(part.id);
            }}
          >
            {/* The actual shapes of the component */}
            <group rotation={[Math.PI / 2, 0, 0]}>{part.render()}</group>

            {/* Glowing selection ring / helper box (visible only when selected) */}
            {isSelected && (
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2.5, 2.5, 0.8]} />
                <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.15} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

// GLB Loader Component (attempts to load user GLB)
const GLBPumpModel = ({
  modelName,
  explodeFactor,
  selectedPartId,
  onSelectPart,
  onModelLoaded,
  motorPower = 2,
  activeDiameter = 2,
  isCavitating = false
}) => {
  // Try loading the GLB from public directory
  const { scene } = useGLTF(`/models/${modelName}`);
  const [hoveredMeshName, setHoveredMeshName] = useState(null);

  useEffect(() => {
    if (scene) {
      // Auto-scale model to normalize dimensions (target max size is 2.8 units)
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      const targetSize = 2.8;
      if (maxDim > 0) {
        const scale = targetSize / maxDim;
        scene.scale.set(scale, scale, scale);
      }

      onModelLoaded(true);
    }
  }, [scene, onModelLoaded]);

  // Adjust node positions dynamically during frame renders
  useFrame(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Apply custom explosion math based on child names
        // Example: if name contains 'impeller', move it on the Z-axis
        const name = child.name.toLowerCase();

        // Define base directions
        let dir = new THREE.Vector3(0, 0, 0);
        if (name.includes('suction') || name.includes('inlet') || name.includes('aspiracion')) {
          dir.set(0, 0, -2.5);
        } else if (
          name.includes('impeller') ||
          name.includes('rodete') ||
          name.includes('impulseur')
        ) {
          dir.set(0, 0, -1.2);
        } else if (
          name.includes('seal') ||
          name.includes('sello') ||
          name.includes('etancheite') ||
          name.includes('joint')
        ) {
          dir.set(0, 0, 1.2);
        } else if (
          name.includes('bearing') ||
          name.includes('cojinete') ||
          name.includes('rodamiento') ||
          name.includes('palier')
        ) {
          dir.set(0, 0, 2.5);
        } else if (name.includes('shaft') || name.includes('eje') || name.includes('arbre')) {
          dir.set(0, 0, 3.8);
        } else if (name.includes('motor') || name.includes('stator') || name.includes('moteur')) {
          dir.set(0, 0, 5.2);
        } else if (
          name.includes('casing') ||
          name.includes('carcasa') ||
          name.includes('volute') ||
          name.includes('corps')
        ) {
          dir.set(0, 0, 0.0); // central reference
        } else {
          // General radial/axial explosion for accessories like rings, shims, grease nipples
          const pos = child.position.clone().normalize();
          // move slightly outward on Y/X and move along Z depending on side
          const zOffset = child.position.z > 0 ? 1.5 : -1.5;
          dir.set(pos.x * 1.0, pos.y * 1.0, zOffset);
        }

        // Store base position if not already stored
        if (!child.userData.basePosition) {
          child.userData.basePosition = child.position.clone();
        }

        // Store base scale if not already stored
        if (!child.userData.baseScale) {
          child.userData.baseScale = child.scale.clone();
        }

        // Interpolate position
        const targetPos = child.userData.basePosition
          .clone()
          .add(dir.multiplyScalar(explodeFactor));
        child.position.lerp(targetPos, 0.1);

        // Dynamic scaling based on simulation parameters
        if (name.includes('motor') || name.includes('stator') || name.includes('moteur')) {
          const motorScale = 1.0 + (motorPower - 2) * 0.15;
          child.scale.copy(child.userData.baseScale).multiplyScalar(motorScale);
        } else if (
          name.includes('suction') ||
          name.includes('inlet') ||
          name.includes('aspiracion')
        ) {
          const pipeScale = 0.5 + activeDiameter * 0.25;
          child.scale.copy(child.userData.baseScale);
          child.scale.x *= pipeScale;
          child.scale.y *= pipeScale;
        } else if (
          name.includes('discharge') ||
          name.includes('outlet') ||
          name.includes('descarga')
        ) {
          const pipeScale = 0.5 + activeDiameter * 0.25;
          child.scale.copy(child.userData.baseScale);
          child.scale.x *= pipeScale;
          child.scale.z *= pipeScale;
        } else {
          // Reset scale for other parts in case it was modified
          child.scale.copy(child.userData.baseScale);
        }

        // Manage selection highlight & cavitation
        const isSelected = selectedPartId === child.name;
        const isHovered = hoveredMeshName === child.name;

        if (child.material) {
          // Ensure material supports emissive colors
          if (!child.userData.originalEmissive) {
            child.userData.originalEmissive =
              child.material.emissive?.clone() || new THREE.Color(0, 0, 0);
          }

          if (
            isCavitating &&
            (name.includes('suction') ||
              name.includes('inlet') ||
              name.includes('casing') ||
              name.includes('volute') ||
              name.includes('corps'))
          ) {
            child.material.emissive?.setHex(0xef4444); // red glow
            child.material.emissiveIntensity = 0.65;
          } else if (isSelected) {
            child.material.emissive?.setHex(0x3b82f6); // blue glow
            child.material.emissiveIntensity = 0.6;
          } else if (isHovered) {
            child.material.emissive?.setHex(0x06b6d4); // cyan glow
            child.material.emissiveIntensity = 0.4;
          } else {
            child.material.emissive?.copy(child.userData.originalEmissive);
            child.material.emissiveIntensity = child.userData.originalEmissiveIntensity || 1.0;
          }
        }
      }
    });
  });

  return (
    <primitive
      object={scene}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.object && e.object.isMesh) {
          setHoveredMeshName(e.object.name);
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHoveredMeshName(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.object && e.object.isMesh) {
          onSelectPart(e.object.name);
        }
      }}
    />
  );
};

// Wrapper Component that exports the Error Boundary and switches between GLB & Procedural
const ExplodedPump = ({
  modelName = 'pump.glb',
  explodeFactor,
  selectedPartId,
  onSelectPart,
  onModelLoaded,
  motorPower = 2,
  activeDiameter = 2,
  isCavitating = false
}) => {
  useEffect(() => {
    // Fallback loading check
    onModelLoaded(true);
  }, [onModelLoaded]);

  return (
    <ModelErrorBoundary
      fallback={
        <ProceduralPump
          explodeFactor={explodeFactor}
          selectedPartId={selectedPartId}
          onSelectPart={onSelectPart}
          motorPower={motorPower}
          activeDiameter={activeDiameter}
          isCavitating={isCavitating}
        />
      }
    >
      <GLBPumpModel
        modelName={modelName}
        explodeFactor={explodeFactor}
        selectedPartId={selectedPartId}
        onSelectPart={onSelectPart}
        onModelLoaded={onModelLoaded}
        motorPower={motorPower}
        activeDiameter={activeDiameter}
        isCavitating={isCavitating}
      />
    </ModelErrorBoundary>
  );
};

export default ExplodedPump;
// Preload the GLTF file to optimize load times
useGLTF.preload('/models/pump.glb');
