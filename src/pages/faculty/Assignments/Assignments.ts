
export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  // New grading fields
  submissionDate?: string;
  grade?: number;
  maxGrade?: number;
  feedback?: string;
  isGraded?: boolean;
}

export interface AssignmentFormData {
  title: string;
  description: string;
  dueDate: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published';
  maxGrade?: number;
}

export interface GradingData {
  grade: number;
  feedback: string;
}