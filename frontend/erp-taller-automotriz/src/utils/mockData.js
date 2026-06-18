// Maestro de Datos Semilla para el ERP Educativo del Taller Automotriz

// 1. Catálogo de Clientes y Vehículos (50 Ítems)
export const mockVehicles = [
  { id: 'V-101', owner: 'Juan Pérez', type: 'Particular', brand: 'Toyota', model: 'Hilux', year: 2020, km: 120000, plate: 'AB-CD-12' },
  { id: 'V-102', owner: 'María González', type: 'Particular', brand: 'Hyundai', model: 'Accent', year: 2018, km: 95000, plate: 'EF-GH-34' },
  { id: 'V-103', owner: 'Dina S.A. (Flota)', type: 'Empresa/Flota', brand: 'Nissan', model: 'Versa', year: 2021, km: 64000, plate: 'JK-LM-56' },
  { id: 'V-104', owner: 'Carlos Muñoz', type: 'Particular', brand: 'Suzuki', model: 'Swift', year: 2019, km: 78000, plate: 'NP-QR-78' },
  { id: 'V-105', owner: 'Minera Los Andes', type: 'Empresa/Flota', brand: 'Toyota', model: 'Hilux', year: 2022, km: 45000, plate: 'ST-UV-90' },
  { id: 'V-106', owner: 'Sofía Valdés', type: 'Particular', brand: 'Honda', model: 'Civic', year: 2017, km: 110000, plate: 'WX-YZ-12' },
  { id: 'V-107', owner: 'Enel Distribución', type: 'Empresa/Flota', brand: 'Peugeot', model: 'Partner', year: 2020, km: 135000, plate: 'AA-BB-22' },
  { id: 'V-108', owner: 'Luis Aravena', type: 'Particular', brand: 'Chevrolet', model: 'Sail', year: 2016, km: 150000, plate: 'CC-DD-44' },
  { id: 'V-109', owner: 'Pedro Morales', type: 'Particular', brand: 'Ford', model: 'Ranger', year: 2019, km: 89000, plate: 'EE-FF-66' },
  { id: 'V-110', owner: 'Constructora Beta', type: 'Empresa/Flota', brand: 'Mitsubishi', model: 'L200', year: 2021, km: 72000, plate: 'GG-HH-88' },
  // 40 vehículos más generados sistemáticamente para lograr los 50 requeridos
  ...Array.from({ length: 40 }, (_, i) => {
    const brands = ['Toyota', 'Hyundai', 'Nissan', 'Kia', 'Chevrolet', 'Ford', 'Mazda', 'Volkswagen'];
    const models = {
      'Toyota': ['Yaris', 'RAV4', 'Corolla', 'Hilux'],
      'Hyundai': ['Tucson', 'Elantra', 'Grand i10', 'Santa Fe'],
      'Nissan': ['Kicks', 'Sentra', 'Qashqai', 'Navara'],
      'Kia': ['Rio', 'Sportage', 'Cerato', 'Frontier'],
      'Chevrolet': ['Tracker', 'Onix', 'Colorado', 'Spark'],
      'Ford': ['F-150', 'Focus', 'EcoSport', 'Explorer'],
      'Mazda': ['Mazda 3', 'CX-5', 'Mazda 6', 'CX-30'],
      'Volkswagen': ['Gol', 'T-Cross', 'Amarok', 'Vento']
    };
    const brand = brands[i % brands.length];
    const model = models[brand][i % models[brand].length];
    const owners = ['Andrés Ossa', 'Loreto Díaz', 'Felipe Castro', 'Transportes Sur', 'Agrosuper Flota', 'Patricia Silva', 'Esteban Soto', 'Claudia Rivas', 'Gasco Distribución'];
    const owner = i % 5 === 0 ? owners[i % owners.length] + ' (Flota)' : owners[i % owners.length];
    const type = owner.includes('Flota') || owner.includes('Transportes') ? 'Empresa/Flota' : 'Particular';
    const year = 2015 + (i % 8);
    const km = 30000 + (i * 4500);
    const plates = 'XYWZVTRQ';
    const plate = `${plates[i % 8]}${plates[(i + 2) % 8]}-${plates[(i + 4) % 8]}${plates[(i + 6) % 8]}-${i + 10}`;
    return { id: `V-${111 + i}`, owner, type, brand, model, year, km, plate };
  })
];

