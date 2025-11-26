require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Instrument = require('../src/models/Instrument');
const Booking = require('../src/models/Booking');
const Notification = require('../src/models/Notification');

// Equipment image URLs mapping
const imageMap = {
  'cnc-lathe-vtu': 'https://www.focus-cnc.com/web/image/product.product/20/image_1024/FBL-510-%20520-%20530-%20540-%20MC?unique=4fbd8a8',
  'fdm-3d-printer': 'https://zbotic.in/wp-content/uploads/2025/10/t6ofhcip.png',
  'a100-ai-server': 'https://www.nvidia.com/content/dam/en-zz/vi_vn/Solutions/viettel-pioneers-ai-research-using-nvidia-dgx-a100-banner.jpg',
  'rtx-4090-workstation': 'https://wp-cdn.pugetsystems.com/2022/08/Closeup-photo-of-1-7x-NVIDIA-GeForce-RTX-4090-in-mining-rack.png',
  'total-station': 'https://www.topconpositioning.com/content/topconpositioning/global/en/solutions/technology/infrastructure-products/robotic-total-stations/_jcr_content/root/container/container/container_677028762/image.coreimg.85.1600.jpeg/1755206312275/robotic-total-stations-web-teaser1.jpeg',
  'rainwater-harvesting-system': 'https://www.svl.com/wp-content/uploads/2024/04/Wahasop-RAINWATER-HARVESTING-SYSTEMS.png',
  'cnc-milling-machine': 'https://image.made-in-china.com/202f0j00cdFbzBsJpHoI/High-Performance-Vmc1160-10000rpm-3-4-5-Axis-CNC-Milling-Machine-CNC-Vertical-Machining-Center.webp',
  'sla-3d-printer': 'https://develop3d.com/wp-content/uploads/2019/04/Stratasys-v650-Flex-SLA-3D-Printer-1024x576.jpg',
  'oscilloscope-digital': 'https://www.rigolna.com/images/products/MSO5000.png',
  'spectrum-analyzer': 'https://electronicsbuzz.in/wp-content/uploads/2025/01/imresizer-1735886248353.jpg',
  'universal-testing-machine': 'https://www.matest.com/contents/products/h001b.jpg',
  'hardness-tester': 'https://5.imimg.com/data5/SELLER/Default/2025/7/531717517/TN/AV/GL/5263696/metal-hardness-tester-500x500.jpg',
  'lathe-machine-conventional': 'https://5.imimg.com/data5/SELLER/Default/2022/12/ZN/QP/PB/153029/conventional-lathe-machine.JPG',
  'milling-machine-conventional': 'https://technologicalprocess.com/wp-content/uploads/2021/07/frezarka_wyr.jpg',
  'rtx-3090-workstation': 'https://cdna.pcpartpicker.com/static/forever/images/userbuild/334963.247dcfb3492233a216a9a7d96bd09d85.jpg',
  'v100-ai-server': 'https://www.servethehome.com/wp-content/uploads/2019/02/8x-NVIDIA-Tesla-V100-32GB-Server.jpg',
  'hydraulic-press': 'https://cdn.thefabricator.com/a/stamping-101-anatomy-of-a-hydraulic-press-1634077329.jpg',
  'function-generator': 'https://in.element14.com/productimages/large/en_GB/2469113-40.jpg',
  'water-quality-analyzer': 'https://5.imimg.com/data5/SELLER/Default/2025/8/536066241/NE/KZ/US/223692774/water-quality-analyzer-1000x1000.jpeg',
  'gps-surveying-equipment': 'https://www.sitechukandireland.com/content/dam/whitelabel/sitechukandireland/pages/en/products/gps/R780%20Montage.png',
  'cnc-plasma-cutter': 'https://5.imimg.com/data5/SELLER/Default/2024/12/470436902/HE/AZ/ZP/88199447/portable-cnc-cutting-machine-1000x1000.jpg',
  'impact-testing-machine': 'https://i.ytimg.com/vi/lrEl9Qr0jM8/maxresdefault.jpg',
  'metal-3d-printer': 'https://i.all3dp.com/wp-content/uploads/2022/03/23141948/10-ways-to-3d-print-metal.jpg',
  'pcb-prototyping-machine': 'https://miro.medium.com/v2/resize:fit:786/format:webp/1*kGf9-egqan4kO-1snAevXQ.jpeg',
  'h100-ai-server': 'https://cdn.uvation.com/marketing/2025/03/AI_Server_2.jpg'
};

