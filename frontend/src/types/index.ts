// ─────────────────────────────────────────────────────────────────────────────
//  Central TypeScript type definitions for the Smart AR Physics Lab frontend
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'educator' | 'admin';

export interface User {
  _id: string;
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  role: UserRole;
  classGroup?: string;
  institution?: string;
  studentId?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Experiments ─────────────────────────────────────────────────────────────

export type ExperimentCategory =
  | 'mechanics'
  | 'optics'
  | 'thermodynamics'
  | 'electromagnetism'
  | 'waves'
  | 'modern_physics';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Equipment {
  name: string;
  modelFile: string;
  description: string;
  quantity: number;
}

export interface ExperimentStep {
  stepNumber: number;
  title: string;
  instruction: string;
  expectedObservation: string;
  hints: string[];
}

export interface Experiment {
  _id: string;
  title: string;
  description: string;
  category: ExperimentCategory;
  difficulty: DifficultyLevel;
  objectives: string[];
  equipment: Equipment[];
  steps: ExperimentStep[];
  theoryConcepts: string[];
  estimatedDuration: number;
  maxScore: number;
  arModelId: string;
  thumbnailUrl: string;
  isActive: boolean;
  createdBy: { firstName: string; lastName: string } | string;
  createdAt: string;
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export type SessionStatus = 'active' | 'completed' | 'abandoned' | 'paused';

export interface StepResult {
  stepNumber: number;
  completed: boolean;
  score: number;
  attemptCount: number;
  hintsUsed: number;
  timeSpentSeconds: number;
  observations: string;
}

export interface Session {
  _id: string;
  student: string | User;
  experiment: string | Experiment;
  status: SessionStatus;
  startedAt: string;
  completedAt?: string;
  totalTimeSeconds: number;
  stepResults: StepResult[];
  finalScore: number;
  maxScore: number;
  accuracyPercent: number;
  arInteractions: number;
  hintsUsed: number;
  notes: string;
  deviceType: string;
  createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface ConceptualScore {
  concept: string;
  score: number;
  lastAssessedAt: string;
}

export interface Analytics {
  _id: string;
  student: (User & { firstName: string; lastName: string; email: string; classGroup?: string }) | string;
  totalSessions: number;
  completedSessions: number;
  totalTimeSpentMinutes: number;
  averageAccuracy: number;
  averageScore: number;
  highestScore: number;
  experimentsAttempted: Experiment[] | string[];
  experimentsCompleted: Experiment[] | string[];
  conceptualScores: ConceptualScore[];
  engagementScore: number;
  streakDays: number;
  lastActiveAt: string;
  weeklyActivity: number[];
  monthlyScores: { month: string; avgScore: number; sessionsCount: number }[];
  aiInsights: string[];
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
}

// ─── Progress ────────────────────────────────────────────────────────────────

export type CompletionStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered';

export interface ProgressEntry {
  experiment: Experiment | string;
  bestScore: number;
  attempts: number;
  completionStatus: CompletionStatus;
  lastAttemptAt: string;
  totalTimeMinutes: number;
  conceptsLearned: string[];
}

export interface Progress {
  _id: string;
  student: string;
  classGroup?: string;
  overallGrade: string;
  overallPercent: number;
  experimentProgress: ProgressEntry[];
  badges: string[];
  currentLevel: number;
  experiencePoints: number;
  createdAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface ClassStudentSummary {
  student: {
    id: string;
    name: string;
    email: string;
    studentId?: string;
  };
  averageScore: number;
  averageAccuracy: number;
  engagementScore: number;
  completedExperiments: number;
  totalSessions: number;
  overallGrade: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastActiveAt?: string;
}

export interface ClassAnalytics {
  classGroup: string;
  totalStudents: number;
  classSummary: {
    avgAccuracy: number;
    avgScore: number;
    avgEngagement: number;
    riskDistribution: { low: number; medium: number; high: number };
  };
  students: ClassStudentSummary[];
}

export interface PlatformOverview {
  totalStudents: number;
  totalEducators: number;
  totalSessions: number;
  activeExperiments: number;
  avgPlatformScore: number;
  avgAccuracy: number;
  avgEngagement: number;
  completionRate: number;
  highRiskCount: number;
  sessionsToday: number;
  platformAvgAccuracy: number;
  platformAvgScore: number;
  platformAvgEngagement: number;
  monthlyTrend: { month: string; sessions: number; avgScore: number }[];
  recentSessions: {
    student: string;
    experiment: string;
    score: number;
    accuracy: number;
    time: string;
    status: string;
  }[];
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