// 2. Maestro de Repuestos (200 SKUs categorizados)
// Creamos una lista base de componentes por categoría y los expandimos para diferentes modelos de autos
const partsBase = [
  // Categoria: Freno
  { name: 'Pastillas de freno delanteras', cat: 'Frenos', baseCost: 15000, min: 8, physical: 12 },
  { name: 'Pastillas de freno traseras', cat: 'Frenos', baseCost: 12000, min: 6, physical: 10 },
  { name: 'Discos de freno delanteros (Par)', cat: 'Frenos', baseCost: 45000, min: 3, physical: 4 },
  { name: 'Discos de freno traseros (Par)', cat: 'Frenos', baseCost: 38000, min: 2, physical: 3 },
  { name: 'Líquido de frenos Dot4 1L', cat: 'Frenos', baseCost: 4500, min: 10, physical: 15 },
  { name: 'Calipers de freno deportivo', cat: 'Frenos', baseCost: 95000, min: 1, physical: 2 },
  { name: 'Flexible de freno hidráulico', cat: 'Frenos', baseCost: 8000, min: 4, physical: 6 },
  
  // Categoria: Suspensión y Dirección
  { name: 'Amortiguador delantero izquierdo', cat: 'Suspensión y Dirección', baseCost: 32000, min: 3, physical: 5 },
  { name: 'Amortiguador delantero derecho', cat: 'Suspensión y Dirección', baseCost: 32000, min: 3, physical: 5 },
  { name: 'Amortiguador trasero', cat: 'Suspensión y Dirección', baseCost: 28000, min: 4, physical: 6 },
  { name: 'Terminal de dirección exterior', cat: 'Suspensión y Dirección', baseCost: 9000, min: 6, physical: 8 },
  { name: 'Bandeja de suspensión delantera', cat: 'Suspensión y Dirección', baseCost: 25000, min: 2, physical: 4 },
  { name: 'Rótula de suspensión inferior', cat: 'Suspensión y Dirección', baseCost: 7500, min: 8, physical: 12 },
  { name: 'Cazoleta amortiguador delantera', cat: 'Suspensión y Dirección', baseCost: 12000, min: 4, physical: 6 },
  { name: 'Kit bujes barra estabilizadora', cat: 'Suspensión y Dirección', baseCost: 5500, min: 10, physical: 14 },
  
  // Categoria: Motor y Filtros
  { name: 'Filtro de aceite sintético', cat: 'Motor y Filtros', baseCost: 5000, min: 15, physical: 25 },
  { name: 'Filtro de aire de motor', cat: 'Motor y Filtros', baseCost: 6500, min: 12, physical: 18 },
  { name: 'Filtro de combustible diésel/bencina', cat: 'Motor y Filtros', baseCost: 8000, min: 8, physical: 10 },
  { name: 'Filtro de cabina/aire acondicionado', cat: 'Motor y Filtros', baseCost: 7000, min: 8, physical: 12 },
  { name: 'Aceite de motor 5W30 Sintético 4L', cat: 'Motor y Filtros', baseCost: 24000, min: 10, physical: 16 },
  { name: 'Bujía de encendido Iridium (unidad)', cat: 'Motor y Filtros', baseCost: 6000, min: 24, physical: 36 },
  { name: 'Correa de accesorios / alternador', cat: 'Motor y Filtros', baseCost: 11000, min: 5, physical: 8 },
  { name: 'Kit de distribución de motor', cat: 'Motor y Filtros', baseCost: 55000, min: 2, physical: 3 },
  { name: 'Bomba de agua de motor', cat: 'Motor y Filtros', baseCost: 29000, min: 2, physical: 4 },
  { name: 'Empaquetadura culata de cilindros', cat: 'Motor y Filtros', baseCost: 18000, min: 3, physical: 5 },
  
  // Categoria: Eléctrico y Diagnóstico
  { name: 'Batería 12V 70AH libre mantención', cat: 'Eléctrico y Diagnóstico', baseCost: 45000, min: 5, physical: 8 },
  { name: 'Sensor de oxígeno O2', cat: 'Eléctrico y Diagnóstico', baseCost: 35000, min: 2, physical: 4 },
  { name: 'Alternador de carga 90A', cat: 'Eléctrico y Diagnóstico', baseCost: 85000, min: 1, physical: 2 },
  { name: 'Motor de arranque de motor', cat: 'Eléctrico y Diagnóstico', baseCost: 72000, min: 2, physical: 3 },
  { name: 'Sensor de posición cigüeñal CKP', cat: 'Eléctrico y Diagnóstico', baseCost: 22000, min: 3, physical: 4 },
  { name: 'Fusible plano surtido (Kit 100u)', cat: 'Eléctrico y Diagnóstico', baseCost: 3500, min: 5, physical: 7 },
  { name: 'Bobina de encendido individual', cat: 'Eléctrico y Diagnóstico', baseCost: 19000, min: 4, physical: 6 },
  { name: 'Computadora de motor ECU (Básica)', cat: 'Eléctrico y Diagnóstico', baseCost: 220000, min: 1, physical: 1 }
];

