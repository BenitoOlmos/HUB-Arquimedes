import prisma from './prisma';

// Time limit threshold for each ESI in simulated minutes/ticks
const ESI_LIMITS: { [key: number]: number } = {
  1: 2,    // Resuscitation: 2 mins (Immediate)
  2: 10,   // Emergency: 10 mins
  3: 30,   // Urgent: 30 mins
  4: 60,   // Semi-urgent: 60 mins
  5: 120   // Non-urgent: 120 mins
};

let activeCrises: string[] = []; // EPIDEMIC, ACCIDENT, EQUIPMENT_FAIL
let socketIoInstance: any = null;

// Clock state in memory
let simTime = { hour: 8, minute: 0, day: 18, month: 6, year: 2026 };
let clockSpeed = 1; // 0 = Pausa, 1 = Normal, 5 = Rápido, 10 = Ultra

// Bed cleaning remaining times in simulated minutes
// Map of bedId -> remaining minutes
const bedCleaningTimers = new Map<string, number>();

// In-transit pharmacy virtual stock arrival timers
// Map of skuId -> quantity in transit
const virtualStockInTransit = new Map<string, number>();

export class HisService {
  static setIo(io: any) {
    socketIoInstance = io;
  }

  async getKpis() {
    const totalBeds = await prisma.hisBed.count();
    const occupiedBeds = await prisma.hisBed.count({ where: { status: 'OCCUPIED' } });
    const occupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    
    const attended = await prisma.hisTriage.count({
      where: { status: { in: ['ADMITTED', 'DISCHARGED'] } }
    });

    const mortality = await prisma.hisTriage.count({
      where: { status: 'DECEASED' }
    });

    const stockouts = await prisma.hisPharmacy.count({
      where: { currentStock: 0 }
    });

    const averageWaitResult = await prisma.hisTriage.findMany({
      where: {
        attentionTime: { not: null }
      },
      select: {
        arrivalTime: true,
        attentionTime: true
      },
      take: 100
    });

    let avgWait = 12;
    if (averageWaitResult.length > 0) {
      const totalWait = averageWaitResult.reduce((sum, item) => {
        const diff = (item.attentionTime as Date).getTime() - item.arrivalTime.getTime();
        return sum + Math.max(0, Math.floor(diff / 60000));
      }, 0);
      avgWait = Math.round(totalWait / averageWaitResult.length);
    }

    return {
      attended,
      mortality,
      occupancy,
      stockouts,
      avgWait
    };
  }

  async getSimulationState() {
    const kpis = await this.getKpis();
    return {
      simTime,
      clockSpeed,
      activeCrises,
      kpis
    };
  }

  updateClockSpeed(speed: number) {
    clockSpeed = speed;
    this.broadcastUpdate();
    return clockSpeed;
  }

  async getBeds() {
    const beds = await prisma.hisBed.findMany({
      orderBy: { bedNumber: 'asc' }
    });

    const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED' && b.currentPatient);
    
    let patientsMap = new Map<string, any>();
    let triageMap = new Map<string, any>();

    if (occupiedBeds.length > 0) {
      const patientIds = occupiedBeds.map(b => b.currentPatient as string);
      
      const patients = await prisma.hisPatient.findMany({
        where: { id: { in: patientIds } }
      });
      patientsMap = new Map(patients.map(p => [p.id, p]));

      const triages = await prisma.hisTriage.findMany({
        where: {
          patientId: { in: patientIds },
          status: 'ADMITTED'
        }
      });
      triageMap = new Map(triages.map(t => [t.patientId, t]));
    }

    return beds.map(b => {
      const cleaningTimeLeftSim = bedCleaningTimers.get(b.id) || 0;
      
      let frontendStatus = 'Disponible';
      if (b.status === 'OCCUPIED') frontendStatus = 'Ocupada';
      else if (b.status === 'CLEANING') frontendStatus = 'En Limpieza';
      else if (b.status === 'MAINTENANCE') frontendStatus = 'Inhabilitada';

      let patientObj = null;
      if (b.status === 'OCCUPIED' && b.currentPatient) {
        const patient = patientsMap.get(b.currentPatient);
        const triage = triageMap.get(b.currentPatient);
        if (patient) {
          patientObj = {
            id: patient.rut,
            name: patient.fullName,
            age: patient.age,
            gender: patient.gender,
            bloodType: patient.bloodType,
            comorbidities: JSON.parse(patient.comorbidities || '[]'),
            allergies: JSON.parse(patient.allergies || '[]'),
            esi: triage ? triage.assignedEsi : 3,
            symptoms: triage ? triage.symptoms : ''
          };
        }
      }

      return {
        id: b.id,
        status: frontendStatus,
        patient: patientObj,
        cleaningTimeLeftSim
      };
    });
  }

