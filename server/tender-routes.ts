import type { Express } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from "./db";
import { 
  companies, 
  tenderUsers, 
  tenderDocuments, 
  tenderPurchases, 
  downloadLogs,
  emailLogs,
  type Company,
  type TenderUser,
  type TenderDocument,
  type InsertCompany,
  type InsertTenderUser,
  type InsertTenderDocument,
  type InsertTenderPurchase
} from "@shared/tender-schema";
import { eq, desc, and, sql } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || 'your-tender-jwt-secret';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/tenders';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, ZIP, and RAR files are allowed.'));
    }
  }
});

// Authentication middleware
const authenticateCompany = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const [company] = await db.select().from(companies).where(eq(companies.id, decoded.id));
    
    if (!company) {
      return res.status(401).json({ message: 'Company not found' });
    }

    req.company = company;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authenticateUser = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const [user] = await db.select().from(tenderUsers).where(eq(tenderUsers.id, decoded.id));
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Email service (mock implementation - replace with actual email service)
const sendEmail = async (to: string, subject: string, html: string, type: string, relatedId?: number) => {
  try {
    // Log email attempt
    await db.insert(emailLogs).values({
      recipientEmail: to,
      emailType: type,
      subject,
      status: 'sent',
      relatedId,
      sentAt: new Date(),
    });
    
    console.log(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    await db.insert(emailLogs).values({
      recipientEmail: to,
      emailType: type,
      subject,
      status: 'failed',
      relatedId,
    });
    return false;
  }
};

export function registerTenderRoutes(app: Express) {
  // Public routes - no authentication required
  
  // Get all tender documents (public info only)
  app.get('/api/tenders/public', async (req, res) => {
    try {
      const tenders = await db
        .select({
          id: tenderDocuments.id,
          title: tenderDocuments.title,
          briefDescription: tenderDocuments.briefDescription,
          category: tenderDocuments.category,
          price: tenderDocuments.price,
          currency: tenderDocuments.currency,
          deadline: tenderDocuments.deadline,
          uploadDate: tenderDocuments.uploadDate,
          viewCount: tenderDocuments.viewCount,
          downloadCount: tenderDocuments.downloadCount,
          company: {
            id: companies.id,
            name: companies.name,
          }
        })
        .from(tenderDocuments)
        .innerJoin(companies, eq(tenderDocuments.companyId, companies.id))
        .where(eq(tenderDocuments.isActive, true))
        .orderBy(desc(tenderDocuments.uploadDate));

      res.json(tenders);
    } catch (error) {
      console.error('Error fetching public tenders:', error);
      res.status(500).json({ message: 'Failed to fetch tenders' });
    }
  });

  // Get categories
  app.get('/api/tenders/categories', async (req, res) => {
    try {
      const categories = await db
        .select({ category: tenderDocuments.category })
        .from(tenderDocuments)
        .where(and(
          eq(tenderDocuments.isActive, true),
          sql`${tenderDocuments.category} IS NOT NULL`
        ))
        .groupBy(tenderDocuments.category);

      const categoryList = categories.map(c => c.category).filter(Boolean);
      res.json(categoryList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // Get tender details (public + auth info)
  app.get('/api/tenders/:id', async (req, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      
      const [tender] = await db
        .select({
          id: tenderDocuments.id,
          title: tenderDocuments.title,
          description: tenderDocuments.description,
          briefDescription: tenderDocuments.briefDescription,
          category: tenderDocuments.category,
          price: tenderDocuments.price,
          currency: tenderDocuments.currency,
          deadline: tenderDocuments.deadline,
          uploadDate: tenderDocuments.uploadDate,
          viewCount: tenderDocuments.viewCount,
          downloadCount: tenderDocuments.downloadCount,
          fileName: tenderDocuments.fileName,
          fileSize: tenderDocuments.fileSize,
          company: {
            id: companies.id,
            name: companies.name,
            contactPerson: companies.contactPerson,
          }
        })
        .from(tenderDocuments)
        .innerJoin(companies, eq(tenderDocuments.companyId, companies.id))
        .where(and(
          eq(tenderDocuments.id, tenderId),
          eq(tenderDocuments.isActive, true)
        ));

      if (!tender) {
        return res.status(404).json({ message: 'Tender not found' });
      }

      // Increment view count
      await db
        .update(tenderDocuments)
        .set({ viewCount: sql`${tenderDocuments.viewCount} + 1` })
        .where(eq(tenderDocuments.id, tenderId));

      res.json(tender);
    } catch (error) {
      console.error('Error fetching tender:', error);
      res.status(500).json({ message: 'Failed to fetch tender' });
    }
  });

  // Authentication Routes

  // Company registration
  app.post('/api/tender-auth/register-company', async (req, res) => {
    try {
      const { name, email, phone, address, contactPerson, password } = req.body;

      // Check if company already exists
      const [existingCompany] = await db.select().from(companies).where(eq(companies.email, email));
      if (existingCompany) {
        return res.status(400).json({ message: 'Company with this email already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create company
      const [company] = await db.insert(companies).values({
        name,
        email,
        phone,
        address,
        contactPerson,
        passwordHash,
      }).returning();

      res.status(201).json({ 
        message: 'Company registered successfully', 
        companyId: company.id 
      });
    } catch (error) {
      console.error('Error registering company:', error);
      res.status(500).json({ message: 'Failed to register company' });
    }
  });

  // User registration
  app.post('/api/tender-auth/register-user', async (req, res) => {
    try {
      const { companyName, email, phone, address, contactPerson, password } = req.body;

      // Check if user already exists
      const [existingUser] = await db.select().from(tenderUsers).where(eq(tenderUsers.email, email));
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const [user] = await db.insert(tenderUsers).values({
        companyName,
        email,
        phone,
        address,
        contactPerson,
        passwordHash,
      }).returning();

      res.status(201).json({ 
        message: 'User registered successfully', 
        userId: user.id 
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Failed to register user' });
    }
  });

  // Company login
  app.post('/api/tender-auth/login-company', async (req, res) => {
    try {
      const { email, password } = req.body;

      const [company] = await db.select().from(companies).where(eq(companies.email, email));
      if (!company) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, company.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: company.id, type: 'company' }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
          contactPerson: company.contactPerson,
        }
      });
    } catch (error) {
      console.error('Error logging in company:', error);
      res.status(500).json({ message: 'Failed to log in' });
    }
  });

  // User login
  app.post('/api/tender-auth/login-user', async (req, res) => {
    try {
      const { email, password } = req.body;

      const [user] = await db.select().from(tenderUsers).where(eq(tenderUsers.email, email));
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, type: 'user' }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          companyName: user.companyName,
          email: user.email,
          contactPerson: user.contactPerson,
          isPaidUser: user.isPaidUser,
          paymentStatus: user.paymentStatus,
        }
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Failed to log in' });
    }
  });

  // Get current user info
  app.get('/api/tender-auth/user', authenticateUser, async (req: any, res) => {
    res.json({
      id: req.user.id,
      companyName: req.user.companyName,
      email: req.user.email,
      contactPerson: req.user.contactPerson,
      isPaidUser: req.user.isPaidUser,
      paymentStatus: req.user.paymentStatus,
    });
  });

  // Get current company info
  app.get('/api/tender-auth/company', authenticateCompany, async (req: any, res) => {
    res.json({
      id: req.company.id,
      name: req.company.name,
      email: req.company.email,
      contactPerson: req.company.contactPerson,
    });
  });

  // Protected User Routes

  // Check if user has purchased a tender
  app.get('/api/tenders/:id/purchase', authenticateUser, async (req: any, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      const userId = req.user.id;

      const [purchase] = await db
        .select()
        .from(tenderPurchases)
        .where(and(
          eq(tenderPurchases.tenderId, tenderId),
          eq(tenderPurchases.userId, userId)
        ));

      res.json(purchase || null);
    } catch (error) {
      console.error('Error checking purchase:', error);
      res.status(500).json({ message: 'Failed to check purchase' });
    }
  });

  // Purchase a tender document
  app.post('/api/tenders/:id/purchase', authenticateUser, async (req: any, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if already purchased
      const [existingPurchase] = await db
        .select()
        .from(tenderPurchases)
        .where(and(
          eq(tenderPurchases.tenderId, tenderId),
          eq(tenderPurchases.userId, userId)
        ));

      if (existingPurchase) {
        return res.status(400).json({ message: 'You have already purchased this document' });
      }

      // Get tender info
      const [tender] = await db
        .select()
        .from(tenderDocuments)
        .innerJoin(companies, eq(tenderDocuments.companyId, companies.id))
        .where(eq(tenderDocuments.id, tenderId));

      if (!tender) {
        return res.status(404).json({ message: 'Tender not found' });
      }

      // Create purchase record (in real app, integrate with payment gateway)
      const [purchase] = await db.insert(tenderPurchases).values({
        tenderId,
        userId,
        amount: tender.tender_documents.price,
        currency: tender.tender_documents.currency,
        paymentMethod: 'stripe', // Mock payment method
        paymentId: `pay_${Date.now()}`, // Mock payment ID
        paymentStatus: 'completed', // Mock successful payment
      }).returning();

      // Send confirmation email to user
      await sendEmail(
        req.user.email,
        `Purchase Confirmation - ${tender.tender_documents.title}`,
        `<h2>Purchase Confirmation</h2>
         <p>Dear ${req.user.contactPerson},</p>
         <p>You have successfully purchased the tender document: <strong>${tender.tender_documents.title}</strong></p>
         <p>You can now download the complete document from your dashboard.</p>
         <p>Thank you for your purchase!</p>`,
        'purchase_confirmation',
        purchase.id
      );

      // Send notification email to company
      await sendEmail(
        tender.companies.email,
        `New Purchase - ${tender.tender_documents.title}`,
        `<h2>New Document Purchase</h2>
         <p>Dear ${tender.companies.contactPerson},</p>
         <p>Your tender document "<strong>${tender.tender_documents.title}</strong>" has been purchased by:</p>
         <ul>
           <li>Company: ${req.user.companyName}</li>
           <li>Contact: ${req.user.contactPerson}</li>
           <li>Email: ${req.user.email}</li>
         </ul>
         <p>Purchase amount: ${tender.tender_documents.price} ${tender.tender_documents.currency}</p>`,
        'company_notification',
        purchase.id
      );

      res.json({ 
        message: 'Purchase successful', 
        purchaseId: purchase.id 
      });
    } catch (error) {
      console.error('Error purchasing tender:', error);
      res.status(500).json({ message: 'Failed to purchase tender' });
    }
  });

  // Download purchased tender document
  app.get('/api/tenders/:id/download', authenticateUser, async (req: any, res) => {
    try {
      const tenderId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if user has purchased this document
      const [purchase] = await db
        .select()
        .from(tenderPurchases)
        .where(and(
          eq(tenderPurchases.tenderId, tenderId),
          eq(tenderPurchases.userId, userId),
          eq(tenderPurchases.paymentStatus, 'completed')
        ));

      if (!purchase) {
        return res.status(403).json({ message: 'You need to purchase this document first' });
      }

      // Get tender file info
      const [tender] = await db
        .select()
        .from(tenderDocuments)
        .where(eq(tenderDocuments.id, tenderId));

      if (!tender) {
        return res.status(404).json({ message: 'Tender not found' });
      }

      const filePath = path.join(process.cwd(), tender.filePath);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Log the download
      await db.insert(downloadLogs).values({
        tenderId,
        userId,
        purchaseId: purchase.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Update download counts
      await db
        .update(tenderPurchases)
        .set({ 
          downloadCount: sql`${tenderPurchases.downloadCount} + 1`,
          downloadedAt: new Date(),
        })
        .where(eq(tenderPurchases.id, purchase.id));

      await db
        .update(tenderDocuments)
        .set({ downloadCount: sql`${tenderDocuments.downloadCount} + 1` })
        .where(eq(tenderDocuments.id, tenderId));

      // Send file
      res.download(filePath, tender.fileName);
    } catch (error) {
      console.error('Error downloading tender:', error);
      res.status(500).json({ message: 'Failed to download tender' });
    }
  });

  // Protected Company Routes

  // Upload tender document
  app.post('/api/company/tenders', authenticateCompany, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { title, description, briefDescription, category, price, currency, deadline } = req.body;
      const companyId = req.company.id;

      const [tender] = await db.insert(tenderDocuments).values({
        title,
        description,
        briefDescription,
        category,
        price: parseFloat(price),
        currency: currency || 'ETB',
        companyId,
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        deadline: deadline ? new Date(deadline) : null,
      }).returning();

      res.status(201).json({ 
        message: 'Tender uploaded successfully', 
        tenderId: tender.id 
      });
    } catch (error) {
      console.error('Error uploading tender:', error);
      res.status(500).json({ message: 'Failed to upload tender' });
    }
  });

  // Get company's tenders
  app.get('/api/company/tenders', authenticateCompany, async (req: any, res) => {
    try {
      const companyId = req.company.id;

      const tenders = await db
        .select()
        .from(tenderDocuments)
        .where(eq(tenderDocuments.companyId, companyId))
        .orderBy(desc(tenderDocuments.uploadDate));

      res.json(tenders);
    } catch (error) {
      console.error('Error fetching company tenders:', error);
      res.status(500).json({ message: 'Failed to fetch tenders' });
    }
  });

  // Get company dashboard stats
  app.get('/api/company/dashboard', authenticateCompany, async (req: any, res) => {
    try {
      const companyId = req.company.id;

      // Get tender count
      const [tenderCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(tenderDocuments)
        .where(eq(tenderDocuments.companyId, companyId));

      // Get total sales
      const [totalSales] = await db
        .select({ 
          total: sql<number>`sum(${tenderPurchases.amount})`,
          count: sql<number>`count(*)`
        })
        .from(tenderPurchases)
        .innerJoin(tenderDocuments, eq(tenderPurchases.tenderId, tenderDocuments.id))
        .where(eq(tenderDocuments.companyId, companyId));

      // Get recent purchases
      const recentPurchases = await db
        .select({
          id: tenderPurchases.id,
          amount: tenderPurchases.amount,
          purchaseDate: tenderPurchases.purchaseDate,
          tenderTitle: tenderDocuments.title,
          userCompany: tenderUsers.companyName,
          userContact: tenderUsers.contactPerson,
        })
        .from(tenderPurchases)
        .innerJoin(tenderDocuments, eq(tenderPurchases.tenderId, tenderDocuments.id))
        .innerJoin(tenderUsers, eq(tenderPurchases.userId, tenderUsers.id))
        .where(eq(tenderDocuments.companyId, companyId))
        .orderBy(desc(tenderPurchases.purchaseDate))
        .limit(10);

      res.json({
        totalTenders: tenderCount.count,
        totalSales: totalSales.total || 0,
        totalSalesCount: totalSales.count || 0,
        recentPurchases,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });
}