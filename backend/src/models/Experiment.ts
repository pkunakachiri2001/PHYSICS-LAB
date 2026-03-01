import mongoose, { Document, Schema, Model } from 'mongoose';

export type ExperimentCategory =
  | 'mechanics'
  | 'optics'
  | 'thermodynamics'
  | 'electromagnetism'
  | 'waves'
  | 'modern_physics';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface IEquipment {
  name: string;
  modelFile: string;
  description: string;
  quantity: number;
}

export interface IExperimentStep {
  stepNumber: number;
  title: string;
  instruction: string;
  expectedObservation: string;
  hints: string[];
}

export interface IExperiment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: ExperimentCategory;
  difficulty: DifficultyLevel;
  objectives: string[];
  equipment: IEquipment[];
  steps: IExperimentStep[];
  theoryConcepts: string[];
  estimatedDuration: number; // in minutes
  maxScore: number;
  arModelId: string;
  thumbnailUrl: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    name: { type: String, required: true },
    modelFile: { type: String, required: true },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const ExperimentStepSchema = new Schema<IExperimentStep>(
  {
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    expectedObservation: { type: String, default: '' },
    hints: [{ type: String }],
  },
  { _id: false }
);

const ExperimentSchema = new Schema<IExperiment>(
  {
    title: {
      type: String,
      required: [true, 'Experiment title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Experiment description is required'],
    },
    category: {
      type: String,
      enum: ['mechanics', 'optics', 'thermodynamics', 'electromagnetism', 'waves', 'modern_physics'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    objectives: [{ type: String, required: true }],
    equipment: [EquipmentSchema],
    steps: [ExperimentStepSchema],
    theoryConcepts: [{ type: String }],
    estimatedDuration: { type: Number, default: 30, min: 5 },
    maxScore: { type: Number, default: 100 },
    arModelId: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

ExperimentSchema.index({ category: 1, difficulty: 1 });
ExperimentSchema.index({ title: 'text', description: 'text' });

const Experiment: Model<IExperiment> = mongoose.model<IExperiment>('Experiment', ExperimentSchema);
export default Experiment;