export const mockParts = [];

// Generamos 200 SKUs cruzando las bases con familias de autos
const carModelsSuffix = ['Toyota Hilux', 'Hyundai Accent', 'Nissan Versa', 'Suzuki Swift', 'Universal'];
let skuCounter = 1000;

partsBase.forEach((p) => {
  carModelsSuffix.forEach((suffix) => {
    skuCounter++;
    const isUniversal = suffix === 'Universal';
    const name = isUniversal ? p.name : `${p.name} (${suffix})`;
    const costMultiplier = isUniversal ? 1.0 : (suffix.includes('Hilux') ? 1.4 : suffix.includes('Accent') ? 0.95 : 1.1);
    const finalCost = Math.round(p.baseCost * costMultiplier);
    
    // Virtual stock represents drop-shipped/ordered but not yet physically in storage
    const stockVirtual = skuCounter % 4 === 0 ? 2 : 0;
    
    mockParts.push({
      sku: `SKU-${skuCounter}`,
      name,
      category: p.cat,
      cost: finalCost,
      price: Math.round(finalCost * 1.5), // markup of 50%
      stockFisico: Math.round(p.physical * (skuCounter % 2 === 0 ? 0.8 : 1.2)),
      stockVirtual,
      minStock: p.min,
      description: `Repuesto de alta precisión para sistemas de ${p.cat.toLowerCase()}.`
    });
  });
});

// Limitar el catálogo a exactamente 200 ítems para ajustarse a las especificaciones
while (mockParts.length > 200) {
  mockParts.pop();
}

// 3. Proveedores con diferentes SLAs y costos
export const mockSuppliers = [
  {
    id: 'SUP-OEM',
    name: 'Original Genuine Parts S.A. (OEM)',
    sla: 7, // 7 turns/days
    costMultiplier: 1.5,
    reliability: 1.00, // 100%
    description: 'Proveedor directo de fábrica. Repuestos 100% originales con garantía total y cero defectos, pero de costo elevado y envío lento.'
  },
  {
    id: 'SUP-QUAL',
    name: 'Apex Auto Parts (Alternativo Calidad)',
    sla: 2, // 2 turns/days
    costMultiplier: 1.0,
    reliability: 0.95, // 95%
    description: 'Excelente balance costo-beneficio. Plazo de entrega rápido de 24/48 horas y calidad certificada bajo normas ISO.'
  },
  {
    id: 'SUP-GEN',
    name: 'Direct Value Imports (Genérico Barato)',
    sla: 0.1, // 2 hours (same turn delivery)
    costMultiplier: 0.65,
    reliability: 0.80, // 80% (20% defect probability)
    description: 'Distribuidor local de piezas genéricas. Entrega exprés en 2 horas, coste mínimo, pero propenso a piezas defectuosas.'
  }
];

