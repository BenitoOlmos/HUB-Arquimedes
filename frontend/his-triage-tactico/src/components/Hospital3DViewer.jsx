import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// 3D Bed Mesh Component
const Bed3D = ({ bed, isHovered, onHover, onClick, activePatient }) => {
  const meshRef = useRef();

  // Pulse animation for bed monitors or cleaning status
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    if (bed.status === 'En Limpieza') {
      // Rotate cleaning indicator
      meshRef.current.rotation.y = t * 2;
    } else if (bed.status === 'Ocupada' && bed.patient) {
      // Pulse height depending on ESI gravity
      const speed = bed.patient.esi === 1 ? 8 : bed.patient.esi === 2 ? 4 : 2;
      const pulse = Math.sin(t * speed) * 0.05 + 0.15;
      meshRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    } else {
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  // Determine mattress color
  const getMattressColor = () => {
    switch (bed.status) {
      case 'Disponible':
        return '#10b981'; // Green
      case 'Ocupada':
        return '#f43f5e'; // Red
      case 'En Limpieza':
        return '#a855f7'; // Purple
      case 'Inhabilitada':
      default:
        return '#4b5563'; // Grey
    }
  };

  // Determine beacon color based on ESI
  const getEsiColor = () => {
    if (!bed.patient) return '#6b7280';
    switch (bed.patient.esi) {
      case 1:
        return '#ef4444'; // ESI 1: Red
      case 2:
        return '#f97316'; // ESI 2: Orange
      case 3:
        return '#eab308'; // ESI 3: Yellow
      case 4:
        return '#10b981'; // ESI 4: Green
      case 5:
        return '#3b82f6'; // ESI 5: Blue
      default:
        return '#94a3b8';
    }
  };

  return (
    <group
      position={bed.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(bed.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(bed.id);
      }}
    >
      {/* Selection Glow Ring */}
      {(isHovered || bed.isSelected) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <ringGeometry args={[0.7, 0.9, 16]} />
          <meshBasicMaterial
            color={bed.isSelected ? '#06b6d4' : '#ffffff'}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Bed Base (Metal frame) */}
      <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.2, 1.8]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Mattress */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[1.1, 0.2, 1.7]} />
        <meshStandardMaterial
          color={getMattressColor()}
          roughness={0.6}
          emissive={bed.status === 'En Limpieza' ? '#a855f7' : '#000000'}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Pillow */}
      <mesh position={[0, 0.23, -0.6]} castShadow>
        <boxGeometry args={[0.9, 0.1, 0.4]} />
        <meshStandardMaterial color="#f9fafb" roughness={0.9} />
      </mesh>

      {/* Headboard */}
      <mesh position={[0, 0.3, -0.85]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.1]} />
        <meshStandardMaterial color="#1f2937" woodness={0.2} />
      </mesh>

      {/* Side Rails */}
      <mesh position={[-0.58, 0.2, 0]} castShadow>
        <boxGeometry args={[0.04, 0.3, 1.2]} />
        <meshStandardMaterial color="#4b5563" metalness={0.9} />
      </mesh>
      <mesh position={[0.58, 0.2, 0]} castShadow>
        <boxGeometry args={[0.04, 0.3, 1.2]} />
        <meshStandardMaterial color="#4b5563" metalness={0.9} />
      </mesh>

      {/* IV Pole */}
      <group position={[-0.5, 0.5, -0.7]}>
        {/* Vertical Stand */}
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} />
        </mesh>
        {/* IV Bag */}
        {bed.status === 'Ocupada' && (
          <mesh position={[0, 0.5, 0.08]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.25, 8]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.75} />
          </mesh>
        )}
      </group>

      {/* Clinical Telemetry Monitor */}
      <group position={[0.5, 0.6, -0.8]}>
        {/* Monitor Stand */}
        <mesh rotation={[0, 0, Math.PI / 4]} position={[-0.1, -0.1, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
          <meshStandardMaterial color="#374151" metalness={0.8} />
        </mesh>
        {/* Monitor Screen Frame */}
        <mesh rotation={[0.1, -0.4, 0]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.05]} />
          <meshStandardMaterial color="#111827" roughness={0.5} />
        </mesh>
        {/* Glowing screen or alarm beacon */}
        {bed.status === 'Ocupada' && (
          <mesh ref={meshRef} rotation={[0.1, -0.4, 0]} position={[0, 0, 0.026]}>
            <planeGeometry args={[0.36, 0.26]} />
            <meshBasicMaterial color={getEsiColor()} />
          </mesh>
        )}
      </group>

      {/* 3D Floating Label (Drei HTML) */}
      <Html
        position={[0, 1.0, 0]}
        center
        distanceFactor={6}
        style={{
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        <div className={`bed-3d-tag ${bed.status.toLowerCase().replace(' ', '-')}`}>
          <div className="tag-id">{bed.id}</div>
          {bed.status === 'Ocupada' && bed.patient && (
            <div
              className="tag-patient-info"
              style={{ borderLeft: `3px solid var(--esi-${bed.patient.esi})` }}
            >
              <span className="tag-name">{bed.patient.name.split(' ')[0]}</span>
              <span className="tag-esi">ESI {bed.patient.esi}</span>
            </div>
          )}
          {bed.status === 'En Limpieza' && (
            <div className="tag-status-cleaning">ASEO {bed.cleaningTimeLeftSim}m</div>
          )}
          {bed.status === 'Inhabilitada' && <div className="tag-status-maintenance">FALLA</div>}
        </div>
      </Html>
    </group>
  );
};

// Ward Floor Slab Component
const WardSlab = ({ name, color, position, size }) => {
  return (
    <group position={position}>
      {/* Semi-transparent ground slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Slab boundary line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[size[0] / 2 - 0.05, size[0] / 2 + 0.05, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* Floating Ward Label */}
      <Html position={[0, 0.02, size[1] / 2 - 0.4]} center distanceFactor={8}>
        <div
          className="ward-3d-label"
          style={{ backgroundColor: color + '22', borderColor: color }}
        >
          {name}
        </div>
      </Html>
    </group>
  );
};

// Main Scene Controller with Raycast Drop support
const HospitalScene = ({
  beds,
  onBedClick,
  hoveredBedId,
  setHoveredBedId,
  selectedBedId,
  waitingPatients
}) => {
  const { camera, raycaster, scene } = useThree();

  // Map database beds to coordinates in 3D space
  const bedsWithPositions = useMemo(() => {
    // Coordinate offsets for each wing
    const offsets = {
      UCI: {
        x: -10,
        z: -6,
        rows: 2,
        cols: 4,
        spacingX: 2.2,
        spacingZ: 3.2,
        color: '#ef4444',
        name: 'UCI'
      },
      UTI: {
        x: 0,
        z: -6,
        rows: 2,
        cols: 4,
        spacingX: 2.2,
        spacingZ: 3.2,
        color: '#f97316',
        name: 'UTI'
      },
      MED: {
        x: -10,
        z: 6,
        rows: 3,
        cols: 4,
        spacingX: 2.2,
        spacingZ: 2.8,
        color: '#3b82f6',
        name: 'MED'
      },
      PED: {
        x: 0,
        z: 6,
        rows: 2,
        cols: 4,
        spacingX: 2.2,
        spacingZ: 3.2,
        color: '#eab308',
        name: 'PED'
      },
      AIS: {
        x: 10,
        z: 0,
        rows: 2,
        cols: 2,
        spacingX: 2.4,
        spacingZ: 3.6,
        color: '#8b5cf6',
        name: 'AIS'
      }
    };

    // Keep track of counts per wing to compute grid offsets
    const wingCounts = { UCI: 0, UTI: 0, MED: 0, PED: 0, AIS: 0 };

    return beds.map((bed) => {
      const prefix = bed.id.substring(0, 3);
      const conf = offsets[prefix] || offsets.MED;
      const index = wingCounts[prefix];
      wingCounts[prefix]++;

      // Compute row and column index
      const col = index % conf.cols;
      const row = Math.floor(index / conf.cols);

      // Position centered inside the wing slab
      const x = conf.x + (col - (conf.cols - 1) / 2) * conf.spacingX;
      const z = conf.z + (row - (conf.rows - 1) / 2) * conf.spacingZ;

      return {
        ...bed,
        position: [x, 0.2, z],
        isSelected: bed.id === selectedBedId
      };
    });
  }, [beds, selectedBedId]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Hospital floor slabs */}
      <WardSlab
        name="UCI (Cuidado Crítico)"
        color="#ef4444"
        position={[-10, 0, -6]}
        size={[9, 7]}
      />
      <WardSlab
        name="UTI (Tratamiento Intermedio)"
        color="#f97316"
        position={[0, 0, -6]}
        size={[9, 7]}
      />
      <WardSlab
        name="Medicina General (MED)"
        color="#3b82f6"
        position={[-10, 0, 6]}
        size={[9, 9]}
      />
      <WardSlab name="Pediatría (PED)" color="#eab308" position={[0, 0, 6]} size={[9, 7]} />
      <WardSlab
        name="Aislamiento Infeccioso (AIS)"
        color="#8b5cf6"
        position={[10, 0, 0]}
        size={[6, 8]}
      />

      {/* Grid Floor */}
      <gridHelper args={[36, 36, '#06b6d4', '#1e293b']} position={[0, -0.01, 0]} />

      {/* 3D Beds */}
      {bedsWithPositions.map((bed) => (
        <Bed3D
          key={bed.id}
          bed={bed}
          isHovered={bed.id === hoveredBedId}
          onHover={setHoveredBedId}
          onClick={onBedClick}
        />
      ))}
    </>
  );
};

