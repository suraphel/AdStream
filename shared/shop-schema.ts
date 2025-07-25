import { sql } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for business logic
export const shopStatusEnum = pgEnum('shop_status', ['active', 'inactive', 'suspended']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const accountingTypeEnum = pgEnum('accounting_type', ['income', 'expense', 'asset', 'liability', 'equity']);
export const transactionTypeEnum = pgEnum('transaction_type', ['sale', 'purchase', 'expense', 'tax', 'commission', 'refund']);

// Shop/Business table
export const shops = pgTable("shops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull(), // References users.id
  
  // Business information
  businessLicense: varchar("business_license", { length: 100 }),
  tinNumber: varchar("tin_number", { length: 20 }).unique(), // Ethiopian TIN
  vatNumber: varchar("vat_number", { length: 20 }).unique(), // Ethiopian VAT registration
  businessType: varchar("business_type", { length: 100 }), // Sole proprietorship, PLC, etc.
  
  // Contact information
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  
  // Shop settings
  logo: varchar("logo", { length: 500 }),
  bannerImage: varchar("banner_image", { length: 500 }),
  primaryColor: varchar("primary_color", { length: 7 }).default("#3B82F6"),
  customDomain: varchar("custom_domain", { length: 255 }).unique(),
  
  // Status and settings
  status: shopStatusEnum("status").default("active"),
  isPublic: boolean("is_public").default(true),
  allowOrders: boolean("allow_orders").default(true),
  currency: varchar("currency", { length: 3 }).default("ETB"), // Ethiopian Birr
  
  // Subscription and limits
  planType: varchar("plan_type", { length: 50 }).default("basic"), // basic, premium, enterprise
  maxProducts: integer("max_products").default(100),
  maxOrders: integer("max_orders").default(1000),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).default("0.0500"), // 5% default
  
  // Metadata
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("shops_owner_id_idx").on(table.ownerId),
  index("shops_status_idx").on(table.status),
  index("shops_slug_idx").on(table.slug),
]);

// Shop products table
export const shopProducts = pgTable("shop_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: 'cascade' }),
  
  // Product information
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  
  // Pricing (in shop's currency)
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 12, scale: 2 }), // Original price for discounts
  costPrice: decimal("cost_price", { precision: 12, scale: 2 }), // For profit calculation
  
  // Inventory
  sku: varchar("sku", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  stockQuantity: integer("stock_quantity").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  trackInventory: boolean("track_inventory").default(true),
  
  // Product attributes
  weight: decimal("weight", { precision: 8, scale: 3 }), // in kg
  dimensions: jsonb("dimensions"), // {length, width, height}
  category: varchar("category", { length: 100 }),
  tags: text("tags").array(),
  
  // Images and media
  images: text("images").array(),
  featuredImage: varchar("featured_image", { length: 500 }),
  
  // SEO and metadata
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  
  // Status
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  
  // Ethiopian tax information
  vatRate: decimal("vat_rate", { precision: 5, scale: 4 }).default("0.1500"), // 15% VAT in Ethiopia
  exciseTaxRate: decimal("excise_tax_rate", { precision: 5, scale: 4 }).default("0.0000"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("shop_products_shop_id_idx").on(table.shopId),
  index("shop_products_sku_idx").on(table.sku),
  index("shop_products_active_idx").on(table.isActive),
]);

