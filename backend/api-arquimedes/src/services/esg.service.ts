import prisma from './prisma';
import PDFDocument from 'pdfkit';
import {
  EmissionFactor,
  EsgFacility,
  ActivityData,
  CarbonMarket,
  EsgMetrics
} from 'shared-schemas';

let esgBudget = 350000; // $350,000 for operations / carbon credits
let offsetEmissions = 0; // Cumulative offset tons of CO2e purchased
let legalFines = 0; // Accumulated compliance fines
let activeEvent = 'NORMAL'; // 'NORMAL', 'OIL_SPILL_AUDIT_STRICT', 'EU_CARBON_TAX_BOOST', 'AMAZON_FIRE_DEVALUATION'
let isCircularEconomyActive = false; // Reduces Scope 3 emissions if active

// Dictionary of purchased tons per project to check greenwashing
const purchasedCredits: Record<string, number> = {};

export class EsgService {
  // Reset simulation states
  async resetSimulation() {
    esgBudget = 350000;
    offsetEmissions = 0;
    legalFines = 0;
    activeEvent = 'NORMAL';
    isCircularEconomyActive = false;
    for (const key of Object.keys(purchasedCredits)) {
      delete purchasedCredits[key];
    }

    // Restore original seeder values for all ActivityData
    const activities = await prisma.activityData.findMany();
    for (const act of activities) {
      if (act.originalAmount !== null && act.originalUnit !== null) {
        // Find correct factor for recalculation
        const factor = await prisma.emissionFactor.findUnique({ where: { id: act.factorId } });
        if (factor) {
          await prisma.activityData.update({
            where: { id: act.id },
            data: {
              rawAmount: act.originalAmount,
              unit: act.originalUnit,
              calculatedCo2e: parseFloat((act.originalAmount * factor.co2ePerUnit).toFixed(3))
            }
          });
        }
      }
    }

    // Reset CarbonMarket pricing
    await prisma.carbonMarket.updateMany({
      where: { projectType: 'FORESTRY' },
      data: { pricePerTon: 15.5, availableTons: 25000 }
    });
    await prisma.carbonMarket.updateMany({
      where: { projectType: 'DAC' },
      data: { pricePerTon: 120.0, availableTons: 5000 }
    });
    await prisma.carbonMarket.updateMany({
      where: { projectType: 'RENEWABLE' },
      data: { pricePerTon: 8.2, availableTons: 50000 }
    });
  }

  async getFacilities(): Promise<EsgFacility[]> {
    return await prisma.esgFacility.findMany();
  }

  async getFactors(): Promise<EmissionFactor[]> {
    return await prisma.emissionFactor.findMany();
  }

  async getActivities(scope?: number, facilityId?: string): Promise<ActivityData[]> {
    const where: any = {};
    if (scope) where.scope = scope;
    if (facilityId) where.facilityId = facilityId;

    const data = await prisma.activityData.findMany({
      where,
      include: {
        facility: true,
        factor: true
      },
      orderBy: { timestamp: 'desc' }
    });

    return data as any[];
  }

  async getCarbonMarket(): Promise<CarbonMarket[]> {
    const market = await prisma.carbonMarket.findMany({
      orderBy: { pricePerTon: 'asc' }
    });
    return market as any[];
  }

  // Set circular economy design
  setCircularEconomy(active: boolean) {
    isCircularEconomyActive = active;
  }

  getCircularEconomyStatus() {
    return isCircularEconomyActive;
  }

  // Active event configuration
  setEvent(event: string) {
    activeEvent = event;
    if (event === 'AMAZON_FIRE_DEVALUATION') {
      // halving amazon reforestation available tons
      prisma.carbonMarket
        .updateMany({
          where: { projectName: { contains: 'Amazónica' } },
          data: { availableTons: 10000 }
        })
        .catch(console.error);
    }
  }

  getEvent() {
    return activeEvent;
  }

