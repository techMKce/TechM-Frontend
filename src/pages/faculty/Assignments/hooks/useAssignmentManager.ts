
import { useState, useEffect } from 'react';
import { Assignment, AssignmentFormData, GradingData } from '../Assignments';
import { useToast } from '@/hooks/use-toast';

export const useAssignmentManager = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);
  const [showGrades, setShowGrades] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const { toast } = useToast();

  // Initialize with sample data including grading information
  useEffect(() => {
    const sampleAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Mathematics Quiz - Algebra',
        description: 'Complete the algebra problems covering linear equations and quadratic functions.',
        dueDate: '2024-01-15T10:00:00',
        subject: 'Mathematics',
        priority: 'high',
        status: 'published',
        createdAt: '2024-01-01T09:00:00',
        updatedAt: '2024-01-01T09:00:00',
        maxGrade: 100,
        submissionDate: '2024-01-14T09:30:00',
        grade: 85,
        feedback: 'Good work on the linear equations. Need improvement on quadratic functions.',
        isGraded: true
      },
      {
        id: '2',
        title: 'Science Project - Ecosystem',
        description: 'Research and present on a specific ecosystem, including flora, fauna, and environmental factors.',
        dueDate: '2024-01-20T23:59:00',
        subject: 'Science',
        priority: 'medium',
        status: 'published',
        createdAt: '2024-01-02T10:00:00',
        updatedAt: '2024-01-02T10:00:00',
        maxGrade: 100,
        submissionDate: '2024-01-21T08:15:00', // Late submission
        grade: 78,
        feedback: 'Great research but submitted late. Excellent presentation skills.',
        isGraded: true
      }
    ];
    setAssignments(sampleAssignments);
  }, []);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleCreateAssignment = (formData: AssignmentFormData) => {
    const newAssignment: Assignment = {
      id: generateId(),
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAssignments(prev => [newAssignment, ...prev]);
    toast({
      title: "Success",
      description: "Assignment created successfully!",
    });
  };

  const handleUpdateAssignment = (formData: AssignmentFormData) => {
    if (!editingAssignment) return;

    const updatedAssignment: Assignment = {
      ...editingAssignment,
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === editingAssignment.id ? updatedAssignment : assignment
      )
    );

    setEditingAssignment(null);
    toast({
      title: "Success",
      description: "Assignment updated successfully!",
    });
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    toast({
      title: "Success",
      description: "Assignment deleted successfully!",
      variant: "destructive",
    });
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const handleGradeAssignment = (assignment: Assignment) => {
    setGradingAssignment(assignment);
  };

  const handleSubmitGrade = (gradingData: GradingData) => {
    if (!gradingAssignment) return;

    const updatedAssignment: Assignment = {
      ...gradingAssignment,
      grade: gradingData.grade,
      feedback: gradingData.feedback,
      isGraded: true,
      updatedAt: new Date().toISOString()
    };

    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === gradingAssignment.id ? updatedAssignment : assignment
      )
    );

    setGradingAssignment(null);
    toast({
      title: "Success",
      description: "Assignment graded successfully!",
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(null);
  };

  const handleCloseGrading = () => {
    setGradingAssignment(null);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || assignment.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return {
    assignments,
    filteredAssignments,
    isFormOpen,
    setIsFormOpen,
    editingAssignment,
    gradingAssignment,
    showGrades,
    setShowGrades,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    handleCreateAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    handleEditAssignment,
    handleGradeAssignment,
    handleSubmitGrade,
    handleCloseForm,
    handleCloseGrading
  };
};
