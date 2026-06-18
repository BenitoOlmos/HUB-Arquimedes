import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function NetworkGraph3D({ accounts, transactions, onSelectAccount }) {
  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Keep physics nodes in ref to survive rerenders and maintain position stability
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const particlesRef = useRef([]); // Animated transfer particles
  
  useEffect(() => {
    if (!containerRef.current || accounts.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#06070a');
    scene.fog = new THREE.FogExp2('#06070a', 0.007);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 80);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight('#00f0ff', 1.0);
    dirLight1.position.set(100, 100, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight('#ff007f', 0.8);
    dirLight2.position.set(-100, -100, -100);
    scene.add(dirLight2);

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 200;
    controls.minDistance = 15;

    // 6. Build or Sync Nodes
    const prevNodesMap = new Map(nodesRef.current.map(n => [n.id, n]));
    const newNodes = accounts.map((acc, idx) => {
      const existing = prevNodesMap.get(acc.id);
      if (existing) {
        // Update mutable details but keep coordinates
        existing.riskScore = acc.riskScore;
        existing.isFrozen = acc.isFrozen;
        existing.balance = acc.balance;
        return existing;
      }
      
      // Spherical distribution initial positions
      const phi = Math.acos(-1 + (2 * idx) / accounts.length);
      const theta = Math.sqrt(accounts.length * Math.PI) * phi;
      const radius = 45;
      
      return {
        id: acc.id,
        accountNumber: acc.accountNumber,
        ownerName: acc.ownerName,
        riskScore: acc.riskScore,
        isFrozen: acc.isFrozen,
        balance: acc.balance,
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        vx: 0,
        vy: 0,
        vz: 0
      };
    });
    nodesRef.current = newNodes;

    // Create Mesh Group
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);
    
    const nodeMeshes = [];
    const sphereGeo = new THREE.SphereGeometry(1.6, 16, 16);

    nodesRef.current.forEach(node => {
      // Color based on riskScore
      let color = '#39ff14'; // Green
      if (node.isFrozen) {
        color = '#888888'; // Gray
      } else if (node.riskScore > 75) {
        color = '#ff007f'; // Neon magenta
      } else if (node.riskScore > 40) {
        color = '#fff000'; // Neon yellow
      }

      const mat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: node.isFrozen ? 0.05 : 0.4,
        shininess: 30,
        specular: new THREE.Color('#ffffff')
      });

      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = { nodeId: node.id };
      nodeGroup.add(mesh);
      nodeMeshes.push({ mesh, nodeData: node });
    });

    // 7. Sync Links based on Transactions
    // Show connections for transactions in the feed
    const links = [];
    const linksMap = new Map();

    transactions.forEach(t => {
      // Find matching accounts
      const senderAcc = accounts.find(a => a.accountNumber === t.sender);
      const receiverAcc = accounts.find(a => a.accountNumber === t.receiver);
      if (!senderAcc || !receiverAcc) return;

      const key = `${senderAcc.id}-${receiverAcc.id}`;
      const revKey = `${receiverAcc.id}-${senderAcc.id}`;
      
      if (!linksMap.has(key) && !linksMap.has(revKey)) {
        linksMap.set(key, {
          sourceId: senderAcc.id,
          targetId: receiverAcc.id,
          isFraud: t.isFraud
        });
      }
    });

    linksMap.forEach(l => {
      const source = nodesRef.current.find(n => n.id === l.sourceId);
      const target = nodesRef.current.find(n => n.id === l.targetId);
      if (source && target) {
        links.push({ source, target, isFraud: l.isFraud });
      }
    });

    linksRef.current = links;

    // Draw Links
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3a405a,
      transparent: true,
      opacity: 0.4
    });
    const fraudLineMaterial = new THREE.LineBasicMaterial({
      color: 0xff007f,
      transparent: true,
      opacity: 0.6
    });

    const linesGroup = new THREE.Group();
    scene.add(linesGroup);

    const lineObjects = [];

    linksRef.current.forEach(link => {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(link.source.x, link.source.y, link.source.z),
        new THREE.Vector3(link.target.x, link.target.y, link.target.z)
      ]);
      const line = new THREE.Line(geom, link.isFraud ? fraudLineMaterial : lineMaterial);
      linesGroup.add(line);
      lineObjects.push({ line, link });
    });

    // 8. Capture and Animate Particles for recent transactions
    // If a new transaction occurs, we spawn a particle traveling source -> target
    const currentTxIds = new Set(transactions.map(t => t.id));
    const prevTxIdsRef = useRef(new Set());
    
    // Spawn particles for transactions that are brand new
    transactions.forEach(t => {
      if (!prevTxIdsRef.current.has(t.id)) {
        const sourceNode = nodesRef.current.find(n => n.accountNumber === t.sender);
        const targetNode = nodesRef.current.find(n => n.accountNumber === t.receiver);
        if (sourceNode && targetNode) {
          particlesRef.current.push({
            id: t.id,
            source: sourceNode,
            target: targetNode,
            progress: 0,
            speed: 0.01 + Math.random() * 0.01,
            isFraud: t.isFraud
          });
        }
      }
    });
    // Keep record of current transaction IDs for next tick
    prevTxIdsRef.current = currentTxIds;

    // Particles visual meshes
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);
    const particleGeom = new THREE.SphereGeometry(0.7, 8, 8);

    // Filter out finished particles and render active ones
    const activeParticleMeshes = [];
    particlesRef.current = particlesRef.current.filter(p => p.progress < 1);
    
    particlesRef.current.forEach(p => {
      const pMat = new THREE.MeshBasicMaterial({
        color: p.isFraud ? 0xff007f : 0x00f0ff
      });
      const pMesh = new THREE.Mesh(particleGeom, pMat);
      particlesGroup.add(pMesh);
      activeParticleMeshes.push({ mesh: pMesh, particleData: p });
    });

    // 9. Interactive Raycasting (Hover/Click)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const nodeInfo = nodesRef.current.find(n => n.id === hitMesh.userData.nodeId);
        if (nodeInfo) {
          setHoveredNode(nodeInfo);
          document.body.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredNode(null);
      document.body.style.cursor = 'default';
    };

    const handleMouseClick = (event) => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const nodeInfo = nodesRef.current.find(n => n.id === hitMesh.userData.nodeId);
        if (nodeInfo) {
          setSelectedNode(nodeInfo);
          onSelectAccount(nodeInfo);
        }
      } else {
        setSelectedNode(null);
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleMouseClick);

    // 10. Animation & Physics Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Force-directed layout logic
      const nodes = nodesRef.current;
      
      // Coulomb repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dz = nodes[j].z - nodes[i].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          
          if (dist < 40) {
            const force = 0.8 / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            const fz = (dz / dist) * force;
            
            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[i].vz -= fz;
            
            nodes[j].vx += fx;
            nodes[j].vy += fy;
            nodes[j].vz += fz;
          }
        }
      }

      // Hooke attraction along links
      linksRef.current.forEach(l => {
        const dx = l.target.x - l.source.x;
        const dy = l.target.y - l.source.y;
        const dz = l.target.z - l.source.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        
        const force = 0.003 * (dist - 20); // Equilibrium distance of 20
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        const fz = (dz / dist) * force;
        
        l.source.vx += fx;
        l.source.vy += fy;
        l.source.vz += fz;
        
        l.target.vx -= fx;
        l.target.vy -= fy;
        l.target.vz -= fz;
      });

      // Gravity towards center and updates positions
      nodes.forEach(n => {
        const dist = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z) || 1;
        // Gravity pull
        n.vx -= (n.x / dist) * 0.015;
        n.vy -= (n.y / dist) * 0.015;
        n.vz -= (n.z / dist) * 0.015;

        // Friction damping
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.vz *= 0.85;

        // Apply velocities
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;
      });

      // Sync node meshes positions
      nodeMeshes.forEach(nm => {
        nm.mesh.position.set(nm.nodeData.x, nm.nodeData.y, nm.nodeData.z);
        // Emphasize selected node
        if (selectedNode && nm.nodeData.id === selectedNode.id) {
          nm.mesh.scale.set(1.6, 1.6, 1.6);
        } else {
          nm.mesh.scale.set(1.0, 1.0, 1.0);
        }
      });

      // Sync line geometries positions
      lineObjects.forEach(lo => {
        const pos = lo.line.geometry.attributes.position;
        pos.setXYZ(0, lo.link.source.x, lo.link.source.y, lo.link.source.z);
        pos.setXYZ(1, lo.link.target.x, lo.link.target.y, lo.link.target.z);
        pos.needsUpdate = true;
      });

      // Animate active transfer particles
      activeParticleMeshes.forEach(pm => {
        const p = pm.particleData;
        p.progress += p.speed;
        
        // Linear interpolation source -> target
        const x = p.source.x + (p.target.x - p.source.x) * p.progress;
        const y = p.source.y + (p.target.y - p.source.y) * p.progress;
        const z = p.source.z + (p.target.z - p.source.z) * p.progress;
        pm.mesh.position.set(x, y, z);
      });

      // Slow rotation of entire scene for aesthetic purposes
      nodeGroup.rotation.y += 0.001;
      linesGroup.rotation.y += 0.001;
      particlesGroup.rotation.y += 0.001;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('click', handleMouseClick);
        renderer.dispose();
      }
    };
  }, [accounts, transactions, selectedNode]);

  return (
    <div className="canvas-wrapper" style={{ height: '520px', width: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Node Tooltip */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'rgba(10, 12, 20, 0.9)',
          border: '1px solid var(--neon-cyan)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          pointerEvents: 'none',
          boxShadow: 'var(--glow-cyan)',
          zIndex: 20
        }}>
          <div style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{hoveredNode.ownerName}</div>
          <div style={{ color: 'var(--text-muted)' }}>Cta: {hoveredNode.accountNumber}</div>
          <div style={{ color: hoveredNode.riskScore > 75 ? 'var(--neon-magenta)' : hoveredNode.riskScore > 40 ? 'var(--neon-yellow)' : 'var(--neon-green)' }}>
            Riesgo: {hoveredNode.riskScore}/100
          </div>
        </div>
      )}

      {/* Graph Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        background: 'rgba(10, 12, 20, 0.75)',
        border: '1px solid var(--border-color)',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '11px',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>
          <span>Riesgo Bajo (&lt;40)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px', backgroundColor: '#fff000' }}></span>
          <span>Riesgo Medio (40-75)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pulse-dot alert" style={{ width: '6px', height: '6px' }}></span>
          <span>Riesgo Alto/Fraude (&gt;75)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px', backgroundColor: '#888888' }}></span>
          <span>Cuenta Congelada</span>
        </div>
      </div>
    </div>
  );
}
