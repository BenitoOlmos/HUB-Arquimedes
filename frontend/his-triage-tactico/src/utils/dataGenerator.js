// Seeded Random Generator for deterministic reproducibility
class SeededRandom {
  constructor(seed = 42) {
    this.seed = seed;
  }
  // Linear Congruential Generator (LCG) parameters
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  nextRange(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  choice(arr) {
    return arr[Math.floor(this.next() * arr.length)];
  }
  choiceMultiple(arr, count) {
    const shuffled = [...arr].sort(() => this.next() - 0.5);
    return shuffled.slice(0, count);
  }
}

const rng = new SeededRandom(2026); // Seed fixed for teaching consistency

// Seed Pools
const firstNamesM = [
  'Juan',
  'Andrés',
  'Carlos',
  'Pedro',
  'Diego',
  'Luis',
  'Javier',
  'Manuel',
  'José',
  'Alejandro',
  'Felipe',
  'Sebastián',
  'Rodrigo',
  'Cristian',
  'Gabriel',
  'Ignacio'
];
const firstNamesF = [
  'María',
  'Sofía',
  'Laura',
  'Ana',
  'Camila',
  'Valentina',
  'Francisca',
  'Isabella',
  'Carolina',
  'Gabriela',
  'Javiera',
  'Antonia',
  'Daniela',
  'Constanza',
  'Beatriz',
  'Elena'
];
const lastNames = [
  'González',
  'Muñoz',
  'Rojas',
  'Díaz',
  'Pérez',
  'Soto',
  'Contreras',
  'Silva',
  'Martínez',
  'Flores',
  'Morales',
  'Rodríguez',
  'Valenzuela',
  'Araya',
  'Tapia',
  'Vergara',
  'Carrasco',
  'Sandoval',
  'Fuentes',
  'Gómez'
];
const bloodTypes = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
const comorbiditiesPool = [
  'Hipertensión Arterial',
  'Diabetes Mellitus Tipo 2',
  'Asma Bronquial',
  'EPOC',
  'Insuficiencia Renal Crónica',
  'Hipotiroidismo',
  'Ninguna'
];
const allergiesPool = [
  'Penicilina',
  'Aspirina',
  'Sulfas',
  'Látex',
  'AINEs',
  'Cloxacilina',
  'Ninguna'
];

const diagnosticsPool = [
  {
    text: 'Neumonía bacteriana grave',
    esi: 2,
    outcome: 'Hospitalización',
    category: 'Respiratorio'
  },
  {
    text: 'Infarto agudo al miocardio',
    esi: 1,
    outcome: 'Hospitalización',
    category: 'Cardiovascular'
  },
  { text: 'Crisis de pánico severa', esi: 3, outcome: 'Alta', category: 'Salud Mental' },
  {
    text: 'Politraumatismo por accidente vial',
    esi: 1,
    outcome: 'Hospitalización',
    category: 'Trauma'
  },
  { text: 'Apendicitis aguda', esi: 2, outcome: 'Hospitalización', category: 'Abdomen' },
  {
    text: 'Gastroenteritis aguda deshidratada',
    esi: 3,
    outcome: 'Alta',
    category: 'Gastrointestinal'
  },
  {
    text: 'Accidente cerebrovascular en curso',
    esi: 1,
    outcome: 'Hospitalización',
    category: 'Neurológico'
  },
  { text: 'Fractura de radio cerrada', esi: 4, outcome: 'Alta', category: 'Trauma' },
  { text: 'Laringitis obstructiva moderada', esi: 3, outcome: 'Alta', category: 'Respiratorio' },
  { text: 'Cetoacidosis diabética', esi: 2, outcome: 'Hospitalización', category: 'Metabólico' },
  { text: 'Crisis hipertensiva sintomática', esi: 2, outcome: 'Alta', category: 'Cardiovascular' },
  { text: 'Fiebre y tos simple (resfrío)', esi: 5, outcome: 'Alta', category: 'Respiratorio' },
  { text: 'Contusión leve de tobillo', esi: 5, outcome: 'Alta', category: 'Trauma' },
  { text: 'Herida cortante que requiere sutura', esi: 4, outcome: 'Alta', category: 'Trauma' },
  {
    text: 'Quemadura de segundo grado (10% SC)',
    esi: 2,
    outcome: 'Hospitalización',
    category: 'Trauma'
  },
  { text: 'Paro cardiorrespiratorio', esi: 1, outcome: 'Fallecido', category: 'Cardiovascular' }
];

const skuTemplates = [
  {
    name: 'Paracetamol 500mg comprimidos',
    category: 'Medicamentos Urgencia',
    baseCost: 15,
    provider: 'FarmaSalud Distribuidores'
  },
  {
    name: 'Salbutamol Inhalador 100mcg/dosis',
    category: 'Medicamentos Urgencia',
    baseCost: 120,
    provider: 'RespiCare S.A.'
  },
  {
    name: 'Epinefrina Ampolla 1mg/ml',
    category: 'Medicamentos Urgencia',
    baseCost: 800,
    provider: 'Laboratorio Bios'
  },
  {
    name: 'Atropina Ampolla 1mg/ml',
    category: 'Medicamentos Urgencia',
    baseCost: 650,
    provider: 'Laboratorio Bios'
  },
  {
    name: 'Ceftriaxona Inyectable 1g',
    category: 'Medicamentos Urgencia',
    baseCost: 1500,
    provider: 'FarmaSalud Distribuidores'
  },
  {
    name: 'Morfina Ampolla 10mg/ml',
    category: 'Medicamentos Urgencia',
    baseCost: 3200,
    provider: 'FarmaControl Central'
  },
  {
    name: 'Suero Fisiológico 0.9% 500ml',
    category: 'Medicamentos Urgencia',
    baseCost: 250,
    provider: 'Gases y Fluidos Clínicos'
  },
  {
    name: 'Ringer Lactato 500ml',
    category: 'Medicamentos Urgencia',
    baseCost: 300,
    provider: 'Gases y Fluidos Clínicos'
  },
  {
    name: 'Kit de Intubación Endotraqueal',
    category: 'Insumos Quirúrgicos',
    baseCost: 8500,
    provider: 'MedTech Proveedores'
  },
  {
    name: 'Catéter Intravenoso 18G',
    category: 'Insumos Quirúrgicos',
    baseCost: 450,
    provider: 'MedTech Proveedores'
  },
  {
    name: 'Guantes de Nitrilo Estériles (caja 100)',
    category: 'EPP',
    baseCost: 1200,
    provider: 'Suministros Médicos Chile'
  },
  {
    name: 'Mascarilla N95 certificada',
    category: 'EPP',
    baseCost: 1500,
    provider: 'Suministros Médicos Chile'
  },
  {
    name: 'Pechera impermeable desechable',
    category: 'EPP',
    baseCost: 350,
    provider: 'Suministros Médicos Chile'
  },
  {
    name: 'Oxígeno Botella Portátil 10L',
    category: 'Gases Medicinales',
    baseCost: 18000,
    provider: 'Indura Hospitalaria'
  }
];

// In-memory Database cache
let patientsDb = [];
let historyDb = [];
let pharmacyDb = [];
let analyticsCache = null;

// Initialize Database
export const initializeSimulationData = () => {
  if (patientsDb.length > 0) return; // Already initialized

  console.log('HIS-Triage: Generating deterministic clinical seed databases...');
  const startTime = performance.now();

  // 1. Generate 10,000 Patients
  for (let i = 0; i < 10500; i++) {
    const isMale = rng.next() > 0.5;
    const gender = isMale ? 'M' : 'F';
    const firstName = rng.choice(isMale ? firstNamesM : firstNamesF);
    const lastName1 = rng.choice(lastNames);
    const lastName2 = rng.choice(lastNames);
    const age = rng.nextRange(0, 95);

    // RUT format (e.g. 15.342.981-k)
    const runNum = rng.nextRange(5000000, 24000000);
    const runDvh = rng.next() > 0.15 ? rng.nextRange(0, 9).toString() : 'K';
    const rut = `${runNum.toLocaleString('es-CL')}-${runDvh}`;

    // Comorbidities (up to 2)
    const comList = [];
    const com1 = rng.choice(comorbiditiesPool);
    if (com1 !== 'Ninguna') {
      comList.push(com1);
      const com2 = rng.choice(comorbiditiesPool);
      if (com2 !== 'Ninguna' && com2 !== com1) {
        comList.push(com2);
      }
    }

    // Allergies
    const allergyList = [];
    const al1 = rng.choice(allergiesPool);
    if (al1 !== 'Ninguna') {
      allergyList.push(al1);
    }

    patientsDb.push({
      id: rut,
      name: `${firstName} ${lastName1} ${lastName2}`,
      age,
      gender,
      comorbidities: comList.length > 0 ? comList : ['Ninguna'],
      allergies: allergyList.length > 0 ? allergyList : ['Ninguna'],
      bloodType: rng.choice(bloodTypes)
    });
  }

  // 2. Generate 50,000 History Logs
  const outcomes = ['Alta', 'Hospitalización', 'Fallecido', 'Derivado'];
  const totalMonths = 12;
  const now = new Date(2026, 5, 18); // Current simulation date

  for (let i = 0; i < 52000; i++) {
    const patient = patientsDb[i % patientsDb.length];
    const diag = rng.choice(diagnosticsPool);

    // Waiting times (ESI 1 should have near 0 wait, ESI 5 has long wait)
    let waitTime = 0;
    if (diag.esi === 2) waitTime = rng.nextRange(2, 25);
    else if (diag.esi === 3) waitTime = rng.nextRange(15, 120);
    else if (diag.esi === 4) waitTime = rng.nextRange(45, 240);
    else if (diag.esi === 5) waitTime = rng.nextRange(60, 360);

    // Deterministic outcome matching diagnosis ESI
    let finalOutcome = diag.outcome;
    if (diag.esi === 1 && rng.next() < 0.1) {
      finalOutcome = 'Fallecido';
    } else if (diag.esi > 3 && rng.next() < 0.05) {
      finalOutcome = 'Derivado';
    }

    // Historical date within past 12 months
    const dateOffsetDays = rng.nextRange(0, 365);
    const logDate = new Date(now.getTime() - dateOffsetDays * 24 * 60 * 60 * 1000);
    const dateString = logDate.toISOString().split('T')[0];

    historyDb.push({
      id: `URG-${100000 + i}`,
      patientId: patient.id,
      patientName: patient.name,
      age: patient.age,
      triageLevel: diag.esi,
      waitTime,
      diagnosis: diag.text,
      outcome: finalOutcome,
      category: diag.category,
      date: dateString,
      month: logDate.getMonth() // 0-11
    });
  }

  // Sort history by date descending
  historyDb.sort((a, b) => b.date.localeCompare(a.date));

  // 3. Generate 1,000+ Pharmacy SKUs
  let skuCounter = 1000;
  skuTemplates.forEach((template) => {
    // Generate variations of packaging/strengths to reach 1000+ SKUs
    const variations = [
      { suffix: '100 mg', multiplier: 0.8 },
      { suffix: '250 mg', multiplier: 0.9 },
      { suffix: '500 mg', multiplier: 1.0 },
      { suffix: '1 g', multiplier: 1.3 },
      { suffix: 'Fórmula Infantil', multiplier: 1.1 },
      { suffix: 'Pediátrico', multiplier: 0.85 },
      { suffix: 'Adulto', multiplier: 1.0 },
      { suffix: 'Hospitalario', multiplier: 1.25 },
      { suffix: 'Envase x50', multiplier: 2.2 },
      { suffix: 'Envase x100', multiplier: 3.8 },
      { suffix: 'Ampolla Inyectable', multiplier: 1.15 },
      { suffix: 'Solución Gotas', multiplier: 0.95 }
    ];

    const chosenVars =
      template.category === 'Medicamentos Urgencia'
        ? variations.slice(0, 8)
        : variations.slice(6, 12);

    chosenVars.forEach((v) => {
      // Create variations for multiple providers/packages to bulk up to 1000+
      for (let pIdx = 1; pIdx <= 10; pIdx++) {
        const skuId = `PHA-${skuCounter++}`;
        const name = `${template.name.split(' ')[0]} ${v.suffix} (Lote #${pIdx})`;
        const cost = Math.round(template.baseCost * v.multiplier * (0.9 + rng.next() * 0.2));
        const stock = rng.nextRange(150, 800);
        const reorderPoint = rng.nextRange(50, 150);

        pharmacyDb.push({
          id: skuId,
          name,
          category: template.category,
          cost,
          stock,
          virtualStock: 0,
          reorderPoint,
          provider: `${template.provider} - Línea ${pIdx}`,
          isCritical:
            template.name.includes('Oxígeno') ||
            template.name.includes('Kit') ||
            template.name.includes('Epinefrina') ||
            template.name.includes('Guantes')
        });
      }
    });
  });

  // Top up with generic SKUs to guarantee exactly 1010 SKUs if needed
  while (pharmacyDb.length < 1010) {
    const skuId = `PHA-${skuCounter++}`;
    pharmacyDb.push({
      id: skuId,
      name: `Insumo Médico Estándar Genérico Lote-${skuCounter}`,
      category: 'Insumos Quirúrgicos',
      cost: rng.nextRange(100, 2500),
      stock: rng.nextRange(100, 500),
      virtualStock: 0,
      reorderPoint: 80,
      provider: 'FarmaSalud Distribuidores',
      isCritical: false
    });
  }

  // 4. Precalculate aggregates for Recharts charts
  calculateAnalytics();

  const endTime = performance.now();
  console.log(
    `HIS-Triage: Seeded ${patientsDb.length} patients, ${historyDb.length} history logs, and ${pharmacyDb.length} SKUs in ${Math.round(endTime - startTime)}ms.`
  );
};

// Internal pre-calculate aggregator
const calculateAnalytics = () => {
  const esiCounts = [0, 0, 0, 0, 0];
  const outcomeCounts = { Alta: 0, Hospitalización: 0, Fallecido: 0, Derivado: 0 };
  const monthlyAdmissions = Array(12)
    .fill(0)
    .map((_, i) => ({
      monthName: [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic'
      ][i],
      admissions: 0,
      deaths: 0
    }));
  const categoryStats = {};

  historyDb.forEach((log) => {
    // Triage level (1-indexed in database ESI 1 to 5)
    esiCounts[log.triageLevel - 1]++;

    // Outcomes
    if (outcomeCounts[log.outcome] !== undefined) {
      outcomeCounts[log.outcome]++;
    }

    // Monthly
    monthlyAdmissions[log.month].admissions++;
    if (log.outcome === 'Fallecido') {
      monthlyAdmissions[log.month].deaths++;
    }

    // Category
    if (!categoryStats[log.category]) {
      categoryStats[log.category] = { count: 0, totalWaitTime: 0 };
    }
    categoryStats[log.category].count++;
    categoryStats[log.category].waitTimeSum =
      (categoryStats[log.category].waitTimeSum || 0) + log.waitTime;
  });

  const categoryAdmissions = Object.keys(categoryStats).map((cat) => ({
    name: cat,
    value: categoryStats[cat].count,
    avgWait: Math.round(categoryStats[cat].waitTimeSum / categoryStats[cat].count)
  }));

  analyticsCache = {
    triageDist: [
      { name: 'ESI 1 (Resucitación)', value: esiCounts[0], color: 'var(--esi-1-resus)' },
      { name: 'ESI 2 (Emergencia)', value: esiCounts[1], color: 'var(--esi-2-emerg)' },
      { name: 'ESI 3 (Urgente)', value: esiCounts[2], color: 'var(--esi-3-urg)' },
      { name: 'ESI 4 (Semi-urgente)', value: esiCounts[3], color: 'var(--esi-4-semi)' },
      { name: 'ESI 5 (No urgente)', value: esiCounts[4], color: 'var(--esi-5-non)' }
    ],
    outcomes: Object.keys(outcomeCounts).map((key) => ({ name: key, value: outcomeCounts[key] })),
    monthlyTrend: monthlyAdmissions,
    categoryStats: categoryAdmissions
  };
};

// API Exporter functions
export const getPaginatedPatients = (page = 1, pageSize = 15, search = '') => {
  initializeSimulationData();
  const query = search.toLowerCase().trim();

  const filtered =
    query === ''
      ? patientsDb
      : patientsDb.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query) ||
            p.bloodType.toLowerCase().includes(query)
        );

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { data, total, totalPages };
};

