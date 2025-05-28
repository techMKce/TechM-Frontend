
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Assignment } from './Assignments';

interface GradesViewProps {
  assignments: Assignment[];
  onBack: () => void;
}

const GradesView: React.FC<GradesViewProps> = ({ assignments, onBack }) => {
  const gradedAssignments = assignments.filter(a => a.isGraded);

  const getSubmissionStatusBadge = (assignment: Assignment) => {
    if (!assignment.submissionDate) {
      return (
        <Badge className="bg-gray-100 text-gray-600">
          <Clock className="h-3 w-3 mr-1" />
          Not Submitted
        </Badge>
      );
    }
    
    const isLate = new Date(assignment.submissionDate) > new Date(assignment.dueDate);
    if (isLate) {
      return (
        <Badge className="bg-red-100 text-red-700">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Late Submission
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3 mr-1" />
        On Time
      </Badge>
    );
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Manager
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Graded Assignments</h1>
              <p className="text-gray-600 mt-1">View all graded assignment results</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Graded</h3>
            <p className="text-2xl font-bold text-gray-900">{gradedAssignments.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Average Grade</h3>
            <p className="text-2xl font-bold text-blue-600">
              {gradedAssignments.length > 0
                ? (gradedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssignments.length).toFixed(1)
                : '0'
              }
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Late Submissions</h3>
            <p className="text-2xl font-bold text-red-600">
              {gradedAssignments.filter(a => 
                a.submissionDate && new Date(a.submissionDate) > new Date(a.dueDate)
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">High Grades (90%+)</h3>
            <p className="text-2xl font-bold text-green-600">
              {gradedAssignments.filter(a => 
                a.grade && a.maxGrade && (a.grade / a.maxGrade) >= 0.9
              ).length}
            </p>
          </div>
        </div>

        {/* Graded Assignments */}
        <div className="space-y-4">
          {gradedAssignments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-gray-400 mb-4">
                <CheckCircle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No graded assignments</h3>
              <p className="text-gray-500">
                Grade some assignments to see the results here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gradedAssignments.map(assignment => (
                <Card key={assignment.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {assignment.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getSubmissionStatusBadge(assignment)}
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {assignment.subject}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Grade Display */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Grade</span>
                          <span className={`text-xl font-bold ${getGradeColor(assignment.grade || 0, assignment.maxGrade || 100)}`}>
                            {assignment.grade}/{assignment.maxGrade || 100}
                          </span>
                        </div>
                        {assignment.maxGrade && (
                          <div className="text-right text-sm text-gray-500">
                            {((assignment.grade || 0) / assignment.maxGrade * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>

                      {/* Feedback */}
                      {assignment.feedback && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {assignment.feedback}
                          </p>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Due: {formatDate(assignment.dueDate)}</div>
                        {assignment.submissionDate && (
                          <div>Submitted: {formatDate(assignment.submissionDate)}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradesView;
