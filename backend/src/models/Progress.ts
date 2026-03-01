import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProgressEntry {
  experiment: mongoose.Types.ObjectId;
  bestScore: number;
  attempts: number;
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  lastAttemptAt: Date;
  totalTimeMinutes: number;
  conceptsLearned: string[];
}

export interface IProgress extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  classGroup?: string;
  overallGrade: string;
  overallPercent: number;
  experimentProgress: IProgressEntry[];
  badges: string[];
  certificatesEarned: string[];
  currentLevel: number;
  experiencePoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressEntrySchema = new Schema<IProgressEntry>(
  {
    experiment: { type: Schema.Types.ObjectId, ref: 'Experiment', required: true },
    bestScore: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    completionStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'mastered'],
      default: 'not_started',
    },
    lastAttemptAt: { type: Date, default: Date.now },
    totalTimeMinutes: { type: Number, default: 0 },
    conceptsLearned: [{ type: String }],
  },
  { _id: false }
);

const ProgressSchema = new Schema<IProgress>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    classGroup: { type: String, trim: true },
    overallGrade: { type: String, default: 'N/A' },
    overallPercent: { type: Number, default: 0, min: 0, max: 100 },
    experimentProgress: [ProgressEntrySchema],
    badges: [{ type: String }],
    certificatesEarned: [{ type: String }],
    currentLevel: { type: Number, default: 1 },
    experiencePoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-calculate grade before save
ProgressSchema.pre('save', function (this: IProgress, next) {
  const p = this.overallPercent;
  if (p >= 90) this.overallGrade = 'A+';
  else if (p >= 80) this.overallGrade = 'A';
  else if (p >= 70) this.overallGrade = 'B';
  else if (p >= 60) this.overallGrade = 'C';
  else if (p >= 50) this.overallGrade = 'D';
  else this.overallGrade = 'F';
  next();
});

const Progress: Model<IProgress> = mongoose.model<IProgress>('Progress', ProgressSchema);
export default Progress;
