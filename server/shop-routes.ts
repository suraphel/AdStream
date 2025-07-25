import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, asc, sum, count, gte, lte } from 'drizzle-orm';
import { isAuthenticated } from './replitAuth';
import { db } from './db';
import {
  shops,
  shopProducts,
  shopOrders,
  shopOrderItems,
  accountingLedger,
  shopAnalytics,
  insertShopSchema,
  insertShopProductSchema,
  insertShopOrderSchema,
  insertShopOrderItemSchema,
  insertAccountingEntrySchema,
  shopRegistrationSchema,
  productCreationSchema,
  orderCreationSchema,
  type Shop,
  type ShopProduct,
  type ShopOrder,
} from '@shared/shop-schema';

const router = Router();

// Ethiopian fiscal year helper (July 1 - June 30)
function getCurrentFiscalYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  if (now.getMonth() >= 6) { // July (6) to December (11)
    return `${year}-${year + 1}`;
  } else { // January (0) to June (5)
    return `${year - 1}-${year}`;
  }
}

function getFiscalPeriod(): number {
  const now = new Date();
  const month = now.getMonth();
  // July = 1, August = 2, ..., June = 12
  return month >= 6 ? month - 5 : month + 7;
}

// Generate unique order number
function generateOrderNumber(shopId: string): string {
  const timestamp = Date.now().toString().slice(-8);
  const shopPrefix = shopId.slice(0, 3).toUpperCase();
  return `${shopPrefix}-${timestamp}`;
}

// Shop management routes
router.post('/api/shops', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const shopData = shopRegistrationSchema.parse(req.body);
    
    // Check if user already has a shop
    const existingShop = await db.select().from(shops).where(eq(shops.ownerId, userId)).limit(1);
    if (existingShop.length > 0) {
      return res.status(400).json({ message: "You already have a shop registered" });
    }
    
    // Check if slug is available
    const slugExists = await db.select().from(shops).where(eq(shops.slug, shopData.slug)).limit(1);
    if (slugExists.length > 0) {
      return res.status(400).json({ message: "Shop URL is already taken" });
    }
    
    const shop = await db.insert(shops).values({
      ...shopData,
      ownerId: userId,
    }).returning();
    
    res.status(201).json(shop[0]);
  } catch (error) {
    console.error("Error creating shop:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid shop data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create shop" });
  }
});

router.get('/api/shops/my-shop', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const shop = await db.select().from(shops).where(eq(shops.ownerId, userId)).limit(1);
    
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found" });
    }
    
    res.json(shop[0]);
  } catch (error) {
    console.error("Error fetching shop:", error);
    res.status(500).json({ message: "Failed to fetch shop" });
  }
});

router.put('/api/shops/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const shopId = req.params.id;
    const updates = insertShopSchema.partial().parse(req.body);
    
    // Verify ownership
    const shop = await db.select().from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.ownerId, userId)))
      .limit(1);
    
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found or not authorized" });
    }
    
    const updatedShop = await db.update(shops)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(shops.id, shopId))
      .returning();
    
    res.json(updatedShop[0]);
  } catch (error) {
    console.error("Error updating shop:", error);
    res.status(500).json({ message: "Failed to update shop" });
  }
});

// Public shop access
router.get('/api/shops/:slug/public', async (req, res) => {
  try {
    const slug = req.params.slug;
    const shop = await db.select().from(shops)
      .where(and(eq(shops.slug, slug), eq(shops.isPublic, true), eq(shops.status, 'active')))
      .limit(1);
    
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found or not public" });
    }
    
    res.json(shop[0]);
  } catch (error) {
    console.error("Error fetching public shop:", error);
    res.status(500).json({ message: "Failed to fetch shop" });
  }
});

// Product management routes
router.post('/api/shops/:shopId/products', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const shopId = req.params.shopId;
    const productData = productCreationSchema.parse(req.body);
    
    // Verify shop ownership
    const shop = await db.select().from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.ownerId, userId)))
      .limit(1);
    
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found or not authorized" });
    }
    
    // Generate slug from product name
    const slug = productData.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const product = await db.insert(shopProducts).values({
      shopId,
      ...productData,
      slug: `${slug}-${Date.now()}`,
      price: productData.price,
    }).returning();
    
    res.status(201).json(product[0]);
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid product data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create product" });
  }
});

