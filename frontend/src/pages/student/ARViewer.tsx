import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder, Torus, Environment, Float, Text } from '@react-three/drei';
import {
  ArrowLeft, Play, Pause, ChevronRight, ChevronLeft, Lightbulb,
  CheckCircle, Eye, RotateCcw,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { experimentsAPI } from '../../services/api';
import { Experiment, Session } from '../../types';

// ─── 3D AR Models per Category ───────────────────────────────────────────────

const PendulumModel: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
  return (
    <group>
      {/* Pivot */}
      <Cylinder args={[0.05, 0.05, 0.1]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* String */}
      <Cylinder args={[0.01, 0.01, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#cbd5e1" />
      </Cylinder>
      {/* Bob */}
      <Float speed={isRunning ? 2 : 0} rotationIntensity={isRunning ? 1 : 0} floatIntensity={0.3}>
        <Sphere args={[0.2]} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#22d3ee" metalness={0.7} roughness={0.3} />
        </Sphere>
      </Float>
      {/* Support */}
      <Box args={[2, 0.1, 0.1]} position={[0, 2.1, 0]}>
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </Box>
    </group>
  );
};

const CircuitModel: React.FC = () => (
  <group>
    {/* Battery */}
    <Box args={[0.4, 0.8, 0.3]} position={[-1.5, 0, 0]}>
      <meshStandardMaterial color="#22c55e" metalness={0.3} roughness={0.6} />
    </Box>
    {/* Resistor */}
    <Box args={[0.6, 0.3, 0.3]} position={[0, 1, 0]}>
      <meshStandardMaterial color="#f59e0b" metalness={0.2} roughness={0.7} />
    </Box>
    {/* LED bulb */}
    <Sphere args={[0.2]} position={[1.5, 0, 0]}>
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
    </Sphere>
    {/* Wires */}
    {[[-0.75, 0.5, 0], [0.75, 0.5, 0]].map((pos, i) => (
      <Cylinder key={i} args={[0.025, 0.025, 1.5]} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#e2e8f0" />
      </Cylinder>
    ))}
  </group>
);

const OpticsModel: React.FC = () => (
  <group>
    {/* Light source */}
    <Box args={[0.3, 0.3, 0.5]} position={[-2, 0, 0]}>
      <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} />
    </Box>
    {/* Prism */}
    <mesh position={[0, 0, 0]} rotation={[0, 0.3, 0]}>
      <tetrahedronGeometry args={[0.6]} />
      <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} metalness={0.1} roughness={0} />
    </mesh>
    {/* Refracted beams */}
    {[0.2, 0, -0.2].map((offset, i) => (
      <Cylinder
        key={i}
        args={[0.02, 0.02, 1.5]}
        position={[1.2, offset, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial
          color={['#ef4444', '#22c55e', '#3b82f6'][i]}
          emissive={['#ef4444', '#22c55e', '#3b82f6'][i]}
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </Cylinder>
    ))}
  </group>
);

const WavesModel: React.FC = () => (
  <group>
    {[...Array(8)].map((_, i) => (
      <Torus key={i} args={[0.3 + i * 0.3, 0.03, 8, 40]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={1 - i * 0.1}
          emissive="#06b6d4"
          emissiveIntensity={0.3}
        />
      </Torus>
    ))}
    <Sphere args={[0.15]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1} />
    </Sphere>
  </group>
);

const GenericModel: React.FC = () => (
  <Float speed={1.5} rotationIntensity={0.5}>
    <Box args={[1, 1, 1]}>
      <meshStandardMaterial color="#818cf8" metalness={0.5} roughness={0.3} />
    </Box>
  </Float>
);

const modelMap: Record<string, React.FC<{ isRunning: boolean }>> = {
  mechanics: PendulumModel,
  electromagnetism: CircuitModel,
  optics: OpticsModel,
  waves: WavesModel,
};

// ─── AR Canvas Wrapper ────────────────────────────────────────────────────────

const ARScene: React.FC<{ category: string; isRunning: boolean }> = ({
  category,
  isRunning,
}) => {
  const ModelComponent = modelMap[category] || GenericModel;
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }} shadows>
      <Suspense fallback={null}>
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, 5]} color="#22d3ee" intensity={0.5} />
        <ModelComponent isRunning={isRunning} />
        <Text
          position={[0, -2.5, 0]}
          fontSize={0.18}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          AR Physics Lab — Drag to rotate
        </Text>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
      </Suspense>
    </Canvas>
  );
};

// ─── Main AR Viewer Page ──────────────────────────────────────────────────────

const ARViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stepCompleted, setStepCompleted] = useState<boolean[]>([]);
  const [observations, setObservations] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [expRes, sessionRes] = await Promise.all([
          experimentsAPI.getById(id),
          experimentsAPI.startSession(id, { deviceType: 'desktop' }),
        ]);
        const exp = expRes.data.data.experiment as Experiment;
        setExperiment(exp);
        setSession(sessionRes.data.data.session as Session);
        setStepCompleted(new Array(exp.steps.length).fill(false));
      } catch (err) {
        console.error('Failed to load experiment:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCompleteStep = async () => {
    if (!session || !experiment) return;
    const updated = [...stepCompleted];
    updated[currentStep] = true;
    setStepCompleted(updated);

    if (currentStep < experiment.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setShowHint(false);
      setObservations('');
    } else {
      // Complete session
      setIsSaving(true);
      try {
        const totalScore = Math.round((updated.filter(Boolean).length / experiment.steps.length) * experiment.maxScore);
        const totalTime = Math.round((Date.now() - startTime.current) / 1000);
        await experimentsAPI.updateSession(session._id, {
          status: 'completed',
          finalScore: totalScore,
          totalTimeSeconds: totalTime,
          arInteractions: 10 + currentStep * 3,
          stepResults: experiment.steps.map((step, i) => ({
            stepNumber: step.stepNumber,
            completed: updated[i],
            score: updated[i] ? Math.round(experiment.maxScore / experiment.steps.length) : 0,
            attemptCount: 1,
            hintsUsed: showHint ? 1 : 0,
            timeSpentSeconds: Math.round(totalTime / experiment.steps.length),
            observations: i === currentStep ? observations : '',
          })),
        });
        navigate('/student', { state: { experimentCompleted: true } });
      } catch (err) {
        console.error('Failed to save session:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen message="Initialising AR environment..." />;
  if (!experiment) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      Experiment not found.
    </div>
  );

  const currentStepData = experiment.steps[currentStep];
  const progressPercent = ((stepCompleted.filter(Boolean).length) / experiment.steps.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/experiments')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={18} /> Back to Lab
          </button>
          <div className="h-5 w-px bg-slate-700" />
          <div>
            <h1 className="text-white font-semibold text-sm">{experiment.title}</h1>
            <p className="text-slate-500 text-xs capitalize">{experiment.category.replace('_', ' ')} · {experiment.difficulty}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-slate-500 text-xs">
              Step {currentStep + 1}/{experiment.steps.length}
            </span>
            <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-cyan-400 text-xs font-medium">{Math.round(progressPercent)}%</span>
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pause Simulation' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* AR Viewport */}
        <div className="flex-1 relative">
          <ARScene category={experiment.category} isRunning={isRunning} />

          {/* AR overlay badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-xs font-medium">AR Mode Active</span>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-lg px-3 py-1.5">
              <span className="text-slate-400 text-xs">
                {experiment.equipment.length > 0
                  ? experiment.equipment.map((e) => e.name).join(' • ')
                  : 'Virtual Apparatus Ready'}
              </span>
            </div>
          </div>

          {/* Rotate hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/40 rounded-lg px-4 py-2 flex items-center gap-2">
              <RotateCcw size={14} className="text-slate-500" />
              <span className="text-slate-500 text-xs">Click and drag to rotate the 3D model</span>
            </div>
          </div>
        </div>

        {/* Step Panel */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
          {/* Steps list header */}
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Eye size={16} className="text-cyan-400" />
              <h2 className="text-white font-semibold text-sm">Experiment Procedure</h2>
            </div>
            <p className="text-slate-500 text-xs">{experiment.title}</p>
          </div>

          {/* Steps navigation */}
          <div className="flex gap-2 px-5 py-3 border-b border-slate-800 overflow-x-auto">
            {experiment.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`flex-shrink-0 w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                  stepCompleted[i]
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : i === currentStep
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {stepCompleted[i] ? '✓' : step.stepNumber}
              </button>
            ))}
          </div>

          {/* Current step content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                  {currentStepData?.stepNumber}
                </div>
                <h3 className="text-white font-semibold text-sm">{currentStepData?.title}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{currentStepData?.instruction}</p>
            </div>

            {currentStepData?.expectedObservation && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-400 text-xs font-semibold mb-1">Expected Observation</p>
                <p className="text-slate-400 text-sm">{currentStepData.expectedObservation}</p>
              </div>
            )}

            {/* Observation input */}
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-2">
                Record Your Observations
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Describe what you observe..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all resize-none"
              />
            </div>

            {/* Hint toggle */}
            {currentStepData?.hints?.length > 0 && (
              <div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 text-amber-400 text-xs hover:text-amber-300 transition-colors"
                >
                  <Lightbulb size={14} />
                  {showHint ? 'Hide hint' : 'Show hint'}
                </button>
                {showHint && (
                  <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-400 text-xs font-semibold mb-1">Hint</p>
                    <p className="text-slate-400 text-sm">{currentStepData.hints[0]}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation controls */}
          <div className="p-5 border-t border-slate-800 space-y-3">
            <button
              onClick={handleCompleteStep}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
            >
              <CheckCircle size={16} />
              {currentStep === experiment.steps.length - 1
                ? isSaving ? 'Saving...' : 'Complete Experiment'
                : 'Mark Step Complete & Continue'}
            </button>

            <div className="flex gap-2">
              <button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((p) => p - 1)}
                className="flex-1 flex items-center justify-center gap-1 bg-slate-800 text-slate-400 text-xs py-2 rounded-xl hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={currentStep === experiment.steps.length - 1}
                onClick={() => setCurrentStep((p) => p + 1)}
                className="flex-1 flex items-center justify-center gap-1 bg-slate-800 text-slate-400 text-xs py-2 rounded-xl hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;
