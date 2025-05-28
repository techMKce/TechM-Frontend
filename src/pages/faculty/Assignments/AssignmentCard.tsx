
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Edit, Trash2, GraduationCap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Assignment } from './Assignments';

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
  onGrade: (assignment: Assignment) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onEdit, onDelete, onGrade }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getSubmissionStatus = () => {
    if (!assignment.submissionDate) {
      return { text: 'Not Submitted', color: 'bg-gray-100 text-gray-600', icon: Clock };
    }
    
    const isLate = new Date(assignment.submissionDate) > new Date(assignment.dueDate);
    if (isLate) {
      return { text: 'Late', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
    }
    
    return { text: 'On Time', color: 'bg-green-100 text-green-700', icon: CheckCircle };
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

  const submissionStatus = getSubmissionStatus();
  const StatusIcon = submissionStatus.icon;

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {assignment.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={getPriorityColor(assignment.priority)}>
                {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
              </Badge>
              <Badge variant="outline" className={getStatusColor(assignment.status)}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </Badge>
              {assignment.submissionDate && (
                <Badge variant="outline" className={submissionStatus.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {submissionStatus.text}
                </Badge>
              )}
              {assignment.isGraded && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                  Graded: {assignment.grade}/{assignment.maxGrade || 100}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGrade(assignment)}
              className="hover:bg-purple-50 hover:border-purple-300 text-purple-600"
            >
              <GraduationCap className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(assignment)}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(assignment.id)}
              className="hover:bg-red-50 hover:border-red-300 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {formatDate(assignment.dueDate)}</span>
          </div>
          {assignment.submissionDate && (
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              <span>Submitted: {formatDate(assignment.submissionDate)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="font-medium text-blue-600">{assignment.subject}</span>
            <span className="text-xs">Updated: {formatDate(assignment.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;