
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Assignment, GradingData } from '@/types/assignment';

interface GradingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gradingData: GradingData) => void;
  assignment: Assignment | null;
}

const GradingDialog: React.FC<GradingDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  assignment
}) => {
  const [gradingData, setGradingData] = useState<GradingData>({
    grade: 0,
    feedback: ''
  });

  useEffect(() => {
    if (assignment && assignment.isGraded) {
      setGradingData({
        grade: assignment.grade || 0,
        feedback: assignment.feedback || ''
      });
    } else {
      setGradingData({
        grade: 0,
        feedback: ''
      });
    }
  }, [assignment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(gradingData);
    onClose();
  };

  const isLateSubmission = () => {
    if (!assignment || !assignment.submissionDate) return false;
    return new Date(assignment.submissionDate) > new Date(assignment.dueDate);
  };

  const getSubmissionStatus = () => {
    if (!assignment?.submissionDate) {
      return { text: 'Not Submitted', color: 'bg-gray-100 text-gray-600', icon: Clock };
    }
    
    const isLate = isLateSubmission();
    if (isLate) {
      return { text: 'Late Submission', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
    }
    
    return { text: 'Submitted On Time', color: 'bg-green-100 text-green-700', icon: CheckCircle };
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

  if (!assignment) return null;

  const submissionStatus = getSubmissionStatus();
  const StatusIcon = submissionStatus.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {assignment.isGraded ? 'Update Grade' : 'Grade Assignment'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg">{assignment.title}</h3>
            <p className="text-gray-600">{assignment.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-medium">Subject:</span> {assignment.subject}
              </div>
              <div>
                <span className="font-medium">Due Date:</span> {formatDate(assignment.dueDate)}
              </div>
              {assignment.maxGrade && (
                <div>
                  <span className="font-medium">Max Grade:</span> {assignment.maxGrade}
                </div>
              )}
            </div>

            {/* Submission Status */}
            <div className="flex items-center gap-2">
              <Badge className={submissionStatus.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {submissionStatus.text}
              </Badge>
              {assignment.submissionDate && (
                <span className="text-sm text-gray-500">
                  Submitted: {formatDate(assignment.submissionDate)}
                </span>
              )}
            </div>
          </div>

          {/* Grading Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade *</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max={assignment.maxGrade || 100}
                  value={gradingData.grade}
                  onChange={(e) => setGradingData(prev => ({
                    ...prev,
                    grade: Number(e.target.value)
                  }))}
                  placeholder="Enter grade"
                  required
                />
              </div>
              
              {assignment.maxGrade && (
                <div className="space-y-2">
                  <Label>Grade Percentage</Label>
                  <div className="p-2 bg-gray-50 rounded text-sm font-medium">
                    {gradingData.grade && assignment.maxGrade 
                      ? `${((gradingData.grade / assignment.maxGrade) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={gradingData.feedback}
                onChange={(e) => setGradingData(prev => ({
                  ...prev,
                  feedback: e.target.value
                }))}
                placeholder="Enter feedback for the student..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {assignment.isGraded ? 'Update Grade' : 'Submit Grade'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradingDialog;
