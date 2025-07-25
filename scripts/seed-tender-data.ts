import { db } from "../server/db";
import { companies, tenderUsers, tenderDocuments } from "@shared/tender-schema";
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'tenders');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sample tender document content
const createSamplePDF = (title: string, description: string): string => {
  const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  const filepath = path.join(uploadsDir, filename);
  
  // Create a simple text file as placeholder (in real scenario, you'd have actual PDF files)
  const content = `
TENDER DOCUMENT
===============

Title: ${title}

Description: ${description}

Terms and Conditions:
1. All bids must be submitted before the deadline
2. Late submissions will not be accepted
3. Technical specifications must be met
4. Payment terms: 30 days after delivery
5. Quality assurance requirements apply

Contact Information:
For questions regarding this tender, please contact the issuing company.

Document generated on: ${new Date().toLocaleDateString()}
`;
  
  fs.writeFileSync(filepath, content, 'utf8');
  return filepath;
};

async function seedTenderData() {
  try {
    console.log('🌱 Starting tender data seeding...');

    // Create sample companies
    const companiesData = [
      {
        name: 'Ethiopian Construction Corp',
        email: 'contact@ethconstruction.com',
        phone: '+251911123456',
        address: 'Addis Ababa, Ethiopia, Bole Sub City, Woreda 03',
        contactPerson: 'Alemayehu Tadesse',
        passwordHash: await bcrypt.hash('company123', 10),
      },
      {
        name: 'Nile Engineering Solutions',
        email: 'info@nileengineering.com',
        phone: '+251922234567',
        address: 'Addis Ababa, Ethiopia, Kirkos Sub City, Woreda 08',
        contactPerson: 'Meron Hailu',
        passwordHash: await bcrypt.hash('company123', 10),
      },
      {
        name: 'Horn of Africa Logistics',
        email: 'procurement@hoalogistics.com',
        phone: '+251933345678',
        address: 'Addis Ababa, Ethiopia, Yeka Sub City, Woreda 12',
        contactPerson: 'Dawit Bekele',
        passwordHash: await bcrypt.hash('company123', 10),
      },
      {
        name: 'Ethiopian Telecom Services',
        email: 'tenders@ethiotelecom.et',
        phone: '+251944456789',
        address: 'Addis Ababa, Ethiopia, Addis Ketema Sub City, Woreda 02',
        contactPerson: 'Hanan Mohammed',
        passwordHash: await bcrypt.hash('company123', 10),
      },
      {
        name: 'Blue Nile Manufacturing',
        email: 'contracts@bluenilemanuf.com',
        phone: '+251955567890',
        address: 'Bahir Dar, Ethiopia, Industrial Zone',
        contactPerson: 'Getachew Alemu',
        passwordHash: await bcrypt.hash('company123', 10),
      }
    ];

    console.log('📊 Creating companies...');
    const createdCompanies = await db.insert(companies).values(companiesData).returning();

    // Create sample users
    const usersData = [
      {
        companyName: 'Tech Solutions Ethiopia',
        email: 'admin@techsolutions.et',
        phone: '+251911987654',
        address: 'Addis Ababa, Ethiopia, Bole Sub City',
        contactPerson: 'Sara Tesfaye',
        passwordHash: await bcrypt.hash('user123', 10),
        isPaidUser: true,
        paymentStatus: 'active' as const,
      },
      {
        companyName: 'Green Energy Partners',
        email: 'procurement@greenenergy.et',
        phone: '+251922876543',
        address: 'Mekelle, Ethiopia, Industrial Park',
        contactPerson: 'Yonas Gebru',
        passwordHash: await bcrypt.hash('user123', 10),
        isPaidUser: true,
        paymentStatus: 'active' as const,
      },
      {
        companyName: 'Highland Trading PLC',
        email: 'contracts@highland.et',
        phone: '+251933765432',
        address: 'Hawassa, Ethiopia, Commercial District',
        contactPerson: 'Rahel Worku',
        passwordHash: await bcrypt.hash('user123', 10),
        isPaidUser: false,
        paymentStatus: 'pending' as const,
      }
    ];

    console.log('👥 Creating users...');
    const createdUsers = await db.insert(tenderUsers).values(usersData).returning();

    // Create comprehensive tender documents
    const tenderDocumentsData = [
      {
        title: 'Construction of 50km Highway Infrastructure Project',
        description: `This tender is for the construction of a modern 50-kilometer highway connecting Addis Ababa to Debre Zeit. The project includes:

• Road construction with asphalt surfacing
• Bridge construction over 3 river crossings
• Installation of modern lighting systems
• Traffic management systems
• Environmental protection measures
• Quality assurance and testing

Technical Requirements:
- Minimum 10 years of construction experience
- ISO 9001:2015 certification required
- Local and international safety standards compliance
- Environmental impact assessment completion

The project duration is 24 months from contract signing. Bidders must provide detailed technical proposals, financial guarantees, and proof of previous similar projects.

All materials must meet Ethiopian Road Authority standards and international best practices. The contractor will be responsible for maintenance for 2 years post-completion.`,
        briefDescription: 'Major highway infrastructure project connecting Addis Ababa to Debre Zeit. 50km road construction with bridges, lighting, and traffic systems. 24-month duration.',
        category: 'Construction & Infrastructure',
        price: 25000,
        currency: 'ETB',
        companyId: createdCompanies[0].id,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        title: 'Supply of Medical Equipment for Regional Hospitals',
        description: `Procurement tender for comprehensive medical equipment supply to 5 regional hospitals across Ethiopia:

Equipment Categories:
• Diagnostic Equipment: X-ray machines, CT scanners, ultrasound devices
• Laboratory Equipment: Blood analyzers, microscopes, centrifuges
• Patient Care Equipment: Hospital beds, wheelchairs, stretchers
• Emergency Equipment: Defibrillators, ventilators, monitoring systems
• Surgical Equipment: Operating tables, surgical instruments, anesthesia machines

Specifications:
- All equipment must have CE/FDA certification
- 2-year warranty minimum
- Installation and training included
- Local technical support availability
- Compliance with WHO medical device standards

Delivery Schedule:
Phase 1: 50% of equipment within 3 months
Phase 2: Remaining 50% within 6 months

Bidders must provide detailed technical specifications, user manuals in English and Amharic, and comprehensive maintenance plans.`,
        briefDescription: 'Medical equipment procurement for 5 regional hospitals. Diagnostic, laboratory, patient care, emergency, and surgical equipment with installation and training.',
        category: 'Healthcare & Medical',
        price: 45000,
        currency: 'ETB',
        companyId: createdCompanies[1].id,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      },
      {
        title: 'IT Infrastructure Modernization for Government Offices',
        description: `Complete IT infrastructure upgrade for 20 government offices in Addis Ababa:

Hardware Requirements:
• 500 Desktop computers with latest specifications
• 50 Laptop computers for mobile workforce
• Network servers and storage systems
• Networking equipment (switches, routers, access points)
• Backup and disaster recovery systems
• Security cameras and access control systems

Software Requirements:
• Operating system licenses (Windows/Linux)
• Office productivity software
• Antivirus and security software
• Database management systems
• Custom application development
• System integration services

Services Included:
- Site preparation and installation
- Data migration from legacy systems
- Staff training programs
- 24/7 technical support for first year
- System maintenance and updates
- Security auditing and compliance

The project must be completed within 6 months with minimal disruption to government operations. All systems must be secure and comply with government IT policies.`,
        briefDescription: 'Complete IT infrastructure modernization for 20 government offices. Hardware, software, installation, training, and support services included.',
        category: 'Information Technology',
        price: 35000,
        currency: 'ETB',
        companyId: createdCompanies[3].id,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      },
      {
        title: 'Renewable Energy Solar Farm Development Project',
        description: `Development of a 100MW solar photovoltaic power plant in the Oromia region:

Project Scope:
• Design and construction of solar PV farm
• Grid connection and transmission infrastructure
• Energy storage system (battery backup)
• Monitoring and control systems
• Environmental compliance and mitigation
• Community engagement and benefit sharing

Technical Specifications:
- High-efficiency monocrystalline solar panels
- Advanced inverter technology
- Smart grid integration capabilities
- 25-year performance warranty
- Remote monitoring and diagnostics
- Dust mitigation systems for Ethiopian conditions

Environmental Requirements:
- Environmental Impact Assessment (EIA)
- Wildlife protection measures
- Soil conservation practices
- Water resource management
- Local community employment preferences

The project includes a 20-year power purchase agreement with Ethiopian Electric Power. Construction timeline is 18 months with commissioning and testing phases.

Preference will be given to bidders with local partnerships and commitment to technology transfer.`,
        briefDescription: '100MW solar PV power plant development in Oromia region. Complete EPC solution with grid connection, storage, and 20-year PPA included.',
        category: 'Energy & Power',
        price: 85000,
        currency: 'ETB',
        companyId: createdCompanies[4].id,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      },
      {
        title: 'Urban Water Supply System Expansion Project',
        description: `Expansion of urban water supply infrastructure for Hawassa city:

Project Components:
• New water treatment plant (50,000 m³/day capacity)
• Distribution network expansion (200km of pipelines)
• Water storage reservoirs (10 locations)
• Pumping stations with backup power
• SCADA system for remote monitoring
• Customer metering and billing system

Technical Requirements:
- Modern water treatment technology
- Energy-efficient pumping systems
- Corrosion-resistant pipeline materials
- Smart water management systems
- Quality monitoring equipment
- Emergency response capabilities

Quality Standards:
- WHO drinking water guidelines compliance
- Ethiopian water quality standards
- ISO certification for all equipment
- Environmental sustainability measures
- Water loss minimization systems

The project aims to provide clean water access to 300,000 residents. Implementation period is 30 months including testing and commissioning.

Local content requirements: Minimum 30% local materials and labor utilization.`,
        briefDescription: 'Urban water supply expansion for Hawassa city. New treatment plant, 200km distribution network, storage, and smart monitoring systems.',
        category: 'Water & Sanitation',
        price: 55000,
        currency: 'ETB',
        companyId: createdCompanies[0].id,
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
      },
      {
        title: 'Educational Technology Platform Development',
        description: `Development of comprehensive e-learning platform for Ethiopian universities:

Platform Features:
• Learning Management System (LMS)
• Virtual classroom capabilities
• Content creation and management tools
• Student assessment and grading systems
• Mobile application for Android and iOS
• Multi-language support (English, Amharic, Oromifa)

Technical Specifications:
- Cloud-based architecture with local hosting options
- Scalable to support 100,000+ concurrent users
- Integration with existing university systems
- Offline content access capabilities
- Advanced analytics and reporting
- Accessibility compliance (WCAG 2.1)

Content Requirements:
- Digital library integration
- Video streaming and storage
- Interactive simulations and labs
- Collaborative tools and forums
- Plagiarism detection system
- Grade book and transcript management

The platform must support both synchronous and asynchronous learning models. Training for 500 educators and technical staff is included.

Development timeline: 12 months with phased rollout across 15 universities.`,
        briefDescription: 'Comprehensive e-learning platform for Ethiopian universities. LMS, virtual classrooms, mobile apps, and multi-language support for 100K+ users.',
        category: 'Education & Training',
        price: 28000,
        currency: 'ETB',
        companyId: createdCompanies[2].id,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
      },
      {
        title: 'Agricultural Mechanization Equipment Supply',
        description: `Supply of modern agricultural machinery for smallholder farmer cooperatives:

Equipment Categories:
• Tractors (50-75 HP) with implements
• Combine harvesters for grain crops
• Seed drills and planting equipment
• Irrigation systems and pumps
• Post-harvest processing equipment
• Farm maintenance tools and spare parts

Specifications:
- Suitable for Ethiopian soil and climate conditions
- Fuel-efficient and environmentally friendly
- Easy maintenance with local support
- Training and certification programs included
- 3-year warranty with parts availability
- Financing options for farmer cooperatives

Training Program:
- Operator training for 200 farmers
- Maintenance training for local technicians
- Safety protocols and best practices
- Cooperative management and scheduling
- Record keeping and cost analysis

The equipment will be distributed across 10 regions with established service centers. Priority areas include major grain-producing zones.

Local assembly requirements: Minimum 20% local assembly content preferred.`,
        briefDescription: 'Agricultural machinery supply for smallholder farmers. Tractors, harvesters, irrigation, and processing equipment with training and support.',
        category: 'Agriculture & Farming',
        price: 42000,
        currency: 'ETB',
        companyId: createdCompanies[1].id,
        deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // 50 days from now
      },
      {
        title: 'National Telecommunications Network Upgrade',
        description: `Nationwide telecommunications infrastructure modernization project:

Network Components:
• 4G/5G base station installations (500 sites)
• Fiber optic backbone expansion (2000km)
• Data center construction and equipment
• Network security and monitoring systems
• Customer service and billing platforms
• Emergency communication systems

Coverage Areas:
- Urban areas: Enhanced capacity and speed
- Rural areas: New connectivity to underserved regions
- Border areas: Strategic communication coverage
- Industrial zones: High-capacity business services
- Educational institutions: Dedicated bandwidth
- Healthcare facilities: Telemedicine capabilities

Technical Standards:
- ITU-T international standards compliance
- Cybersecurity best practices implementation
- Environmental impact minimization
- Energy efficiency optimization
- Disaster resilience and redundancy
- Future technology upgrade compatibility

The project includes technology transfer, local skills development, and establishment of regional maintenance centers.

Implementation period: 36 months with phased rollout by region.`,
        briefDescription: 'National telecom network upgrade with 4G/5G, fiber expansion, data centers, and rural connectivity. 500 base stations and 2000km fiber.',
        category: 'Telecommunications',
        price: 125000,
        currency: 'ETB',
        companyId: createdCompanies[3].id,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      }
    ];

    console.log('📄 Creating tender documents...');
    const tenderPromises = tenderDocumentsData.map(async (tender) => {
      const filePath = createSamplePDF(tender.title, tender.description);
      const stats = fs.statSync(filePath);
      
      return {
        ...tender,
        filePath: filePath.replace(process.cwd(), ''),
        fileName: `${tender.title.substring(0, 50)}.pdf`,
        fileSize: stats.size,
        mimeType: 'application/pdf',
      };
    });

    const tendersWithFiles = await Promise.all(tenderPromises);
    const createdTenders = await db.insert(tenderDocuments).values(tendersWithFiles).returning();

    console.log('✅ Tender data seeding completed successfully!');
    console.log(`📊 Created ${createdCompanies.length} companies`);
    console.log(`👥 Created ${createdUsers.length} users`);
    console.log(`📄 Created ${createdTenders.length} tender documents`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('Companies (email: company123):');
    companiesData.forEach(company => {
      console.log(`  - ${company.email}`);
    });
    console.log('\nUsers (email: user123):');
    usersData.forEach(user => {
      console.log(`  - ${user.email}`);
    });

  } catch (error) {
    console.error('❌ Error seeding tender data:', error);
    throw error;
  }
}

// Run the seeding function
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTenderData()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedTenderData };