import prisma from './prisma';

let blackFridayActive = false;
let crmRules: any[] = [
  { id: "rule-1", name: "Recuperación Descuento Calzado", condition: "Stock Repuesto < 48h", discount: "10% OFF", active: true }
];

export class RetailService {

  async getProducts() {
    return prisma.retailProduct.findMany({
      include: {
        inventories: true
      }
    });
  }

  async getStoreInventories() {
    const inventories = await prisma.storeInventory.findMany({
      include: {
        product: true
      }
    });
    return inventories.map(inv => ({
      id: inv.id,
      productId: inv.productId,
      sku: inv.product.sku,
      productName: inv.product.name,
      storeType: inv.storeType,
      lat: inv.locationLat,
      lng: inv.locationLng,
      stockLevel: inv.stockLevel
    }));
  }

  // Transfer stock from one node to another (Logistics Dispatch)
  async transferStock(productId: string, fromType: string, toLat: number, toLng: number, qty: number) {
    // Find source inventory
    const source = await prisma.storeInventory.findFirst({
      where: {
        productId,
        storeType: fromType
      }
    });

    // Find destination inventory
    const dest = await prisma.storeInventory.findFirst({
      where: {
        productId,
        locationLat: toLat,
        locationLng: toLng
      }
    });

    if (!source || !dest) {
      throw new Error("Source or Destination inventory not found");
    }

    if (source.stockLevel < qty) {
      throw new Error(`Insufficient stock in source: has ${source.stockLevel}, requested ${qty}`);
    }

    // Execute transfer inside database transaction
    await prisma.$transaction([
      prisma.storeInventory.update({
        where: { id: source.id },
        data: { stockLevel: { decrement: qty } }
      }),
      prisma.storeInventory.update({
        where: { id: dest.id },
        data: { stockLevel: { increment: qty } }
      })
    ]);

    return { success: true, transferred: qty };
  }

  // Get Conversion Funnel KPIs pre-calculated
  async getConversionFunnel() {
    const events = await prisma.retailEvent.findMany();
    
    const pageViews = events.filter(e => e.eventType === "PAGE_VIEW").length;
    const addCarts = events.filter(e => e.eventType === "ADD_TO_CART").length;
    const abandons = events.filter(e => e.eventType === "CART_ABANDONED").length;
    const purchases = events.filter(e => e.eventType === "PURCHASE").length;

    // Calculate CTR and Conversion Rates
    const clickRate = pageViews > 0 ? (addCarts / pageViews) * 100 : 0;
    const conversionRate = pageViews > 0 ? (purchases / pageViews) * 100 : 0;
    const abandonRate = addCarts > 0 ? (abandons / addCarts) * 100 : 0;

    return {
      funnelData: [
        { stage: "1. Vistas", cantidad: pageViews, pct: 100 },
        { stage: "2. Carritos", cantidad: addCarts, pct: parseFloat(clickRate.toFixed(1)) },
        { stage: "3. Compras", cantidad: purchases, pct: parseFloat(conversionRate.toFixed(1)) }
      ],
      kpis: {
        pageViews,
        addCarts,
        abandons,
        purchases,
        ctr: parseFloat(clickRate.toFixed(1)),
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        abandonRate: parseFloat(abandonRate.toFixed(1)),
        lostRevenue: abandons * 79.90 // Average lost sales per abandonment
      }
    };
  }

  // Segment customers
  async getCustomers() {
    const customers = await prisma.retailCustomer.findMany({
      include: {
        orders: true,
        sessions: {
          include: {
            events: true
          }
        }
      }
    });

    return customers.map(c => {
      // Calculate totals
      const ordersCount = c.orders.length;
      let abandonedCount = 0;
      
      c.sessions.forEach(s => {
        abandonedCount += s.events.filter(e => e.eventType === "CART_ABANDONED").length;
      });

      return {
        id: c.id,
        segment: c.segment,
        lifetimeValue: c.lifetimeValue,
        ordersCount,
        abandonedCount
      };
    });
  }

