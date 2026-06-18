import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HotelMap3D = ({ rooms, reservations, onSelectRoom, selectedRoomNumber }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const roomsGroupRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  const roomsRef = useRef(rooms);
  const reservationsRef = useRef(reservations);
  useEffect(() => {
    roomsRef.current = rooms;
    reservationsRef.current = reservations;
  }, [rooms, reservations]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0f19');
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;
    const aspect = width / height;
    const d = 6;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(12, 10, 12);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Light setup
    const ambientLight = new THREE.AmbientLight('#1e293b', 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#38bdf8', 2.0);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Floor grids/guides
    const gridHelper = new THREE.GridHelper(20, 20, '#1e293b', '#0f172a');
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    const roomsGroup = new THREE.Group();
    scene.add(roomsGroup);
    roomsGroupRef.current = roomsGroup;

    // Room Geometry & Standard Materials
    const roomGeom = new THREE.BoxGeometry(1.2, 0.8, 1.2);
    const borderGeom = new THREE.RingGeometry(0.7, 0.8, 4);
    borderGeom.rotateX(-Math.PI / 2);

    const statusColors = {
      DIRTY: '#ef4444',
      CLEAN: '#eab308',
      INSPECTED: '#10b981',
      OUT_OF_ORDER: '#64748b',
      OCCUPIED: '#3b82f6'
    };

    const roomMeshes = [];

    // Layout the rooms: 3 floors, 8 rooms per floor
    // Floor 1: standard Standard rooms, Floor 2: Deluxe, Floor 3: Suites
    for (let floor = 1; floor <= 3; floor++) {
      const yPos = (floor - 1) * 1.5; // floor stack spacing

      for (let r = 1; r <= 8; r++) {
        const roomNumber = `${floor}0${r}`;
        const isLeftCol = r <= 4;
        
        // Z side corridors
        const zPos = isLeftCol ? -1.5 : 1.5;
        // X position along floor
        const xPos = -2.5 + ((r - 1) % 4) * 1.6;

        const group = new THREE.Group();
        group.position.set(xPos, yPos, zPos);
        group.userData = { roomNumber };

        // Main room mesh
        const mat = new THREE.MeshStandardMaterial({
          color: '#1e293b',
          roughness: 0.6,
          metalness: 0.2
        });
        const mesh = new THREE.Mesh(roomGeom, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        // Indicator Light/Sphere above room
        const sphereGeom = new THREE.SphereGeometry(0.12, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color: '#64748b' });
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        sphere.position.set(0, 0.6, 0);
        group.add(sphere);
        group.userData.indicator = sphere;

        // Selection ring below room mesh
        const selectionRingMat = new THREE.MeshBasicMaterial({
          color: '#06b6d4',
          side: THREE.DoubleSide,
          visible: false
        });
        const selectionRing = new THREE.Mesh(borderGeom, selectionRingMat);
        selectionRing.position.y = -0.401;
        group.add(selectionRing);
        group.userData.selectionRing = selectionRing;

        roomsGroup.add(group);
        roomMeshes.push(group);
      }
    }

    // Raycasting for room click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(roomsGroup.children, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object;
        while (parent && parent.parent !== roomsGroup) {
          parent = parent.parent;
        }
        if (parent && parent.userData.roomNumber) {
          onSelectRoom(parent.userData.roomNumber);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const currentRooms = roomsRef.current || [];
      const currentReservations = reservationsRef.current || [];

      roomsGroup.children.forEach(group => {
        const roomNum = group.userData.roomNumber;
        const roomData = currentRooms.find(r => r.roomNumber === roomNum);
        
        // Find if this room is currently occupied (CHECKED_IN guest)
        const isOccupied = currentReservations.some(
          res => res.room?.roomNumber === roomNum && res.status === 'CHECKED_IN'
        );

        let targetColor = statusColors.CLEAN;
        if (roomData) {
          if (isOccupied) {
            targetColor = statusColors.OCCUPIED;
          } else {
            targetColor = statusColors.OCCUPIED; // fallback
            // Choose by status
            if (roomData.status === 'DIRTY') targetColor = statusColors.DIRTY;
            else if (roomData.status === 'CLEAN') targetColor = statusColors.CLEAN;
            else if (roomData.status === 'INSPECTED') targetColor = statusColors.INSPECTED;
            else if (roomData.status === 'OUT_OF_ORDER') targetColor = statusColors.OUT_OF_ORDER;
          }
        }

        // 1. Update room mesh color based on state
        const roomMesh = group.children[0];
        if (roomMesh && roomMesh.material) {
          roomMesh.material.color.lerp(new THREE.Color(targetColor), 0.1);
        }

        // 2. Animate indicator light (pulse if occupied/dirty, solid if clean)
        const indicator = group.userData.indicator;
        if (indicator) {
          indicator.material.color.set(targetColor);
          if (roomData?.status === 'DIRTY') {
            indicator.scale.setScalar(0.8 + Math.sin(elapsed * 12) * 0.2);
          } else if (isOccupied) {
            indicator.scale.setScalar(0.9 + Math.sin(elapsed * 6) * 0.1);
          } else {
            indicator.scale.setScalar(1.0);
          }
        }

        // 3. Selection ring visibility
        const isSelected = selectedRoomNumber === roomNum;
        if (group.userData.selectionRing) {
          group.userData.selectionRing.visible = isSelected;
          if (isSelected) {
            group.userData.selectionRing.rotation.z += 0.02;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      const aspect = w / h;
      camera.left = -d * aspect;
      camera.right = d * aspect;
      camera.top = d;
      camera.bottom = -d;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [selectedRoomNumber]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-[#090d16] flex flex-col">
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
        <span className="text-xs font-mono text-cyan-400 tracking-wider">3D PISOS DEL HOTEL - LIVE FEED</span>
      </div>
      <div className="absolute bottom-4 right-4 z-10 bg-slate-950/80 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-xxs font-mono text-slate-400 flex flex-col space-y-1">
        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-emerald-500 mr-2"></span>INSPECTED (LISTA)</div>
        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-yellow-500 mr-2"></span>CLEAN (LIMPIA NO INSP)</div>
        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-red-500 mr-2"></span>DIRTY (SUCIA)</div>
        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-blue-500 mr-2"></span>OCCUPIED (OCUPADA)</div>
        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-slate-500 mr-2"></span>OUT OF ORDER (OOO)</div>
      </div>
      <div ref={containerRef} className="w-full h-full flex-grow flex items-center justify-center" />
    </div>
  );
};

export default HotelMap3D;