// 4. Mecánicos con Especialidades
export const mockMechanics = [
  { id: 'MEC-1', name: 'Andrés Silva', specialty: 'Mecánica General', speed: 1.0, costPerDay: 45000, description: 'Velocidad estándar. Experto en suspensiones, motores y cajas mecánicas.' },
  { id: 'MEC-2', name: 'Carlos Mendoza', specialty: 'Eléctrico y Diagnóstico', speed: 1.2, costPerDay: 55000, description: 'Especialista en inyección electrónica, cableados, ECUs y sensores. Trabaja un 20% más rápido.' },
  { id: 'MEC-3', name: 'Jorge Oyarzún', specialty: 'Lubricación y Frenos', speed: 1.1, costPerDay: 40000, description: 'Experto en afinamiento rápido, frenos y cambios de fluidos.' },
  { id: 'MEC-4', name: 'Marina Riquelme', specialty: 'Alineación y Suspensión', speed: 1.0, costPerDay: 48000, description: 'Especializada en geometrías de dirección, balanceo dinámico y amortiguación.' }
];

// 5. Órdenes de Trabajo Activas (15 ítems iniciales hidratados)
export const initialActiveOTs = [
  {
    id: 'OT-2001',
    vehicleId: 'V-101', // Toyota Hilux - Juan Pérez
    clientName: 'Juan Pérez',
    vehicleLabel: 'Toyota Hilux (AB-CD-12)',
    description: 'Ruido metálico en tren delantero al pasar baches. Revisar amortiguadores.',
    status: 'EnEjecucion', // Presupuesto | EsperandoRepuestos | EnEjecucion | Listo
    andenId: 'AND-2', // Alineación y Suspensión
    mechanicId: 'MEC-4', // Marina Riquelme
    partsRequired: [
      { sku: 'SKU-1008', name: 'Amortiguador delantero izquierdo (Toyota Hilux)', qty: 1, cost: 44800, price: 67200, status: 'Disponible' },
      { sku: 'SKU-1013', name: 'Amortiguador delantero derecho (Toyota Hilux)', qty: 1, cost: 44800, price: 67200, status: 'Disponible' }
    ],
    budgetApproved: true,
    laborHoursTarget: 4,
    laborHoursReal: 2,
    laborCostPerHour: 12000,
    laborPricePerHour: 18000,
    entryDate: 'Día 0',
    dueDate: 'Día 2',
    notes: 'Marina está desmontando el amortiguador delantero izquierdo.',
    urgency: 'Normal'
  },
  {
    id: 'OT-2002',
    vehicleId: 'V-102', // Hyundai Accent - María González
    clientName: 'María González',
    vehicleLabel: 'Hyundai Accent (EF-GH-34)',
    description: 'Pérdida de líquido de frenos y pedal esponjoso. Diagnóstico urgente.',
    status: 'Presupuesto',
    andenId: null,
    mechanicId: null,
    partsRequired: [
      { sku: 'SKU-1002', name: 'Pastillas de freno delanteras (Hyundai Accent)', qty: 1, cost: 11400, price: 17100, status: 'Pendiente' },
      { sku: 'SKU-1022', name: 'Flexible de freno hidráulico (Hyundai Accent)', qty: 2, cost: 7600, price: 11400, status: 'Pendiente' }
    ],
    budgetApproved: false,
    laborHoursTarget: 2,
    laborHoursReal: 0,
    laborCostPerHour: 10000,
    laborPricePerHour: 15000,
    entryDate: 'Día 1',
    dueDate: 'Día 2',
    notes: 'Presupuesto enviado a cliente esperando respuesta telefónica.',
    urgency: 'Alta'
  },
  {
    id: 'OT-2003',
    vehicleId: 'V-103', // Nissan Versa - Dina S.A.
    clientName: 'Dina S.A. (Flota)',
    vehicleLabel: 'Nissan Versa (JK-LM-56)',
    description: 'Check engine encendido, motor tironea en baja. Escaneo electrónico.',
    status: 'EsperandoRepuestos',
    andenId: null,
    mechanicId: 'MEC-2', // Carlos Mendoza
    partsRequired: [
      { sku: 'SKU-1129', name: 'Sensor de posición cigüeñal CKP (Nissan Versa)', qty: 1, cost: 24200, price: 36300, status: 'Pedido', supplierId: 'SUP-QUAL', eta: 2 }
    ],
    budgetApproved: true,
    laborHoursTarget: 3,
    laborHoursReal: 1,
    laborCostPerHour: 15000,
    laborPricePerHour: 22000,
    entryDate: 'Día -1',
    dueDate: 'Día 3',
    notes: 'Repuesto comprado a Apex Auto Parts, llegada estimada en Día 3.',
    urgency: 'Crítica'
  },
  {
    id: 'OT-2004',
    vehicleId: 'V-104', // Suzuki Swift - Carlos Muñoz
    clientName: 'Carlos Muñoz',
    vehicleLabel: 'Suzuki Swift (NP-QR-78)',
    description: 'Mantenimiento preventivo de los 80.000 KM y afinamiento completo.',
    status: 'EnEjecucion',
    andenId: 'AND-3', // Foso de fluidos
    mechanicId: 'MEC-3', // Jorge Oyarzún
    partsRequired: [
      { sku: 'SKU-1079', name: 'Filtro de aceite sintético (Suzuki Swift)', qty: 1, cost: 5500, price: 8250, status: 'Disponible' },
      { sku: 'SKU-1099', name: 'Aceite de motor 5W30 Sintético 4L (Suzuki Swift)', qty: 1, cost: 26400, price: 39600, status: 'Disponible' },
      { sku: 'SKU-1104', name: 'Bujía de encendido Iridium (Suzuki Swift)', qty: 4, cost: 6600, price: 9900, status: 'Disponible' }
    ],
    budgetApproved: true,
    laborHoursTarget: 3,
    laborHoursReal: 2.5,
    laborCostPerHour: 10000,
    laborPricePerHour: 15000,
    entryDate: 'Día 1',
    dueDate: 'Día 2',
    notes: 'Jorge se encuentra cambiando las bujías de encendido. Queda poco.',
    urgency: 'Normal'
  },
  {
    id: 'OT-2005',
    vehicleId: 'V-105', // Toyota Hilux - Minera Los Andes
    clientName: 'Minera Los Andes',
    vehicleLabel: 'Toyota Hilux (ST-UV-90)',
    description: 'Reemplazo del kit de distribución por kilometraje acumulado.',
    status: 'Listo',
    andenId: null,
    mechanicId: 'MEC-1', // Andrés Silva
    partsRequired: [
      { sku: 'SKU-1111', name: 'Kit de distribución de motor (Toyota Hilux)', qty: 1, cost: 77000, price: 115500, status: 'Disponible' }
    ],
    budgetApproved: true,
    laborHoursTarget: 5,
    laborHoursReal: 5,
    laborCostPerHour: 12000,
    laborPricePerHour: 18000,
    entryDate: 'Día -2',
    dueDate: 'Día 1',
    notes: 'Trabajo terminado. Vehículo lavado y estacionado en patio de entrega. Listo para facturación.',
    urgency: 'Alta'
  },
  {
    id: 'OT-2006',
    vehicleId: 'V-106', // Honda Civic - Sofía Valdés
    clientName: 'Sofía Valdés',
    vehicleLabel: 'Honda Civic (WX-YZ-12)',
    description: 'Alternador no carga batería adecuadamente. Luces parpadean.',
    status: 'Presupuesto',
    andenId: null,
    mechanicId: null,
    partsRequired: [
      { sku: 'SKU-1121', name: 'Alternador de carga 90A (Universal)', qty: 1, cost: 85000, price: 127500, status: 'Pendiente' },
      { sku: 'SKU-1116', name: 'Batería 12V 70AH libre mantención (Universal)', qty: 1, cost: 45000, price: 67500, status: 'Pendiente' }
    ],
    budgetApproved: false,
    laborHoursTarget: 2,
    laborHoursReal: 0,
    laborCostPerHour: 14000,
    laborPricePerHour: 20000,
    entryDate: 'Día 1',
    dueDate: 'Día 3',
    notes: 'Inspeccionado por Carlos. Se verificó que el alternador está quemado.',
    urgency: 'Normal'
  },
  {
    id: 'OT-2007',
    vehicleId: 'V-107', // Peugeot Partner - Enel
    clientName: 'Enel Distribución',
    vehicleLabel: 'Peugeot Partner (AA-BB-22)',
    description: 'Embrague patina en pendientes de carga. Cambiar embrague.',
    status: 'EnEjecucion',
    andenId: 'AND-1', // Elevador 2 postes
    mechanicId: 'MEC-1', // Andrés Silva
    partsRequired: [
      { sku: 'SKU-1131', name: 'Computadora de motor ECU (Universal)', qty: 1, cost: 220000, price: 330000, status: 'Disponible' }
    ],
    budgetApproved: true,
    laborHoursTarget: 6,
    laborHoursReal: 1,
    laborCostPerHour: 12000,
    laborPricePerHour: 18000,
    entryDate: 'Día 1',
    dueDate: 'Día 4',
    notes: 'Andrés está desmontando la transmisión. Requiere ayuda técnica para bajar la caja.',
    urgency: 'Alta'
  },
  {
    id: 'OT-2008',
    vehicleId: 'V-108', // Chevrolet Sail - Luis Aravena
    clientName: 'Luis Aravena',
    vehicleLabel: 'Chevrolet Sail (CC-DD-44)',
    description: 'Inspección técnica anual previa a revisión técnica oficial.',
    status: 'Listo',
    andenId: null,
    mechanicId: 'MEC-3', // Jorge Oyarzún
    partsRequired: [],
    budgetApproved: true,
    laborHoursTarget: 1.5,
    laborHoursReal: 1.5,
    laborCostPerHour: 10000,
    laborPricePerHour: 15000,
    entryDate: 'Día 1',
    dueDate: 'Día 1',
    notes: 'Inspección de gases, frenos, luces y holguras aprobada sin observaciones.',
    urgency: 'Normal'
  },
  {
    id: 'OT-2009',
    vehicleId: 'V-109', // Ford Ranger - Pedro Morales
    clientName: 'Pedro Morales',
    vehicleLabel: 'Ford Ranger (EE-FF-66)',
    description: 'Golpeteo en amortiguadores traseros al cargar peso. Revisar bujes.',
    status: 'Presupuesto',
    andenId: null,
    mechanicId: null,
    partsRequired: [
      { sku: 'SKU-1024', name: 'Amortiguador trasero (Universal)', qty: 2, cost: 28000, price: 42000, status: 'Pendiente' },
      { sku: 'SKU-1049', name: 'Kit bujes barra estabilizadora (Universal)', qty: 1, cost: 5500, price: 8250, status: 'Pendiente' }
    ],
    budgetApproved: false,
    laborHoursTarget: 3,
    laborHoursReal: 0,
    laborCostPerHour: 11000,
    laborPricePerHour: 16500,
    entryDate: 'Día 1',
    dueDate: 'Día 3',
    notes: 'El cliente solicita evaluar si es necesario cambiar cazoletas.',
    urgency: 'Normal'
  },
  {
    id: 'OT-2010',
    vehicleId: 'V-110', // Mitsubishi L200 - Constructora Beta
    clientName: 'Constructora Beta',
    vehicleLabel: 'Mitsubishi L200 (GG-HH-88)',
    description: 'Cambio de pastillas y discos delanteros por desgaste extremo.',
    status: 'EsperandoRepuestos',
    andenId: null,
    mechanicId: 'MEC-3', // Jorge Oyarzún
    partsRequired: [
      { sku: 'SKU-1005', name: 'Discos de freno delanteros (Par) (Universal)', qty: 1, cost: 45000, price: 67500, status: 'Pedido', supplierId: 'SUP-GEN', eta: 1 }
    ],
    budgetApproved: true,
    laborHoursTarget: 2,
    laborHoursReal: 0,
    laborCostPerHour: 10000,
    laborPricePerHour: 15000,
    entryDate: 'Día 1',
    dueDate: 'Día 2',
    notes: 'Repuesto de entrega rápida comprado al distribuidor local (2 hrs de demora).',
    urgency: 'Alta'
  },
  {
    id: 'OT-2011',
    vehicleId: 'V-111',
    clientName: 'Esteban Soto',
    vehicleLabel: 'Mazda CX-5 (XY-WT-10)',
    description: 'Alineación y balanceo por vibraciones en volante a 100 km/h.',
    status: 'Listo',
    andenId: null,
    mechanicId: 'MEC-4',
    partsRequired: [
      { sku: 'SKU-1084', name: 'Kit bujes barra estabilizadora (Universal)', qty: 1, cost: 5500, price: 8250, status: 'Disponible' }
    ],
    budgetApproved: true,
    laborHoursTarget: 2,
    laborHoursReal: 1.8,
    laborCostPerHour: 12000,
    laborPricePerHour: 18000,
    entryDate: 'Día 0',
    dueDate: 'Día 1',
    notes: 'Alineación láser exitosa. Balanceo dinámico finalizado en tren delantero.',
    urgency: 'Normal'
  },
  {
    id: 'OT-2012',
    vehicleId: 'V-112',
    clientName: 'Loreto Díaz',
    vehicleLabel: 'Hyundai Tucson (ZR-TY-20)',
    description: 'Falla intermitente en vidrios eléctricos y alarma.',
    status: 'Presupuesto',
    andenId: null,
    mechanicId: null,
    partsRequired: [
      { sku: 'SKU-1126', name: 'Fusible plano surtido (Kit 100u) (Universal)', qty: 1, cost: 3500, price: 5250, status: 'Pendiente' }
    ],
    budgetApproved: false,
    laborHoursTarget: 2,
    laborHoursReal: 0,
    laborCostPerHour: 15000,
    laborPricePerHour: 22000,
    entryDate: 'Día 1',
    dueDate: 'Día 2',
    notes: 'Se requiere escaneo para verificar módulo de confort (BCM).',
    urgency: 'Normal'
  },
  {
    id: 'OT-2013',
    vehicleId: 'V-113',
    clientName: 'Claudia Rivas',
    vehicleLabel: 'Toyota Yaris (QS-LM-30)',
    description: 'Cambio de correa de accesorios y tensores por resequedad.',
    status: 'EsperandoRepuestos',
    andenId: null,
    mechanicId: 'MEC-1',
    partsRequired: [
      { sku: 'SKU-1106', name: 'Correa de accesorios / alternador (Toyota Hilux)', qty: 1, cost: 15400, price: 23100, status: 'Pedido', supplierId: 'SUP-OEM', eta: 7 }
    ],
    budgetApproved: true,
    laborHoursTarget: 2.5,
    laborHoursReal: 0.5,
    laborCostPerHour: 11000,
    laborPricePerHour: 16500,
    entryDate: 'Día -1',
    dueDate: 'Día 6',
    notes: 'Parte original OEM comprada a fábrica, requiere importación lenta de 7 días.',
    urgency: 'Alta'
  },
  {
    id: 'OT-2014',
    vehicleId: 'V-114',
    clientName: 'Constructora Beta',
    vehicleLabel: 'Mitsubishi L200 (AB-YY-40)',
    description: 'Humo azulado en escape y consumo excesivo de aceite. Culata?',
    status: 'EnEjecucion',
    andenId: 'AND-1', // Elevador de 2 postes
    mechanicId: 'MEC-1', // Andrés Silva
    partsRequired: [
      { sku: 'SKU-1118', name: 'Empaquetadura culata de cilindros (Universal)', qty: 1, cost: 18000, price: 27000, status: 'Disponible' }
    ],
    budgetApproved: true,
    laborHoursTarget: 8,
    laborHoursReal: 6.5,
    laborCostPerHour: 12000,
    laborPricePerHour: 18000,
    entryDate: 'Día -2',
    dueDate: 'Día 2',
    notes: 'Desmontaje de culata completado. Rectificado de superficie e instalación de empaquetadura nueva en progreso.',
    urgency: 'Alta'
  },
  {
    id: 'OT-2015',
    vehicleId: 'V-115',
    clientName: 'Transportes Sur',
    vehicleLabel: 'Mercedes Frontier (CD-BB-50)',
    description: 'VIP: Servicio técnico urgente por mantención de flota.',
    status: 'Presupuesto',
    andenId: null,
    mechanicId: null,
    partsRequired: [
      { sku: 'SKU-1077', name: 'Filtro de aceite sintético (Universal)', qty: 2, cost: 5000, price: 7500, status: 'Pendiente' },
      { sku: 'SKU-1087', name: 'Aceite de motor 5W30 Sintético 4L (Universal)', qty: 2, cost: 24000, price: 36000, status: 'Pendiente' }
    ],
    budgetApproved: false,
    laborHoursTarget: 2.5,
    laborHoursReal: 0,
    laborCostPerHour: 12000,
    laborPricePerHour: 18000,
    entryDate: 'Día 1',
    dueDate: 'Día 1',
    notes: 'Cliente VIP requiere entrega hoy mismo. Prioridad crítica del taller.',
    urgency: 'Crítica'
  }
];