  // Recalculates metrics and KPIs dynamically
  async getEsgMetrics(): Promise<EsgMetrics> {
    const activities = await prisma.activityData.findMany({
      include: { factor: true }
    });

    let totalScope1 = 0;
    let totalScope2 = 0;
    let totalScope3 = 0;
    let auditErrorsCount = 0;

    for (const act of activities) {
      const factor = act.factor;
      let calculated = act.calculatedCo2e;

      // Count uncorrected audit errors (where unit is not standard)
      if (['MJ', 'Miles', 'ton-miles'].includes(act.unit)) {
        auditErrorsCount++;
      }

      // If Circular Economy is active, Scope 3 plastic/paper packaging emissions are reduced by 70%
      if (
        isCircularEconomyActive &&
        act.scope === 3 &&
        (act.category === 'PLASTIC_VIRGIN' || act.category === 'PAPER_RECYCLED')
      ) {
        calculated *= 0.3; // 70% reduction
      }

      if (act.scope === 1) {
        totalScope1 += calculated;
      } else if (act.scope === 2) {
        totalScope2 += calculated;
      } else if (act.scope === 3) {
        totalScope3 += calculated;
      }
    }

    const totalEmissions = totalScope1 + totalScope2 + totalScope3;

    // SBTi target for 2025 (target: 175 tons CO2e)
    const targetEmissions = 175;
    const netEmissions = Math.max(0, totalEmissions - offsetEmissions);

    // Legal Fines logic: Ley Marco de Cambio Climático & TCFD
    // If there are uncorrected errors in the report, fine is generated
    // $5,000 fine per uncorrected error, or if Oil Spill Audit is active, fine is $10,000 per error
    const finePerError = activeEvent === 'OIL_SPILL_AUDIT_STRICT' ? 10000 : 5000;
    legalFines = auditErrorsCount * finePerError;

    // Greenwashing check: check if RENEWABLE offset credits purchased comprise > 50% of total compensations
    const renewableCredits = purchasedCredits['RENEWABLE'] || 0;
    const totalPurchased = offsetEmissions;
    const isGreenwashing = totalPurchased > 0 && renewableCredits / totalPurchased > 0.5;

    // Calculate reputationScore
    let repScore = 100;
    // Penalize uncorrected errors
    repScore -= auditErrorsCount * 4;
    // Penalize if target emissions missed
    if (netEmissions > targetEmissions) {
      const dev = ((netEmissions - targetEmissions) / targetEmissions) * 100;
      repScore -= Math.min(25, dev * 0.5); // max 25 points penalty
    }
    // Greenwashing penalty
    if (isGreenwashing) {
      repScore -= 20;
    }
    // Oil spill event increases penalties
    if (activeEvent === 'OIL_SPILL_AUDIT_STRICT' && auditErrorsCount > 0) {
      repScore -= 15;
    }

    repScore = Math.max(0, Math.min(100, Math.round(repScore)));

    return {
      totalScope1: parseFloat(totalScope1.toFixed(2)),
      totalScope2: parseFloat(totalScope2.toFixed(2)),
      totalScope3: parseFloat(totalScope3.toFixed(2)),
      totalEmissions: parseFloat(totalEmissions.toFixed(2)),
      targetEmissions,
      offsetEmissions: parseFloat(offsetEmissions.toFixed(2)),
      netEmissions: parseFloat(netEmissions.toFixed(2)),
      budget: parseFloat(esgBudget.toFixed(2)),
      auditErrorsCount,
      reputationScore: repScore,
      legalFines: parseFloat(legalFines.toFixed(2))
    };
  }

  // Audit activity and correct units
  async auditActivity(id: string, correctedAmount: number, correctedUnit: string) {
    const activity = await prisma.activityData.findUnique({
      where: { id },
      include: { factor: true }
    });
    if (!activity) throw new Error('Activity record not found');

    const factor = activity.factor;
    let finalAmount = correctedAmount;
    let finalCo2e = 0;

    // Perform unit conversion math
    const from = correctedUnit.toLowerCase();
    const to = factor.unit.toLowerCase();

    if (from === to) {
      finalCo2e = finalAmount * factor.co2ePerUnit;
    } else {
      // Apply conversions
      if (from === 'mj' && to === 'kwh') {
        finalAmount = correctedAmount / 3.6;
      } else if (from === 'miles' && to === 'passenger-km') {
        finalAmount = correctedAmount * 1.60934;
      } else if (from === 'ton-miles' && to === 'ton-km') {
        finalAmount = correctedAmount * 1.45997;
      } else if (from === 'gallons' && to === 'liters') {
        finalAmount = correctedAmount * 3.78541;
      } else if (from === 'therms' && to === 'm3') {
        finalAmount = correctedAmount * 2.83;
      } else {
        throw new Error(`Conversión no soportada de ${correctedUnit} a ${factor.unit}`);
      }
      finalCo2e = finalAmount * factor.co2ePerUnit;
    }

    // Update ActivityData record
    return await prisma.activityData.update({
      where: { id },
      data: {
        rawAmount: correctedAmount,
        unit: correctedUnit,
        calculatedCo2e: parseFloat(finalCo2e.toFixed(3))
      },
      include: { facility: true, factor: true }
    });
  }