// Main exported viewer component
const Hospital3DViewer = ({
  beds,
  onTransferPatient,
  onDischargePatient,
  onTriggerAlert,
  selectedPatientId,
  setSelectedPatientId,
  selectedBedId,
  setSelectedBedId,
  waitingPatients
}) => {
  const [hoveredBedId, setHoveredBedId] = useState(null);
  const canvasContainerRef = useRef(null);

  // Set up mouse ref for HTML drag-over
  const hoveredBedIdRef = useRef(hoveredBedId);
  useEffect(() => {
    hoveredBedIdRef.current = hoveredBedId;
  }, [hoveredBedId]);

  // Click handler
  const handleBedClick = (bedId) => {
    const bed = beds.find((b) => b.id === bedId);
    if (!bed) return;

    if (bed.status === 'Ocupada') {
      setSelectedBedId('');
      if (confirm(`¿Desea dar de alta al paciente ${bed.patient.name} de la cama ${bed.id}?`)) {
        onDischargePatient(bed.id);
        onTriggerAlert(`Alta: Paciente ${bed.patient.name} egresado de la cama ${bed.id}`);
      }
    } else if (bed.status === 'Disponible') {
      setSelectedBedId(bedId);
    }
  };

  // HTML5 Drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    const patientId = e.dataTransfer.getData('text/plain');
    const targetBedId = hoveredBedIdRef.current;

    if (!patientId || !targetBedId) return;

    const patient = waitingPatients.find((p) => p.id === patientId);
    const bed = beds.find((b) => b.id === targetBedId);

    if (!patient || !bed) return;
    if (bed.status !== 'Disponible') {
      alert(`⚠️ ERROR: La cama ${targetBedId} no está disponible (Estado: ${bed.status}).`);
      return;
    }

    // Call transfer directly
    onTransferPatient(patientId, targetBedId);
  };

  return (
    <div
      className="hospital-3d-container"
      ref={canvasContainerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        width: '100%',
        height: '600px',
        backgroundColor: '#05070a',
        borderRadius: '12px',
        border: '1px solid var(--border-glass)',
        overflow: 'hidden'
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 18, 16], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <HospitalScene
          beds={beds}
          onBedClick={handleBedClick}
          hoveredBedId={hoveredBedId}
          setHoveredBedId={setHoveredBedId}
          selectedBedId={selectedBedId}
          waitingPatients={waitingPatients}
        />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1} // Prevent looking below ground
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>

      {/* Floating Instructions */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          padding: '0.6rem 1rem',
          margin: 0,
          pointerEvents: 'none',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          maxWidth: '300px'
        }}
      >
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
          🎮 Control del Plano 3D:
        </span>
        <span>• Arrastra con Click Izquierdo para rotar la cámara.</span>
        <span>• Arrastra con Click Derecho para desplazar la cámara.</span>
        <span>• Usa la rueda para hacer Zoom.</span>
        <span>• Clica una cama libre (Verde) para seleccionarla.</span>
        <span>• Doble click en cama ocupada (Roja) para dar de alta.</span>
      </div>

      {/* Drag overlay indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid var(--accent-cyan)',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          color: 'var(--accent-cyan)',
          pointerEvents: 'none'
        }}
      >
        💡 SUELTA UN PACIENTE DE TRIAGE AQUÍ PARA INGRESARLO
      </div>
    </div>
  );
};

export default Hospital3DViewer;