// Customer orders table
export const shopOrders = pgTable("shop_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: 'cascade' }),
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
  
  // Customer information
  customerId: varchar("customer_id"), // References users.id if registered
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  
  // Shipping address
  shippingAddress: jsonb("shipping_address").notNull(), // Full address object
  billingAddress: jsonb("billing_address"), // Billing address if different
  
  // Order totals (in shop's currency)
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  shippingCost: decimal("shipping_cost", { precision: 12, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Status and tracking
  status: orderStatusEnum("status").default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  
  // Payment information
  paymentMethod: varchar("payment_method", { length: 50 }), // telebirr, cash, bank_transfer
  paymentReference: varchar("payment_reference", { length: 100 }),
  paidAt: timestamp("paid_at"),
  
  // Delivery information
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  estimatedDelivery: timestamp("estimated_delivery"),
  
  // Notes and metadata
  customerNotes: text("customer_notes"),
  adminNotes: text("admin_notes"),
  metadata: jsonb("metadata"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("shop_orders_shop_id_idx").on(table.shopId),
  index("shop_orders_customer_id_idx").on(table.customerId),
  index("shop_orders_status_idx").on(table.status),
  index("shop_orders_created_at_idx").on(table.createdAt),
]);

// Order items table
export const shopOrderItems = pgTable("shop_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => shopOrders.id, { onDelete: 'cascade' }),
  productId: varchar("product_id").notNull().references(() => shopProducts.id),
  
  // Product snapshot at time of order
  productName: varchar("product_name", { length: 255 }).notNull(),
  productSku: varchar("product_sku", { length: 100 }),
  productImage: varchar("product_image", { length: 500 }),
  
  // Pricing and quantity
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  
  // Tax information
  vatRate: decimal("vat_rate", { precision: 5, scale: 4 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 12, scale: 2 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("shop_order_items_order_id_idx").on(table.orderId),
  index("shop_order_items_product_id_idx").on(table.productId),
]);

// Accounting ledger following Ethiopian accounting standards
export const accountingLedger = pgTable("accounting_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: 'cascade' }),
  
  // Transaction details
  transactionId: varchar("transaction_id").notNull(), // Reference to order, expense, etc.
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  
  // Accounting information
  accountType: accountingTypeEnum("account_type").notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountCode: varchar("account_code", { length: 20 }), // Chart of accounts code
  
  // Double-entry bookkeeping
  debitAmount: decimal("debit_amount", { precision: 12, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 12, scale: 2 }).default("0.00"),
  
  // Ethiopian tax compliance
  vatAmount: decimal("vat_amount", { precision: 12, scale: 2 }).default("0.00"),
  withholdingTax: decimal("withholding_tax", { precision: 12, scale: 2 }).default("0.00"),
  exciseTax: decimal("excise_tax", { precision: 12, scale: 2 }).default("0.00"),
  
  // Description and references
  description: text("description").notNull(),
  reference: varchar("reference", { length: 100 }),
  
  // Ethiopian fiscal year (July 1 - June 30)
  fiscalYear: varchar("fiscal_year", { length: 9 }).notNull(), // e.g., "2023-2024"
  fiscalPeriod: integer("fiscal_period").notNull(), // 1-12 (July=1, June=12)
  
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").notNull(), // User who created the entry
}, (table) => [
  index("accounting_ledger_shop_id_idx").on(table.shopId),
  index("accounting_ledger_transaction_id_idx").on(table.transactionId),
  index("accounting_ledger_fiscal_year_idx").on(table.fiscalYear),
  index("accounting_ledger_account_type_idx").on(table.accountType),
]);

// Shop analytics and reports
export const shopAnalytics = pgTable("shop_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: 'cascade' }),
  
  // Date and period
  recordDate: timestamp("record_date").notNull(),
  periodType: varchar("period_type", { length: 20 }).notNull(), // daily, weekly, monthly, yearly
  
  // Sales metrics
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).default("0.00"),
  totalOrders: integer("total_orders").default(0),
  averageOrderValue: decimal("average_order_value", { precision: 12, scale: 2 }).default("0.00"),
  
  // Tax collected (Ethiopian compliance)
  vatCollected: decimal("vat_collected", { precision: 12, scale: 2 }).default("0.00"),
  exciseTaxCollected: decimal("excise_tax_collected", { precision: 12, scale: 2 }).default("0.00"),
  withholdingTaxPaid: decimal("withholding_tax_paid", { precision: 12, scale: 2 }).default("0.00"),
  
  // Profit metrics
  grossProfit: decimal("gross_profit", { precision: 12, scale: 2 }).default("0.00"),
  netProfit: decimal("net_profit", { precision: 12, scale: 2 }).default("0.00"),
  
  // Customer metrics
  newCustomers: integer("new_customers").default(0),
  returningCustomers: integer("returning_customers").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("shop_analytics_shop_id_idx").on(table.shopId),
  index("shop_analytics_record_date_idx").on(table.recordDate),
  index("shop_analytics_period_type_idx").on(table.periodType),
]);

// Type exports
export type Shop = typeof shops.$inferSelect;
export type InsertShop = typeof shops.$inferInsert;
export type ShopProduct = typeof shopProducts.$inferSelect;
export type InsertShopProduct = typeof shopProducts.$inferInsert;
export type ShopOrder = typeof shopOrders.$inferSelect;
export type InsertShopOrder = typeof shopOrders.$inferInsert;
export type ShopOrderItem = typeof shopOrderItems.$inferSelect;
export type InsertShopOrderItem = typeof shopOrderItems.$inferInsert;
export type AccountingEntry = typeof accountingLedger.$inferSelect;
export type InsertAccountingEntry = typeof accountingLedger.$inferInsert;
export type ShopAnalytics = typeof shopAnalytics.$inferSelect;
export type InsertShopAnalytics = typeof shopAnalytics.$inferInsert;

// Zod schemas for validation
export const insertShopSchema = createInsertSchema(shops);
export const insertShopProductSchema = createInsertSchema(shopProducts);
export const insertShopOrderSchema = createInsertSchema(shopOrders);
export const insertShopOrderItemSchema = createInsertSchema(shopOrderItems);
export const insertAccountingEntrySchema = createInsertSchema(accountingLedger);
export const insertShopAnalyticsSchema = createInsertSchema(shopAnalytics);

// Custom validation schemas
export const shopRegistrationSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters"),
  slug: z.string().min(3, "Shop slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  businessLicense: z.string().optional(),
  tinNumber: z.string().regex(/^[0-9]{10}$/, "TIN must be 10 digits").optional(),
  vatNumber: z.string().regex(/^[0-9]{10}$/, "VAT number must be 10 digits").optional(),
  businessType: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City name required"),
  region: z.string().min(2, "Region name required"),
});

export const productCreationSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Price must be a positive number"),
  stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative"),
  category: z.string().optional(),
  sku: z.string().optional(),
  vatRate: z.string().optional().default("0.15"), // 15% VAT default
});

export const orderCreationSchema = z.object({
  customerName: z.string().min(2, "Customer name required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  shippingAddress: z.object({
    street: z.string().min(5, "Street address required"),
    city: z.string().min(2, "City required"),
    region: z.string().min(2, "Region required"),
    postalCode: z.string().optional(),
  }),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
  })).min(1, "At least one item required"),
});