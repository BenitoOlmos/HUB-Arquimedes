import prisma from './prisma';

let studentWebhookUrl: string | null = null;

// Evaluation statistics tracked in memory per simulation session
let totalLegitimatePassed = 0;
let totalLegitimateBlocked = 0; // False Positives (Friction)
let totalFraudPassed = 0;       // False Negatives (Direct losses)
let totalFraudBlocked = 0;      // True Positives (Good ML classification)

export class FintechService {

  getWebhookUrl() {
    return studentWebhookUrl;
  }

  setWebhookUrl(url: string | null) {
    studentWebhookUrl = url;
    return { success: true, url: studentWebhookUrl };
  }

  // Get in-memory evaluation stats
  getEvaluationStats() {
    const totalLegitimate = totalLegitimatePassed + totalLegitimateBlocked;
    const totalFraud = totalFraudPassed + totalFraudBlocked;

    const fpRate = totalLegitimate > 0 ? (totalLegitimateBlocked / totalLegitimate) * 100 : 0;
    const fnRate = totalFraud > 0 ? (totalFraudPassed / totalFraud) * 100 : 0;
    const accuracy = (totalLegitimate + totalFraud) > 0 
      ? ((totalLegitimatePassed + totalFraudBlocked) / (totalLegitimate + totalFraud)) * 100 
      : 100;

    return {
      falsePositives: totalLegitimateBlocked,
      falseNegatives: totalFraudPassed,
      truePositives: totalFraudBlocked,
      trueNegatives: totalLegitimatePassed,
      falsePositiveRate: parseFloat(fpRate.toFixed(1)),
      falseNegativeRate: parseFloat(fnRate.toFixed(1)),
      accuracy: parseFloat(accuracy.toFixed(1)),
      directLossesUSD: totalFraudPassed * 4500, // Average fraud loss
      frictionLossesUSD: totalLegitimateBlocked * 150 // Penalty fee per legit client blocked
    };
  }

  async getAccounts() {
    return prisma.finAccount.findMany({
      orderBy: { accountNumber: 'asc' }
    });
  }

