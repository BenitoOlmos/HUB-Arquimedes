import React, { useState, useEffect } from 'react';
import DashboardPanel from './components/DashboardPanel';
import WorkshopPanel from './components/WorkshopPanel';
import InventoryPanel from './components/InventoryPanel';
import ProcurementPanel from './components/ProcurementPanel';
import TeacherConsole from './components/TeacherConsole';
import WorkOrdersPanel from './components/WorkOrdersPanel';
import HistoryPanel from './components/HistoryPanel';
import {
  mockVehicles,
  mockParts,
  mockSuppliers,
  mockMechanics,
  initialActiveOTs,
  generateClosedOTs
} from './utils/mockData';
import {
  LayoutDashboard,
  Wrench,
  Package,
  Truck,
  FileText,
  Sliders,
  Calendar,
  Play,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard'); // dashboard | workshop | inventory | procurement | orders | history | teacher

  // Financial & Quality States
  const [cash, setCash] = useState(2500000); // 2.5 Million Pesos
  const [satisfaction, setSatisfaction] = useState(88.0); // 88% Initial Satisfaction
  const [currentDay, setCurrentDay] = useState(1);

  // ERP Core Entities States
  const [parts, setParts] = useState(mockParts);
  const [activeOTs, setActiveOTs] = useState(initialActiveOTs);
  const [historicalLogs, setHistoricalLogs] = useState(() => generateClosedOTs());

  const [bays, setBays] = useState([
    {
      id: 'AND-1',
      name: 'Elevador 2 Postes',
      specialty: 'Suspensiones y Transmisión',
      mechanicId: 'MEC-1'
    },
    {
      id: 'AND-2',
      name: 'Alineación y Balanceo',
      specialty: 'Alineación y Suspensión',
      mechanicId: 'MEC-4'
    },
    {
      id: 'AND-3',
      name: 'Foso de Fluidos',
      specialty: 'Lubricación y Frenos',
      mechanicId: 'MEC-3'
    },
    {
      id: 'AND-4',
      name: 'Bahía Electrónica',
      specialty: 'Eléctrico y Diagnóstico',
      mechanicId: 'MEC-2'
    }
  ]);

  const [mechanics, setMechanics] = useState(mockMechanics);

  // Game Master / Scenario States
  const [teacherScenarios, setTeacherScenarios] = useState({
    supplierStrike: false, // delays SUP-QUAL shipments by 3 days
    dollarFluctuation: false, // increases SUP-OEM costs by 15%
    liftOffline: false, // blocks AND-1
    sickMechanic: false // blocks MEC-2
  });

  const [pendingShipments, setPendingShipments] = useState([]);
  const [turnLogs, setTurnLogs] = useState([
    'Taller mecánico inaugurado. Caja inicial: $2,500,000. 15 Órdenes de Trabajo activas listas para procesar.'
  ]);

  // Methods
  const toggleScenario = (key) => {
    setTeacherScenarios((prev) => {
      const val = !prev[key];
      const name =
        key === 'supplierStrike'
          ? 'Huelga de Transportistas'
          : key === 'dollarFluctuation'
            ? 'Alza del Dólar'
            : key === 'liftOffline'
              ? 'Elevador de 2 postes fuera de servicio'
              : 'Carlos Mendoza con licencia médica';

      const scenarioNote = `Docente: Escenario [${name}] ha sido ${val ? 'ACTIVADO' : 'DESACTIVADO'}.`;
      setTurnLogs((logs) => [scenarioNote, ...logs]);
      return { ...prev, [key]: val };
    });
  };

  const injectVipClient = () => {
    // Select a random vehicle
    const randomVeh = mockVehicles[Math.floor(Math.random() * mockVehicles.length)];
    const newVipOT = {
      id: `OT-VIP-${Date.now().toString().slice(-4)}`,
      vehicleId: randomVeh.id,
      clientName: randomVeh.owner + ' (VIP)',
      vehicleLabel: `${randomVeh.brand} ${randomVeh.model} (${randomVeh.plate})`,
      description:
        'VIP: Revisión urgente de motor, emisión de gases e inyección electrónica. Vehículo corporativo.',
      status: 'Presupuesto',
      andenId: null,
      mechanicId: null,
      partsRequired: [
        {
          sku: 'SKU-1077',
          name: 'Filtro de aceite sintético (Universal)',
          qty: 1,
          cost: 5000,
          price: 7500,
          status: 'Pendiente'
        },
        {
          sku: 'SKU-1120',
          name: 'Sensor de oxígeno O2 (Universal)',
          qty: 1,
          cost: 35000,
          price: 52500,
          status: 'Pendiente'
        }
      ],
      budgetApproved: false,
      laborHoursTarget: 2.5,
      laborHoursReal: 0,
      laborCostPerHour: 15000,
      laborPricePerHour: 25000,
      entryDate: `Día ${currentDay}`,
      dueDate: `Día ${currentDay}`, // Immediate
      notes: 'Prioridad Crítica: Entrega requerida el mismo día de aprobación.',
      urgency: 'Crítica'
    };

    setActiveOTs((prev) => [newVipOT, ...prev]);
    setTurnLogs((prev) => [
      `🚀 EVENTO VIP: Se inyectó la orden ${newVipOT.id} para el cliente VIP ${newVipOT.clientName}.`,
      ...prev
    ]);
    setCurrentTab('orders');
  };

  const approveOTBudget = (otId) => {
    setActiveOTs((prevOTs) =>
      prevOTs.map((ot) => {
        if (ot.id === otId) {
          // Check if all parts are already 'Disponible' (or if there are no parts required)
          const allAvailable = ot.partsRequired.every((p) => p.status === 'Disponible');

          let nextStatus = 'EsperandoRepuestos';
          let note =
            'Presupuesto aprobado por cliente. Esperando que se compren/entreguen los repuestos.';

          if (allAvailable) {
            // Find if there's a free anden suitable for it
            const matchedBay = bays.find((b) =>
              b.specialty.includes(ot.description.includes('Alineación') ? 'Alineación' : '')
            );
            if (
              matchedBay &&
              !activeOTs.some((o) => o.andenId === matchedBay.id && o.status === 'EnEjecucion')
            ) {
              nextStatus = 'EnEjecucion';
              ot.andenId = matchedBay.id;
              ot.mechanicId = matchedBay.mechanicId;
              note = `Presupuesto aprobado. Asignado automáticamente a ${matchedBay.name}.`;
            } else {
              note = 'Presupuesto aprobado. Esperando asignación manual de andén de trabajo libre.';
            }
          }

          setTurnLogs((logs) => [
            `📋 OT APROBADA: Presupuesto de ${ot.id} aprobado. Estado cambiado a [${nextStatus === 'EnEjecucion' ? 'En Proceso' : 'Espera de Repuestos'}].`,
            ...logs
          ]);

          return {
            ...ot,
            budgetApproved: true,
            status: nextStatus,
            notes: note
          };
        }
        return ot;
      })
    );
  };

  const assignOTToBay = (otId, bayId) => {
    const bay = bays.find((b) => b.id === bayId);
    if (!bay) return;

    setActiveOTs((prevOTs) =>
      prevOTs.map((ot) => {
        if (ot.id === otId) {
          return {
            ...ot,
            andenId: bayId,
            mechanicId: bay.mechanicId,
            status: 'EnEjecucion',
            notes: `Asignado a ${bay.name}. Mecánico trabajando.`
          };
        }
        return ot;
      })
    );

    setTurnLogs((logs) => [`🔧 ASIGNACIÓN: Orden ${otId} asignada al andén ${bay.name}.`, ...logs]);
  };

  const assignMechanicToBay = (bayId, mechanicId) => {
    setBays((prevBays) =>
      prevBays.map((b) => {
        if (b.id === bayId) {
          return { ...b, mechanicId };
        }
        return b;
      })
    );

    // Also update any OT currently executing in this bay
    setActiveOTs((prevOTs) =>
      prevOTs.map((ot) => {
        if (ot.andenId === bayId && ot.status === 'EnEjecucion') {
          return { ...ot, mechanicId };
        }
        return ot;
      })
    );
  };

  const purchasePartsFromSupplier = (partSku, qty, supplierId, associatedOtId = null) => {
    const part = parts.find((p) => p.sku === partSku);
    const supplier = mockSuppliers.find((s) => s.id === supplierId);
    if (!part || !supplier) return;

    // Check strike delay
    const isStrike = teacherScenarios.supplierStrike && supplierId === 'SUP-QUAL';
    const isDollarHigh = teacherScenarios.dollarFluctuation && supplierId === 'SUP-OEM';

    const finalSla = isStrike ? supplier.sla + 3 : supplier.sla;
    const finalCostMult = isDollarHigh ? supplier.costMultiplier + 0.15 : supplier.costMultiplier;

    const unitCost = Math.round(part.cost * finalCostMult);
    const totalCost = unitCost * qty;

    // Deduct cash
    setCash((prev) => prev - totalCost);

    // Increase virtual stock
    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.sku === partSku) {
          return { ...p, stockVirtual: p.stockVirtual + qty };
        }
        return p;
      })
    );

    // Register shipment
    const newShipment = {
      id: `SHP-${Date.now().toString().slice(-4)}`,
      partSku,
      qty,
      supplierId,
      cost: unitCost,
      eta: finalSla,
      associatedOtId
    };

    setPendingShipments((prev) => [...prev, newShipment]);

    // Update OT part status to 'Pedido'
    if (associatedOtId) {
      setActiveOTs((prevOTs) =>
        prevOTs.map((ot) => {
          if (ot.id === associatedOtId) {
            return {
              ...ot,
              notes: `Adquisición de repuesto solicitada a ${supplier.name} (ETA: ${finalSla === 0.1 ? '2h' : `${finalSla} turnos`}).`,
              partsRequired: ot.partsRequired.map((pr) => {
                if (pr.sku === partSku) {
                  return { ...pr, status: 'Pedido', supplierId, eta: finalSla };
                }
                return pr;
              })
            };
          }
          return ot;
        })
      );
    }

    const buyNote = `🛒 COMPRA: Adquiridas ${qty} unidades de ${part.name} a ${supplier.name} por $${totalCost.toLocaleString()}.`;
    setTurnLogs((logs) => [buyNote, ...logs]);
  };

  const completeWorkOnBay = (bayId) => {
    // Change OT status to 'Listo'
    setActiveOTs((prevOTs) =>
      prevOTs.map((ot) => {
        if (ot.andenId === bayId && ot.status === 'EnEjecucion') {
          return {
            ...ot,
            status: 'Listo',
            notes: 'Trabajo terminado en andén. Listo para cobro de factura y entrega.'
          };
        }
        return ot;
      })
    );
  };

  const deliverOTToClient = (otId) => {
    const ot = activeOTs.find((o) => o.id === otId);
    if (!ot) return;

    // Calculate finances
    const partsCost = ot.partsRequired.reduce((acc, p) => acc + p.cost * p.qty, 0);
    const partsPrice = ot.partsRequired.reduce((acc, p) => acc + p.price * p.qty, 0);
    const laborPrice = ot.laborHoursTarget * ot.laborPricePerHour;
    const laborCost = ot.laborHoursReal * ot.laborCostPerHour;

    const totalRevenue = partsPrice + laborPrice;
    const totalCost = partsCost + laborCost;
    const margin = totalRevenue - totalCost;

    // Add revenue to cash
    setCash((prev) => prev + totalRevenue);

    // Calculate customer satisfaction
    // base satisfaction is 92%. Deduct 10% per day late.
    const entryDay = parseInt(ot.entryDate.replace('Día ', '')) || 1;
    const dueDay = parseInt(ot.dueDate.replace('Día ', '')) || 2;
    const daysLate = Math.max(0, currentDay - dueDay);

    let otSatisfaction = 95 - daysLate * 15;
    otSatisfaction = Math.max(45, Math.min(100, otSatisfaction));

    // Rolling average for global satisfaction
    setSatisfaction((prev) => prev * 0.9 + otSatisfaction * 0.1);

    // Create closed history record
    const closedLog = {
      id: ot.id,
      vehicleId: ot.vehicleId,
      clientName: ot.clientName,
      vehicleLabel: ot.vehicleLabel,
      description: ot.description,
      status: 'Listo',
      andenId: ot.andenId || 'N/A',
      mechanicId: ot.mechanicId || 'N/A',
      partsRequired: ot.partsRequired,
      budgetApproved: true,
      laborHoursTarget: ot.laborHoursTarget,
      laborHoursReal: ot.laborHoursReal,
      laborCost,
      laborPrice,
      totalCost,
      totalPrice: totalRevenue,
      margin,
      entryDate: ot.entryDate,
      dueDate: ot.dueDate,
      closedDate: `Día ${currentDay}`,
      satisfaction: Math.round(otSatisfaction),
      notes: ot.notes
    };

    setHistoricalLogs((prev) => [closedLog, ...prev]);

    // Remove from active OTs list
    setActiveOTs((prev) => prev.filter((o) => o.id !== otId));

    const deliverNote = `🏁 ENTREGA: Vehículo de ${ot.clientName} entregado. Cobro: +$${totalRevenue.toLocaleString()} (Utilidad: +$${margin.toLocaleString()}). Satisfacción: ${Math.round(otSatisfaction)}%.`;
    setTurnLogs((logs) => [deliverNote, ...logs]);
  };

  const advanceTurn = () => {
    const nextDay = currentDay + 1;
    setCurrentDay(nextDay);

    // 1. operational costs deduction
    const fixedRent = 30000;

    // wages
    const wages = mechanics.reduce((acc, m) => {
      const isSick = teacherScenarios.sickMechanic && m.id === 'MEC-2';
      return acc + (isSick ? 0 : m.costPerDay);
    }, 0);

    // storage fee
    const storageFees = parts.reduce((acc, p) => acc + p.stockFisico * 100, 0);

    const totalOperationalCost = fixedRent + wages + storageFees;
    setCash((prev) => prev - totalOperationalCost);

    const costNote = `⏰ DÍA ${nextDay}: Costos operativos del Día ${currentDay} cobrados (-$${totalOperationalCost.toLocaleString()}). Alquiler: $30k, Sueldos: $${wages.toLocaleString()}, Bodegaje: $${storageFees.toLocaleString()}`;
    setTurnLogs((prev) => [costNote, ...prev]);

    // 2. process pending shipments
    setPendingShipments((prevShipments) => {
      const remaining = [];
      const arrivedGroup = {};

      prevShipments.forEach((shipment) => {
        const updatedEta = shipment.eta - 1;

        if (updatedEta <= 0) {
          // Shipment arrived
          const supplier = mockSuppliers.find((s) => s.id === shipment.supplierId);
          const rand = Math.random();
          const failed = rand > supplier.reliability;

          if (failed) {
            // Defective parts!
            setSatisfaction((s) => Math.max(40, s - 6));
            const refund = Math.round(shipment.cost * 0.4 * shipment.qty);
            setCash((c) => c + refund);

            const failNote = `🚨 CONTROLES DE CALIDAD RECHAZADOS: Envío de ${supplier.name} venía fallado. Reembolso: $${refund.toLocaleString()}. Repuestos rechazados y devueltos.`;
            setTurnLogs((prev) => [failNote, ...prev]);

            // Clear virtual stock
            setParts((prevParts) =>
              prevParts.map((p) => {
                if (p.sku === shipment.partSku) {
                  return { ...p, stockVirtual: Math.max(0, p.stockVirtual - shipment.qty) };
                }
                return p;
              })
            );

            // Mark part as pending in OT so they must reorder
            if (shipment.associatedOtId) {
              setActiveOTs((prevOTs) =>
                prevOTs.map((ot) => {
                  if (ot.id === shipment.associatedOtId) {
                    return {
                      ...ot,
                      status: 'EsperandoRepuestos',
                      notes: `🚨 Repuesto de ${supplier.name} rechazado por fallas de control. Adquirir de nuevo.`,
                      partsRequired: ot.partsRequired.map((pr) => {
                        if (pr.sku === shipment.partSku) {
                          return { ...pr, status: 'Pendiente' };
                        }
                        return pr;
                      })
                    };
                  }
                  return ot;
                })
              );
            }
          } else {
            // Arrived safely
            arrivedGroup[shipment.partSku] = (arrivedGroup[shipment.partSku] || 0) + shipment.qty;

            const arriveNote = `📦 ENTRADA DE STOCK: Recibidos ${shipment.qty}x de ${parts.find((p) => p.sku === shipment.partSku)?.name} de ${supplier.name}.`;
            setTurnLogs((prev) => [arriveNote, ...prev]);

            // Update associated OT parts status
            if (shipment.associatedOtId) {
              setActiveOTs((prevOTs) =>
                prevOTs.map((ot) => {
                  if (ot.id === shipment.associatedOtId) {
                    const updatedParts = ot.partsRequired.map((pr) => {
                      if (pr.sku === shipment.partSku) {
                        return { ...pr, status: 'Disponible' };
                      }
                      return pr;
                    });

                    const allAvailable = updatedParts.every((pr) => pr.status === 'Disponible');
                    let nextStatus = ot.status;

                    if (allAvailable && ot.andenId) {
                      nextStatus = 'EnEjecucion';
                    }

                    return {
                      ...ot,
                      status: nextStatus,
                      partsRequired: updatedParts,
                      notes:
                        nextStatus === 'EnEjecucion'
                          ? 'Repuestos recibidos en andén. Mecánico trabajando.'
                          : 'Repuestos recibidos. Esperando asignación de andén.'
                    };
                  }
                  return ot;
                })
              );
            }
          }
        } else {
          remaining.push({ ...shipment, eta: updatedEta });
        }
      });

      // Update inventory values
      if (Object.keys(arrivedGroup).length > 0) {
        setParts((prevParts) =>
          prevParts.map((p) => {
            if (arrivedGroup[p.sku]) {
              return {
                ...p,
                stockFisico: p.stockFisico + arrivedGroup[p.sku],
                stockVirtual: Math.max(0, p.stockVirtual - arrivedGroup[p.sku])
              };
            }
            return p;
          })
        );
      }

      return remaining;
    });

    // 3. progress active OTs in execution
    setActiveOTs((prevOTs) => {
      return prevOTs.map((ot) => {
        if (ot.status === 'EnEjecucion') {
          const isSickMec = teacherScenarios.sickMechanic && ot.mechanicId === 'MEC-2';
          const isOfflineBay = teacherScenarios.liftOffline && ot.andenId === 'AND-1';

          if (isSickMec) {
            return {
              ...ot,
              notes: '⚠️ Trabajo en pausa: Carlos Mendoza está ausente por licencia médica.'
            };
          }
          if (isOfflineBay) {
            return {
              ...ot,
              notes: '⚠️ Trabajo en pausa: Elevador 2 postes bloqueado por falla de presión.'
            };
          }

          const mechanic = mechanics.find((m) => m.id === ot.mechanicId) || { speed: 1.0 };
          const progress = 1 * mechanic.speed;
          const newHoursReal = ot.laborHoursReal + progress;
          const isDone = newHoursReal >= ot.laborHoursTarget;

          return {
            ...ot,
            laborHoursReal: newHoursReal,
            status: isDone ? 'Listo' : 'EnEjecucion',
            notes: isDone
              ? 'Servicio completado. Estacionado en patio listo para entrega.'
              : `En progreso. Avance: ${Math.round((newHoursReal / ot.laborHoursTarget) * 100)}%`
          };
        }
        return ot;
      });
    });
  };

  return (
    <div className="app-container">
      {/* Background blobs */}
      <div className="bg-ambient-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Header bar */}
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-badge">LABORATORIO DE GESTIÓN Y OPERACIONES</span>
          <h1 className="brand-title">
            <Wrench size={18} style={{ color: 'var(--accent-blue)' }} /> ERP Simulación Taller
            Automotriz
          </h1>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="global-navbar">
          <button
            className={`nav-tab ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-tab ${currentTab === 'orders' ? 'active' : ''}`}
            onClick={() => setCurrentTab('orders')}
          >
            <ClipboardList size={14} />
            <span>Ordenes de Trabajo</span>
          </button>

          <button
            className={`nav-tab ${currentTab === 'workshop' ? 'active' : ''}`}
            onClick={() => setCurrentTab('workshop')}
          >
            <Wrench size={14} />
            <span>Andenes (Taller)</span>
          </button>

          <button
            className={`nav-tab ${currentTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setCurrentTab('inventory')}
          >
            <Package size={14} />
            <span>Bodega Dual</span>
          </button>

          <button
            className={`nav-tab ${currentTab === 'procurement' ? 'active' : ''}`}
            onClick={() => setCurrentTab('procurement')}
          >
            <Truck size={14} />
            <span>Proveedores</span>
          </button>

          <button
            className={`nav-tab ${currentTab === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentTab('history')}
          >
            <FileText size={14} />
            <span>Historial e Informes</span>
          </button>

          <button
            className={`nav-tab ${currentTab === 'teacher' ? 'active' : ''}`}
            onClick={() => setCurrentTab('teacher')}
            style={{
              border: '1px dashed var(--status-inspect)',
              background: currentTab === 'teacher' ? 'rgba(245,158,11,0.1)' : ''
            }}
          >
            <Sliders size={14} />
            <span>Consola Docente</span>
          </button>
        </nav>
      </header>

      {/* Main viewport */}
      <main className="app-main">
        {currentTab === 'dashboard' && (
          <DashboardPanel
            cash={cash}
            satisfaction={satisfaction}
            activeOTs={activeOTs}
            closedOTsCount={historicalLogs.length}
            parts={parts}
            historicalLogs={historicalLogs}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'orders' && (
          <WorkOrdersPanel
            activeOTs={activeOTs}
            approveOTBudget={approveOTBudget}
            deliverOTToClient={deliverOTToClient}
            purchasePartsFromSupplier={purchasePartsFromSupplier}
            suppliers={mockSuppliers}
            cash={cash}
          />
        )}

        {currentTab === 'workshop' && (
          <WorkshopPanel
            bays={bays}
            mechanics={mechanics}
            activeOTs={activeOTs}
            assignOTToBay={assignOTToBay}
            assignMechanicToBay={assignMechanicToBay}
            completeWorkOnBay={completeWorkOnBay}
            teacherScenarios={teacherScenarios}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryPanel
            parts={parts}
            suppliers={mockSuppliers}
            purchasePartsFromSupplier={purchasePartsFromSupplier}
            cash={cash}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'procurement' && (
          <ProcurementPanel suppliers={mockSuppliers} teacherScenarios={teacherScenarios} />
        )}

        {currentTab === 'history' && <HistoryPanel historicalLogs={historicalLogs} />}

        {currentTab === 'teacher' && (
          <TeacherConsole
            teacherScenarios={teacherScenarios}
            toggleScenario={toggleScenario}
            injectVipClient={injectVipClient}
            activeOTs={activeOTs}
          />
        )}
      </main>

      {/* Footer simulation clock */}
      <footer className="sim-clock-bar">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 'bold'
          }}
        >
          <Calendar size={16} color="var(--accent-blue)" />
          <span>Día de Operación: {currentDay}</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Envíos pendientes de entrega: {pendingShipments.length}
          </span>
        </div>

        {/* Turn logs ticker */}
        <div
          style={{
            flex: 1,
            margin: '0 24px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            background: 'rgba(0,0,0,0.03)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-glass)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '500px'
          }}
        >
          📢 <strong>Último Suceso:</strong> {turnLogs[0] || 'Taller operativo.'}
        </div>

        <button
          className="premium-btn active"
          onClick={advanceTurn}
          style={{
            gap: '6px',
            padding: '8px 20px',
            background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-indigo) 100%)',
            border: 'none',
            color: '#ffffff'
          }}
        >
          <Play size={12} fill="#ffffff" /> Avanzar Turno (Siguiente Día)
        </button>
      </footer>
    </div>
  );
}

export default App;
