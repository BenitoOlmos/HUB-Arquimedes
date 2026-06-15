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
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