  async getActiveTriage() {
    const list = await prisma.hisTriage.findMany({
      where: {
        status: { in: ['WAITING', 'IN_TREATMENT'] }
      },
      include: {
        patient: true
      },
      orderBy: [
        { assignedEsi: 'asc' },
        { arrivalTime: 'asc' }
      ]
    });

    return list.map(item => {
      const parts = item.symptoms.split(' | Vitales: ');
      const cleanSymptoms = parts[0];
      const vitalsText = parts[1] || '';
      
      const vitals = { temp: 36.5, hr: 80, bp: "120/80", sat: 98 };
      if (vitalsText) {
        const tempMatch = vitalsText.match(/T:([\d.]+)°C/);
        const hrMatch = vitalsText.match(/FC:(\d+)LPM/);
        const bpMatch = vitalsText.match(/PA:([\d/]+)/);
        const satMatch = vitalsText.match(/Sat:(\d+)%/);
        
        if (tempMatch) vitals.temp = parseFloat(tempMatch[1]);
        if (hrMatch) vitals.hr = parseInt(hrMatch[1]);
        if (bpMatch) vitals.bp = bpMatch[1];
        if (satMatch) vitals.sat = parseInt(satMatch[1]);
      }

      const waitElapsedSim = Math.floor((new Date().getTime() - item.arrivalTime.getTime()) / 60000);
      const ESI_LIMITS: { [key: number]: number } = {
        1: 2, 2: 10, 3: 30, 4: 60, 5: 120
      };
      const esi = item.assignedEsi || 3;
      const timeLimitSim = ESI_LIMITS[esi];

      return {
        id: item.id,
        patientId: item.patient.rut,
        rut: item.patient.rut,
        name: item.patient.fullName,
        age: item.patient.age,
        gender: item.patient.gender,
        bloodType: item.patient.bloodType,
        comorbidities: JSON.parse(item.patient.comorbidities || '[]'),
        allergies: JSON.parse(item.patient.allergies || '[]'),
        esi,
        symptoms: cleanSymptoms,
        vitals,
        arrivalTime: item.arrivalTime,
        waitElapsedSim,
        timeLimitSim,
        dead: item.status === 'DECEASED'
      };
    });
  }

  async admitPatient(rut: string, symptoms: string, assignedEsi: number, vitals: any) {
    let patient = await prisma.hisPatient.findUnique({
      where: { rut }
    });

    if (!patient) {
      // If patient not found in database, auto-create one
      patient = await prisma.hisPatient.create({
        data: {
          rut,
          fullName: 'Paciente Autogenerado',
          age: 35,
          bloodType: 'O+',
          comorbidities: JSON.stringify(['Ninguna']),
          allergies: JSON.stringify(['Ninguna']),
          gender: 'M'
        }
      });
    }

    const triage = await prisma.hisTriage.create({
      data: {
        patientId: patient.id,
        symptoms: `${symptoms} | Vitales: T:${vitals.temp}°C, FC:${vitals.hr}LPM, PA:${vitals.bp}, Sat:${vitals.sat}%`,
        assignedEsi,
        status: 'WAITING',
        arrivalTime: new Date()
      },
      include: {
        patient: true
      }
    });

    this.broadcastUpdate();
    this.emitAlert(`📢 Ingreso Triage: Paciente ${patient.fullName} categorizado ESI ${assignedEsi}`);
    return triage;
  }

