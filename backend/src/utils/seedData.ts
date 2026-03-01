/**
 * Seed script — populates the database with demo experiments, users, and analytics.
 * Run with: npx ts-node src/utils/seedData.ts
 */

import mongoose from 'mongoose';
import { config } from '../config/config';
import Experiment from '../models/Experiment';
import User from '../models/User';

const experiments = [
  // ─── Mechanics ───────────────────────────────────────────────────────────
  {
    title: "Newton's Second Law of Motion",
    description:
      'Investigate the relationship between force, mass, and acceleration using virtual carts and force sensors in an AR environment.',
    category: 'mechanics',
    difficulty: 'beginner',
    objectives: [
      'Understand the relationship F = ma',
      'Measure net force and resulting acceleration',
      'Plot and interpret F-a graphs',
    ],
    equipment: [
      { name: 'Virtual Cart', modelFile: 'cart.glb', description: 'Frictionless AR cart', quantity: 1 },
      { name: 'Force Sensor', modelFile: 'sensor.glb', description: 'Digital force gauge', quantity: 1 },
      { name: 'Mass Set', modelFile: 'masses.glb', description: '100 g slotted masses', quantity: 5 },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Setup the AR Cart System',
        instruction: 'Place the virtual cart on the frictionless track and attach the force sensor.',
        expectedObservation: 'Cart remains stationary; force sensor reads 0 N.',
        hints: ['Ensure the cart is centred on the track.'],
      },
      {
        stepNumber: 2,
        title: 'Apply Known Forces',
        instruction: 'Apply forces of 1 N, 2 N, and 3 N and record the resulting acceleration each time.',
        expectedObservation: 'Acceleration doubles when force doubles (constant mass).',
        hints: ['Use the digital readout overlay to record values.'],
      },
      {
        stepNumber: 3,
        title: 'Vary the Mass',
        instruction: 'Keep force constant at 2 N and change the mass from 0.5 kg to 1 kg and 2 kg.',
        expectedObservation: 'Acceleration halves when mass doubles.',
        hints: ['Drag slotted masses onto the cart in AR.'],
      },
      {
        stepNumber: 4,
        title: 'Analyse Results',
        instruction: 'Plot F vs a and m vs 1/a graphs. Calculate the slope.',
        expectedObservation: 'Both graphs are linear; slope equals mass and force respectively.',
        hints: ['Use the in-app graph tool.'],
      },
    ],
    theoryConcepts: ["Newton's Second Law", 'Net Force', 'Inertia', 'Kinematics'],
    estimatedDuration: 35,
    maxScore: 100,
    arModelId: 'mechanics_newton',
    isActive: true,
  },
  {
    title: 'Simple Pendulum and Gravitational Acceleration',
    description:
      'Measure the period of a simple pendulum for varying lengths and determine the local gravitational acceleration.',
    category: 'mechanics',
    difficulty: 'beginner',
    objectives: [
      'Measure period T for different pendulum lengths',
      'Use T = 2π√(L/g) to find g',
      'Analyse sources of experimental error',
    ],
    equipment: [
      { name: 'AR Pendulum', modelFile: 'pendulum.glb', description: 'Fixed-length virtual pendulum', quantity: 1 },
      { name: 'Stopwatch', modelFile: 'stopwatch.glb', description: 'AR digital timer', quantity: 1 },
    ],
    steps: [
      { stepNumber: 1, title: 'Set Pendulum Length', instruction: 'Set the pendulum length to 0.25 m using the AR slider.', expectedObservation: 'Length indicator reads 0.25 m.', hints: [] },
      { stepNumber: 2, title: 'Release and Time', instruction: 'Release from 10° and time 10 complete oscillations.', expectedObservation: 'Period ≈ 1.0 s at 0.25 m length.', hints: ['Count from the lowest point for accuracy.'] },
      { stepNumber: 3, title: 'Repeat for Multiple Lengths', instruction: 'Repeat for 0.5 m, 0.75 m, and 1.0 m.', expectedObservation: 'Period increases with length; T² ∝ L.', hints: [] },
      { stepNumber: 4, title: 'Calculate g', instruction: 'Plot T² vs L and calculate g from the gradient.', expectedObservation: 'g ≈ 9.8 m/s².', hints: ['gradient = 4π²/g'] },
    ],
    theoryConcepts: ['Simple Harmonic Motion', 'Gravitational Acceleration', 'Period and Frequency'],
    estimatedDuration: 30,
    maxScore: 100,
    arModelId: 'mechanics_pendulum',
    isActive: true,
  },

  // ─── Optics ──────────────────────────────────────────────────────────────
  {
    title: "Snell's Law and Refraction",
    description:
      'Observe the refraction of light at an air-glass interface and verify Snell\'s Law using virtual ray tracing.',
    category: 'optics',
    difficulty: 'intermediate',
    objectives: [
      'Measure angles of incidence and refraction',
      'Verify n₁ sin θ₁ = n₂ sin θ₂',
      'Calculate the refractive index of glass',
    ],
    equipment: [
      { name: 'AR Light Ray', modelFile: 'ray.glb', description: 'Adjustable monochromatic ray', quantity: 1 },
      { name: 'Glass Block', modelFile: 'glass_block.glb', description: 'Semi-circular glass slab', quantity: 1 },
    ],
    steps: [
      { stepNumber: 1, title: 'Set Up Ray and Block', instruction: 'Position the glass block and direct the ray at 30° to the normal.', expectedObservation: 'Ray bends toward the normal inside glass.', hints: [] },
      { stepNumber: 2, title: 'Measure Angles', instruction: 'Record θ_i and θ_r for incidence angles 20°, 40°, 60°.', expectedObservation: 'θ_r < θ_i for all cases.', hints: ['Use the protractor overlay.'] },
      { stepNumber: 3, title: 'Calculate n', instruction: 'Apply Snell\'s Law to find n for each measurement.', expectedObservation: 'n ≈ 1.5 for all cases — consistent result.', hints: ['n = sin θ_i / sin θ_r'] },
      { stepNumber: 4, title: 'Find Critical Angle', instruction: 'Increase θ_i until total internal reflection occurs.', expectedObservation: 'TIR at θ_c ≈ 42°.', hints: ['θ_c = arcsin(1/n)'] },
    ],
    theoryConcepts: ["Snell's Law", 'Refractive Index', 'Total Internal Reflection'],
    estimatedDuration: 40,
    maxScore: 100,
    arModelId: 'optics_snell',
    isActive: true,
  },

  // ─── Electromagnetism ────────────────────────────────────────────────────
  {
    title: "Ohm's Law and Resistance",
    description:
      "Build virtual circuits to verify Ohm's Law and explore series versus parallel resistor configurations.",
    category: 'electromagnetism',
    difficulty: 'beginner',
    objectives: [
      "Verify V = IR (Ohm's Law)",
      'Measure current, voltage, and resistance',
      'Compare series and parallel combinations',
    ],
    equipment: [
      { name: 'AR Battery', modelFile: 'battery.glb', description: 'Variable-voltage cell', quantity: 1 },
      { name: 'Resistors', modelFile: 'resistor.glb', description: '100Ω, 220Ω, 470Ω', quantity: 3 },
      { name: 'Ammeter', modelFile: 'ammeter.glb', description: 'Digital AR ammeter', quantity: 1 },
      { name: 'Voltmeter', modelFile: 'voltmeter.glb', description: 'Digital AR voltmeter', quantity: 1 },
    ],
    steps: [
      { stepNumber: 1, title: 'Build Series Circuit', instruction: 'Connect battery, 100Ω resistor, and ammeter in series.', expectedObservation: 'Circuit complete; current flows.', hints: [] },
      { stepNumber: 2, title: 'Vary Voltage', instruction: 'Change voltage from 2 V to 10 V and record current.', expectedObservation: 'Current increases linearly with voltage.', hints: ['Plot V vs I.'] },
      { stepNumber: 3, title: 'Swap Resistors', instruction: 'Replace 100Ω with 220Ω, then 470Ω. Record current at 6 V each time.', expectedObservation: 'Current decreases as resistance increases.', hints: [] },
      { stepNumber: 4, title: 'Parallel Configuration', instruction: 'Connect 100Ω and 220Ω in parallel. Measure total current.', expectedObservation: 'Total current is sum of branch currents.', hints: ["R_total = R1*R2 / (R1+R2)"] },
    ],
    theoryConcepts: ["Ohm's Law", 'Series Circuits', 'Parallel Circuits', 'Resistance'],
    estimatedDuration: 35,
    maxScore: 100,
    arModelId: 'electromagnetism_ohm',
    isActive: true,
  },

  // ─── Thermodynamics ──────────────────────────────────────────────────────
  {
    title: "Boyle's Law — Pressure and Volume",
    description:
      'Explore the inverse relationship between gas pressure and volume at constant temperature using an AR piston apparatus.',
    category: 'thermodynamics',
    difficulty: 'intermediate',
    objectives: [
      'Verify PV = constant at constant T',
      'Plot P vs 1/V graphs',
      'Understand isothermal processes',
    ],
    equipment: [
      { name: 'AR Syringe', modelFile: 'syringe.glb', description: 'Variable-volume gas syringe', quantity: 1 },
      { name: 'Pressure Gauge', modelFile: 'pressure_gauge.glb', description: 'Digital manometer', quantity: 1 },
    ],
    steps: [
      { stepNumber: 1, title: 'Set Initial Conditions', instruction: 'Set volume to 60 mL at atmospheric pressure (101.3 kPa).', expectedObservation: 'Gauge reads 101.3 kPa.', hints: [] },
      { stepNumber: 2, title: 'Compress Gas', instruction: 'Reduce volume to 50, 40, 30, and 20 mL. Record pressure each time.', expectedObservation: 'Pressure increases as volume decreases.', hints: ['Keep temperature constant!'] },
      { stepNumber: 3, title: 'Calculate PV', instruction: 'Compute PV for each measurement.', expectedObservation: 'PV ≈ constant for all readings.', hints: [] },
      { stepNumber: 4, title: 'Plot and Conclude', instruction: 'Plot P vs 1/V. Interpret the graph.', expectedObservation: 'Straight line through origin confirms Boyle\'s Law.', hints: [] },
    ],
    theoryConcepts: ["Boyle's Law", 'Ideal Gas', 'Isothermal Process', 'PV diagrams'],
    estimatedDuration: 30,
    maxScore: 100,
    arModelId: 'thermodynamics_boyle',
    isActive: true,
  },

  // ─── Waves ───────────────────────────────────────────────────────────────
  {
    title: 'Wave Properties — Frequency, Wavelength, Speed',
    description:
      'Investigate the relationship v = fλ using a virtual wave tank, adjustable frequency oscillator, and stroboscope.',
    category: 'waves',
    difficulty: 'intermediate',
    objectives: [
      'Measure wavelength and frequency independently',
      'Verify v = fλ',
      'Observe standing waves and resonance',
    ],
    equipment: [
      { name: 'AR Wave Tank', modelFile: 'wave_tank.glb', description: 'Ripple tank simulator', quantity: 1 },
      { name: 'Oscillator', modelFile: 'oscillator.glb', description: 'Variable-frequency source', quantity: 1 },
      { name: 'Stroboscope', modelFile: 'strobe.glb', description: 'Adjustable strobe lamp', quantity: 1 },
    ],
    steps: [
      { stepNumber: 1, title: 'Set Frequency', instruction: 'Set oscillator to 5 Hz. Observe the wave pattern.', expectedObservation: 'Regular wave crests visible.', hints: [] },
      { stepNumber: 2, title: 'Measure Wavelength', instruction: 'Use the AR ruler to measure the distance between 5 consecutive crests.', expectedObservation: 'λ ≈ 4 cm at f = 5 Hz.', hints: ['Divide total distance by number of gaps.'] },
      { stepNumber: 3, title: 'Calculate Speed', instruction: 'Compute v = f × λ.', expectedObservation: 'v ≈ 0.2 m/s.', hints: [] },
      { stepNumber: 4, title: 'Find Resonance', instruction: 'Adjust frequency until standing waves appear in the tank.', expectedObservation: 'Nodes and antinodes stationary — resonance confirmed.', hints: ['Resonance occurs when L = nλ/2.'] },
    ],
    theoryConcepts: ['Wave Equation', 'Wavelength', 'Frequency', 'Standing Waves', 'Resonance'],
    estimatedDuration: 40,
    maxScore: 100,
    arModelId: 'waves_properties',
    isActive: true,
  },

  // ─── Modern Physics ──────────────────────────────────────────────────────
  {
    title: 'Photoelectric Effect',
    description:
      'Investigate the emission of electrons from a metal surface when illuminated with light of varying frequency and intensity.',
    category: 'modern_physics',
    difficulty: 'advanced',
    objectives: [
      'Observe the photoelectric effect in AR',
      "Plot stopping voltage vs frequency to find Planck's constant",
      'Determine the work function of the metal',
    ],
    equipment: [
      { name: 'AR Light Source', modelFile: 'light_source.glb', description: 'Tunable frequency lamp', quantity: 1 },
      { name: 'Photocell', modelFile: 'photocell.glb', description: 'AR photoelectric cell', quantity: 1 },
      { name: 'Galvanometer', modelFile: 'galvanometer.glb', description: 'Sensitive current meter', quantity: 1 },
    ],
    steps: [
      { stepNumber: 1, title: 'Below Threshold Frequency', instruction: 'Illuminate the metal with red light (f < f₀). Note the current.', expectedObservation: 'No current flows regardless of intensity.', hints: ["This shows the quantum nature of light."] },
      { stepNumber: 2, title: 'Above Threshold', instruction: 'Switch to UV light (f > f₀). Observe the photocurrent.', expectedObservation: 'Current flows immediately; increases with intensity.', hints: [] },
      { stepNumber: 3, title: 'Measure Stopping Voltage', instruction: 'Apply a reverse voltage to just stop the current at 5 different frequencies.', expectedObservation: 'Higher f → higher stopping voltage V_s.', hints: ['Record f and V_s in the data table.'] },
      { stepNumber: 4, title: "Calculate Planck's Constant", instruction: 'Plot V_s vs f. Gradient = h/e. Calculate h.', expectedObservation: 'h ≈ 6.63 × 10⁻³⁴ J·s.', hints: ['e = 1.6 × 10⁻¹⁹ C'] },
    ],
    theoryConcepts: ['Photoelectric Effect', "Planck's Constant", 'Work Function', 'Photons', 'Quantum Theory'],
    estimatedDuration: 50,
    maxScore: 120,
    arModelId: 'modern_photoelectric',
    isActive: true,
  },
];

