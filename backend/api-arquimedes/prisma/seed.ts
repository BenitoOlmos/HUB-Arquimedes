import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pumpParts = [
  {
    id: 'volute_casing',
    name: 'Volute Casing',
    spanishName: 'Carcasa de Voluta',
    description: 'The outer casing that contains the fluid and directs it to the discharge flange. Its spiral shape acts as a diffuser, converting velocity energy into static pressure.',
    material: 'Cast Iron (ASTM A48 Class 30) or Duplex Stainless Steel',
    function: 'Houses internal rotating elements, contains pressure boundary, and converts kinetic velocity to pressure.',
    maintenanceInterval: 'Every 24 months',
    status: 'Operational',
    commonFailures: 'Volute wear due to sand erosion, local corrosion pitting, casting microcracks due to thermal stress or water hammer.',
    technicianAlert: 'Verify casing wall thickness using ultrasound. Check torque on casing bolts in a cross pattern to ensure even gasket compression.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[0.8, 0.9, 0.9, 1.0, 1.1, 1.2, 1.2]',
    stressHistory: '[20, 25, 30, 28, 35, 42, 40]',
    remainingLife: 88,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Montaje verificado. Anclaje de pernos de cimentación con torque de 120 N·m. Junta de grafito espiralada instalada.',
    nextMaintenance: '2026-06-15',
    maintenanceLogs: JSON.stringify([
      { id: 'vc-01', date: '2025-01-10', tech: 'Héctor Gómez', desc: 'Liquid penetrant testing performed on casing joint. Gasket replaced with graphite ring.' }
    ])
  },
  {
    id: 'impeller',
    name: 'Impeller',
    spanishName: 'Impulsor / Rodete',
    description: 'The key rotating component with curved vanes that imparts centrifugal acceleration to the fluid, moving it from the eye outward.',
    material: 'Aluminum Bronze (C95800) or Stainless Steel 316L',
    function: 'Converts driver shaft mechanical energy into fluid kinetic energy.',
    maintenanceInterval: 'Every 12 months',
    status: 'Operational',
    commonFailures: 'Cavitation pitting on vane tips, erosion from abrasive slurries, dynamic imbalance due to uneven vane wear.',
    technicianAlert: 'Look for honeycomb-like cavitation damage. Balance the assembly dynamically on G2.5 spec before reinstallation.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[1.5, 1.6, 1.8, 1.9, 2.4, 2.8, 3.2]',
    stressHistory: '[40, 48, 55, 62, 70, 78, 85]',
    remainingLife: 60,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Balanceo dinámico ISO G2.5 aprobado. Ajuste de chaveta y tuerca del impulsor con arandela de seguridad.',
    nextMaintenance: '2026-07-20',
    maintenanceLogs: JSON.stringify([
      { id: 'imp-01', date: '2025-01-12', tech: 'Carlos Mendoza', desc: 'Impeller cleaned and balanced. Minor wear on blade edges smoothed by grinding.' }
    ])
  },
  {
    id: 'shaft',
    name: 'Shaft',
    spanishName: 'Eje de Transmisión',
    description: 'The precision-machined rotating rod that transmits mechanical torque from the motor coupling to the pump impeller.',
    material: 'High-Tensile Alloy Steel (AISI 4140) or SS 410',
    function: 'Carries torque, keeps internal rotating components aligned, and absorbs radial and axial loads.',
    maintenanceInterval: 'Every 18 months',
    status: 'Operational',
    commonFailures: 'Fatigue cracks at keyways or step transitions, shaft deflection (runout) due to high hydraulic loads, wear under sleeve.',
    technicianAlert: 'Check total runout with dial indicator (must not exceed 0.05 mm). Perform magnetic particle inspection on shaft keyway.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[0.5, 0.6, 0.6, 0.7, 0.7, 0.8, 0.8]',
    stressHistory: '[30, 32, 35, 38, 40, 42, 45]',
    remainingLife: 80,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Alineación láser de acoplamiento completada: desviación radial 0.02 mm, desviación axial 0.01 mm.',
    nextMaintenance: '2026-08-10',
    maintenanceLogs: JSON.stringify([
      { id: 'sh-01', date: '2025-07-15', tech: 'Héctor Gómez', desc: 'Runout measured at 0.02 mm, well within parameters. Alignment checked with coupling.' }
    ])
  },
  {
    id: 'mechanical_seal',
    name: 'Mechanical Seal',
    spanishName: 'Sello Mecánico',
    description: 'The sealing device located around the shaft that prevents leakage of the pressurized pumped liquid to the surrounding atmosphere.',
    material: 'Silicon Carbide (SiC) vs Carbon, Viton Elastomers',
    function: 'Creates static and dynamic seal barrier to contain process liquid.',
    maintenanceInterval: 'Every 6 months',
    status: 'Inspect',
    commonFailures: 'Dry running face heat checking, elastomer degradation, face chipping from foreign particulate, spring clogging.',
    technicianAlert: 'Ensure flush plan piping is clear. Do not start pump dry - ensure pump casing is vented and fully flooded before startup.',
    entryDate: '2025-07-15',
    operatingHours: 5200,
    vibrationHistory: '[1.0, 1.1, 1.2, 1.4, 1.8, 2.5, 3.1]',
    stressHistory: '[35, 42, 50, 58, 65, 72, 88]',
    remainingLife: 35,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Sello de cartucho instalado. Presión de flush verificada a 2.5 bar sobre presión de succión. Se verificó no arranque en seco.',
    nextMaintenance: '2026-06-01',
    maintenanceLogs: JSON.stringify([
      { id: 'ms-01', date: '2025-07-15', tech: 'Carlos Mendoza', desc: 'Old packing gland upgraded to mechanical cartridge seal. Flush plan 11 connected.' }
    ])
  },
  {
    id: 'bearings',
    name: 'Bearings',
    spanishName: 'Cojinetes / Rodamientos',
    description: 'Standard bearing components supporting the shaft assembly, absorbing radial and axial thrust loads and reducing frictional resistance.',
    material: 'High-Chrome Steel (AISI 52100)',
    function: 'Supports radial thrust and axial hydraulic thrust. Restricts axial movement.',
    maintenanceInterval: 'Every 6 months',
    status: 'Operational',
    commonFailures: 'Fatigue spalling on rollers, lubrication failure (burn), water ingress in bearing housing, misalignment heating.',
    technicianAlert: 'Check temperature (max 75°C). Monitor vibration acceleration in Gs for early bearing frequency detection.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[1.1, 1.2, 1.2, 1.4, 1.6, 1.7, 1.8]',
    stressHistory: '[25, 30, 35, 40, 45, 52, 55]',
    remainingLife: 75,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Rodamientos lubricados con grasa sintética Mobilith SHC 100. Holgura axial ajustada según catálogo del fabricante.',
    nextMaintenance: '2026-06-15',
    maintenanceLogs: JSON.stringify([
      { id: 'br-01', date: '2025-01-12', tech: 'Carlos Mendoza', desc: 'Bearings cleaned and flushed. Housing refilled with ISO VG 46 synthetic oil.' }
    ])
  },
  {
    id: 'shaft_sleeve',
    name: 'Shaft Sleeve',
    spanishName: 'Camisa / Deflector',
    description: 'A replaceable metal tube that wraps around the shaft in the seal or packing chamber to protect the underlying shaft from wear.',
    material: 'Hardened Stainless Steel 420 or Stellite Coated Steel',
    function: 'Protects the main shaft from wear and chemical action under seal elements.',
    maintenanceInterval: 'Every 12 months',
    status: 'Replace',
    commonFailures: 'Scoring or grooving from seal packing rings, chemical corrosion, micro-pitting under seal faces.',
    technicianAlert: 'Inspect surface roughness (Ra max 0.8 microns). Replace sleeve if grooving exceeds 0.25 mm depth.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[0.6, 0.7, 0.8, 1.0, 1.3, 1.7, 2.2]',
    stressHistory: '[50, 58, 65, 75, 82, 90, 95]',
    remainingLife: 10,
    lifecycleStage: 'Replacement',
    installationNotes: 'Camisa montada con ajuste deslizante sobre el eje. O-rings internos lubricados con vaselina técnica.',
    nextMaintenance: '2026-05-30',
    maintenanceLogs: JSON.stringify([
      { id: 'sl-01', date: '2025-01-12', tech: 'Héctor Gómez', desc: 'Polished sleeve surface during routine overhaul. Re-installed with new O-rings.' }
    ])
  },
  {
    id: 'wear_rings',
    name: 'Wear Rings',
    spanishName: 'Anillos de Desgaste',
    description: 'Replaceable annular rings located between the impeller shroud and casing that restrict fluid recirculation from high to low pressure.',
    material: 'Bronze C93200 or Nitronic 60',
    function: 'Maintains minimum clearance to optimize pump efficiency and prevent internal leakage.',
    maintenanceInterval: 'Every 18 months',
    status: 'Operational',
    commonFailures: 'Galling from close metallic contact, enlargement of clearance due to abrasive erosion.',
    technicianAlert: 'Measure diameter at 4 points. If clearance exceeds 2x design value, replace rings to restore volumetric efficiency.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[0.9, 1.0, 1.0, 1.1, 1.2, 1.3, 1.4]',
    stressHistory: '[20, 22, 25, 28, 30, 35, 38]',
    remainingLife: 82,
    lifecycleStage: 'Maintenance',
    installationNotes: 'Holgura diametral de diseño verificada en 0.28 mm. Fijación con pernos prisioneros y Loctite 243.',
    nextMaintenance: '2026-09-05',
    maintenanceLogs: JSON.stringify([
      { id: 'wr-01', date: '2025-01-12', tech: 'Carlos Mendoza', desc: 'Clearance measured at 0.38 mm (within tolerance). Reseated casing ring.' }
    ])
  },
  {
    id: 'suction_flange',
    name: 'Suction Flange',
    spanishName: 'Brida de Aspiración',
    description: 'The connection flange at the intake of the pump volute through which the fluid enters.',
    material: 'Matches Volute Casing (Cast Iron or SS)',
    function: 'Inlet port of the centrifugal pump.',
    maintenanceInterval: 'Every 24 months',
    status: 'Operational',
    commonFailures: 'Bolt elongation or relaxation, flange face gasket leakage, bolt corrosion.',
    technicianAlert: 'Check bolt tension with torque wrench. Ensure no flange loading forces from piping alignment errors.',
    entryDate: '2024-01-15',
    operatingHours: 14820,
    vibrationHistory: '[0.3, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5]',
    stressHistory: '[10, 12, 11, 14, 15, 13, 15]',
    remainingLife: 95,
    lifecycleStage: 'Installation',
    installationNotes: 'Brida libre de tensiones externas. Tubería de succión soportada independientemente para evitar esfuerzos en carcasa.',
    nextMaintenance: '2026-11-20',
    maintenanceLogs: JSON.stringify([
      { id: 'sf-01', date: '2025-01-10', tech: 'Héctor Gómez', desc: 'Torqued connection bolts. Replaced seal gasket with EPDM spiral wound ring.' }
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
