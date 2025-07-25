import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies table - for tender uploading companies
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  contactPerson: varchar("contact_person", { length: 100 }),
  // Business registration fields
  vatNumber: varchar("vat_number", { length: 50 }).unique(),
  businessLicense: varchar("business_license", { length: 100 }),
  tinNumber: varchar("tin_number", { length: 50 }).unique(), // Tax Identification Number
  registrationNumber: varchar("registration_number", { length: 100 }),
  businessType: varchar("business_type", { length: 100 }), // LLC, Share Company, etc.
  establishedYear: integer("established_year"),
  website: varchar("website", { length: 255 }),
  // Authentication
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false), // Admin verification status
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users table - for document purchasing users
export const tenderUsers = pgTable("tender_users", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  contactPerson: varchar("contact_person", { length: 100 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isPaidUser: boolean("is_paid_user").default(false),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // pending, active, expired
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tender documents table
export const tenderDocuments = pgTable("tender_documents", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  briefDescription: text("brief_description").notNull(), // Visible to all users
  category: varchar("category", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("ETB"),
  companyId: integer("company_id").notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileName: varchar("file_name", { length: 200 }).notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type", { length: 100 }),
  isActive: boolean("is_active").default(true),
  downloadCount: integer("download_count").default(0),
  viewCount: integer("view_count").default(0),
  deadline: timestamp("deadline"),
  uploadDate: timestamp("upload_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tender purchases table
export const tenderPurchases = pgTable("tender_purchases", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("ETB"),
  paymentMethod: varchar("payment_method", { length: 50 }), // stripe, paypal, etc.
  paymentId: varchar("payment_id", { length: 100 }), // External payment reference
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // pending, completed, failed, refunded
  purchaseDate: timestamp("purchase_date").defaultNow(),
  downloadedAt: timestamp("downloaded_at"),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Download logs for security and tracking
export const downloadLogs = pgTable("download_logs", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull(),
  userId: integer("user_id").notNull(),
  purchaseId: integer("purchase_id").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
});

// Email notifications log
export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  recipientEmail: varchar("recipient_email", { length: 100 }).notNull(),
  emailType: varchar("email_type", { length: 50 }).notNull(), // purchase_confirmation, company_notification, etc.
  subject: varchar("subject", { length: 200 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, sent, failed
  relatedId: integer("related_id"), // purchase_id or tender_id
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  tenderDocuments: many(tenderDocuments),
}));

export const tenderUsersRelations = relations(tenderUsers, ({ many }) => ({
  purchases: many(tenderPurchases),
  downloadLogs: many(downloadLogs),
}));

export const tenderDocumentsRelations = relations(tenderDocuments, ({ one, many }) => ({
  company: one(companies, {
    fields: [tenderDocuments.companyId],
    references: [companies.id],
  }),
  purchases: many(tenderPurchases),
  downloadLogs: many(downloadLogs),
}));

export const tenderPurchasesRelations = relations(tenderPurchases, ({ one, many }) => ({
  tender: one(tenderDocuments, {
    fields: [tenderPurchases.tenderId],
    references: [tenderDocuments.id],
  }),
  user: one(tenderUsers, {
    fields: [tenderPurchases.userId],
    references: [tenderUsers.id],
  }),
  downloadLogs: many(downloadLogs),
}));

export const downloadLogsRelations = relations(downloadLogs, ({ one }) => ({
  tender: one(tenderDocuments, {
    fields: [downloadLogs.tenderId],
    references: [tenderDocuments.id],
  }),
  user: one(tenderUsers, {
    fields: [downloadLogs.userId],
    references: [tenderUsers.id],
  }),
  purchase: one(tenderPurchases, {
    fields: [downloadLogs.purchaseId],
    references: [tenderPurchases.id],
  }),
}));

// Insert schemas for validation
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenderUserSchema = createInsertSchema(tenderUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenderDocumentSchema = createInsertSchema(tenderDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  uploadDate: true,
  downloadCount: true,
  viewCount: true,
});

export const insertTenderPurchaseSchema = createInsertSchema(tenderPurchases).omit({
  id: true,
  createdAt: true,
  purchaseDate: true,
});

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type TenderUser = typeof tenderUsers.$inferSelect;
export type InsertTenderUser = z.infer<typeof insertTenderUserSchema>;

export type TenderDocument = typeof tenderDocuments.$inferSelect;
export type InsertTenderDocument = z.infer<typeof insertTenderDocumentSchema>;

export type TenderPurchase = typeof tenderPurchases.$inferSelect;
export type InsertTenderPurchase = z.infer<typeof insertTenderPurchaseSchema>;

export type DownloadLog = typeof downloadLogs.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;