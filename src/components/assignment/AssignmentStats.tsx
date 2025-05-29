
import React from 'react';
import { Assignment } from '../../pages/faculty/Assignments/Assignments';

interface AssignmentStatsProps {
  assignments: Assignment[];
}

const AssignmentStats: React.FC<AssignmentStatsProps> = ({ assignments }) => {
  const publishedCount = assignments.filter(a => a.status === 'published').length;
  const gradedCount = assignments.filter(a => a.isGraded).length;
  const dueThisWeekCount = assignments.filter(a => {
    const due = new Date(a.dueDate);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return due <= weekFromNow && due >= new Date();
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Assignments</h3>
        <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-sm font-medium text-gray-500">Published</h3>
        <p className="text-2xl font-bold text-blue-600">{publishedCount}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-sm font-medium text-gray-500">Graded</h3>
        <p className="text-2xl font-bold text-green-600">{gradedCount}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-sm font-medium text-gray-500">Due This Week</h3>
        <p className="text-2xl font-bold text-orange-600">{dueThisWeekCount}</p>
      </div>
    </div>
  );
};

export default AssignmentStats;