  async getTransactions(limit = 50) {
    return prisma.finTransaction.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        sender: true,
        receiver: true
      }
    });
  }

  async getAlerts() {
    return prisma.amlAlert.findMany({
      where: { resolved: false },
      orderBy: { id: 'desc' }
    });
  }

  async resolveAlert(id: string) {
    return prisma.amlAlert.update({
      where: { id },
      data: { resolved: true }
    });
  }

  async toggleAccountFreeze(id: string, isFrozen: boolean) {
    return prisma.finAccount.update({
      where: { id },
      data: { isFrozen }
    });
  }

  async resetSimulation() {
    totalLegitimatePassed = 0;
    totalLegitimateBlocked = 0;
    totalFraudPassed = 0;
    totalFraudBlocked = 0;
    studentWebhookUrl = null;

    // Reset account balances to default
    await prisma.finAccount.updateMany({
      data: { isFrozen: false }
    });
  }

  // Execute Core Bank Transfer
  async executeTransaction(data: {
    senderId: string;
    receiverId: string;
    amount: number;
    ipAddress: string;
    deviceFingerprint?: string;
    isFraud: boolean;
  }) {
    const sender = await prisma.finAccount.findUnique({ where: { id: data.senderId } });
    const receiver = await prisma.finAccount.findUnique({ where: { id: data.receiverId } });

    if (!sender || !receiver) {
      throw new Error("Sender or Receiver account not found");
    }

    if (sender.isFrozen) {
      throw new Error(`Transaction blocked: Sender account ${sender.accountNumber} is frozen.`);
    }

    if (receiver.isFrozen) {
      throw new Error(`Transaction blocked: Receiver account ${receiver.accountNumber} is frozen.`);
    }

    if (sender.balance.toNumber() < data.amount) {
      throw new Error(`Transaction failed: Insufficient funds in account ${sender.accountNumber}.`);
    }

    // 1. Evaluate baseline AML Rules
    // Rule A: Amount >= $10,000 or close boundary ($9,990 USD)
    const isLendingLimit = data.amount >= 9900;
    // Rule B: Darkweb Tor exit nodes (mock IPs starting with 192.42 or 85.204)
    const isDarkWeb = data.ipAddress.startsWith("192.42") || data.ipAddress.startsWith("85.204");
    
    const isFlagged = isLendingLimit || isDarkWeb;

    // 2. Query Student Python/FastAPI ML model if active
    let blockedByStudent = false;

    if (studentWebhookUrl) {
      try {
        const payload = {
          senderAccount: sender.accountNumber,
          receiverAccount: receiver.accountNumber,
          amount: data.amount,
          ipAddress: data.ipAddress,
          deviceFingerprint: data.deviceFingerprint || "unknown",
          senderRiskScore: sender.riskScore
        };

        const response = await fetch(studentWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = (await response.json()) as any;
          // Student response: { block: true } or { isFraud: true }
          if (result && (result.block === true || result.isFraud === true)) {
            blockedByStudent = true;
          }
        }
      } catch (err: any) {
        console.warn("Student Webhook failed to respond. Defaulting to standard AML checks:", err?.message || err);
      }
    }

    // 3. Register Gamification results
    if (blockedByStudent) {
      if (data.isFraud) {
        totalFraudBlocked += 1; // True Positive
      } else {
        totalLegitimateBlocked += 1; // False Positive (friction penalty)
      }
      throw new Error("Transacción bloqueada por el Optimizador de Riesgos de Inteligencia Artificial (ML).");
    } else {
      if (data.isFraud) {
        totalFraudPassed += 1; // False Negative (fraud loss)
      } else {
        totalLegitimatePassed += 1; // True Negative
      }
    }

    // 4. Update balances inside transaction
    await prisma.$transaction([
      prisma.finAccount.update({
        where: { id: sender.id },
        data: { balance: { decrement: data.amount } }
      }),
      prisma.finAccount.update({
        where: { id: receiver.id },
        data: { balance: { increment: data.amount } }
      }),
      prisma.finTransaction.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          amount: data.amount,
          ipAddress: data.ipAddress,
          deviceFingerprint: data.deviceFingerprint,
          isFlagged,
          isFraud: data.isFraud
        }
      })
    ]);

    // Retrieve the created transaction to return
    const tx = await prisma.finTransaction.findFirst({
      where: { senderId: sender.id, receiverId: receiver.id },
      orderBy: { timestamp: 'desc' }
    });

    if (tx && isFlagged) {
      // Create AML alert
      await prisma.amlAlert.create({
        data: {
          transactionId: tx.id,
          ruleTriggered: isLendingLimit ? "LIMITE_DETECTOR_UAF" : "IP_CONEXION_DARKWEB",
          severity: isLendingLimit ? "HIGH" : "CRITICAL",
          resolved: false
        }
      });
    }

    return tx;
  }

  // Simulation step: generates 1 random transaction
  async runSimulationStep() {
    const accounts = await this.getAccounts();
    if (accounts.length < 2) return;

    // Pick random sender and receiver
    const senderIdx = Math.floor(Math.random() * accounts.length);
    let receiverIdx = Math.floor(Math.random() * accounts.length);
    while (senderIdx === receiverIdx) {
      receiverIdx = Math.floor(Math.random() * accounts.length);
    }

    const sender = accounts[senderIdx];
    const receiver = accounts[receiverIdx];

    if (sender.isFrozen || receiver.isFrozen) return;

    // Determine if fraud (10% chance)
    const isFraud = Math.random() < 0.12;
    let amount = 10 + Math.random() * 500;
    let ipAddress = `190.160.${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 255)}`;
    let deviceFingerprint = `fp-user-${Math.floor(Math.random() * 900000)}`;

    if (isFraud) {
      // 3 Fraud Templates
      const choice = Math.random();
      if (choice < 0.35) {
        // Template A: Carding Velocity
        amount = 12.50 + Math.random() * 5;
        ipAddress = "192.42.116.89"; // Dark web
        deviceFingerprint = "fp-carder-bot";
      } else if (choice < 0.7) {
        // Template B: Smurfing transfer boundary
        amount = 9990.00;
        ipAddress = "85.204.116.12"; // Tor exit
        deviceFingerprint = "fp-smurf-device";
      } else {
        // Template C: Large transfer mismatch
        amount = 15000.00 + Math.random() * 10000;
        ipAddress = "192.42.116.5";
        deviceFingerprint = "fp-layering-layer";
      }
    }

    // Only transact if sender has sufficient balance
    if (sender.balance.toNumber() >= amount) {
      try {
        await this.executeTransaction({
          senderId: sender.id,
          receiverId: receiver.id,
          amount,
          ipAddress,
          deviceFingerprint,
          isFraud
        });
      } catch (err) {
        // Caught if blocked by model or frozen
        // console.log("Sim Transaction blocked:", err.message);
      }
    }
  }
}