router.get('/api/shops/:shopId/products', async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const { page = '1', limit = '20', category, active = 'true' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let conditions = [eq(shopProducts.shopId, shopId)];
    
    if (active === 'true') {
      conditions.push(eq(shopProducts.isActive, true));
    }
    
    if (category) {
      conditions.push(eq(shopProducts.category, category as string));
    }
    
    const products = await db.select().from(shopProducts)
      .where(and(...conditions))
      .orderBy(desc(shopProducts.createdAt))
      .limit(limitNum)
      .offset(offset);
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.put('/api/shops/:shopId/products/:productId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { shopId, productId } = req.params;
    const updates = productCreationSchema.partial().parse(req.body);
    
    // Verify shop ownership
    const shop = await db.select().from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.ownerId, userId)))
      .limit(1);
    
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found or not authorized" });
    }
    
    const updatedProduct = await db.update(shopProducts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(shopProducts.id, productId))
      .returning();
    
    if (updatedProduct.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(updatedProduct[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// Order management routes
router.post('/api/shops/:shopId/orders', async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const orderData = orderCreationSchema.parse(req.body);
    
    // Verify shop exists and allows orders
    const shop = await db.select().from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.allowOrders, true), eq(shops.status, 'active')))
      .limit(1);
    
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found or not accepting orders" });
    }
    
    // Calculate order totals
    let subtotal = 0;
    let totalVat = 0;
    const orderItems = [];
    
    for (const item of orderData.items) {
      const product = await db.select().from(shopProducts)
        .where(and(eq(shopProducts.id, item.productId), eq(shopProducts.isActive, true)))
        .limit(1);
      
      if (product.length === 0) {
        return res.status(400).json({ message: `Product ${item.productId} not found or inactive` });
      }
      
      const prod = product[0];
      const itemTotal = parseFloat(prod.price) * item.quantity;
      const vatAmount = itemTotal * parseFloat(prod.vatRate);
      
      subtotal += itemTotal;
      totalVat += vatAmount;
      
      orderItems.push({
        productId: item.productId,
        productName: prod.name,
        productSku: prod.sku || '',
        productImage: prod.featuredImage || '',
        quantity: item.quantity,
        unitPrice: prod.price,
        totalPrice: itemTotal.toFixed(2),
        vatRate: prod.vatRate,
        vatAmount: vatAmount.toFixed(2),
      });
    }
    
    const totalAmount = subtotal + totalVat;
    const orderNumber = generateOrderNumber(shopId);
    
    // Create order
    const order = await db.insert(shopOrders).values({
      shopId,
      orderNumber,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerName: orderData.customerName,
      shippingAddress: orderData.shippingAddress,
      subtotal: subtotal.toFixed(2),
      taxAmount: totalVat.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    }).returning();
    
    // Create order items
    for (const item of orderItems) {
      await db.insert(shopOrderItems).values({
        orderId: order[0].id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        vatRate: item.vatRate,
        vatAmount: item.vatAmount,
      });
    }
    
    // Create accounting entries for the sale
    const fiscalYear = getCurrentFiscalYear();
    const fiscalPeriod = getFiscalPeriod();
    
    // Sales revenue (Credit)
    await db.insert(accountingLedger).values({
      shopId,
      transactionId: order[0].id,
      transactionType: 'sale',
      transactionDate: new Date(),
      accountType: 'income',
      accountName: 'Sales Revenue',
      accountCode: '4100',
      debitAmount: '0.00',
      creditAmount: subtotal.toFixed(2),
      description: `Sale - Order ${orderNumber}`,
      reference: orderNumber,
      fiscalYear,
      fiscalPeriod,
      createdBy: 'system',
    });
    
    // VAT liability (Credit)
    if (totalVat > 0) {
      await db.insert(accountingLedger).values({
        shopId,
        transactionId: order[0].id,
        transactionType: 'sale',
        transactionDate: new Date(),
        accountType: 'liability',
        accountName: 'VAT Payable',
        accountCode: '2300',
        debitAmount: '0.00',
        creditAmount: totalVat.toFixed(2),
        vatAmount: totalVat.toFixed(2),
        description: `VAT collected - Order ${orderNumber}`,
        reference: orderNumber,
        fiscalYear,
        fiscalPeriod,
        createdBy: 'system',
      });
    }
    
    // Accounts receivable (Debit) - until payment
    await db.insert(accountingLedger).values({
      shopId,
      transactionId: order[0].id,
      transactionType: 'sale',
      transactionDate: new Date(),
      accountType: 'asset',
      accountName: 'Accounts Receivable',
      accountCode: '1200',
      debitAmount: totalAmount.toFixed(2),
      creditAmount: '0.00',
      description: `Receivable - Order ${orderNumber}`,
      reference: orderNumber,
      fiscalYear,
      fiscalPeriod,
      createdBy: 'system',
    });
    
    res.status(201).json({
      order: order[0],
      items: orderItems,
      totals: {
        subtotal,
        vatAmount: totalVat,
        totalAmount,
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid order data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create order" });
  }
});

