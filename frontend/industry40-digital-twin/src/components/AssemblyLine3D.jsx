import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AssemblyLine3D = ({ lineState, onSelectMachine, selectedMachineId }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const machinesGroupRef = useRef(null);
  const partsGroupRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Keep mutable references for the animation loop to use
  const lineStateRef = useRef(lineState);
  useEffect(() => {
    lineStateRef.current = lineState;
  }, [lineState]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0f19');
    sceneRef.current = scene;

    // Orthographic/Isometric camera for SCADA look
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 400;
    const aspect = width / height;
    const d = 8;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Clear container and append new canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight('#1e293b', 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#38bdf8', 2.0);
    dirLight.position.set(15, 20, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Subtle blue point lights next to machines for premium glow
    const pointLight = new THREE.PointLight('#06b6d4', 3, 20);
    pointLight.position.set(0, 4, 0);
    scene.add(pointLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, '#1e293b', '#0f172a');
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Create Groups
    const conveyorGroup = new THREE.Group();
    scene.add(conveyorGroup);

    const machinesGroup = new THREE.Group();
    scene.add(machinesGroup);
    machinesGroupRef.current = machinesGroup;

    const partsGroup = new THREE.Group();
    scene.add(partsGroup);
    partsGroupRef.current = partsGroup;

    // Build Conveyor Belt
    const conveyorLength = 16;
    const conveyorGeom = new THREE.BoxGeometry(conveyorLength, 0.3, 1.2);
    const conveyorMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.8,
      metalness: 0.3
    });
    const conveyor = new THREE.Mesh(conveyorGeom, conveyorMat);
    conveyor.position.set(0, -0.15, 0);
    conveyor.receiveShadow = true;
    conveyorGroup.add(conveyor);

    // Add conveyor legs
    const legGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.2);
    const legMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.7 });
    for (let x = -7; x <= 7; x += 3.5) {
      const legL = new THREE.Mesh(legGeom, legMat);
      legL.position.set(x, -0.75, 0.4);
      legL.castShadow = true;
      conveyorGroup.add(legL);

      const legR = new THREE.Mesh(legGeom, legMat);
      legR.position.set(x, -0.75, -0.4);
      legR.castShadow = true;
      conveyorGroup.add(legR);
    }

    // Spawn Virtual Machines along the line
    const machinesData = [
      { id: '1', type: 'CNC', name: 'CNC Láser', x: -5 },
      { id: '2', type: 'CNC', name: 'CNC Plegadora', x: -1.6 },
      { id: '3', type: 'ROBOTIC_ARM', name: 'Soldadora Estación 3', x: 1.6 },
      { id: '4', type: 'INSPECTION_STATION', name: 'Inspección Óptica', x: 5 }
    ];

    const machineMeshes = [];

    machinesData.forEach((m, idx) => {
      const group = new THREE.Group();
      group.position.set(m.x, 0, 0);
      group.userData = { id: m.id, name: m.name, type: m.type };

      // Base block
      const baseGeom = new THREE.BoxGeometry(1.6, 0.8, 1.6);
      const baseMat = new THREE.MeshStandardMaterial({
        color: '#334155',
        roughness: 0.5,
        metalness: 0.5
      });
      const baseMesh = new THREE.Mesh(baseGeom, baseMat);
      baseMesh.position.y = 0.4;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Unique additions depending on machine type
      if (m.type === 'CNC') {
        // Enclosure top
        const topGeom = new THREE.BoxGeometry(1.4, 0.8, 1.4);
        const topMat = new THREE.MeshStandardMaterial({
          color: '#0f172a',
          roughness: 0.4,
          metalness: 0.8
        });
        const topMesh = new THREE.Mesh(topGeom, topMat);
        topMesh.position.y = 1.2;
        topMesh.castShadow = true;
        group.add(topMesh);

        // Glass window
        const glassGeom = new THREE.BoxGeometry(1.0, 0.4, 0.1);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: '#38bdf8',
          transparent: true,
          opacity: 0.5,
          roughness: 0.1,
          transmission: 0.9
        });
        const glass = new THREE.Mesh(glassGeom, glassMat);
        glass.position.set(0, 1.2, 0.7);
        group.add(glass);
      } else if (m.type === 'ROBOTIC_ARM') {
        // Base turret
        const turretGeom = new THREE.CylinderGeometry(0.3, 0.4, 0.3, 16);
        const turretMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8 });
        const turret = new THREE.Mesh(turretGeom, turretMat);
        turret.position.y = 0.95;
        turret.castShadow = true;
        group.add(turret);

        // Arm joint 1
        const arm1Geom = new THREE.CylinderGeometry(0.08, 0.08, 1.0);
        arm1Geom.translate(0, 0.5, 0);
        const arm1 = new THREE.Mesh(arm1Geom, turretMat);
        arm1.position.set(0, 1.1, 0);
        arm1.rotation.z = 0.4;
        arm1.castShadow = true;
        group.add(arm1);
        group.userData.arm1 = arm1;

        // Arm joint 2
        const arm2Geom = new THREE.CylinderGeometry(0.06, 0.06, 0.8);
        arm2Geom.translate(0, 0.4, 0);
        const arm2 = new THREE.Mesh(arm2Geom, turretMat);
        arm2.position.set(0, 0.9, 0);
        arm2.rotation.z = -0.8;
        arm2.castShadow = true;
        arm1.add(arm2);
        group.userData.arm2 = arm2;
      } else if (m.type === 'INSPECTION_STATION') {
        // Arch sensor structure
        const archGeom = new THREE.BoxGeometry(0.2, 1.8, 1.6);
        const archMat = new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.8 });
        
        const archL = new THREE.Mesh(archGeom, archMat);
        archL.position.set(-0.6, 0.9, 0);
        archL.castShadow = true;
        group.add(archL);

        const archR = new THREE.Mesh(archGeom, archMat);
        archR.position.set(0.6, 0.9, 0);
        archR.castShadow = true;
        group.add(archR);

        const archTopGeom = new THREE.BoxGeometry(1.4, 0.2, 1.6);
        const archTop = new THREE.Mesh(archTopGeom, archMat);
        archTop.position.set(0, 1.8, 0);
        archTop.castShadow = true;
        group.add(archTop);

        // Laser pointer mesh (red semi-transparent cylinder)
        const laserGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.4);
        const laserMat = new THREE.MeshBasicMaterial({
          color: '#ef4444',
          transparent: true,
          opacity: 0.4
        });
        const laser = new THREE.Mesh(laserGeom, laserMat);
        laser.position.set(0, 1.0, 0);
        group.add(laser);
        group.userData.laser = laser;
      }

      // Add Andon Light Stack (Green, Yellow, Red stack next to machine)
      const andonGroup = new THREE.Group();
      andonGroup.position.set(0.7, 0.8, -0.7);

      const poleGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.8);
      const poleMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.9 });
      const pole = new THREE.Mesh(poleGeom, poleMat);
      pole.position.y = 0.4;
      andonGroup.add(pole);

      // Stack lights
      const lightGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12);
      
      const lightRed = new THREE.Mesh(lightGeom, new THREE.MeshBasicMaterial({ color: '#7f1d1d' }));
      lightRed.position.y = 0.8;
      andonGroup.add(lightRed);

      const lightYellow = new THREE.Mesh(lightGeom, new THREE.MeshBasicMaterial({ color: '#78350f' }));
      lightYellow.position.y = 0.65;
      andonGroup.add(lightYellow);

      const lightGreen = new THREE.Mesh(lightGeom, new THREE.MeshBasicMaterial({ color: '#064e3b' }));
      lightGreen.position.y = 0.5;
      andonGroup.add(lightGreen);

      group.add(andonGroup);

      group.userData.andon = {
        red: lightRed,
        yellow: lightYellow,
        green: lightGreen
      };

      // Selection indicator circle (flat ring below machine)
      const ringGeom = new THREE.RingGeometry(1.0, 1.1, 32);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#06b6d4',
        side: THREE.DoubleSide,
        visible: false
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.y = 0.01;
      group.add(ring);
      group.userData.selectIndicator = ring;

      machinesGroup.add(group);
      machineMeshes.push(group);
    });

    // Populate active items (materials) moving on the belt
    const partsCount = 6;
    const items = [];
    const itemGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 16);
    const itemMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.3, metalness: 0.6 });

    for (let i = 0; i < partsCount; i++) {
      const item = new THREE.Mesh(itemGeom, itemMat);
      item.castShadow = true;
      // Distribute evenly along conveyor length [-7, 7]
      const startX = -7 + (i * (14 / (partsCount - 1)));
      item.position.set(startX, 0.15, 0);
      partsGroup.add(item);
      items.push(item);
    }

    // Raycasting for clicking machines
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(machinesGroup.children, true);

      if (intersects.length > 0) {
        // Find top-level machine group in the intersect path
        let parent = intersects[0].object;
        while (parent && parent.parent !== machinesGroup) {
          parent = parent.parent;
        }
        if (parent && parent.userData.id) {
          // Find the actual machine node matching sequence order
          const matchNode = lineStateRef.current?.machines?.find(
            m => m.sequenceOrder.toString() === parent.userData.id
          );
          if (matchNode) {
            onSelectMachine(matchNode);
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Animation Loop
    let clock = new THREE.Clock();
    let pulseTime = 0;

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();
      pulseTime += 0.05;

      const currentLineState = lineStateRef.current;
      const isSimulationActive = currentLineState?.machines?.some(m => m.status === 'OPERATIONAL') && 
        !(currentLineState?.activeEvent === 'NORMAL' && currentLineState?.machines?.every(m => m.status === 'OPERATIONAL') && !currentLineState?.machines?.some(m => m.upgraded)); 
      // Actually let's look at activeEvent / simulation status. If we have machines with 'OPERATIONAL' but simulation loop isn't active, we can check.
      // Better: let's determine simulation active state from the prop values or if any machine is operating.

      // Animate active items on the belt
      const isBeltMoving = currentLineState?.machines?.some(m => m.status === 'OPERATIONAL');

      items.forEach((item, idx) => {
        if (isBeltMoving) {
          item.position.x += 0.03; // speed of conveyor
          if (item.position.x > 8) {
            item.position.x = -8; // wrap around
            // reset material color to normal
            item.material.color.set('#64748b');
          }

          // If raw material defect event is active, color parts red as they pass station 1 (CNC)
          if (currentLineState?.activeEvent === 'RAW_MATERIAL_DEFECT' && item.position.x > -5) {
            item.material.color.set('#ef4444'); // Defect highlight!
          }
        }
      });

      // Animate each machine based on its live state
      machinesGroup.children.forEach((group) => {
        const sequenceOrder = parseInt(group.userData.id);
        const node = currentLineState?.machines?.find(m => m.sequenceOrder === sequenceOrder);
        const status = node?.status || 'OPERATIONAL';

        // 1. Update selection indicator
        const isSelected = selectedMachineId === node?.id;
        group.userData.selectIndicator.visible = isSelected;
        if (isSelected) {
          group.userData.selectIndicator.material.opacity = 0.5 + Math.sin(elapsed * 5) * 0.3;
          group.userData.selectIndicator.material.transparent = true;
        }

        // 2. Update Andon Light colors
        const andon = group.userData.andon;
        if (status === 'DOWN') {
          // Flashing Red Andon light
          const isRedOn = Math.floor(elapsed * 4) % 2 === 0;
          andon.red.material.color.set(isRedOn ? '#ef4444' : '#571313');
          andon.yellow.material.color.set('#78350f');
          andon.green.material.color.set('#064e3b');
        } else if (status === 'DEGRADED') {
          // Yellow/Orange
          andon.red.material.color.set('#7f1d1d');
          andon.yellow.material.color.set('#f59e0b');
          andon.green.material.color.set('#064e3b');
        } else {
          // Green
          andon.red.material.color.set('#7f1d1d');
          andon.yellow.material.color.set('#78350f');
          andon.green.material.color.set('#22c55e');
        }

        // 3. Robotic Arms movement
        if (group.userData.type === 'ROBOTIC_ARM') {
          const arm1 = group.userData.arm1;
          const arm2 = group.userData.arm2;

          if (status === 'OPERATIONAL') {
            // Smooth operational movement cycle
            const swingSpeed = 2.0;
            arm1.rotation.y = Math.sin(elapsed * swingSpeed) * 0.5;
            arm1.rotation.z = 0.4 + Math.sin(elapsed * swingSpeed * 2) * 0.15;
            arm2.rotation.z = -0.8 + Math.cos(elapsed * swingSpeed * 2) * 0.2;
          } else if (status === 'DEGRADED') {
            // Sluggish/jerky movements due to misalignment
            const swingSpeed = 0.5;
            const jerkiness = Math.sin(elapsed * 20) * 0.03;
            arm1.rotation.y = Math.sin(elapsed * swingSpeed) * 0.5 + jerkiness;
            arm1.rotation.z = 0.4 + Math.sin(elapsed * swingSpeed * 2) * 0.15 + jerkiness;
            arm2.rotation.z = -0.8 + Math.cos(elapsed * swingSpeed * 2) * 0.2 + jerkiness;
          } else {
            // DOWN: limb hanging low, inactive
            arm1.rotation.y = THREE.MathUtils.lerp(arm1.rotation.y, 0, 0.1);
            arm1.rotation.z = THREE.MathUtils.lerp(arm1.rotation.z, 0.8, 0.1);
            arm2.rotation.z = THREE.MathUtils.lerp(arm2.rotation.z, -0.2, 0.1);
          }
        }

        // 4. Laser visual updates
        if (group.userData.type === 'INSPECTION_STATION' && group.userData.laser) {
          const laser = group.userData.laser;
          if (status === 'OPERATIONAL') {
            laser.visible = true;
            laser.material.opacity = 0.3 + Math.sin(elapsed * 15) * 0.15;
          } else if (status === 'DEGRADED') {
            laser.visible = true;
            // flashing yellow warning laser
            laser.material.color.set('#eab308');
            laser.material.opacity = Math.floor(elapsed * 6) % 2 === 0 ? 0.4 : 0.05;
          } else {
            laser.visible = false;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 400;
      
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
  }, [selectedMachineId]); // trigger setup/cleanup only when selection changes (requires ring update)

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-[#090d16] flex flex-col">
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
        <span className="text-xs font-mono text-cyan-400 tracking-wider">3D DIGITAL TWIN - ACTIVE PLC SIMULATION</span>
      </div>
      <div className="absolute bottom-4 right-4 z-10 bg-slate-950/80 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-xxs font-mono text-slate-400 flex flex-col space-y-1">
        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-green-500 mr-2"></span>OPERATIONAL</div>
        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-yellow-500 mr-2"></span>DEGRADED / FAULT</div>
        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-red-500 mr-2 animate-pulse"></span>DOWN / EMERGENCY</div>
      </div>
      <div ref={containerRef} className="w-full h-full flex-grow flex items-center justify-center" />
    </div>
  );
};

export default AssemblyLine3D;