  // Purchase carbon credit
  async buyCarbonCredits(
    projectId: string,
    tons: number
  ): Promise<{ success: boolean; message: string; budget?: number; offset?: number }> {
    const project = await prisma.carbonMarket.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Carbon project not found');

    if (project.availableTons < tons) {
      return { success: false, message: 'Toneladas no disponibles en el inventario del proyecto.' };
    }

    const cost = tons * project.pricePerTon;
    if (esgBudget < cost) {
      return { success: false, message: 'Presupuesto insuficiente para realizar la compensación.' };
    }

    // Deduct budget and update metrics
    esgBudget -= cost;
    offsetEmissions += tons;

    // Track categories for Greenwashing calculations
    const pType = project.projectType;
    purchasedCredits[pType] = (purchasedCredits[pType] || 0) + tons;

    // Deduct available credits in DB
    await prisma.carbonMarket.update({
      where: { id: projectId },
      data: { availableTons: project.availableTons - tons }
    });

    return {
      success: true,
      message: `Comprado con éxito ${tons} tCO2e de compensación.`,
      budget: esgBudget,
      offset: offsetEmissions
    };
  }

  // Background fluctuation simulation
  async fluctuateMarketPrices() {
    const projects = await prisma.carbonMarket.findMany();
    for (const p of projects) {
      let changePercent = (Math.random() * 4 - 2) / 100; // -2% to +2% normal fluctuation

      // Inject events influence
      if (activeEvent === 'EU_CARBON_TAX_BOOST') {
        // High quality DAC prices spike, RENEWABLES increase slightly
        if (p.projectType === 'DAC') {
          changePercent += 0.05; // +5% increase per tick
        } else {
          changePercent += 0.01;
        }
      } else if (activeEvent === 'AMAZON_FIRE_DEVALUATION') {
        if (p.projectName.includes('Amazónica')) {
          changePercent -= 0.08; // Amazon credit prices crash by 8% per tick
        }
      }

      let newPrice = p.pricePerTon * (1 + changePercent);
      // Floor limits
      if (p.projectType === 'DAC') newPrice = Math.max(80.0, newPrice);
      else if (p.projectType === 'FORESTRY') newPrice = Math.max(5.0, newPrice);
      else newPrice = Math.max(3.0, newPrice);

      // Save updated price
      await prisma.carbonMarket.update({
        where: { id: p.id },
        data: { pricePerTon: parseFloat(newPrice.toFixed(2)) }
      });
    }
  }

