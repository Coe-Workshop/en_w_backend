import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/pkg/models";
import { eq } from "drizzle-orm";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema, casing: "snake_case" });

type ItemCategoryType = "ELECTRONIC" | "MECHANICAL" | "ELECTRICAL" | "PNEUMATIC" | "HYDRAULIC" | "MEASUREMENT" | "SOLDERING" | "HAND_TOOLS" | "POWER_TOOLS" | "SAFETY" | "ROBOTICS" | "AUTOMATION" | "PROTOTYPING" | "THREE_D_PRINTING" | "CNC" | "MAINTENANCE";

const categoriesData: { name: ItemCategoryType }[] = [
  { name: "ELECTRONIC" },
  { name: "MECHANICAL" },
  { name: "ELECTRICAL" },
  { name: "PNEUMATIC" },
  { name: "HYDRAULIC" },
  { name: "MEASUREMENT" },
  { name: "SOLDERING" },
  { name: "HAND_TOOLS" },
  { name: "POWER_TOOLS" },
  { name: "SAFETY" },
  { name: "ROBOTICS" },
  { name: "AUTOMATION" },
  { name: "PROTOTYPING" },
  { name: "THREE_D_PRINTING" },
  { name: "CNC" },
  { name: "MAINTENANCE" },
];

const itemsData: { name: string; description: string; category: ItemCategoryType; imageUrl: string | null }[] = [
  { name: "Arduino Uno R3", description: "Microcontroller board for electronics projects", category: "ELECTRONIC", imageUrl: null },
  { name: "Raspberry Pi 4 Model B", description: "Single-board computer for IoT and automation", category: "ELECTRONIC", imageUrl: null },
  { name: "Digital Multimeter", description: "Voltage, current, and resistance meter", category: "ELECTRONIC", imageUrl: null },
  { name: "Soldering Station", description: "Temperature-controlled soldering iron", category: "ELECTRONIC", imageUrl: null },
  { name: "Oscilloscope", description: "Digital oscilloscope for signal analysis", category: "ELECTRONIC", imageUrl: null },
  { name: "Function Generator", description: "Signal generator for testing circuits", category: "ELECTRONIC", imageUrl: null },
  { name: "Logic Analyzer", description: "Digital signal analyzer for debugging", category: "ELECTRONIC", imageUrl: null },
  { name: "Power Supply Unit", description: "Adjustable DC power supply 0-30V 5A", category: "ELECTRONIC", imageUrl: null },
  { name: "Breadboard Kit", description: "Solderless prototype board with jumper wires", category: "ELECTRONIC", imageUrl: null },
  { name: "Component Kit", description: "Assorted resistors, capacitors, and ICs", category: "ELECTRONIC", imageUrl: null },

  { name: "Lathe Machine", description: "Metal turning lathe for precision work", category: "MECHANICAL", imageUrl: null },
  { name: "Milling Machine", description: "Vertical milling machine for machining", category: "MECHANICAL", imageUrl: null },
  { name: "Drill Press", description: "Bench-top drill press for precision drilling", category: "MECHANICAL", imageUrl: null },
  { name: "Bandsaw", description: "Vertical bandsaw for cutting metal and wood", category: "MECHANICAL", imageUrl: null },
  { name: "Bench Grinder", description: "Dual-wheel grinder for tool sharpening", category: "MECHANICAL", imageUrl: null },
  { name: "Hydraulic Press", description: "20-ton hydraulic press for forming", category: "MECHANICAL", imageUrl: null },
  { name: "Sheet Metal Brake", description: "Bending brake for sheet metal work", category: "MECHANICAL", imageUrl: null },
  { name: "Sandblaster Cabinet", description: "Enclosed sandblasting cabinet", category: "MECHANICAL", imageUrl: null },

  { name: "Arc Welder", description: "Stick welding machine for metal fabrication", category: "ELECTRICAL", imageUrl: null },
  { name: "MIG Welder", description: "Wire feed welding machine", category: "ELECTRICAL", imageUrl: null },
  { name: "TIG Welder", description: "Tungsten inert gas welding machine", category: "ELECTRICAL", imageUrl: null },
  { name: "Plasma Cutter", description: "Plasma cutting system for metal", category: "ELECTRICAL", imageUrl: null },
  { name: "Spot Welder", description: "Resistance spot welding machine", category: "ELECTRICAL", imageUrl: null },
  { name: "Transformer", description: "Variable voltage transformer", category: "ELECTRICAL", imageUrl: null },

  { name: "Air Compressor", description: "50-gallon air compressor system", category: "PNEUMATIC", imageUrl: null },
  { name: "Pneumatic Drill", description: "Air-powered drill for metal work", category: "PNEUMATIC", imageUrl: null },
  { name: "Impact Wrench", description: "Pneumatic impact wrench", category: "PNEUMATIC", imageUrl: null },
  { name: "Air Ratchet", description: "Pneumatic ratchet wrench", category: "PNEUMATIC", imageUrl: null },
  { name: "Blow Gun", description: "Air blow gun with safety nozzle", category: "PNEUMATIC", imageUrl: null },
  { name: "Air Hose Reel", description: "Retractable air hose system", category: "PNEUMATIC", imageUrl: null },

  { name: "Hydraulic Jack", description: "10-ton hydraulic bottle jack", category: "HYDRAULIC", imageUrl: null },
  { name: "Hydraulic Lift Table", description: "Scissor lift table for heavy loads", category: "HYDRAULIC", imageUrl: null },
  { name: "Hydraulic Cylinder", description: "Double-acting hydraulic cylinder", category: "HYDRAULIC", imageUrl: null },
  { name: "Hydraulic Pump", description: "Gear-type hydraulic pump", category: "HYDRAULIC", imageUrl: null },
  { name: "Pressure Gauge", description: "Hydraulic pressure gauge 0-10000 PSI", category: "HYDRAULIC", imageUrl: null },

  { name: "Digital Caliper", description: "0-150mm digital Vernier caliper", category: "MEASUREMENT", imageUrl: null },
  { name: "Micrometer Set", description: "Outside micrometer set 0-75mm", category: "MEASUREMENT", imageUrl: null },
  { name: "Height Gauge", description: "Digital height gauge 0-600mm", category: "MEASUREMENT", imageUrl: null },
  { name: "Dial Indicator", description: "Precision dial indicator 0.01mm", category: "MEASUREMENT", imageUrl: null },
  { name: "Feeler Gauge Set", description: "Blade-type feeler gauge set", category: "MEASUREMENT", imageUrl: null },
  { name: "Angle Finder", description: "Digital protractor angle finder", category: "MEASUREMENT", imageUrl: null },
  { name: "Surface Plate", description: "Granite surface plate 300x300mm", category: "MEASUREMENT", imageUrl: null },

  { name: "Soldering Iron", description: "25W soldering iron for electronics", category: "SOLDERING", imageUrl: null },
  { name: "Soldering Station", description: "Temperature-controlled soldering station", category: "SOLDERING", imageUrl: null },
  { name: "Desoldering Pump", description: "Manual desoldering vacuum pump", category: "SOLDERING", imageUrl: null },
  { name: "Solder Wire", description: "Lead-free solder wire 0.8mm", category: "SOLDERING", imageUrl: null },
  { name: "Flux Paste", description: "Soldering flux paste for electronics", category: "SOLDERING", imageUrl: null },
  { name: "Heat Gun", description: "Variable temperature heat gun", category: "SOLDERING", imageUrl: null },

  { name: "Screwdriver Set", description: " Phillips and flathead screwdriver set", category: "HAND_TOOLS", imageUrl: null },
  { name: "Wrench Set", description: "Combination wrench set metric", category: "HAND_TOOLS", imageUrl: null },
  { name: "Socket Set", description: "Ratchet socket set drive", category: "HAND_TOOLS", imageUrl: null },
  { name: "Pliers Set", description: "Needle-nose and slip-joint pliers", category: "HAND_TOOLS", imageUrl: null },
  { name: "Hammer", description: "Claw hammer 16oz", category: "HAND_TOOLS", imageUrl: null },
  { name: "Hacksaw", description: "Adjustable hacksaw frame", category: "HAND_TOOLS", imageUrl: null },
  { name: "File Set", description: "Metal file set assorted shapes", category: "HAND_TOOLS", imageUrl: null },
  { name: "Measuring Tape", description: "5-meter measuring tape", category: "HAND_TOOLS", imageUrl: null },
  { name: "Level", description: "Spirit level 24-inch", category: "HAND_TOOLS", imageUrl: null },
  { name: "Utility Knife", description: "Retractable utility knife", category: "HAND_TOOLS", imageUrl: null },

  { name: "Angle Grinder", description: "4.5-inch angle grinder", category: "POWER_TOOLS", imageUrl: null },
  { name: "Circular Saw", description: "7-1/4 inch circular saw", category: "POWER_TOOLS", imageUrl: null },
  { name: "Reciprocating Saw", description: "Variable speed reciprocating saw", category: "POWER_TOOLS", imageUrl: null },
  { name: "Power Drill", description: "Cordless drill driver 18V", category: "POWER_TOOLS", imageUrl: null },
  { name: "Impact Driver", description: "Cordless impact driver 18V", category: "POWER_TOOLS", imageUrl: null },
  { name: "Jigsaw", description: "Variable speed jigsaw", category: "POWER_TOOLS", imageUrl: null },
  { name: "Router", description: "Plunge router with speed control", category: "POWER_TOOLS", imageUrl: null },
  { name: "Sander", description: "Random orbital sander 5-inch", category: "POWER_TOOLS", imageUrl: null },

  { name: "Safety Goggles", description: "Protective eyewear ANSI rated", category: "SAFETY", imageUrl: null },
  { name: "Safety Gloves", description: "Cut-resistant work gloves", category: "SAFETY", imageUrl: null },
  { name: "Face Shield", description: "Full-face protection shield", category: "SAFETY", imageUrl: null },
  { name: "Welding Helmet", description: "Auto-darkening welding helmet", category: "SAFETY", imageUrl: null },
  { name: "Ear Protection", description: "Noise-canceling ear muffs", category: "SAFETY", imageUrl: null },
  { name: "Dust Mask", description: "N95 respirator mask pack", category: "SAFETY", imageUrl: null },
  { name: "Safety Boots", description: "Steel-toe safety boots", category: "SAFETY", imageUrl: null },
  { name: "Fire Extinguisher", description: "ABC fire extinguisher 10lb", category: "SAFETY", imageUrl: null },

  { name: "Robotic Arm", description: "6-axis industrial robotic arm", category: "ROBOTICS", imageUrl: null },
  { name: "Servo Motor Kit", description: "High-torque servo motor set", category: "ROBOTICS", imageUrl: null },
  { name: "Stepper Motor Driver", description: "Stepper motor controller board", category: "ROBOTICS", imageUrl: null },
  { name: "Motion Controller", description: "Multi-axis motion controller", category: "ROBOTICS", imageUrl: null },
  { name: "Sensor Kit", description: "Distance and proximity sensors", category: "ROBOTICS", imageUrl: null },
  { name: "Gripper Module", description: "Pneumatic gripper for robotics", category: "ROBOTICS", imageUrl: null },
  { name: "End Effector", description: "Universal robot end effector", category: "ROBOTICS", imageUrl: null },

  { name: "PLC Controller", description: "Programmable logic controller", category: "AUTOMATION", imageUrl: null },
  { name: "HMI Display", description: "Human-machine interface panel", category: "AUTOMATION", imageUrl: null },
  { name: "Limit Switch", description: "Industrial limit switch pack", category: "AUTOMATION", imageUrl: null },
  { name: "Proximity Sensor", description: "Inductive proximity sensors", category: "AUTOMATION", imageUrl: null },
  { name: "Conveyor Belt Kit", description: "Mini conveyor system", category: "AUTOMATION", imageUrl: null },
  { name: "Relay Board", description: "8-channel relay module", category: "AUTOMATION", imageUrl: null },
  { name: "Motor Controller", description: "Variable frequency drive", category: "AUTOMATION", imageUrl: null },

  { name: "3D Printer Filament", description: "PLA filament 1.75mm various colors", category: "PROTOTYPING", imageUrl: null },
  { name: "Acrylic Sheet", description: "Clear acrylic sheet 3mm", category: "PROTOTYPING", imageUrl: null },
  { name: "Foam Board", description: "Styrofoam board for prototyping", category: "PROTOTYPING", imageUrl: null },
  { name: "3D Printer", description: "FDM 3D printer 300x300x400mm", category: "PROTOTYPING", imageUrl: null },
  { name: "Laser Cutter", description: "CO2 laser cutter 40W", category: "PROTOTYPING", imageUrl: null },
  { name: "Vacuum Forming Machine", description: "Desktop vacuum former", category: "PROTOTYPING", imageUrl: null },
  { name: "Injection Molder", description: "Desktop injection molding machine", category: "PROTOTYPING", imageUrl: null },

  { name: "3D Printer Resin", description: "UV-curable resin for SLA printing", category: "THREE_D_PRINTING", imageUrl: null },
  { name: "Print Bed Adhesive", description: "Build plate adhesive spray", category: "THREE_D_PRINTING", imageUrl: null },
  { name: "Nozzle Kit", description: "3D printer nozzle assortment", category: "THREE_D_PRINTING", imageUrl: null },
  { name: "Print Surface", description: "PEI spring steel build plate", category: "THREE_D_PRINTING", imageUrl: null },
  { name: "Filament Dryer", description: "Filament storage and dryer box", category: "THREE_D_PRINTING", imageUrl: null },
  { name: "SLA Printer", description: "Resin LCD 3D printer", category: "THREE_D_PRINTING", imageUrl: null },

  { name: "CNC Router", description: "Desktop CNC router 300x300mm", category: "CNC", imageUrl: null },
  { name: "CNC Mill", description: "Vertical CNC milling machine", category: "CNC", imageUrl: null },
  { name: "End Mill Set", description: "Carbide end mill assortment", category: "CNC", imageUrl: null },
  { name: "CNC Controller", description: "GRBL CNC controller board", category: "CNC", imageUrl: null },
  { name: "Spindle Motor", description: "Water-cooled spindle 2.2kW", category: "CNC", imageUrl: null },
  { name: "Vise", description: "CNC milling vise 6-inch", category: "CNC", imageUrl: null },
  { name: "Coolant System", description: "Flood coolant system for CNC", category: "CNC", imageUrl: null },

  { name: "Bearing Puller", description: "Slide hammer bearing puller", category: "MAINTENANCE", imageUrl: null },
  { name: "Grease Gun", description: "Heavy-duty grease gun", category: "MAINTENANCE", imageUrl: null },
  { name: "Torque Wrench", description: "Click-type torque wrench", category: "MAINTENANCE", imageUrl: null },
  { name: "Oil Filter Wrench", description: "Adjustable oil filter wrench", category: "MAINTENANCE", imageUrl: null },
  { name: "Multimeter", description: "Digital multimeter for maintenance", category: "MAINTENANCE", imageUrl: null },
  { name: "Tool Cart", description: "Rolling tool cart with drawers", category: "MAINTENANCE", imageUrl: null },
  { name: "Parts Washer", description: "Solvent parts cleaning tank", category: "MAINTENANCE", imageUrl: null },
];

async function seed() {
  console.log("Starting database seed...\n");

  try {
    console.log("Seeding categories...");
    for (const category of categoriesData) {
      const existing = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.name, category.name));
      
      if (existing.length === 0) {
        await db.insert(schema.categories).values(category);
        console.log(`Inserted category: ${category.name}`);
      } else {
        console.log(`  - Category already exists: ${category.name}`);
      }
    }

    console.log("\nSeeding items...");
    const allCategories = await db.select().from(schema.categories);
    const categoryMap = new Map(allCategories.map(c => [c.name, c.id]));

    for (const item of itemsData) {
      const categoryID = categoryMap.get(item.category);
      if (!categoryID) {
        console.log(`Skipping item "${item.name}": category "${item.category}" not found`);
        continue;
      }

      const existing = await db
        .select()
        .from(schema.items)
        .where(eq(schema.items.name, item.name));

      if (existing.length === 0) {
        await db.insert(schema.items).values({
          name: item.name,
          description: item.description,
          categoryID: categoryID,
          imageUrl: item.imageUrl,
        });
        console.log(`Inserted item: ${item.name}`);
      } else {
        console.log(`  - Item already exists: ${item.name}`);
      }
    }

    console.log("\nDatabase seed completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
