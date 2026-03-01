import mongoose, { Document, Schema, Model } from 'mongoose';

export type SessionStatus = 'active' | 'completed' | 'abandoned' | 'paused';

export interface IStepResult {
  stepNumber: number;
  completed: boolean;
  score: number;
  attemptCount: number;
  hintsUsed: number;
  timeSpentSeconds: number;
  observations: string;
  submittedAt?: Date;
}

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  experiment: mongoose.Types.ObjectId;
  status: SessionStatus;
  startedAt: Date;
  completedAt?: Date;
  totalTimeSeconds: number;
  stepResults: IStepResult[];
  finalScore: number;
  maxScore: number;
  accuracyPercent: number;
  arInteractions: number;
  hintsUsed: number;
  notes: string;
  deviceType: string;
  createdAt: Date;
  updatedAt: Date;
}

const StepResultSchema = new Schema<IStepResult>(
  {
    stepNumber: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    attemptCount: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    timeSpentSeconds: { type: Number, default: 0 },
    observations: { type: String, default: '' },
    submittedAt: { type: Date },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    experiment: {
      type: Schema.Types.ObjectId,
      ref: 'Experiment',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned', 'paused'],
      default: 'active',
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    totalTimeSeconds: { type: Number, default: 0 },
    stepResults: [StepResultSchema],
    finalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 100 },
    accuracyPercent: { type: Number, default: 0, min: 0, max: 100 },
    arInteractions: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    deviceType: { type: String, default: 'desktop' },
  },
  { timestamps: true }
);

// Auto-calculate accuracy before save
SessionSchema.pre('save', function (this: ISession, next) {
  if (this.maxScore > 0) {
    this.accuracyPercent = Math.round((this.finalScore / this.maxScore) * 100);
  }
  next();
});

SessionSchema.index({ student: 1, experiment: 1 });
SessionSchema.index({ createdAt: -1 });

const Session: Model<ISession> = mongoose.model<ISession>('Session', SessionSchema);
export default Session;