const demoUsers = [
  {
    firstName: 'Alice',
    lastName: 'Mwanza',
    email: 'alice.student@arlab.edu',
    password: 'Student@123',
    role: 'student',
    studentId: 'STU-2024-001',
    classGroup: 'Physics-A',
    institution: 'Smart AR University',
    isActive: true,
  },
  {
    firstName: 'Bob',
    lastName: 'Phiri',
    email: 'bob.student@arlab.edu',
    password: 'Student@123',
    role: 'student',
    studentId: 'STU-2024-002',
    classGroup: 'Physics-A',
    institution: 'Smart AR University',
    isActive: true,
  },
  {
    firstName: 'Dr. Sarah',
    lastName: 'Banda',
    email: 'sarah.educator@arlab.edu',
    password: 'Educator@123',
    role: 'educator',
    institution: 'Smart AR University',
    isActive: true,
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@arlab.edu',
    password: 'Admin@123',
    role: 'admin',
    institution: 'Smart AR University',
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅  Connected to MongoDB');

    // Clear existing
    await Experiment.deleteMany({});
    await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });
    console.log('🗑️  Cleared existing seed data');

    // Insert admin user first so we have an _id for createdBy
    const adminData = demoUsers.find((u) => u.role === 'admin')!;
    const adminUser = await new User(adminData).save();

    // Insert remaining users
    for (const u of demoUsers.filter((u) => u.role !== 'admin')) {
      await new User(u).save();
    }
    console.log(`👥  Seeded ${demoUsers.length} demo users`);

    // Insert experiments with createdBy set to admin's _id
    await Experiment.insertMany(experiments.map((e) => ({ ...e, createdBy: adminUser._id })));
    console.log(`📐  Seeded ${experiments.length} experiments`);

    console.log('\n🎉  Seed complete!');
    console.log('\nDemo credentials:');
    console.log('  Student  → alice.student@arlab.edu  / Student@123');
    console.log('  Educator → sarah.educator@arlab.edu / Educator@123');
    console.log('  Admin    → admin@arlab.edu          / Admin@123');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
