export function courseStateManager(state, action) {
  switch (action.type) {
    case 'invoked':
      return { ...state, ...action.data };
    default:
      return state;
  }
}
export let courseState = {
  courseCode: "",
  course_id: 0,
  courseTitle: "",
  courseDescription: "",
  instructorName: "",
  dept: "",
  isActive: false,
  duration: 0,
  credit: 0,
  createdAt: "",
  updatedAt: "",
  imageUrl: ""
};