  // Export Events Logs to CSV
  async getEventsLogs() {
    const events = await prisma.retailEvent.findMany({
      include: {
        session: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 200
    });

    const products = await prisma.retailProduct.findMany();
    const productMap = new Map(products.map(p => [p.id, p]));

    return events.map(e => {
      const p = e.productId ? productMap.get(e.productId) : null;
      return {
        id: e.id,
        sessionId: e.sessionId,
        eventType: e.eventType,
        sku: p ? p.sku : "N/A",
        productName: p ? p.name : "N/A",
        price: p ? p.basePrice : 0,
        timestamp: e.timestamp.toISOString()
      };
    });
  }

  // CRM rules management
  getCrmRules() {
    return crmRules;
  }

  addCrmRule(name: string, condition: string, discount: string) {
    const newRule = {
      id: `rule-${Date.now()}`,
      name,
      condition,
      discount,
      active: true
    };
    crmRules.push(newRule);
    return crmRules;
  }

  setBlackFridayActive(active: boolean) {
    blackFridayActive = active;
    return { blackFridayActive };
  }

  getBlackFridayActive() {
    return blackFridayActive;
  }

  // Simulation Cyber monday: generates random traffic events, updates DB & emits sockets
  async runSimulationStep() {
    if (!blackFridayActive) return null;

    const customers = await prisma.retailCustomer.findMany();
    if (customers.length === 0) return null;

    // Pick random customer
    const customer = customers[Math.floor(Math.random() * customers.length)];
    
    // Create session
    const session = await prisma.retailSession.create({
      data: {
        customerId: customer.id,
        device: "Mobile-APP"
      }
    });

    // Pick product (80% chance of trail runner shoes to test stockouts!)
    const products = await prisma.retailProduct.findMany();
    if (products.length === 0) return null;
    
    const shoes = products.find(p => p.sku === "SKU-SHOES-01");
    const product = (shoes && Math.random() < 0.8) ? shoes : products[Math.floor(Math.random() * products.length)];

    // PAGE_VIEW event
    await prisma.retailEvent.create({
      data: {
        sessionId: session.id,
        eventType: "PAGE_VIEW",
        productId: product.id
      }
    });

    // ADD_TO_CART (70% click rate)
    const isAdd = Math.random() < 0.70;
    if (isAdd) {
      await prisma.retailEvent.create({
        data: {
          sessionId: session.id,
          eventType: "ADD_TO_CART",
          productId: product.id
        }
      });

      // CHECK STOCK LEVEL of the product across stores to determine conversion
      const inventories = await prisma.storeInventory.findMany({
        where: { productId: product.id }
      });
      const totalStock = inventories.reduce((acc, curr) => acc + curr.stockLevel, 0);

      // If no stock, trigger immediate CART_ABANDONED (Stockout)
      if (totalStock <= 0) {
        const ev = await prisma.retailEvent.create({
          data: {
            sessionId: session.id,
            eventType: "CART_ABANDONED",
            productId: product.id
          }
        });
        return { event: ev, stockout: true, sku: product.sku };
      }

      // Convert or abandon
      const isPurchase = Math.random() < 0.55; // 55% checkout conversion
      if (isPurchase) {
        // Decrease stock in a store that has stock
        const storeWithStock = inventories.find(i => i.stockLevel > 0);
        if (storeWithStock) {
          await prisma.storeInventory.update({
            where: { id: storeWithStock.id },
            data: { stockLevel: { decrement: 1 } }
          });
        }

        const ev = await prisma.retailEvent.create({
          data: {
            sessionId: session.id,
            eventType: "PURCHASE",
            productId: product.id
          }
        });

        // Add order and LTV
        await prisma.retailOrder.create({
          data: {
            customerId: customer.id,
            totalAmount: product.basePrice,
            status: "COMPLETED"
          }
        });

        await prisma.retailCustomer.update({
          where: { id: customer.id },
          data: { lifetimeValue: { increment: product.basePrice } }
        });

        return { event: ev, stockout: false, sku: product.sku };
      } else {
        const ev = await prisma.retailEvent.create({
          data: {
            sessionId: session.id,
            eventType: "CART_ABANDONED",
            productId: product.id
          }
        });
        return { event: ev, stockout: false, sku: product.sku };
      }
    }

    return null;
  }
}
