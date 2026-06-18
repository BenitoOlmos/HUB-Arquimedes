import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pumpParts = [
  {
    id: 'volute_casing',
    name: 'Volute Casing',
    spanishName: 'Carcasa de Voluta',
    description: 'Carcasa exterior que contiene el líquido y lo dirige a la boquilla de descarga. Su forma espiral actúa como difusor, convirtiendo la velocidad cinética en presión estática.',
    material: 'Fundición de Hierro (ASTM A48 Clase 30) o Acero Inoxidable Dúplex',
    function: 'Alberga las piezas giratorias internas, contiene la presión del fluido y convierte la velocidad cinética en presión estática.',
    maintenanceInterval: 'Cada 24 meses',
    status: 'Operational',
    commonFailures: 'Desgaste local por erosión de partículas abrasivas (arena), corrosión galvánica localizada, microfisuras por golpe de ariete.',
    technicianAlert: 'Realizar medición de espesores por ultrasonido en la voluta. Ajustar pernos de brida en cruz para torque parejo.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[0.8, 0.9, 0.9, 1.0, 1.1, 1.2, 1.2]',
    stressHistory: '[20, 25, 30, 28, 35, 42, 40]',
    remainingLife: 88,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Montaje verificado. Anclaje de pernos de cimentación con torque de 120 N·m. Junta de grafito espiralada instalada.',
    nextMaintenance: '2026-06-15',
    maintenanceLogs: JSON.stringify([
      { id: 'vc-01', date: '2025-01-10', tech: 'Héctor Gómez', desc: 'Inspección por líquidos penetrantes en junta. Reemplazo de junta elastomérica por grafito.' }
    ])
  },
  {
    id: 'impeller',
    name: 'Impeller',
    spanishName: 'Impulsor / Rodete',
    description: 'Componente giratorio principal equipado con álabes. Transfiere energía del motor al fluido, acelerándolo hacia afuera por fuerza centrífuga.',
    material: 'Bronce Alumínico (C95800) o Acero Inoxidable 316L',
    function: 'Imparte velocidad al fluido que se bombea. Es el núcleo de transferencia de energía.',
    maintenanceInterval: 'Cada 12 meses',
    status: 'Operational',
    commonFailures: 'Picaduras severas por cavitación, erosión abrasiva en filos de álabes, desbalance dinámico por incrustaciones.',
    technicianAlert: 'Inspeccionar desgaste característico tipo panal de abejas. Balancear dinámicamente según norma ISO G2.5 antes de montar.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[1.5, 1.6, 1.8, 1.9, 2.4, 2.8, 3.2]',
    stressHistory: '[40, 48, 55, 62, 70, 78, 85]',
    remainingLife: 60,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Balanceo dinámico ISO G2.5 aprobado. Ajuste de chaveta y tuerca del impulsor con arandela de seguridad.',
    nextMaintenance: '2026-07-20',
    maintenanceLogs: JSON.stringify([
      { id: 'imp-01', date: '2025-01-12', tech: 'Carlos Mendoza', desc: 'Limpieza general y balanceo estático realizado. Suavizado de filos de álabes con amoladora.' }
    ])
  },
  {
    id: 'shaft',
    name: 'Shaft',
    spanishName: 'Eje de Transmisión',
    description: 'Eje de acero rectificado de precisión que transmite el par de rotación del motor al impulsor. Debe resistir esfuerzos de flexión y torsión.',
    material: 'Acero de Alta Resistencia (AISI 4140) o SS 410',
    function: 'Transmite el torque mecánico del motor al impulsor, manteniendo la alineación del rotor.',
    maintenanceInterval: 'Cada 18 meses',
    status: 'Operational',
    commonFailures: 'Fatiga por torsión en chaveteros, deflexión por cargas hidráulicas desequilibradas, desgaste bajo la camisa.',
    technicianAlert: 'Verificar excentricidad con reloj comparador (máx 0.05 mm). Inspeccionar chaveteros por partículas magnéticas.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[0.5, 0.6, 0.6, 0.7, 0.7, 0.8, 0.8]',
    stressHistory: '[30, 32, 35, 38, 40, 42, 45]',
    remainingLife: 80,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Alineación láser de acoplamiento completada: desviación radial 0.02 mm, desviación axial 0.01 mm.',
    nextMaintenance: '2026-08-10',
    maintenanceLogs: JSON.stringify([
      { id: 'sh-01', date: '2025-07-15', tech: 'Héctor Gómez', desc: 'Runout verificado en 0.02 mm, holgura dentro de la norma. Alineación láser con motor realizada.' }
    ])
  },
  {
    id: 'mechanical_seal',
    name: 'Mechanical Seal',
    spanishName: 'Sello Mecánico',
    description: 'Evita fugas del fluido bombeado entre el eje giratorio y la carcasa de la bomba. Utiliza caras de sellado de carbón y carburo de silicio.',
    material: 'Carburo de Silicio (SiC) vs Carbón, Juntas Tóricas de Viton',
    function: 'Forma una barrera dinámica estanca alrededor del eje para evitar escapes de líquido presurizado.',
    maintenanceInterval: 'Cada 6 meses',
    status: 'Inspect',
    commonFailures: 'Daño por choque térmico (marcha en seco), degradación de elastómeros, astillado de caras de fricción por sólidos.',
    technicianAlert: 'Verificar caudal de la línea de lavado (Flush Plan 11). Jamás arrancar la bomba en seco para evitar quemar las caras del sello.',
    entryDate: '2025-07-15',
    operatingHours: 5200,
    vibrationHistory: '[1.0, 1.1, 1.2, 1.4, 1.8, 2.5, 3.1]',
    stressHistory: '[35, 42, 50, 58, 65, 72, 88]',
    remainingLife: 35,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Sello de cartucho instalado. Presión de flush verificada a 2.5 bar sobre presión de succión. Se verificó no arranque en seco.',
    nextMaintenance: '2026-06-01',
    maintenanceLogs: JSON.stringify([
      { id: 'ms-01', date: '2025-07-15', tech: 'Carlos Mendoza', desc: 'Conversión de prensaestopas antiguo a sello mecánico de cartucho. Conexión de tubería de flush.' }
    ])
  },
  {
    id: 'bearings',
    name: 'Bearings',
    spanishName: 'Cojinetes / Rodamientos',
    description: 'Soporta el conjunto del eje giratorio, absorbiendo las fuerzas de empuje hidráulico radiales y axiales. Mantiene la deflexión del eje dentro de tolerancias.',
    material: 'Acero de Rodamientos de Alto Carbono y Cromo (AISI 52100)',
    function: 'Soporta las cargas radiales y de empuje axial del rotor, garantizando rotación libre con mínima fricción.',
    maintenanceInterval: 'Cada 6 meses',
    status: 'Operational',
    commonFailures: 'Fatiga por picadura en pistas de rodadura, lubricación deficiente por exceso o falta de grasa, ingreso de agua al cuerpo de rodamientos.',
    technicianAlert: 'Monitorear temperatura del cuerpo (máx 75°C). Analizar vibración en alta frecuencia (aceleración Gs) para detección temprana.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[1.1, 1.2, 1.2, 1.4, 1.6, 1.7, 1.8]',
    stressHistory: '[25, 30, 35, 40, 45, 52, 55]',
    remainingLife: 75,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Rodamientos lubricados con grasa sintética Mobilith SHC 100. Holgura axial ajustada según catálogo del fabricante.',
    nextMaintenance: '2026-06-15',
    maintenanceLogs: JSON.stringify([
      { id: 'br-01', date: '2025-01-12', tech: 'Carlos Mendoza', desc: 'Lavado del cárter de aceite. Relleno con aceite sintético ISO VG 46 de alta viscosidad.' }
    ])
  },
  {
    id: 'shaft_sleeve',
    name: 'Shaft Sleeve',
    spanishName: 'Camisa / Deflector',
    description: 'Cilindro de metal reemplazable colocado sobre el eje en la zona de sellado. Protege el eje de transmisión contra el desgaste, la corrosión y la erosión.',
    material: 'Acero Inoxidable Templado 420 o con recubrimiento de Stellite',
    function: 'Protege el eje de transmisión principal del desgaste abrasivo y corrosivo bajo las caras del sello.',
    maintenanceInterval: 'Cada 12 meses',
    status: 'Replace',
    commonFailures: 'Rayado profundo o ranuración por fricción, corrosión bajo tensión química, picaduras por entrada de sedimentos.',
    technicianAlert: 'Inspeccionar rugosidad superficial (Ra máx 0.8 micrones). Reemplazar camisa si el surco excede 0.25 mm de profundidad.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[0.6, 0.7, 0.8, 1.0, 1.3, 1.7, 2.2]',
    stressHistory: '[50, 58, 65, 75, 82, 90, 95]',
    remainingLife: 10,
    lifecycleStage: 'Replacement',
    installationNotes: 'Camisa montada con ajuste deslizante sobre el eje. O-rings internos lubricados con vaselina técnica.',
    nextMaintenance: '2026-05-30',
    maintenanceLogs: JSON.stringify([
      { id: 'sl-01', date: '2025-01-12', tech: 'Héctor Gómez', desc: 'Superficie de la camisa pulida durante la revisión de rutina. Reinstalada con nuevas juntas tóricas.' }
    ])
  },
  {
    id: 'wear_rings',
    name: 'Wear Rings',
    spanishName: 'Anillos de Desgaste',
    description: 'Anillos reemplazables instalados en la carcasa e impulsor para proporcionar una holgura estrecha. Restringe la recirculación interna del fluido.',
    material: 'Bronce C93200 o Nitronic 60',
    function: 'Reduce el caudal de recirculación interna desde la descarga a la succión para mantener la eficiencia de la bomba.',
    maintenanceInterval: 'Cada 18 meses',
    status: 'Operational',
    commonFailures: 'Aferramiento por contacto metálico accidental, incremento de holgura por erosión de finos.',
    technicianAlert: 'Medir holgura diametral en 4 puntos cardinales. Si la holgura duplica el diseño original, reemplazar los anillos.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[0.9, 1.0, 1.0, 1.1, 1.2, 1.3, 1.4]',
    stressHistory: '[20, 22, 25, 28, 30, 35, 38]',
    remainingLife: 82,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Holgura diametral de diseño verificada en 0.28 mm. Fijación con pernos prisioneros y Loctite 243.',
    nextMaintenance: '2026-09-05',
    maintenanceLogs: JSON.stringify([
      { id: 'wr-01', date: '2025-01-12', tech: 'Carlos Mendoza', desc: 'Medición de holgura de desgaste arrojó 0.38 mm (aceptable). Fijación de anillo de carcasa reajustada.' }
    ])
  },
  {
    id: 'suction_flange',
    name: 'Suction Flange',
    spanishName: 'Brida de Aspiración',
    description: 'Puerto de entrada donde el fluido entra en la bomba. Diseñado para garantizar un flujo de entrada suave y de baja turbulencia.',
    material: 'Mismo que la carcasa (Hierro fundido o Acero inoxidable)',
    function: 'Acoplamiento de entrada que conecta la bomba al sistema de succión de la tubería.',
    maintenanceInterval: 'Cada 24 meses',
    status: 'Operational',
    commonFailures: 'Estiramiento o corrosión de pernos de anclaje, fuga de la junta de brida por vibración del ducto.',
    technicianAlert: 'Verificar tensión con torquímetro. Asegurar que las tuberías no transmitan cargas ni desalineación física sobre la brida.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[0.3, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5]',
    stressHistory: '[10, 12, 11, 14, 15, 13, 15]',
    remainingLife: 95,
    lifecycleStage: 'Installation',
    installationNotes: 'Brida libre de tensiones externas. Tubería de succión soportada independientemente para evitar esfuerzos en carcasa.',
    nextMaintenance: '2026-11-20',
    maintenanceLogs: JSON.stringify([
      { id: 'sf-01', date: '2025-01-10', tech: 'Héctor Gómez', desc: 'Reajuste de torque en tornillería de conexión. Reemplazo de junta por una espiralada de EPDM.' }
    ])
  },
  {
    id: 'motor',
    name: 'Electric Motor',
    spanishName: 'Motor Eléctrico',
    description: 'Motor asincrónico trifásico acoplado de inducción. Proporciona la potencia mecánica y el par necesario para accionar la bomba centrífuga a su velocidad nominal de diseño (2900 RPM).',
    material: 'Carcasa de Aluminio o Hierro Fundido con Bobinado de Cobre',
    function: 'Convierte la energía eléctrica de entrada en energía rotacional mecánica para accionar el eje del impulsor.',
    maintenanceInterval: 'Cada 12 meses',
    status: 'Operational',
    commonFailures: 'Cortocircuito en bobinado por humedad, sobrecalentamiento por sobrecarga eléctrica, falla de rodamientos del estator.',
    technicianAlert: 'Medir resistencia de aislamiento (Megger) entre bobinados y carcasa. Inspeccionar temperatura en la carcasa con cámara termográfica.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[1.1, 1.2, 1.3, 1.2, 1.4, 1.4, 1.5]',
    stressHistory: '[30, 35, 33, 38, 42, 40, 45]',
    remainingLife: 82,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Alineación láser de precisión realizada. Megger de bobinados arrojó > 100 Megaohms (Aprobado). Caja de conexiones estanca verificada.',
    nextMaintenance: '2026-08-25',
    maintenanceLogs: JSON.stringify([
      { id: 'mot-01', date: '2025-01-12', tech: 'Carlos Mendoza', desc: 'Limpieza de aletas de refrigeración y engrase de rodamientos con grasa Mobil Polyrex EM.' }
    ])
  }
];