// 6. Generador de 100 Órdenes de Trabajo Cerradas Históricas (Hidratación de Dashboard)
export const generateClosedOTs = () => {
  const closedOTs = [];
  const startDay = -120;
  
  // Lista de mecánicos y vehículos disponibles para la simulación histórica
  const mechanics = mockMechanics;
  const vehicles = mockVehicles;

  for (let i = 1; i <= 100; i++) {
    const vIdx = i % vehicles.length;
    const mIdx = (i + 2) % mechanics.length;
    const vehicle = vehicles[vIdx];
    const mechanic = mechanics[mIdx];
    
    // Asignar costos, ingresos y horas de forma aleatoria estructurada
    const durationHours = 1 + (i % 6);
    const hourlyCost = mechanic.costPerDay / 8; // costo hora aproximado
    const hourlyRate = hourlyCost * 1.5;
    
    const laborCost = Math.round(durationHours * hourlyCost);
    const laborPrice = Math.round(durationHours * hourlyRate);
    
    // Repuestos usados
    const sparesCount = i % 4; // de 0 a 3 repuestos
    let sparesCost = 0;
    let sparesPrice = 0;
    const sparesUsed = [];

    for (let j = 0; j < sparesCount; j++) {
      const partIdx = (i * 3 + j) % mockParts.length;
      const part = mockParts[partIdx];
      const qty = 1 + (j % 2);
      sparesCost += part.cost * qty;
      sparesPrice += part.price * qty;
      sparesUsed.push({
        sku: part.sku,
        name: part.name,
        qty,
        cost: part.cost,
        price: part.price,
        status: 'Entregado'
      });
    }

    const totalCost = laborCost + sparesCost;
    const totalPrice = laborPrice + sparesPrice;
    const margin = totalPrice - totalCost;
    const day = startDay + Math.round((i / 100) * 118); // distribuir a lo largo de 120 días
    
    // Determinar si el proveedor falló en el histórico
    const supplierFailed = i % 10 === 0; // 10% de fallas en proveedores
    const satisfaction = supplierFailed ? 60 + (i % 20) : 85 + (i % 15); // menor satisfacción si hubo fallas

    closedOTs.push({
      id: `OT-HIST-${1000 + i}`,
      vehicleId: vehicle.id,
      clientName: vehicle.owner,
      vehicleLabel: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`,
      description: `Mantención programada preventiva nº ${i}.`,
      status: 'Listo',
      andenId: `AND-${(i % 4) + 1}`,
      mechanicId: mechanic.id,
      partsRequired: sparesUsed,
      budgetApproved: true,
      laborHoursTarget: durationHours,
      laborHoursReal: durationHours * (supplierFailed ? 1.3 : 1.0), // más lento si hubo problemas
      laborCost,
      laborPrice,
      totalCost,
      totalPrice,
      margin,
      entryDate: `Día ${day}`,
      dueDate: `Día ${day + 1}`,
      closedDate: `Día ${day + (supplierFailed ? 2 : 1)}`,
      satisfaction,
      supplierFailed,
      urgency: i % 15 === 0 ? 'Crítica' : 'Normal'
    });
  }

  return closedOTs;
};
