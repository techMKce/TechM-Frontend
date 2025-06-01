import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

type CourseFormData = {
  course_id: string;
  courseTitle: string;
  courseDescription: string;
  instructorName: string;
  dept: string;
  duration: string;
  credit: string;
  isActive: boolean;
  imageUrl: string;
};

type CourseFormProps = {
  onClose: () => void;
  onSave: (data: Omit<CourseFormData, 'duration' | 'credit'> & { duration: number; credit: number }) => void;
  departments?: string[];
  isEditMode?: boolean;
  initialData?: Partial<CourseFormData> | null;
};

const CourseForm = ({
  onClose,
  onSave,
  departments = [],
  isEditMode = false,
  initialData = null,
}: CourseFormProps) => {
  const defaultDepartments = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
  const availableDepartments = departments.length > 0 ? departments : defaultDepartments;

  const [formData, setFormData] = useState<CourseFormData>({
    course_id: '',
    courseTitle: '',
    courseDescription: '',
    instructorName: '',
    dept: '',
    duration: '0',
    credit: '0',
    isActive: true,
    imageUrl: '',
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        course_id: initialData.course_id || '',
        courseTitle: initialData.courseTitle || '',
        courseDescription: initialData.courseDescription || '',
        instructorName: initialData.instructorName || '',
        dept: initialData.dept || availableDepartments[0],
        duration: initialData.duration?.toString() || '0',
        credit: initialData.credit?.toString() || '0',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        imageUrl: initialData.imageUrl || '',
      });
    }
  }, [initialData, isEditMode, availableDepartments]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDeptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      dept: e.target.value.toUpperCase(),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const duration = Number(formData.duration);
    const credit = Number(formData.credit);

    if (isNaN(duration) || duration <= 0) {
      alert('Please enter a valid duration (must be positive number)');
      return;
    }

    if (isNaN(credit) || credit <= 0) {
      alert('Please enter valid credits (must be positive number)');
      return;
    }

    onSave({
      ...formData,
      duration,
      credit,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
          Course Title <span className="text-red-500">*</span>
              </label>
              <input
          type="text"
          name="courseTitle"
          value={formData.courseTitle}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
          Course Description <span className="text-red-500">*</span>
              </label>
              <textarea
          name="courseDescription"
          value={formData.courseDescription}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={3}
          required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
          Instructor Name <span className="text-red-500">*</span>
              </label>
              <input
          type="text"
          name="instructorName"
          value={formData.instructorName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
          Department <span className="text-red-500">*</span>
              </label>
              <input
          type="text"
          name="dept"
          value={formData.dept}
          onChange={e => {
            // Only allow word characters, no spaces
            const value = e.target.value.replace(/\W/g, '').toUpperCase();
            setFormData(prev => ({ ...prev, dept: value }));
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="e.g. CSE"
          pattern="^\w+$"
          required
              />
              <span className="text-xs text-gray-500">No spaces or special characters allowed.</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL <span className="text-red-500">*</span>
              </label>
              <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="https://example.com/image.jpg"
          required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (hours) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            min="1"
            required
          />
              </div>
              <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credits <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="credit"
            value={formData.credit}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            min="1"
            max="10"
            required
          />
              </div>
            </div>
            {isEditMode && (
              <div className="flex items-center mt-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-gray-700">Active Course</label>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 bg-white sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {isEditMode ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;