  async transferPatientToBed(triageId: string, bedId: string) {
    const triage = await prisma.hisTriage.findUnique({
      where: { id: triageId },
      include: { patient: true }
    });
    if (!triage) throw new Error('Triage record not found');

    const bed = await prisma.hisBed.findUnique({
      where: { id: bedId }
    });
    if (!bed) throw new Error('Bed not found');
    if (bed.status !== 'AVAILABLE') throw new Error('Bed is not available');

    // Clinical Validation Rules
    const comorbidities = JSON.parse(triage.patient.comorbidities || '[]');
    const isPediatric = triage.patient.age < 18;
    const isAdult = triage.patient.age >= 18;
    const isContagious = triage.symptoms.toLowerCase().includes('infección') ||
                         triage.symptoms.toLowerCase().includes('brote') ||
                         triage.symptoms.toLowerCase().includes('contagio') ||
                         comorbidities.includes('Infección Activa');

    // 1. Pediatric check
    if (isPediatric && bed.ward !== 'PED' && bed.ward !== 'AIS') {
      throw new Error('Validación Clínica: Paciente pediátrico debe ir a la sala de Pediatría o Aislamiento.');
    }
    // 2. Adult check
    if (isAdult && bed.ward === 'PED') {
      throw new Error('Validación Clínica: Pacientes adultos no pueden ser ingresados a Pediatría.');
    }
    // 3. Contagious check
    if (isContagious && bed.ward !== 'AIS' && bed.ward !== 'UCI') {
      throw new Error('Validación Clínica: Paciente contagioso/infeccioso debe ser aislado en Aislamiento o UCI.');
    }
    // 4. Critical check
    if ((triage.assignedEsi === 1 || triage.assignedEsi === 2) && (bed.ward !== 'UCI' && bed.ward !== 'UTI')) {
      throw new Error('Validación Clínica: Pacientes críticos ESI 1 y ESI 2 requieren monitoreo en UCI o UTI.');
    }

    // Perform Transfer
    await prisma.$transaction([
      prisma.hisTriage.update({
        where: { id: triageId },
        data: {
          status: 'ADMITTED',
          attentionTime: new Date()
        }
      }),
      prisma.hisBed.update({
        where: { id: bedId },
        data: {
          status: 'OCCUPIED',
          currentPatient: triage.patient.id
        }
      })
    ]);

    // Update stock out metrics or cost
    // Reduce some critical medications in pharmacy on admission
    await this.consumeCriticalSuppliesOnAdmit(triage.assignedEsi || 3);

    this.broadcastUpdate();
    this.emitAlert(`🩺 Traslado: Paciente ${triage.patient.fullName} ingresado a Cama ${bedId}`);
    return { success: true };
  }

  private async consumeCriticalSuppliesOnAdmit(esi: number) {
    try {
      const itemsToConsume = esi <= 2 ? 10 : 2;
      const medications = await prisma.hisPharmacy.findMany({
        where: { category: 'MEDICATION', currentStock: { gt: 0 } },
        take: 3
      });
      for (const med of medications) {
        await prisma.hisPharmacy.update({
          where: { id: med.id },
          data: { currentStock: { decrement: Math.min(med.currentStock, itemsToConsume) } }
        });
      }
    } catch (e) {
      console.error('Error consuming pharmacy stock on admit:', e);
    }
  }

  async dischargePatient(bedId: string) {
    const bed = await prisma.hisBed.findUnique({
      where: { id: bedId }
    });
    if (!bed) throw new Error('Bed not found');
    if (bed.status !== 'OCCUPIED' || !bed.currentPatient) throw new Error('Bed is not occupied');

    const patient = await prisma.hisPatient.findUnique({
      where: { id: bed.currentPatient }
    });

    // Mark bed as CLEANING
    await prisma.hisBed.update({
      where: { id: bedId },
      data: {
        status: 'CLEANING',
        currentPatient: null
      }
    });

    // Start 15 simulated minutes cleaning timer
    bedCleaningTimers.set(bedId, 15);

    // Update triage records to DISCHARGED
    if (patient) {
      const activeTriage = await prisma.hisTriage.findFirst({
        where: {
          patientId: patient.id,
          status: 'ADMITTED'
        }
      });
      if (activeTriage) {
        await prisma.hisTriage.update({
          where: { id: activeTriage.id },
          data: { status: 'DISCHARGED' }
        });
      }
    }

    this.broadcastUpdate();
    this.emitAlert(`✨ Limpieza: Paciente dado de alta. Cama ${bedId} ingresa a desinfección (15 min).`);
    return { success: true };
  }

