import fs from 'fs';
import path from 'path';

// Create realistic tender document images
const createTenderImages = () => {
  const imagesDir = path.join(process.cwd(), 'uploads', 'tender-images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Create sample images as SVG files (since we can't fetch real images)
  const sampleImages = [
    {
      filename: 'highway-construction.svg',
      content: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#87CEEB"/>
        <rect y="300" width="800" height="200" fill="#8B4513"/>
        <rect y="350" width="800" height="100" fill="#696969"/>
        <rect y="375" width="800" height="50" fill="#FFFF00" opacity="0.3"/>
        <rect y="380" width="800" height="40" fill="#FFFFFF" opacity="0.8"/>
        <!-- Vehicles -->
        <rect x="100" y="360" width="60" height="30" fill="#FF4500"/>
        <circle cx="110" cy="395" r="8" fill="#000"/>
        <circle cx="150" cy="395" r="8" fill="#000"/>
        <rect x="300" y="350" width="80" height="40" fill="#4169E1"/>
        <circle cx="320" cy="395" r="10" fill="#000"/>
        <circle cx="360" cy="395" r="10" fill="#000"/>
        <text x="400" y="100" font-family="Arial" font-size="24" fill="#000">Highway Construction Project</text>
        <text x="400" y="130" font-family="Arial" font-size="16" fill="#333">50km Addis Ababa to Debre Zeit</text>
      </svg>`
    },
    {
      filename: 'medical-equipment.svg',
      content: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#F0F8FF"/>
        <rect x="50" y="100" width="300" height="200" fill="#FFFFFF" stroke="#CCC" stroke-width="2"/>
        <rect x="450" y="100" width="300" height="200" fill="#FFFFFF" stroke="#CCC" stroke-width="2"/>
        <rect x="50" y="350" width="300" height="200" fill="#FFFFFF" stroke="#CCC" stroke-width="2"/>
        <rect x="450" y="350" width="300" height="200" fill="#FFFFFF" stroke="#CCC" stroke-width="2"/>
        <!-- Medical equipment representations -->
        <circle cx="200" cy="200" r="50" fill="#4169E1" stroke="#000" stroke-width="2"/>
        <rect x="180" y="190" width="40" height="20" fill="#000"/>
        <text x="150" y="270" font-family="Arial" font-size="14" fill="#000">X-Ray Machine</text>
        <rect x="500" y="150" width="80" height="100" fill="#32CD32" stroke="#000" stroke-width="2"/>
        <text x="520" y="270" font-family="Arial" font-size="14" fill="#000">CT Scanner</text>
        <rect x="100" y="400" width="100" height="60" fill="#FF6347" stroke="#000" stroke-width="2"/>
        <text x="120" y="520" font-family="Arial" font-size="14" fill="#000">Hospital Bed</text>
        <circle cx="600" cy="450" r="40" fill="#FFD700" stroke="#000" stroke-width="2"/>
        <text x="570" y="520" font-family="Arial" font-size="14" fill="#000">Defibrillator</text>
        <text x="400" y="50" font-family="Arial" font-size="24" fill="#000">Medical Equipment Supply</text>
      </svg>`
    },
    {
      filename: 'solar-farm.svg',
      content: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#87CEEB"/>
        <circle cx="700" cy="100" r="40" fill="#FFD700"/>
        <rect y="400" width="800" height="200" fill="#228B22"/>
        <!-- Solar panels -->
        <g transform="translate(50,200)">
          <rect width="80" height="40" fill="#191970" stroke="#000"/>
          <rect x="85" width="80" height="40" fill="#191970" stroke="#000"/>
          <rect x="170" width="80" height="40" fill="#191970" stroke="#000"/>
          <rect x="255" width="80" height="40" fill="#191970" stroke="#000"/>
        </g>
        <g transform="translate(50,260)">
          <rect width="80" height="40" fill="#191970" stroke="#000"/>
          <rect x="85" width="80" height="40" fill="#191970" stroke="#000"/>
          <rect x="170" width="80" height="40" fill="#191970" stroke="#000"/>
          <rect x="255" width="80" height="40" fill="#191970" stroke="#000"/>
        </g>
        <g transform="translate(400,200)">
          <rect width="80" height="40" fill="#191970" stroke="#000"/>
          <rect x="85" width="80" height="40" fill="#191970" stroke="#000"/>
          <rect x="170" width="80" height="40" fill="#191970" stroke="#000"/>
          <rect x="255" width="80" height="40" fill="#191970" stroke="#000"/>
        </g>
        <text x="400" y="50" font-family="Arial" font-size="24" fill="#000">100MW Solar Farm Development</text>
        <text x="400" y="80" font-family="Arial" font-size="16" fill="#333">Oromia Region, Ethiopia</text>
      </svg>`
    },
    {
      filename: 'it-infrastructure.svg',
      content: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#F5F5F5"/>
        <!-- Server racks -->
        <rect x="100" y="150" width="80" height="120" fill="#2F4F4F" stroke="#000"/>
        <rect x="110" y="160" width="60" height="15" fill="#00FF00"/>
        <rect x="110" y="180" width="60" height="15" fill="#00FF00"/>
        <rect x="110" y="200" width="60" height="15" fill="#FFFF00"/>
        <rect x="110" y="220" width="60" height="15" fill="#00FF00"/>
        <rect x="110" y="240" width="60" height="15" fill="#00FF00"/>
        <!-- Computers -->
        <rect x="250" y="200" width="100" height="60" fill="#000"/>
        <rect x="260" y="210" width="80" height="50" fill="#4169E1"/>
        <rect x="370" y="200" width="100" height="60" fill="#000"/>
        <rect x="380" y="210" width="80" height="50" fill="#4169E1"/>
        <!-- Network equipment -->
        <rect x="500" y="180" width="120" height="40" fill="#696969"/>
        <circle cx="520" cy="200" r="5" fill="#00FF00"/>
        <circle cx="540" cy="200" r="5" fill="#00FF00"/>
        <circle cx="560" cy="200" r="5" fill="#FFFF00"/>
        <circle cx="580" cy="200" r="5" fill="#00FF00"/>
        <text x="400" y="50" font-family="Arial" font-size="24" fill="#000">IT Infrastructure Modernization</text>
        <text x="400" y="80" font-family="Arial" font-size="16" fill="#333">Government Offices - Addis Ababa</text>
      </svg>`
    },
    {
      filename: 'water-supply.svg',
      content: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#87CEEB"/>
        <!-- Water treatment plant -->
        <rect x="100" y="200" width="200" height="100" fill="#C0C0C0" stroke="#000"/>
        <rect x="120" y="180" width="40" height="40" fill="#4169E1"/>
        <rect x="180" y="180" width="40" height="40" fill="#4169E1"/>
        <rect x="240" y="180" width="40" height="40" fill="#4169E1"/>
        <!-- Pipelines -->
        <rect x="300" y="240" width="200" height="20" fill="#8B4513"/>
        <rect x="500" y="240" width="200" height="20" fill="#8B4513"/>
        <!-- Water tanks -->
        <circle cx="550" cy="180" r="40" fill="#4682B4" stroke="#000" stroke-width="2"/>
        <circle cx="650" cy="180" r="40" fill="#4682B4" stroke="#000" stroke-width="2"/>
        <!-- Houses -->
        <rect x="100" y="400" width="60" height="60" fill="#DEB887"/>
        <polygon points="100,400 130,370 160,400" fill="#8B4513"/>
        <rect x="200" y="400" width="60" height="60" fill="#DEB887"/>
        <polygon points="200,400 230,370 260,400" fill="#8B4513"/>
        <rect x="300" y="400" width="60" height="60" fill="#DEB887"/>
        <polygon points="300,400 330,370 360,400" fill="#8B4513"/>
        <text x="400" y="50" font-family="Arial" font-size="24" fill="#000">Water Supply System Expansion</text>
        <text x="400" y="80" font-family="Arial" font-size="16" fill="#333">Hawassa City Infrastructure</text>
      </svg>`
    },
    {
      filename: 'telecom-tower.svg',
      content: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#87CEEB"/>
        <!-- Telecom towers -->
        <rect x="200" y="100" width="10" height="300" fill="#696969"/>
        <rect x="180" y="120" width="50" height="5" fill="#696969"/>
        <rect x="180" y="140" width="50" height="5" fill="#696969"/>
        <rect x="180" y="160" width="50" height="5" fill="#696969"/>
        <rect x="500" y="80" width="10" height="320" fill="#696969"/>
        <rect x="480" y="100" width="50" height="5" fill="#696969"/>
        <rect x="480" y="120" width="50" height="5" fill="#696969"/>
        <rect x="480" y="140" width="50" height="5" fill="#696969"/>
        <!-- Signal waves -->
        <circle cx="205" cy="150" r="30" fill="none" stroke="#00FF00" stroke-width="2" opacity="0.5"/>
        <circle cx="205" cy="150" r="50" fill="none" stroke="#00FF00" stroke-width="2" opacity="0.3"/>
        <circle cx="505" cy="120" r="40" fill="none" stroke="#00FF00" stroke-width="2" opacity="0.5"/>
        <circle cx="505" cy="120" r="60" fill="none" stroke="#00FF00" stroke-width="2" opacity="0.3"/>
        <!-- Fiber optic cables -->
        <rect x="100" y="450" width="600" height="10" fill="#FF4500"/>
        <text x="400" y="50" font-family="Arial" font-size="24" fill="#000">Telecommunications Network Upgrade</text>
        <text x="400" y="80" font-family="Arial" font-size="16" fill="#333">4G/5G Infrastructure - National Coverage</text>
      </svg>`
    },
    {
      filename: 'agricultural-equipment.svg',
      content: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#87CEEB"/>
        <rect y="300" width="800" height="300" fill="#228B22"/>
        <!-- Tractor -->
        <rect x="100" y="200" width="120" height="60" fill="#FF4500"/>
        <circle cx="130" cy="270" r="20" fill="#000"/>
        <circle cx="190" cy="270" r="20" fill="#000"/>
        <rect x="220" y="220" width="40" height="40" fill="#FF4500"/>
        <!-- Combine harvester -->
        <rect x="400" y="180" width="180" height="80" fill="#FFD700"/>
        <circle cx="440" cy="270" r="25" fill="#000"/>
        <circle cx="540" cy="270" r="25" fill="#000"/>
        <rect x="580" y="200" width="60" height="60" fill="#FFD700"/>
        <!-- Irrigation system -->
        <rect x="100" y="400" width="200" height="20" fill="#4169E1"/>
        <rect x="150" y="380" width="10" height="40" fill="#4169E1"/>
        <rect x="200" y="380" width="10" height="40" fill="#4169E1"/>
        <rect x="250" y="380" width="10" height="40" fill="#4169E1"/>
        <!-- Crops -->
        <rect x="50" y="500" width="5" height="30" fill="#32CD32"/>
        <rect x="80" y="500" width="5" height="30" fill="#32CD32"/>
        <rect x="110" y="500" width="5" height="30" fill="#32CD32"/>
        <rect x="140" y="500" width="5" height="30" fill="#32CD32"/>
        <text x="400" y="50" font-family="Arial" font-size="24" fill="#000">Agricultural Mechanization Equipment</text>
        <text x="400" y="80" font-family="Arial" font-size="16" fill="#333">Smallholder Farmer Support Program</text>
      </svg>`
    },
    {
      filename: 'education-platform.svg',
      content: `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#F0F8FF"/>
        <!-- Computer screens -->
        <rect x="100" y="200" width="120" height="80" fill="#000"/>
        <rect x="110" y="210" width="100" height="60" fill="#4169E1"/>
        <rect x="250" y="200" width="120" height="80" fill="#000"/>
        <rect x="260" y="210" width="100" height="60" fill="#4169E1"/>
        <rect x="400" y="200" width="120" height="80" fill="#000"/>
        <rect x="410" y="210" width="100" height="60" fill="#4169E1"/>
        <rect x="550" y="200" width="120" height="80" fill="#000"/>
        <rect x="560" y="210" width="100" height="60" fill="#4169E1"/>
        <!-- Mobile devices -->
        <rect x="150" y="350" width="60" height="100" fill="#000" rx="10"/>
        <rect x="160" y="360" width="40" height="80" fill="#4169E1"/>
        <rect x="300" y="350" width="60" height="100" fill="#000" rx="10"/>
        <rect x="310" y="360" width="40" height="80" fill="#4169E1"/>
        <rect x="450" y="350" width="60" height="100" fill="#000" rx="10"/>
        <rect x="460" y="360" width="40" height="80" fill="#4169E1"/>
        <!-- Network connections -->
        <line x1="160" y1="240" x2="310" y2="240" stroke="#32CD32" stroke-width="3"/>
        <line x1="310" y1="240" x2="460" y2="240" stroke="#32CD32" stroke-width="3"/>
        <line x1="460" y1="240" x2="610" y2="240" stroke="#32CD32" stroke-width="3"/>
        <text x="400" y="50" font-family="Arial" font-size="24" fill="#000">Educational Technology Platform</text>
        <text x="400" y="80" font-family="Arial" font-size="16" fill="#333">E-Learning System for Ethiopian Universities</text>
      </svg>`
    }
  ];

  sampleImages.forEach(image => {
    const filePath = path.join(imagesDir, image.filename);
    fs.writeFileSync(filePath, image.content, 'utf8');
  });

  console.log(`✅ Created ${sampleImages.length} tender images in ${imagesDir}`);
};

// Run the function
createTenderImages();