export const getPaginatedHistory = (page = 1, pageSize = 15, search = '', triageFilter = 0) => {
  initializeSimulationData();
  const query = search.toLowerCase().trim();

  const filtered = historyDb.filter((log) => {
    const matchesSearch =
      query === '' ||
      log.patientName.toLowerCase().includes(query) ||
      log.patientId.toLowerCase().includes(query) ||
      log.diagnosis.toLowerCase().includes(query);
    const matchesTriage = triageFilter === 0 || log.triageLevel === Number(triageFilter);
    return matchesSearch && matchesTriage;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { data, total, totalPages };
};

export const getPaginatedPharmacy = (page = 1, pageSize = 15, search = '', categoryFilter = '') => {
  initializeSimulationData();
  const query = search.toLowerCase().trim();

  const filtered = pharmacyDb.filter((sku) => {
    const matchesSearch =
      query === '' ||
      sku.name.toLowerCase().includes(query) ||
      sku.id.toLowerCase().includes(query) ||
      sku.provider.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === '' || sku.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { data, total, totalPages, rawList: filtered };
};

export const getAnalyticsData = () => {
  initializeSimulationData();
  return analyticsCache;
};

// Purchase action updates pharmacy item
export const buyPharmacySKU = (skuId, qty) => {
  const item = pharmacyDb.find((s) => s.id === skuId);
  if (item) {
    item.virtualStock += qty;
    return item;
  }
  return null;
};

// Resolve/deliver in transit stock
export const deliverVirtualStock = () => {
  pharmacyDb.forEach((item) => {
    if (item.virtualStock > 0) {
      item.stock += item.virtualStock;
      item.virtualStock = 0;
    }
  });
};

// Consume stock during operations
export const consumePharmacyStock = (category, qty) => {
  const items = pharmacyDb.filter((s) => s.category === category && s.stock > 0);
  if (items.length === 0) return 0;

  // Consume proportionally among available stock to simulate real usage
  let actualConsumed = 0;
  const qtyPerItem = Math.ceil(qty / items.length);

  items.forEach((item) => {
    const toConsume = Math.min(item.stock, qtyPerItem);
    item.stock -= toConsume;
    actualConsumed += toConsume;
  });

  return actualConsumed;
};

// Trigger reorder checklist
export const getReorderItemsList = () => {
  return pharmacyDb.filter((s) => s.stock <= s.reorderPoint);
};

// Exporters for Classroom Resets
export const exportDataAsJSON = (datasetName) => {
  let data;
  if (datasetName === 'pacientes') data = patientsDb;
  else if (datasetName === 'historial') data = historyDb;
  else data = pharmacyDb;

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `${datasetName}_db_seed.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportDataAsCSV = (datasetName) => {
  let data;
  if (datasetName === 'pacientes') data = patientsDb;
  else if (datasetName === 'historial') data = historyDb;
  else data = pharmacyDb;

  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  data.forEach((item) => {
    const values = headers.map((header) => {
      const val = item[header];
      const escaped = ('' + val).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${datasetName}_db_seed.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
