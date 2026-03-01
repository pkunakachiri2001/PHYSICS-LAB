import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IConceptualScore {
  concept: string;
  score: number;
  lastAssessedAt: Date;
}

export interface IAnalytics extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  totalSessions: number;
  completedSessions: number;
  totalTimeSpentMinutes: number;
  averageAccuracy: number;
  averageScore: number;
  highestScore: number;
  experimentsAttempted: mongoose.Types.ObjectId[];
  experimentsCompleted: mongoose.Types.ObjectId[];
  conceptualScores: IConceptualScore[];
  engagementScore: number; // AI-computed 0–100
  streakDays: number;
  lastActiveAt: Date;
  weeklyActivity: number[]; // 7 values, one per day
  monthlyScores: { month: string; averageScore: number }[];
  aiInsights: string[];
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const ConceptualScoreSchema = new Schema<IConceptualScore>(
  {
    concept: { type: String, required: true },
    score: { type: Number, default: 0, min: 0, max: 100 },
    lastAssessedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MonthlyScoreSchema = new Schema(
  {
    month: { type: String, required: true },
    averageScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalSessions: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    totalTimeSpentMinutes: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0, min: 0, max: 100 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    experimentsAttempted: [{ type: Schema.Types.ObjectId, ref: 'Experiment' }],
    experimentsCompleted: [{ type: Schema.Types.ObjectId, ref: 'Experiment' }],
    conceptualScores: [ConceptualScoreSchema],
    engagementScore: { type: Number, default: 0, min: 0, max: 100 },
    streakDays: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
    weeklyActivity: {
      type: [Number],
      default: [0, 0, 0, 0, 0, 0, 0],
      validate: {
        validator: (arr: number[]) => arr.length === 7,
        message: 'weeklyActivity must have exactly 7 entries',
      },
    },
    monthlyScores: [MonthlyScoreSchema],
    aiInsights: [{ type: String }],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  { timestamps: true }
);

const Analytics: Model<IAnalytics> = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
export default Analytics;