  async getPharmacyInventory(page: number, pageSize: number, search: string, category: string) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    const [data, total] = await prisma.$transaction([
      prisma.hisPharmacy.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { sku: 'asc' }
      }),
      prisma.hisPharmacy.count({ where })
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return { data, total, totalPages };
  }

  async buyPharmacySku(skuId: string, quantity: number) {
    const item = await prisma.hisPharmacy.findUnique({
      where: { id: skuId }
    });
    if (!item) throw new Error('SKU not found');

    const updated = await prisma.hisPharmacy.update({
      where: { id: skuId },
      data: {
        virtualStock: { increment: quantity }
      }
    });

    // In-transit items arrive in 10 simulated ticks
    virtualStockInTransit.set(skuId, quantity);

    this.broadcastUpdate();
    this.emitAlert(`📦 Compra: Orden de ${quantity} unidades enviada para ${item.name}`);
    return updated;
  }

  async getHistoricalAnalytics() {
    // Standard aggregations for history panel
    const recentHistory = await prisma.hisTriage.findMany({
      where: { status: { in: ['DISCHARGED', 'DECEASED', 'ADMITTED'] } },
      orderBy: { arrivalTime: 'desc' },
      take: 100,
      include: { patient: true }
    });

    // Generate mock analytics based on active database for Recharts dashboard
    const esiDistribution = [
      { name: "ESI 1 (Resucitación)", value: 850, color: "var(--esi-1-resus)" },
      { name: "ESI 2 (Emergencia)", value: 4200, color: "var(--esi-2-emerg)" },
      { name: "ESI 3 (Urgente)", value: 12500, color: "var(--esi-3-urg)" },
      { name: "ESI 4 (Semi-urgente)", value: 19800, color: "var(--esi-4-semi)" },
      { name: "ESI 5 (No urgente)", value: 14650, color: "var(--esi-5-non)" }
    ];

    const outcomes = [
      { name: "Alta", value: 34500 },
      { name: "Hospitalización", value: 16200 },
      { name: "Fallecido", value: 320 },
      { name: "Derivado", value: 980 }
    ];

    const monthlyTrend = [
      { monthName: "Ene", admissions: 4200, deaths: 25 },
      { monthName: "Feb", admissions: 3900, deaths: 18 },
      { monthName: "Mar", admissions: 4500, deaths: 22 },
      { monthName: "Abr", admissions: 4100, deaths: 15 },
      { monthName: "May", admissions: 4800, deaths: 31 },
      { monthName: "Jun", admissions: 5200, deaths: 38 },
      { monthName: "Jul", admissions: 5600, deaths: 45 },
      { monthName: "Ago", admissions: 5100, deaths: 29 },
      { monthName: "Sep", admissions: 4600, deaths: 20 },
      { monthName: "Oct", admissions: 4300, deaths: 24 },
      { monthName: "Nov", admissions: 4100, deaths: 19 },
      { monthName: "Dic", admissions: 4800, deaths: 35 }
    ];

    const categoryStats = [
      { name: "Cardiovascular", value: 8200, avgWait: 10 },
      { name: "Respiratorio", value: 14500, avgWait: 25 },
      { name: "Trauma", value: 11200, avgWait: 15 },
      { name: "Gastrointestinal", value: 9400, avgWait: 45 },
      { name: "Salud Mental", value: 3200, avgWait: 60 }
    ];

    return {
      recentHistory,
      analytics: {
        triageDist: esiDistribution,
        outcomes,
        monthlyTrend,
        categoryStats
      }
    };
  }

  triggerCrisis(type: string) {
    if (!activeCrises.includes(type)) {
      activeCrises.push(type);
    }

    if (type === 'ACCIDENT') {
      this.emitAlert(`🚨 CRISIS: ¡Accidente de tránsito múltiple! Afluencia masiva de pacientes graves en curso.`);
      this.injectTraumaPatients();
    } else if (type === 'EPIDEMIC') {
      this.emitAlert(`⚠️ CRISIS: Brote viral respiratorio detectado. Alta demanda de camas y suministro de oxígeno.`);
    } else if (type === 'EQUIPMENT_FAIL') {
      this.emitAlert(`❌ CRISIS: Falla técnica crítica en respiradores de la UCI. 2 camas inhabilitadas.`);
      this.disableUciBeds();
    }

    this.broadcastUpdate();
  }

  resolveCrises() {
    activeCrises = [];
    this.enableAllBeds();
    this.broadcastUpdate();
    this.emitAlert(`✅ Escenario controlado: Retornando a flujo operativo estándar.`);
  }

  private async injectTraumaPatients() {
    try {
      // Fetch 8 random patients from the database to inject
      const patients = await prisma.hisPatient.findMany({
        take: 8
      });
      for (const patient of patients) {
        await prisma.hisTriage.create({
          data: {
            patientId: patient.id,
            symptoms: 'Politraumatismo agudo por colisión vial de alto impacto | FC:115LPM, Sat:88%',
            assignedEsi: Math.random() > 0.4 ? 1 : 2,
            status: 'WAITING',
            arrivalTime: new Date()
          }
        });
      }
      this.broadcastUpdate();
    } catch (e) {
      console.error('Error injecting trauma patients:', e);
    }
  }

  private async disableUciBeds() {
    try {
      const uciBeds = await prisma.hisBed.findMany({
        where: { ward: 'UCI', status: 'AVAILABLE' },
        take: 2
      });
      for (const bed of uciBeds) {
        await prisma.hisBed.update({
          where: { id: bed.id },
          data: { status: 'MAINTENANCE' }
        });
      }
      this.broadcastUpdate();
    } catch (e) {
      console.error('Error disabling UCI beds:', e);
    }
  }

  private async enableAllBeds() {
    try {
      await prisma.hisBed.updateMany({
        where: { status: 'MAINTENANCE' },
        data: { status: 'AVAILABLE' }
      });
    } catch (e) {
      console.error('Error enabling beds:', e);
    }
  }

  // Simulation tick run every 30 seconds
  async runSimulationStep() {
    if (clockSpeed === 0) return;

    // Advance clock minutes depending on speed
    const advanceMinutes = clockSpeed;
    let nMin = simTime.minute + advanceMinutes;
    let nHour = simTime.hour;
    let nDay = simTime.day;

    if (nMin >= 60) {
      nHour += Math.floor(nMin / 60);
      nMin = nMin % 60;
    }
    if (nHour >= 24) {
      nDay += Math.floor(nHour / 24);
      nHour = nHour % 24;
    }
    simTime = { ...simTime, minute: nMin, hour: nHour, day: nDay };

    // 1. Process Bed Cleaning Timers
    for (const [bedId, timeLeft] of bedCleaningTimers.entries()) {
      const newTime = timeLeft - advanceMinutes;
      if (newTime <= 0) {
        bedCleaningTimers.delete(bedId);
        await prisma.hisBed.update({
          where: { id: bedId },
          data: { status: 'AVAILABLE' }
        });
        this.emitAlert(`✨ Cama ${bedId} desinfectada y lista para recibir ingresos.`);
      } else {
        bedCleaningTimers.set(bedId, newTime);
      }
    }

    // 2. Process in-transit stocks delivery
    for (const [skuId, qty] of virtualStockInTransit.entries()) {
      await prisma.hisPharmacy.update({
        where: { id: skuId },
        data: {
          currentStock: { increment: qty },
          virtualStock: { decrement: qty }
        }
      });
      virtualStockInTransit.delete(skuId);
    }

    // 3. Process clinical degradation for waiting patients
    const waitingPatients = await prisma.hisTriage.findMany({
      where: { status: 'WAITING' },
      include: { patient: true }
    });

    for (const item of waitingPatients) {
      // Calculate minutes waited
      const diffMs = new Date().getTime() - item.arrivalTime.getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000)) + 1;

      const currentEsi = item.assignedEsi || 3;
      const limit = ESI_LIMITS[currentEsi];

      if (diffMins > limit) {
        if (currentEsi > 1) {
          // Degrade ESI
          const newEsi = currentEsi - 1;
          await prisma.hisTriage.update({
            where: { id: item.id },
            data: { assignedEsi: newEsi }
          });
          this.emitAlert(`⚠️ DEGRADACIÓN CLÍNICA: Paciente ${item.patient.fullName} empeoró a ESI ${newEsi} por tiempo de espera.`);
        } else if (currentEsi === 1 && diffMins > limit + 5) {
          // ESI 1 waiting too long dies
          await prisma.hisTriage.update({
            where: { id: item.id },
            data: { status: 'DECEASED' }
          });
          this.emitAlert(`🚨 CÓDIGO NEGRO: Deceso de paciente ${item.patient.fullName} en sala de espera.`);
        }
      }
    }

    // 4. Pharmacy consumption based on occupied beds
    const beds = await prisma.hisBed.findMany();
    const occupiedCount = beds.filter(b => b.status === 'OCCUPIED').length;
    if (occupiedCount > 0) {
      const multiplier = activeCrises.includes('EPIDEMIC') ? 2.5 : 1.0;
      const qtyToConsume = Math.ceil(occupiedCount * 0.2 * multiplier);

      // Consume standard category items
      await this.consumeCategoryStock('MEDICATION', qtyToConsume);
      await this.consumeCategoryStock('PPE', Math.ceil(qtyToConsume * 0.8));
      await this.consumeCategoryStock('BIOMEDICAL', Math.ceil(qtyToConsume * 0.5));
    }

    // 5. Patient Auto-Arrival simulation
    let arrivalChance = 0.15;
    if (activeCrises.includes('EPIDEMIC')) arrivalChance = 0.40;
    if (activeCrises.includes('ACCIDENT')) arrivalChance = 0.50;

    if (Math.random() < arrivalChance) {
      await this.generateAutoArrivalPatient();
    }

    this.broadcastUpdate();
  }

  private async consumeCategoryStock(category: string, qty: number) {
    try {
      const items = await prisma.hisPharmacy.findMany({
        where: { category, currentStock: { gt: 0 } },
        take: 5
      });
      if (items.length === 0) return;

      const qtyPerItem = Math.ceil(qty / items.length);
      for (const item of items) {
        await prisma.hisPharmacy.update({
          where: { id: item.id },
          data: {
            currentStock: { decrement: Math.min(item.currentStock, qtyPerItem) }
          }
        });
      }
    } catch (e) {
      console.error('Error during pharmacy stock consumption step:', e);
    }
  }

  private async generateAutoArrivalPatient() {
    try {
      // Pick a random patient from HisPatient
      const totalPatients = await prisma.hisPatient.count();
      if (totalPatients === 0) return;

      const skip = Math.floor(Math.random() * totalPatients);
      const patient = await prisma.hisPatient.findFirst({
        skip
      });

      if (!patient) return;

      // Exclude if already has active urgency
      const activeTriage = await prisma.hisTriage.findFirst({
        where: {
          patientId: patient.id,
          status: { in: ['WAITING', 'IN_TREATMENT'] }
        }
      });
      if (activeTriage) return;

      let assignedEsi = 4;
      let symptoms = 'Dolor general y malestar';
      if (activeCrises.includes('EPIDEMIC')) {
        assignedEsi = Math.random() > 0.4 ? 2 : 3;
        symptoms = 'Insuficiencia respiratoria severa y disnea';
      } else if (activeCrises.includes('ACCIDENT')) {
        assignedEsi = Math.random() > 0.3 ? 1 : 2;
        symptoms = 'Politraumatismo por impacto cinético grave';
      } else {
        assignedEsi = Math.floor(Math.random() * 4) + 2; // ESI 2-5
      }

      await prisma.hisTriage.create({
        data: {
          patientId: patient.id,
          symptoms,
          assignedEsi,
          status: 'WAITING',
          arrivalTime: new Date()
        }
      });

      this.emitAlert(`📢 Ingreso Triage: Paciente ${patient.fullName} categorizado ESI ${assignedEsi}`);
    } catch (e) {
      console.error('Error generating auto arrival patient:', e);
    }
  }

  private broadcastUpdate() {
    if (socketIoInstance) {
      Promise.all([
        this.getBeds(),
        this.getActiveTriage(),
        this.getKpis()
      ]).then(([beds, activeTriage, kpis]) => {
        socketIoInstance.emit('his-telemetry-update', {
          beds,
          activeTriage,
          simTime,
          clockSpeed,
          activeCrises,
          kpis
        });
      }).catch(err => {
        console.error('Error fetching broadcast data:', err);
      });
    }
  }

  private emitAlert(message: string) {
    if (socketIoInstance) {
      const formattedTime = `${simTime.hour < 10 ? '0' + simTime.hour : simTime.hour}:${simTime.minute < 10 ? '0' + simTime.minute : simTime.minute}`;
      socketIoInstance.emit('his-system-alert', {
        time: formattedTime,
        message
      });
    }
  }
}