  // PDF Generation report according to GHG Protocol standards
  async generatePdfReport(metrics: EsgMetrics, activities: ActivityData[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Design styling
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#080d16'); // Dark theme background

      // Header Banner
      doc.rect(30, 30, doc.page.width - 60, 80).fill('#0f172a');
      doc
        .fillColor('#00e5ff')
        .fontSize(20)
        .text('INFORME OFICIAL DE HUELLA DE CARBONO (GEI)', 50, 45, { align: 'center' });
      doc
        .fillColor('#a0a5b5')
        .fontSize(10)
        .text(
          'Cumplimiento bajo el Estándar Corporativo de Gases de Efecto Invernadero (GHG Protocol)',
          50,
          75,
          { align: 'center' }
        );

      // Left column metadata
      doc
        .fillColor('#f5f6f9')
        .fontSize(11)
        .text(`Fecha de Declaración: ${new Date().toLocaleDateString()}`, 50, 130);
      doc.text(`Organización: Arquímedes Global Corp`, 50, 150);
      doc.text(
        `Estado de Auditoría: ${metrics.auditErrorsCount === 0 ? 'CALIBRADO & APROBADO' : 'INCOMPLETO (ERRORES DETECTADOS)'}`,
        50,
        170
      );

      // Right column score
      doc.rect(doc.page.width - 200, 130, 150, 60).fill('#1e293b');
      doc
        .fillColor('#00e5ff')
        .fontSize(18)
        .text(`${metrics.reputationScore}/100`, doc.page.width - 190, 145, {
          align: 'center',
          width: 130
        });
      doc
        .fillColor('#a0a5b5')
        .fontSize(8)
        .text('ÍNDICE DE REPUTACIÓN ESG', doc.page.width - 190, 170, {
          align: 'center',
          width: 130
        });

      // Horizontal separator
      doc
        .strokeColor('#38bdf8')
        .lineWidth(1)
        .moveTo(50, 210)
        .lineTo(doc.page.width - 50, 210)
        .stroke();

      // GHG Inventory
      doc.fillColor('#00e5ff').fontSize(14).text('1. Inventario Consolidado de Emisiones', 50, 230);
      doc.moveDown(0.5);

      doc.fillColor('#f5f6f9').fontSize(10);
      doc.text(
        `- Alcance 1 (Emisiones Directas de Flota/Calderas): ${metrics.totalScope1.toFixed(2)} tCO2e`
      );
      doc.text(
        `- Alcance 2 (Emisiones Indirectas por Electricidad): ${metrics.totalScope2.toFixed(2)} tCO2e`
      );
      doc.text(
        `- Alcance 3 (Emisiones Indirectas de Cadena de Suministro): ${metrics.totalScope3.toFixed(2)} tCO2e`
      );
      doc
        .fontSize(11)
        .fillColor('#38bdf8')
        .text(`- Emisiones Brutas Totales: ${metrics.totalEmissions.toFixed(2)} tCO2e`);
      doc
        .fillColor('#eab308')
        .text(
          `- Créditos de Carbono Adquiridos (Compensación): -${metrics.offsetEmissions.toFixed(2)} tCO2e`
        );
      doc
        .fontSize(12)
        .fillColor('#00e5ff')
        .text(`- Emisiones Netas Declaradas: ${metrics.netEmissions.toFixed(2)} tCO2e`);
      doc.text(`- Trayectoria Target SBTi 2025: ${metrics.targetEmissions.toFixed(2)} tCO2e`);

      // Target verification banner
      doc.moveDown(1);
      const targetMet = metrics.netEmissions <= metrics.targetEmissions;
      doc.rect(50, doc.y, doc.page.width - 100, 30).fill(targetMet ? '#065f46' : '#991b1b');
      doc
        .fillColor('#ffffff')
        .fontSize(10)
        .text(
          targetMet
            ? ' Trayectoria de descarbonización CONFORME a las metas de reducción SBTi.'
            : ' Trayectoria NO CONFORME: Las emisiones netas superan el límite SBTi.',
          60,
          doc.y + 10
        );

      // Audit warning if errors exist
      doc.moveDown(2);
      if (metrics.auditErrorsCount > 0) {
        doc.rect(50, doc.y, doc.page.width - 100, 45).fill('#78350f');
        doc
          .fillColor('#ffffff')
          .fontSize(9)
          .text(
            `¡ATENCIÓN! Se reportan ${metrics.auditErrorsCount} discrepancias de unidades sin auditar en la base de datos de facturas. Este informe carece de validez legal bajo estándares de reporte TCFD y acumula multas de cambio climático por $${metrics.legalFines.toLocaleString()} USD.`,
            60,
            doc.y + 8,
            { width: doc.page.width - 120 }
          );
        doc.moveDown(1.5);
      } else {
        doc.rect(50, doc.y, doc.page.width - 100, 30).fill('#0284c7');
        doc
          .fillColor('#ffffff')
          .fontSize(10)
          .text(
            ' Informe auditado con 100% de coherencia en unidades. Libre de multas de cumplimiento legal.',
            60,
            doc.y + 10
          );
        doc.moveDown(1);
      }

      // Facility breakout
      doc.moveDown(1);
      doc
        .fillColor('#00e5ff')
        .fontSize(14)
        .text('2. Desglose de Emisiones por Centro de Operación', 50, doc.y);
      doc.moveDown(0.5);

      const facilityMap: Record<string, { s1: number; s2: number; s3: number }> = {};
      for (const act of activities) {
        const fName = act.facility?.name || 'Sucursal Desconocida';
        if (!facilityMap[fName]) facilityMap[fName] = { s1: 0, s2: 0, s3: 0 };
        if (act.scope === 1) facilityMap[fName].s1 += act.calculatedCo2e;
        if (act.scope === 2) facilityMap[fName].s2 += act.calculatedCo2e;
        if (act.scope === 3) facilityMap[fName].s3 += act.calculatedCo2e;
      }

      doc.fillColor('#f5f6f9').fontSize(9);
      for (const [fName, scopes] of Object.entries(facilityMap)) {
        const total = scopes.s1 + scopes.s2 + scopes.s3;
        doc.text(`* ${fName} (Total: ${total.toFixed(2)} tCO2e)`);
        doc
          .fillColor('#a0a5b5')
          .text(
            `  - Alcance 1: ${scopes.s1.toFixed(2)} t | Alcance 2: ${scopes.s2.toFixed(2)} t | Alcance 3: ${scopes.s3.toFixed(2)} t`
          );
        doc.fillColor('#f5f6f9').moveDown(0.3);
      }

      // Legal disclaimer footer
      doc.moveDown(2);
      doc
        .strokeColor('#38bdf8')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke();
      doc.moveDown(1);
      doc
        .fillColor('#6b7080')
        .fontSize(8)
        .text(
          'Este documento es una simulación académica del reporte anual de emisiones reguladas de gases de efecto invernadero bajo el ecosistema de ingeniería digital Arquímedes Online. La información y hash presentados han sido generados por el simulador de contabilidad ESG.',
          50,
          doc.y,
          { align: 'center', width: doc.page.width - 100 }
        );

      doc.end();
    });
  }
}