async function main() {
  console.log('Start seeding pump parts...');
  for (const part of pumpParts) {
    const createdPart = await prisma.pumpPart.upsert({
      where: { id: part.id },
      update: part,
      create: part,
    });
    console.log(`Created/Updated part: ${createdPart.name} (${createdPart.id})`);
  }

  console.log('Purging Smart Port tables...');
  await prisma.globalEvent.deleteMany();
  await prisma.cargoManifest.deleteMany();
  await prisma.portShip.deleteMany();

  console.log('Seeding 510 Port Ships and 10,200 Cargo Manifests...');
  
  // Seed helper arrays
  const prefixNames = ["Oceanic", "Pacific", "Maersk", "MSC", "CMA CGM", "Evergreen", "Hapag-Lloyd", "ONE", "Hyundai", "Yang Ming", "COSCO", "Suez", "Atlantic", "Panama", "Global", "Arctic", "Meridian", "Horizon"];
  const suffixNames = ["Express", "Titan", "Orion", "Apex", "Atlas", "Titan", "Odyssey", "Monarch", "Vanguard", "Leader", "Voyager", "Sovereign", "Pioneer", "Challenger", "Cruiser", "Star", "Glory", "Spirit"];
  const ports = ["Shanghai", "Singapore", "Rotterdam", "Los Angeles", "New York", "Talcahuano", "Valparaíso", "San Antonio", "Manzanillo", "Suez", "Panamá", "Antwerp", "Hamburg", "Busan", "Qingdao", "Ningbo-Zhoushan"];
  const incoterms = ["FOB", "CIF", "EXW", "DDP", "CFR"];
  const cargoCategories = [
    { item: "Smartphones y Laptops de Consumo", category: "Tecnología", weight: 14.2 },
    { item: "Componentes y Motores Automotrices", category: "Automotriz", weight: 26.5 },
    { item: "Ropa, Calzado y Textiles", category: "Moda", weight: 9.1 },
    { item: "Frutas Refrigeradas de Exportación", category: "Fitosanitario", weight: 19.8 },
    { item: "Reactivos Químicos y Polímeros", category: "Químicos", weight: 23.4 },
    { item: "Material Médico y Jeringas", category: "Salud", weight: 11.2 },
    { item: "Respuestos de Maquinaria Minera", category: "Maquinaria", weight: 31.8 }
  ];

  // Coordinate route endpoints
  const routes = [
    // 1. Pacific: Shanghai (31.2, 121.5) -> LA (33.7, -118.2)
    { sLat: 31.2, sLng: 121.5, eLat: 33.7, eLng: 241.8, origin: "Shanghai", dest: "Los Angeles" },
    // 2. Atlantic: Rotterdam (51.9, 4.4) -> NY (40.7, -74.0)
    { sLat: 51.9, sLng: 4.4, eLat: 40.7, eLng: -74.0, origin: "Rotterdam", dest: "New York" },
    // 3. South America: Valparaíso (-33.0, -71.6) -> Shanghai (31.2, 121.5)
    { sLat: -33.0, sLng: -71.6, eLat: 31.2, eLng: 121.5, origin: "Valparaíso", dest: "Shanghai" },
    // 4. Europe-Asia: Singapore (1.3, 103.8) -> Rotterdam (51.9, 4.4)
    { sLat: 1.3, sLng: 103.8, eLat: 51.9, eLng: 4.4, origin: "Singapore", dest: "Rotterdam" },
    // 5. Oceania: Singapore (1.3, 103.8) -> Valparaíso (-33.0, -71.6)
    { sLat: 1.3, sLng: 103.8, eLat: -33.0, eLng: -71.6, origin: "Singapore", dest: "Valparaíso" }
  ];

  const shipsData = [];
  const manifestsData = [];

  for (let i = 0; i < 510; i++) {
    const route = routes[i % routes.length];
    
    // Interpolate coordinate along route
    const progress = Math.random();
    let lat = route.sLat + (route.eLat - route.sLat) * progress;
    let lng = route.sLng + (route.eLng - route.sLng) * progress;
    
    // Wrap longitude
    if (lng > 180) lng -= 360;
    if (lng < -180) lng += 360;

    const shipId = `ship-${200000 + i}`;
    const name = `${prefixNames[i % prefixNames.length]} ${suffixNames[(i + 7) % suffixNames.length]}`;
    const imo = `IMO${9000000 + i}`;
    const capacity = 3000 + (i % 8) * 2000; // 3k to 17k TEU
    const fuel = 20 + Math.random() * 80;
    const dailyCost = 15000 + (capacity / 1000) * 1200;

    shipsData.push({
      id: shipId,
      imoNumber: imo,
      name,
      capacityTEU: capacity,
      currentLat: parseFloat(lat.toFixed(4)),
      currentLng: parseFloat(lng.toFixed(4)),
      status: "EN_RUTA",
      fuelLevel: parseFloat(fuel.toFixed(1)),
      dailyFuelCost: parseFloat(dailyCost.toFixed(2))
    });

    // Generate 20 cargo manifests per ship (total 10,200 manifests)
    for (let j = 0; j < 20; j++) {
      const manifestId = `man-${shipId}-${j}`;
      const cargo = cargoCategories[(i + j) % cargoCategories.length];
      const incoterm = incoterms[(i + j) % incoterms.length];
      const date = new Date();
      date.setDate(date.getDate() + (i % 15)); // Arrival offset

      // Intentionally inject documents discrepancies (15% chance)
      let cargoDetail = { ...cargo };
      let docIncoterm = incoterm;
      let status = "PENDIENTE";

      if (Math.random() < 0.15) {
        // Discrepancy details
        cargoDetail.item = `${cargo.item} (Alerta: Discrepancia de Peso Detectada)`;
        cargoDetail.weight = cargo.weight * 1.5; // Weight mismatch
        docIncoterm = "EXW"; // Wrong Incoterm for a container ship route
        status = "INSPECCION_FISICA";
      }

      manifestsData.push({
        id: manifestId,
        shipId: shipId,
        originPort: route.origin,
        destPort: route.dest,
        contents: JSON.stringify(cargoDetail),
        incoterm: docIncoterm,
        customsStatus: status,
        arrivalDate: date
      });
    }
  }

  // Bulk Insert Ships (Fast)
  await prisma.portShip.createMany({
    data: shipsData
  });

  // Bulk Insert Manifests (Fast)
  await prisma.cargoManifest.createMany({
    data: manifestsData
  });

  // Seed Global Disruption Events
  await prisma.globalEvent.create({
    data: {
      eventType: "CLIMA",
      severity: 4,
      affectedRegion: "Canal de Suez",
      active: true
    }
  });

  await prisma.globalEvent.create({
    data: {
      eventType: "HUELGA",
      severity: 3,
      affectedRegion: "Canal de Panamá",
      active: true
    }
  });

  console.log('Smart Port seeding finished.');

  console.log('Purging AgroTech tables...');
  await prisma.pestHistoricalRecord.deleteMany();
  await prisma.irrigationRule.deleteMany();
  await prisma.agroTelemetry.deleteMany();
  await prisma.agroSensor.deleteMany();
  await prisma.agroValve.deleteMany();
  await prisma.agroZone.deleteMany();

  console.log('Seeding AgroTech Zones...');
  const agroZones = [
    { id: 'zone-a', name: 'Cuadrante A - Vid', cropType: 'Vid (Uva)' },
    { id: 'zone-b', name: 'Cuadrante B - Tomate', cropType: 'Tomates' },
    { id: 'zone-c', name: 'Cuadrante C - Olivo', cropType: 'Olivos' },
    { id: 'zone-d', name: 'Cuadrante D - Palta', cropType: 'Paltas (Aguacates)' }
  ];

  for (const zone of agroZones) {
    await prisma.agroZone.create({ data: zone });
  }

  console.log('Seeding AgroTech Sensors and Valves...');
  const sensorTypes = ['SOIL_MOISTURE', 'PH', 'TEMPERATURE', 'RADIATION'];
  const telemetryData: any[] = [];
  const seedNow = new Date();

  for (const zone of agroZones) {
    // Valve
    await prisma.agroValve.create({
      data: {
        id: `valve-${zone.id}`,
        zoneId: zone.id,
        name: `Electroválvula ${zone.name.replace('Cuadrante ', '')}`,
        status: 'CERRADA'
      }
    });

    // Sensors
    for (const type of sensorTypes) {
      const sensorId = `sensor-${zone.id}-${type.toLowerCase()}`;
      await prisma.agroSensor.create({
        data: {
          id: sensorId,
          zoneId: zone.id,
          type,
          isActive: true
        }
      });

      // Generate 60 days of hourly historical readings (1440 hours)
      let baseVal = 0;
      if (type === 'SOIL_MOISTURE') baseVal = 40; // 0-100%
      else if (type === 'PH') baseVal = 6.5; // 0-14
      else if (type === 'TEMPERATURE') baseVal = 20; // °C
      else baseVal = 400; // RADIATION W/m2

      for (let hour = 1440; hour >= 0; hour--) {
        const timestamp = new Date(seedNow.getTime() - hour * 60 * 60 * 1000);
        let val = baseVal;
        const hrOfDay = timestamp.getHours();
        
        if (type === 'RADIATION') {
          if (hrOfDay >= 6 && hrOfDay <= 18) {
            const cycle = Math.sin((hrOfDay - 6) / 12 * Math.PI);
            val = baseVal + cycle * 500 + Math.random() * 50;
          } else {
            val = 0;
          }
        } else if (type === 'TEMPERATURE') {
          const cycle = Math.sin((hrOfDay - 8) / 24 * 2 * Math.PI);
          val = baseVal + cycle * 8 + Math.random() * 2;
        } else if (type === 'SOIL_MOISTURE') {
          val = baseVal - (hour % 100) * 0.12 + Math.random() * 1.5;
          val = Math.max(10, Math.min(95, val));
        } else if (type === 'PH') {
          val = baseVal + Math.sin(hour / 24) * 0.15 + Math.random() * 0.05;
        }

        telemetryData.push({
          sensorId,
          value: parseFloat(val.toFixed(2)),
          timestamp
        });
      }
    }
  }

  // Bulk Insert Telemetry Data (~23,000 records)
  console.log(`Bulk inserting ${telemetryData.length} telemetry records...`);
  const chunkSize = 5000;
  for (let i = 0; i < telemetryData.length; i += chunkSize) {
    const chunk = telemetryData.slice(i, i + chunkSize);
    await prisma.agroTelemetry.createMany({
      data: chunk
    });
  }

  console.log('Seeding Pest Historical Records...');
  const pests = ["Botrytis (Moho Gris)", "Arañita Roja", "Mosca Blanca", "Fusarium", "Mildiu velloso"];
  const pestRecords: any[] = [];
  
  for (let i = 0; i < 100; i++) {
    const pestName = pests[i % pests.length];
    const cropLost = 5 + (i % 8) * 4.5 + Math.random() * 3;
    
    let avgTemp = 18 + Math.random() * 10;
    let avgHumidity = 60 + Math.random() * 30;

    if (pestName.includes("Botrytis") || pestName.includes("Mildiu")) {
      avgTemp = 15 + Math.random() * 6;
      avgHumidity = 80 + Math.random() * 15;
    } else if (pestName.includes("Arañita")) {
      avgTemp = 28 + Math.random() * 8;
      avgHumidity = 30 + Math.random() * 20;
    }

    const date = new Date();
    date.setDate(date.getDate() - (i * 35) - 10);

    pestRecords.push({
      pestName,
      avgTemp: parseFloat(avgTemp.toFixed(1)),
      avgHumidity: parseFloat(avgHumidity.toFixed(1)),
      cropLost: parseFloat(cropLost.toFixed(1)),
      outbreakDate: date
    });
  }

  await prisma.pestHistoricalRecord.createMany({
    data: pestRecords
  });

  console.log('AgroTech seeding finished.');

  console.log('Purging FinTech Sandbox tables...');
  await prisma.amlAlert.deleteMany();
  await prisma.finTransaction.deleteMany();
  await prisma.finAccount.deleteMany();

  console.log('Seeding 100 FinTech Accounts...');
  const firstNames = ["Benito", "Andrea", "Carlos", "Francisca", "Diego", "Gabriela", "Eduardo", "María", "José", "Alejandra", "Héctor", "Camila", "Sebastián", "Valentina", "Nicolás", "Javiera", "Ricardo", "Paulina", "Claudio", "Sofía"];
  const lastNames = ["Olmos", "Silva", "Gómez", "Mendoza", "Pizarro", "Vergara", "Henríquez", "Tapia", "Muñoz", "Reyes", "Garrido", "Soto", "Contreras", "Vargas", "Morales", "Rojas", "Díaz", "Castro", "Cifuentes", "Ortiz"];

  const accountsData = [];
  for (let i = 0; i < 100; i++) {
    const ownerName = `${firstNames[i % firstNames.length]} ${lastNames[(i + 7) % lastNames.length]}`;
    const accountNumber = `ACC-${100000 + i}`;
    const balance = 1000 + (i % 5) * 5000 + Math.random() * 4000 + (i === 0 ? 150000 : 0);
    const riskScore = 15 + (i % 7) * 10 + Math.random() * 8;
    accountsData.push({
      id: `acc-id-${100000 + i}`,
      accountNumber,
      ownerName,
      balance: parseFloat(balance.toFixed(2)),
      riskScore: Math.round(riskScore),
      isFrozen: false
    });
  }

  await prisma.finAccount.createMany({
    data: accountsData
  });

  console.log('Seeding +1,000 FinTransaction records (Ground Truth & Anomalies)...');
  const transactionsData = [];
  const seedNow = new Date();
  
  for (let i = 0; i < 900; i++) {
    const sender = accountsData[i % accountsData.length];
    const receiver = accountsData[(i + 13) % accountsData.length];
    
    if (sender.id === receiver.id) continue;

    const amount = 20 + (i % 10) * 150 + Math.random() * 50;
    const date = new Date(seedNow.getTime() - (i * 20 * 60 * 1000));
    const ipAddress = `190.160.${10 + (i % 40)}.${100 + (i % 150)}`;
    const fingerprint = `fp-${Math.floor(100000 + (i % 50) * 8500)}`;

    transactionsData.push({
      id: `tx-id-legit-${i}`,
      senderId: sender.id,
      receiverId: receiver.id,
      amount: parseFloat(amount.toFixed(2)),
      timestamp: date,
      ipAddress,
      deviceFingerprint: fingerprint,
      isFlagged: false,
      isFraud: false
    });
  }

  const carder = accountsData[3];
  for (let j = 0; j < 15; j++) {
    const receiver = accountsData[10 + j];
    const date = new Date(seedNow.getTime() - (2 * 60 * 1000 * j));
    transactionsData.push({
      id: `tx-id-carding-${j}`,
      senderId: carder.id,
      receiverId: receiver.id,
      amount: 15.5 + Math.random() * 2,
      timestamp: date,
      ipAddress: "192.42.116.14",
      deviceFingerprint: "fp-malicious-carder-01",
      isFlagged: true,
      isFraud: true
    });
  }

  const moneyLaunderer = accountsData[0];
  for (let j = 0; j < 10; j++) {
    const receiver = accountsData[30 + j];
    const date = new Date(seedNow.getTime() - (j * 12 * 60 * 60 * 1000));
    transactionsData.push({
      id: `tx-id-smurfing-${j}`,
      senderId: moneyLaunderer.id,
      receiverId: receiver.id,
      amount: 9990.00,
      timestamp: date,
      ipAddress: "85.204.116.48",
      deviceFingerprint: `fp-smurf-device-${j}`,
      isFlagged: true,
      isFraud: true
    });
  }

  const targetAcc = accountsData[5];
  for (let j = 0; j < 15; j++) {
    const sourceAcc = accountsData[45 + j];
    const date = new Date(seedNow.getTime() - (j * 10 * 60 * 1000));
    transactionsData.push({
      id: `tx-id-layering-${j}`,
      senderId: sourceAcc.id,
      receiverId: targetAcc.id,
      amount: 4500.00,
      timestamp: date,
      ipAddress: "192.42.116.25",
      deviceFingerprint: "fp-layering-layer",
      isFlagged: true,
      isFraud: true
    });
  }

  console.log(`Bulk inserting ${transactionsData.length} transactions...`);
  const txChunkSize = 5000;
  for (let i = 0; i < transactionsData.length; i += txChunkSize) {
    const chunk = transactionsData.slice(i, i + txChunkSize);
    await prisma.finTransaction.createMany({
      data: chunk
    });
  }

  console.log('Seeding baseline AML alerts...');
  const flaggedTxs = transactionsData.filter(tx => tx.isFlagged);
  const alertsData = flaggedTxs.map((tx, idx) => ({
    id: `alert-id-${idx}`,
    transactionId: tx.id,
    ruleTriggered: tx.amount === 9990 ? "MONTO_LIMITE_AML" : (tx.ipAddress.startsWith("192.42") ? "IP_DARKWEB_DETECTOR" : "TRANSACCIONES_ALTA_VELOCIDAD"),
    severity: tx.amount === 9990 ? "HIGH" : "CRITICAL",
    resolved: false
  }));

  await prisma.amlAlert.createMany({
    data: alertsData
  });

  console.log('FinTech Sandbox seeding finished.');

  console.log('Purging SCADA tables...');
  await prisma.assetAlarm.deleteMany();
  await prisma.assetTelemetry.deleteMany();
  await prisma.scadaAsset.deleteMany();

  console.log('Seeding SCADA assets...');
  const assets = [
    { tagId: "WTG-01", assetType: "WIND_TURBINE", status: "ONLINE", location: "Zona Norte - Colina" },
    { tagId: "WTG-02", assetType: "WIND_TURBINE", status: "ONLINE", location: "Zona Norte - Cresta" },
    { tagId: "PV-ARRAY-01", assetType: "SOLAR_PANEL", status: "ONLINE", location: "Valle Sur - Bloque A" },
    { tagId: "PV-ARRAY-02", assetType: "SOLAR_PANEL", status: "ONLINE", location: "Valle Sur - Bloque B" },
    { tagId: "INV-01", assetType: "INVERTER", status: "ONLINE", location: "Subestación Inversores A" },
    { tagId: "INV-02", assetType: "INVERTER", status: "ONLINE", location: "Subestación Inversores B" },
    { tagId: "TRAFO-01", assetType: "TRANSFORMER", status: "ONLINE", location: "Punto de Inyección Grid" }
  ];

  const createdAssets: any[] = [];
  for (const asset of assets) {
    const created = await prisma.scadaAsset.create({
      data: asset
    });
    createdAssets.push(created);
  }

  console.log('Seeding SCADA telemetry history (15 days)...');
  const telemetryRecords: any[] = [];
  const alarmsRecords: any[] = [];
  const baseDate = new Date();

  for (const asset of createdAssets) {
    for (let h = 360; h >= 0; h--) {
      const timestamp = new Date(baseDate.getTime() - h * 60 * 60 * 1000);
      const hour = timestamp.getHours();
      const dayIdx = Math.floor((360 - h) / 24);

      // Clima curves
      const irradiance = (hour >= 6 && hour <= 18) 
        ? Math.sin((hour - 6) / 12 * Math.PI) * 950 + Math.random() * 50 
        : 0;
      const windSpeed = 4 + Math.sin(dayIdx * 0.5 + hour * 0.1) * 6 + Math.random() * 4;

      if (asset.assetType === "SOLAR_PANEL") {
        const temp = 20 + (irradiance * 0.03) + Math.random() * 3;
        const power = irradiance > 0 ? (irradiance * 8000 * 0.20 * (1 - 0.004 * (temp - 25))) / 1000 : 0;
        const voltage = irradiance > 0 ? 600 + Math.random() * 50 : 0;
        const current = voltage > 0 ? (power * 1000) / voltage : 0;

        telemetryRecords.push({ assetId: asset.id, parameter: "IRRADIANCE", value: parseFloat(irradiance.toFixed(1)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "TEMPERATURE", value: parseFloat(temp.toFixed(1)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "POWER", value: parseFloat((power / 1000).toFixed(3)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "VOLTAGE", value: parseFloat(voltage.toFixed(1)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "CURRENT", value: parseFloat(current.toFixed(1)), timestamp });
      } 
      else if (asset.assetType === "INVERTER") {
        const efficiency = 0.98;
        const solarPowerVal = (hour >= 6 && hour <= 18) ? Math.sin((hour - 6) / 12 * Math.PI) * 600 : 0;
        const powerOut = solarPowerVal * efficiency;
        let temp = 40 + (powerOut / 12) + Math.random() * 5;

        // Anomaly: INV-02 has clogged filters, rising temp
        if (asset.tagId === "INV-02" && h < 240) {
          temp += (240 - h) * 0.18;
        }

        telemetryRecords.push({ assetId: asset.id, parameter: "TEMPERATURE", value: parseFloat(temp.toFixed(1)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "POWER", value: parseFloat((powerOut / 1000).toFixed(3)), timestamp });

        // Trigger alarm for INV-02 overtemp near current time
        if (asset.tagId === "INV-02" && h === 0 && temp > 85) {
          alarmsRecords.push({
            assetId: asset.id,
            alarmCode: "ALM_INV_OVERTEMP",
            description: "Temperatura crítica en inversor central - flujo de refrigeración insuficiente",
            severity: "HIGH",
            triggeredAt: timestamp
          });
        }
      } 
      else if (asset.assetType === "WIND_TURBINE") {
        const Cp = 0.4;
        let power = 0;
        if (windSpeed >= 3 && windSpeed <= 25) {
          power = 0.5 * 1.225 * 6361 * Math.pow(windSpeed, 3) * Cp * 0.9 / 1000;
          power = Math.min(2500, power);
        }
        const rpm = windSpeed > 3 ? 8 + windSpeed * 0.6 + Math.random() * 2 : 0;
        let vibration = 1.5 + Math.random() * 0.4;
        const pitch = 0;

        // Anomaly: WTG-01 mechanical degradation (gearbox vibration rising)
        if (asset.tagId === "WTG-01") {
          vibration += (360 - h) * 0.014;
        }

        telemetryRecords.push({ assetId: asset.id, parameter: "WIND_SPEED", value: parseFloat(windSpeed.toFixed(1)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "RPM", value: parseFloat(rpm.toFixed(1)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "POWER", value: parseFloat((power / 1000).toFixed(3)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "VIBRATION", value: parseFloat(vibration.toFixed(2)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "PITCH", value: pitch, timestamp });

        // Trigger alarm for WTG-01 excessive vibration near current time
        if (asset.tagId === "WTG-01" && h === 0 && vibration > 6.0) {
          alarmsRecords.push({
            assetId: asset.id,
            alarmCode: "ALM_WTG_VIBRATION",
            description: "Vibración crítica en caja multiplicadora de turbina",
            severity: "CRITICAL",
            triggeredAt: timestamp
          });
        }
      } 
      else if (asset.assetType === "TRANSFORMER") {
        const totalPowerMW = 2.4;
        const voltage = 220;
        const current = (totalPowerMW * 1000) / (voltage * Math.sqrt(3));
        const temp = 35 + totalPowerMW * 5 + Math.random() * 3;

        telemetryRecords.push({ assetId: asset.id, parameter: "VOLTAGE", value: parseFloat(voltage.toFixed(1)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "CURRENT", value: parseFloat(current.toFixed(2)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "POWER", value: parseFloat(totalPowerMW.toFixed(3)), timestamp });
        telemetryRecords.push({ assetId: asset.id, parameter: "TEMPERATURE", value: parseFloat(temp.toFixed(1)), timestamp });
      }
    }
  }

  console.log(`Inserting ${telemetryRecords.length} SCADA telemetry logs...`);
  const chunkVal = 2000;
  for (let i = 0; i < telemetryRecords.length; i += chunkVal) {
    const chunk = telemetryRecords.slice(i, i + chunkVal);
    await prisma.assetTelemetry.createMany({ data: chunk });
  }

  if (alarmsRecords.length > 0) {
    console.log('Inserting active alarms...');
    await prisma.assetAlarm.createMany({ data: alarmsRecords });
    
    await prisma.scadaAsset.update({
      where: { tagId: "WTG-01" },
      data: { status: "FAULT" }
    });
    await prisma.scadaAsset.update({
      where: { tagId: "INV-02" },
      data: { status: "FAULT" }
    });
  }

  console.log('SCADA Renovables seeding finished.');

  console.log('Purging Retail tables...');
  await prisma.retailEvent.deleteMany();
  await prisma.retailSession.deleteMany();
  await prisma.retailOrder.deleteMany();
  await prisma.retailCustomer.deleteMany();
  await prisma.storeInventory.deleteMany();
  await prisma.retailProduct.deleteMany();

  console.log('Seeding Retail products...');
  const products = [
    { sku: "SKU-SHOES-01", name: "Zapatillas Trail Runner X", category: "Calzado", basePrice: 89.90 },
    { sku: "SKU-SHOES-02", name: "Zapatillas Urban Classic", category: "Calzado", basePrice: 59.90 },
    { sku: "SKU-JACKET-01", name: "Chaqueta Cortavientos Outdoor", category: "Vestuario", basePrice: 79.90 },
    { sku: "SKU-JACKET-02", name: "Polerón Térmico Fleece", category: "Vestuario", basePrice: 45.00 },
    { sku: "SKU-CAP-01", name: "Gorra Deportiva Transpirable", category: "Accesorios", basePrice: 15.00 },
    { sku: "SKU-CAP-02", name: "Mochila Ergonómica 25L", category: "Accesorios", basePrice: 39.90 },
    { sku: "SKU-PANTS-01", name: "Pantalón de Trekking Convert", category: "Vestuario", basePrice: 49.90 },
    { sku: "SKU-PANTS-02", name: "Calzas Deportivas Compresión", category: "Vestuario", basePrice: 35.00 }
  ];
  const createdProducts = [];
  for (const prod of products) {
    const p = await prisma.retailProduct.create({ data: prod });
    createdProducts.push(p);
  }

  console.log('Seeding Store Inventories...');
  const stores = [
    { name: "Providencia (DS)", type: "DARK_STORE", lat: -33.425, lng: -70.614 },
    { name: "Las Condes (DS)", type: "DARK_STORE", lat: -33.412, lng: -70.578 },
    { name: "Santiago Centro (RT)", type: "RETAIL_STORE", lat: -33.442, lng: -70.653 },
    { name: "Maipú (RT)", type: "RETAIL_STORE", lat: -33.485, lng: -70.757 },
    { name: "Pudahuel (WH)", type: "MAIN_WAREHOUSE", lat: -33.435, lng: -70.792 }
  ];

  for (const store of stores) {
    for (const prod of createdProducts) {
      let stock = 40 + Math.floor(Math.random() * 80);
      
      // Anomaly Trap: SKU-SHOES-01 has 0 stock in Las Condes and Santiago Centro
      if (prod.sku === "SKU-SHOES-01" && (store.name.includes("Las Condes") || store.name.includes("Santiago Centro"))) {
        stock = 0;
      }
      if (store.type === "MAIN_WAREHOUSE") {
        stock = 250 + Math.floor(Math.random() * 150);
      }

      await prisma.storeInventory.create({
        data: {
          productId: prod.id,
          storeType: store.type,
          locationLat: store.lat,
          locationLng: store.lng,
          stockLevel: stock
        }
      });
    }
  }

  console.log('Seeding Customers, Sessions and conversion events...');
  const segments = ["MILLENNIAL_TECH", "BARGAIN_HUNTER", "LOYAL_PREMIUM"];
  const devices = ["Mobile-iOS", "Mobile-Android", "Desktop-Chrome", "Desktop-Safari"];
  
  const customers = [];
  for (let i = 0; i < 150; i++) {
    const segment = segments[i % segments.length];
    const ltv = segment === "LOYAL_PREMIUM" ? 120 + Math.random() * 400 : 0.0;
    const cust = await prisma.retailCustomer.create({
      data: { segment, lifetimeValue: parseFloat(ltv.toFixed(2)) }
    });
    customers.push(cust);
  }

  const seedNow = new Date();
  const eventsBatch = [];
  
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const numSessions = 2 + (i % 5);

    for (let s = 0; s < numSessions; s++) {
      const sessionDate = new Date(seedNow.getTime() - (s * 3 + i * 0.5) * 24 * 60 * 60 * 1000);
      const session = await prisma.retailSession.create({
        data: {
          customerId: customer.id,
          startedAt: sessionDate,
          device: devices[s % devices.length]
        }
      });

      const pIdx = (i + s) % createdProducts.length;
      const product = createdProducts[pIdx];

      // PAGE_VIEW
      eventsBatch.push({
        sessionId: session.id,
        eventType: "PAGE_VIEW",
        productId: product.id,
        timestamp: sessionDate
      });

      // ADD_TO_CART (45% chance)
      const isAddToCart = Math.random() < 0.45;
      if (isAddToCart) {
        const cartTime = new Date(sessionDate.getTime() + 2 * 60 * 1000);
        eventsBatch.push({
          sessionId: session.id,
          eventType: "ADD_TO_CART",
          productId: product.id,
          timestamp: cartTime
        });

        const isTrapLocation = (i % 2 === 0);
        const isShoes01 = product.sku === "SKU-SHOES-01";
        
        // Out of stock causes high cart abandonment in trap locations
        const isAbandoned = (isShoes01 && isTrapLocation) ? Math.random() < 0.95 : Math.random() < 0.65;
        
        if (isAbandoned) {
          const abandonTime = new Date(cartTime.getTime() + 10 * 60 * 1000);
          eventsBatch.push({
            sessionId: session.id,
            eventType: "CART_ABANDONED",
            productId: product.id,
            timestamp: abandonTime
          });
        } else {
          // PURCHASE
          const purchaseTime = new Date(cartTime.getTime() + 8 * 60 * 1000);
          eventsBatch.push({
            sessionId: session.id,
            eventType: "PURCHASE",
            productId: product.id,
            timestamp: purchaseTime
          });

          await prisma.retailOrder.create({
            data: {
              customerId: customer.id,
              totalAmount: product.basePrice,
              status: "COMPLETED",
              createdAt: purchaseTime
            }
          });

          await prisma.retailCustomer.update({
            where: { id: customer.id },
            data: { lifetimeValue: { increment: product.basePrice } }
          });
        }
      }
    }
  }

  console.log(`Inserting ${eventsBatch.length} RetailEvents...`);
  const retChunk = 1000;
  for (let i = 0; i < eventsBatch.length; i += retChunk) {
    const chunk = eventsBatch.slice(i, i + retChunk);
    await prisma.retailEvent.createMany({ data: chunk });
  }

  console.log('Retail Analytics Engine seeding finished.');

  console.log('Purging Smart City Hub tables...');
  await prisma.commuterValidation.deleteMany();
  await prisma.busTelemetry.deleteMany();
  await prisma.busUnit.deleteMany();
  await prisma.transitRoute.deleteMany();
  await prisma.trafficIntersection.deleteMany();

  console.log('Seeding Traffic Intersections (Santiago Grid)...');
  const intersections = [
    { name: "Alameda / Las Rejas", lat: -33.4530, lng: -70.7090, greenPhase: 40, redPhase: 40, offset: 0 },
    { name: "Alameda / Gral Velásquez", lat: -33.4520, lng: -70.6920, greenPhase: 45, redPhase: 35, offset: 5 },
    { name: "Alameda / Estación Central", lat: -33.4510, lng: -70.6780, greenPhase: 50, redPhase: 30, offset: 10 },
    { name: "Alameda / Santa Lucía", lat: -33.4440, lng: -70.6470, greenPhase: 45, redPhase: 35, offset: 15 },
    { name: "Providencia / Pedro de Valdivia", lat: -33.4240, lng: -70.6120, greenPhase: 40, redPhase: 40, offset: 20 }
  ];

  for (const inter of intersections) {
    await prisma.trafficIntersection.create({ data: inter });
  }

  console.log('Seeding Transit Routes...');
  const routesData = [
    { routeCode: "401", name: "Maipú - Las Condes (via Alameda)" },
    { routeCode: "210", name: "Estación Central - Puente Alto" },
    { routeCode: "506", name: "Maipú - Peñalolén" },
    { routeCode: "B02", name: "Huechuraba - Santiago Centro" },
    { routeCode: "104", name: "Providencia - Puente Alto" }
  ];

  const createdRoutes = [];
  for (const rd of routesData) {
    const route = await prisma.transitRoute.create({ data: rd });
    createdRoutes.push(route);
  }

  console.log('Seeding Bus Units & Telemetries...');
  const prefixes = ["BJ-", "FL-", "ZN-", "WA-", "CY-"];
  const stopPoints = {
    "401": [
      { lat: -33.485, lng: -70.757 }, // Maipú
      { lat: -33.453, lng: -70.709 }, // Las Rejas
      { lat: -33.451, lng: -70.678 }, // Estación Central
      { lat: -33.442, lng: -70.653 }, // Santiago Centro
      { lat: -33.425, lng: -70.614 }, // Providencia
      { lat: -33.412, lng: -70.578 }  // Las Condes
    ],
    "210": [
      { lat: -33.451, lng: -70.678 }, // Estación Central
      { lat: -33.442, lng: -70.653 }, // Centro
      { lat: -33.468, lng: -70.625 }, // Vicuña Mackenna / Ñuble
      { lat: -33.512, lng: -70.598 }, // La Florida
      { lat: -33.595, lng: -70.578 }  // Puente Alto
    ],
    "506": [
      { lat: -33.485, lng: -70.757 }, // Maipú
      { lat: -33.465, lng: -70.698 }, // Cerrillos
      { lat: -33.460, lng: -70.655 }, // Blanco Encalada
      { lat: -33.463, lng: -70.620 }, // Grecia / Ñuñoa
      { lat: -33.475, lng: -70.555 }  // Peñalolén
    ],
    "B02": [
      { lat: -33.375, lng: -70.675 }, // Huechuraba
      { lat: -33.415, lng: -70.665 }, // Independencia
      { lat: -33.442, lng: -70.653 }  // Santiago Centro
    ],
    "104": [
      { lat: -33.425, lng: -70.614 }, // Providencia
      { lat: -33.475, lng: -70.605 }, // Macul
      { lat: -33.525, lng: -70.590 }, // La Florida
      { lat: -33.595, lng: -70.578 }  // Puente Alto
    ]
  };

  const seedDate = new Date();

  for (const route of createdRoutes) {
    const code = route.routeCode;
    const path = stopPoints[code] || [];
    
    // Create 6 buses per route
    for (let b = 0; b < 6; b++) {
      const plateNumber = `${prefixes[b % prefixes.length]}${2000 + Math.floor(Math.random() * 8000)}`;
      const bus = await prisma.busUnit.create({
        data: {
          plateNumber,
          routeId: route.id,
          capacity: 80
        }
      });

      // Generate 12 hours of historical telemetry (1 reading every hour)
      for (let h = 12; h >= 0; h--) {
        const timestamp = new Date(seedDate.getTime() - h * 60 * 60 * 1000);
        // Interpolate along route path based on time
        const step = (12 - h + b) % path.length;
        const pos = path[step] || { lat: -33.442, lng: -70.653 };
        
        await prisma.busTelemetry.create({
          data: {
            busId: bus.id,
            lat: pos.lat + (Math.random() - 0.5) * 0.002, // slight jitter
            lng: pos.lng + (Math.random() - 0.5) * 0.002,
            speed: 15 + Math.random() * 20,
            passengerCount: Math.floor(10 + Math.random() * 60),
            timestamp
          }
        });
      }
    }
  }

  console.log('Seeding Commuter Validations (Smart Taps)...');
  const peripheralStops = ["STOP-MAIPU", "STOP-PUENTE-ALTO", "STOP-PUDAHUEL", "STOP-HUECHURABA"];
  const centralStops = ["STOP-CENTRO", "STOP-PROVIDENCIA", "STOP-LAS-CONDES"];
  const routeCodes = ["401", "210", "506", "B02", "104"];

  const validationsBatch = [];
  
  // Seed 2,500 commuters (each has an origin validation in AM, and destination in PM)
  for (let c = 0; c < 2500; c++) {
    const cardHash = `bip-card-hash-${100000 + c}`;
    const routeCode = routeCodes[c % routeCodes.length];
    
    // Morning: validation at peripheral stop
    const amTime = new Date(seedDate.getTime());
    amTime.setHours(7, Math.floor(Math.random() * 60), 0);
    const originStop = peripheralStops[c % peripheralStops.length];
    
    validationsBatch.push({
      cardNumber: cardHash,
      stopId: originStop,
      routeCode,
      timestamp: amTime
    });

    // Evening: validation at central stop
    const pmTime = new Date(seedDate.getTime());
    pmTime.setHours(17, Math.floor(Math.random() * 60), 0);
    const destStop = centralStops[c % centralStops.length];

    validationsBatch.push({
      cardNumber: cardHash,
      stopId: destStop,
      routeCode,
      timestamp: pmTime
    });
  }

  console.log(`Bulk inserting ${validationsBatch.length} CommuterValidations...`);
  const valChunk = 1000;
  for (let i = 0; i < validationsBatch.length; i += valChunk) {
    const chunk = validationsBatch.slice(i, i + valChunk);
    await prisma.commuterValidation.createMany({ data: chunk });
  }

  console.log('Smart City Hub seeding finished.');

  console.log('Purging Industry 4.0 tables...');
  await prisma.downtimeLog.deleteMany();
  await prisma.machineTelemetry.deleteMany();
  await prisma.productionBatch.deleteMany();
  await prisma.machineNode.deleteMany();
  await prisma.assemblyLine.deleteMany();

  console.log('Seeding Assembly Line...');
  const line = await prisma.assemblyLine.create({
    data: {
      name: "Línea de Ensamblaje Continua (Celda A)",
      targetUPH: 500
    }
  });

  console.log('Seeding Machine Nodes...');
  const machinesData = [
    { name: "Corte Láser CNC", type: "CNC", sequenceOrder: 1, nominalCycleTime: 6.0 },
    { name: "Plegado y Punzonado", type: "CNC", sequenceOrder: 2, nominalCycleTime: 6.0 },
    { name: "Soldadura Robótica (Estación 3)", type: "ROBOTIC_ARM", sequenceOrder: 3, nominalCycleTime: 6.0 },
    { name: "Inspección de Calidad Óptica", type: "INSPECTION_STATION", sequenceOrder: 4, nominalCycleTime: 6.0 }
  ];

  const createdMachines = [];
  for (const m of machinesData) {
    const node = await prisma.machineNode.create({
      data: {
        lineId: line.id,
        type: m.type,
        sequenceOrder: m.sequenceOrder,
        nominalCycleTime: m.nominalCycleTime
      }
    });
    createdMachines.push({ ...node, name: m.name });
  }

  console.log('Seeding Production Batches...');
  const batchesCount = 10;
  const createdBatches = [];
  const seedNow = new Date();

  for (let b = 0; b < batchesCount; b++) {
    const startTime = new Date(seedNow.getTime() - (batchesCount - b) * 8 * 60 * 60 * 1000); // 8 hours per batch shift
    const endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000);
    
    // Correlation: Batch 4 and 8 will have higher energy and high defects (tool wear)
    const isFaultyBatch = (b === 4 || b === 8);
    const defects = isFaultyBatch ? 45 + Math.floor(Math.random() * 20) : 3 + Math.floor(Math.random() * 8);
    const totalProduced = 3200 + Math.floor(Math.random() * 300);

    const batch = await prisma.productionBatch.create({
      data: {
        lineId: line.id,
        totalProduced,
        defectsFound: defects,
        startTime,
        endTime
      }
    });
    createdBatches.push({ ...batch, isFaultyBatch });
  }

  console.log('Seeding Machine Telemetries (with Bottleneck & Energy-Quality Correlation)...');
  const telemetryRecords = [];

  for (const machine of createdMachines) {
    // Generate telemetry linked to batches timeframe
    for (const batch of createdBatches) {
      // 50 readings per 8-hour shift batch
      for (let r = 0; r < 50; r++) {
        const timestamp = new Date(batch.startTime.getTime() + (r * 8 * 60 * 60 * 1000) / 50);

        let actualCycle = machine.nominalCycleTime + (Math.random() - 0.5) * 0.5; // slight variance
        
        // Trap: Machine 3 (Soldadura Robótica) has an average cycle time of 7.5s (Bottleneck!)
        if (machine.sequenceOrder === 3) {
          actualCycle = 7.5 + (Math.random() - 0.5) * 0.8;
        }

        // Correlation: higher energy consumption on CNC cutting if batch has high defects (tool wear)
        let energy = 1.2 + (Math.random() - 0.5) * 0.2;
        if (machine.type === 'CNC' && batch.isFaultyBatch) {
          energy = 2.4 + (Math.random() - 0.5) * 0.4; // elevated energy consumption due to tool wear
        }

        telemetryRecords.push({
          machineId: machine.id,
          actualCycleTime: parseFloat(actualCycle.toFixed(2)),
          energyConsumed: parseFloat(energy.toFixed(3)),
          timestamp
        });
      }
    }
  }

  console.log(`Bulk inserting ${telemetryRecords.length} MachineTelemetries...`);
  const telChunk = 1000;
  for (let i = 0; i < telemetryRecords.length; i += telChunk) {
    const chunk = telemetryRecords.slice(i, i + telChunk);
    await prisma.machineTelemetry.createMany({ data: chunk });
  }

  console.log('Seeding Downtime Logs (Tiempos Muertos)...');
  const reasons = ["ERR_MATERIAL_JAM", "ERR_MOTOR_TEMP", "ERR_TOOL_WEAR", "ERR_COMM_LOST"];
  
  for (const machine of createdMachines) {
    // 5 downtime events per machine
    for (let d = 0; d < 5; d++) {
      const timestamp = new Date(seedNow.getTime() - (d * 24 * 60 * 60 * 1000) - Math.random() * 12 * 60 * 60 * 1000);
      const duration = 120 + Math.floor(Math.random() * 1800); // 2 mins to 30 mins
      const reasonCode = reasons[(d + machine.sequenceOrder) % reasons.length];

      await prisma.downtimeLog.create({
        data: {
          machineId: machine.id,
          reasonCode,
          durationSecs: duration,
          timestamp
        }
      });
    }
  }

  console.log('Industry 4.0 Digital Twin seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