router.get('/api/shops/:shopId/orders', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const shopId = req.params.shopId;
    const { page = '1', limit = '20', status } = req.query;
    
    // Verify shop ownership
    const shop = await db.select().from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.ownerId, userId)))
      .limit(1);
    
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found or not authorized" });
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let conditions = [eq(shopOrders.shopId, shopId)];
    if (status) {
      conditions.push(eq(shopOrders.status, status as any));
    }
    
    const orders = await db.select().from(shopOrders)
      .where(and(...conditions))
      .orderBy(desc(shopOrders.createdAt))
      .limit(limitNum)
      .offset(offset);
    
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Accounting and reports routes
router.get('/api/shops/:shopId/accounting/ledger', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const shopId = req.params.shopId;
    const { fiscalYear, startDate, endDate, accountType } = req.query;
    
    // Verify shop ownership
    const shop = await db.select().from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.ownerId, userId)))
      .limit(1);
    
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found or not authorized" });
    }
    
    let conditions = [eq(accountingLedger.shopId, shopId)];
    
    if (fiscalYear) {
      conditions.push(eq(accountingLedger.fiscalYear, fiscalYear as string));
    }
    
    if (startDate && endDate) {
      conditions.push(
        and(
          gte(accountingLedger.transactionDate, new Date(startDate as string)),
          lte(accountingLedger.transactionDate, new Date(endDate as string))
        )!
      );
    }
    
    if (accountType) {
      conditions.push(eq(accountingLedger.accountType, accountType as any));
    }
    
    const ledgerEntries = await db.select().from(accountingLedger)
      .where(and(...conditions))
      .orderBy(desc(accountingLedger.transactionDate));
    
    res.json(ledgerEntries);
  } catch (error) {
    console.error("Error fetching ledger:", error);
    res.status(500).json({ message: "Failed to fetch accounting ledger" });
  }
});

router.get('/api/shops/:shopId/reports/financial-summary', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const shopId = req.params.shopId;
    const { fiscalYear = getCurrentFiscalYear() } = req.query;
    
    // Verify shop ownership
    const shop = await db.select().from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.ownerId, userId)))
      .limit(1);
    
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found or not authorized" });
    }
    
    // Get income summary
    const incomeQuery = await db.select({
      totalIncome: sum(accountingLedger.creditAmount),
    }).from(accountingLedger)
      .where(and(
        eq(accountingLedger.shopId, shopId),
        eq(accountingLedger.fiscalYear, fiscalYear as string),
        eq(accountingLedger.accountType, 'income')
      ));
    
    // Get expense summary
    const expenseQuery = await db.select({
      totalExpenses: sum(accountingLedger.debitAmount),
    }).from(accountingLedger)
      .where(and(
        eq(accountingLedger.shopId, shopId),
        eq(accountingLedger.fiscalYear, fiscalYear as string),
        eq(accountingLedger.accountType, 'expense')
      ));
    
    // Get VAT summary
    const vatQuery = await db.select({
      totalVat: sum(accountingLedger.vatAmount),
    }).from(accountingLedger)
      .where(and(
        eq(accountingLedger.shopId, shopId),
        eq(accountingLedger.fiscalYear, fiscalYear as string)
      ));
    
    // Get order count
    const orderCountQuery = await db.select({
      totalOrders: count(),
    }).from(shopOrders)
      .where(eq(shopOrders.shopId, shopId));
    
    const totalIncome = parseFloat(incomeQuery[0]?.totalIncome || '0');
    const totalExpenses = parseFloat(expenseQuery[0]?.totalExpenses || '0');
    const totalVat = parseFloat(vatQuery[0]?.totalVat || '0');
    const totalOrders = orderCountQuery[0]?.totalOrders || 0;
    
    const netProfit = totalIncome - totalExpenses;
    
    res.json({
      fiscalYear,
      totalIncome,
      totalExpenses,
      netProfit,
      totalVat,
      totalOrders,
      currency: shop[0].currency,
    });
  } catch (error) {
    console.error("Error generating financial summary:", error);
    res.status(500).json({ message: "Failed to generate financial summary" });
  }
});

export { router as shopRoutes };