// POC Equipment Data
const pocEquipment = [
  {
    slug: "cnc-lathe-vtu",
    name: "CNC Lathe Machine",
    category: "CNC Machines",
    availability: "available",
    specs: { power: "3kW", bed_length: "1500mm", spindle_speed: "4000 RPM" }
  },
  {
    slug: "fdm-3d-printer",
    name: "FDM 3D Printer",
    category: "3D Printers",
    availability: "available",
    specs: { build_volume: "300x300x400mm", layer_resolution: "0.1mm", filament: "PLA, ABS, PETG" }
  },
  {
    slug: "a100-ai-server",
    name: "A100 AI Compute Server",
    category: "AI Servers",
    availability: "available",
    specs: { gpu: "NVIDIA A100 80GB", ram: "512GB DDR4", storage: "4TB NVMe SSD" }
  },
  {
    slug: "rtx-4090-workstation",
    name: "RTX 4090 Workstation",
    category: "GPU Workstations",
    availability: "available",
    specs: { gpu: "NVIDIA RTX 4090 24GB", cpu: "AMD Ryzen 9 7950X", ram: "128GB DDR5" }
  },
  {
    slug: "total-station",
    name: "Total Station",
    category: "Civil",
    availability: "available",
    specs: { accuracy: "2mm + 2ppm", range: "5000m", display: "Color touchscreen" }
  },
  {
    slug: "rainwater-harvesting-system",
    name: "Rainwater Harvesting System",
    category: "Environmental",
    availability: "available",
    specs: { capacity: "10000L", filtration: "Multi-stage", monitoring: "IoT enabled" }
  },
  {
    slug: "cnc-milling-machine",
    name: "CNC Milling Machine",
    category: "CNC Machines",
    availability: "booked",
    specs: { table_size: "1200x600mm", spindle_speed: "8000 RPM", axes: "3-axis" }
  },
  {
    slug: "sla-3d-printer",
    name: "SLA 3D Printer",
    category: "3D Printers",
    availability: "available",
    specs: { build_volume: "192x120x200mm", layer_resolution: "0.025mm", resin_type: "UV-curable" }
  },
  {
    slug: "oscilloscope-digital",
    name: "Digital Oscilloscope",
    category: "Electronics",
    availability: "available",
    specs: { bandwidth: "200MHz", channels: "4", sample_rate: "2GSa/s" }
  },
  {
    slug: "spectrum-analyzer",
    name: "Spectrum Analyzer",
    category: "Electronics",
    availability: "available",
    specs: { frequency_range: "9kHz - 26.5GHz", resolution: "1Hz", display: "10.4 inch touchscreen" }
  },
  {
    slug: "universal-testing-machine",
    name: "Universal Testing Machine",
    category: "Material Testing",
    availability: "available",
    specs: { capacity: "100kN", test_types: "Tension, Compression, Bending", accuracy: "±0.5%" }
  },
  {
    slug: "hardness-tester",
    name: "Hardness Tester",
    category: "Material Testing",
    availability: "booked",
    specs: { test_methods: "Rockwell, Brinell, Vickers", load_range: "1-187.5kgf", accuracy: "±1%" }
  },
  {
    slug: "lathe-machine-conventional",
    name: "Conventional Lathe Machine",
    category: "Mechanical",
    availability: "available",
    specs: { swing: "400mm", center_distance: "1500mm", spindle_speeds: "12 steps" }
  },
  {
    slug: "milling-machine-conventional",
    name: "Conventional Milling Machine",
    category: "Mechanical",
    availability: "available",
    specs: { table_size: "1370x305mm", spindle_taper: "ISO 40", power: "5HP" }
  },
  {
    slug: "rtx-3090-workstation",
    name: "RTX 3090 Workstation",
    category: "GPU Workstations",
    availability: "available",
    specs: { gpu: "NVIDIA RTX 3090 24GB", cpu: "Intel i9-12900K", ram: "64GB DDR4" }
  },
  {
    slug: "h100-ai-server",
    name: "H100 AI Compute Server",
    category: "AI Servers",
    availability: "booked",
    specs: { gpu: "NVIDIA H100 80GB", ram: "1TB DDR5", storage: "8TB NVMe SSD" }
  },
  {
    slug: "pcb-prototyping-machine",
    name: "PCB Prototyping Machine",
    category: "Electronics",
    availability: "available",
    specs: { board_size: "300x400mm", resolution: "0.1mm", layers: "Double-sided" }
  },
  {
    slug: "metal-3d-printer",
    name: "Metal 3D Printer",
    category: "3D Printers",
    availability: "available",
    specs: { build_volume: "250x250x300mm", materials: "Stainless Steel, Titanium, Aluminum", layer_thickness: "20-100μm" }
  },
  {
    slug: "impact-testing-machine",
    name: "Impact Testing Machine",
    category: "Material Testing",
    availability: "available",
    specs: { capacity: "450J", test_types: "Charpy, Izod", pendulum_angle: "150°" }
  },
  {
    slug: "cnc-plasma-cutter",
    name: "CNC Plasma Cutter",
    category: "CNC Machines",
    availability: "available",
    specs: { cutting_area: "2000x3000mm", thickness: "Up to 25mm", power: "200A" }
  },
  {
    slug: "gps-surveying-equipment",
    name: "GPS Surveying Equipment",
    category: "Civil",
    availability: "available",
    specs: { accuracy: "±5mm + 0.5ppm", channels: "220", battery_life: "8 hours" }
  },
  {
    slug: "water-quality-analyzer",
    name: "Water Quality Analyzer",
    category: "Environmental",
    availability: "available",
    specs: { parameters: "pH, TDS, Turbidity, DO", accuracy: "±2%", data_logging: "10000 readings" }
  },
  {
    slug: "function-generator",
    name: "Function Generator",
    category: "Electronics",
    availability: "available",
    specs: { frequency_range: "1μHz - 80MHz", waveforms: "Sine, Square, Triangle, Pulse", channels: "2" }
  },
  {
    slug: "hydraulic-press",
    name: "Hydraulic Press",
    category: "Mechanical",
    availability: "available",
    specs: { capacity: "200 tons", stroke: "600mm", table_size: "800x800mm" }
  },
  {
    slug: "v100-ai-server",
    name: "V100 AI Compute Server",
    category: "AI Servers",
    availability: "available",
    specs: { gpu: "NVIDIA V100 32GB", ram: "256GB DDR4", storage: "2TB NVMe SSD" }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lablinc');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await Instrument.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } }); // Keep admin users
    console.log('✅ Cleared instruments, bookings, notifications, and non-admin users');

    // Create VTU Belagavi institute user
    console.log('\n👤 Creating VTU Belagavi institute user...');
    const hashedPassword = await bcrypt.hash('vtu123456', 12);
    
    const vtuUser = await User.create({
      name: 'VTU Belagavi',
      email: 'vtu@belagavi.edu',
      password: hashedPassword,
      role: 'institute',
      organization: 'Visvesvaraya Technological University',
      address: 'Jnana Sangama, Belagavi - 590018, Karnataka, India',
      phone: '+91 831 2498100',
      status: 'active'
    });
    console.log(`✅ Created VTU Belagavi user (ID: ${vtuUser._id})`);

    // Create instruments
    console.log('\n🔬 Creating instruments...');
    let createdCount = 0;
    
    for (const equipment of pocEquipment) {
      const imageUrl = imageMap[equipment.slug] || '';
      
      const instrument = await Instrument.create({
        name: equipment.name,
        description: `Professional ${equipment.name} available for research and development purposes. Equipped with state-of-the-art features and maintained to the highest standards.`,
        category: equipment.category,
        specifications: equipment.specs,
        owner: vtuUser._id,
        ownerName: vtuUser.name,
        pricing: {
          hourly: Math.floor(Math.random() * 500) + 100,
          daily: Math.floor(Math.random() * 3000) + 1000,
          weekly: Math.floor(Math.random() * 15000) + 5000,
          monthly: Math.floor(Math.random() * 50000) + 20000
        },
        availability: equipment.availability,
        location: 'VTU Belagavi, Karnataka',
        photos: imageUrl ? [imageUrl] : [],
        videos: [],
        featured: createdCount < 6, // First 6 are featured
        status: 'active'
      });
      
      createdCount++;
      console.log(`  ✓ ${createdCount}. ${instrument.name}`);
    }

    console.log(`\n✅ Created ${createdCount} instruments`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   • Institute: VTU Belagavi`);
    console.log(`   • Email: vtu@belagavi.edu`);
    console.log(`   • Password: vtu123456`);
    console.log(`   • Instruments: ${createdCount}`);
    console.log(`   • Featured: 6`);
    console.log(`   • With Images: ${pocEquipment.filter(e => imageMap[e.slug]).length}`);
    console.log('\n💡 You can now login as VTU Belagavi to manage instruments!');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
