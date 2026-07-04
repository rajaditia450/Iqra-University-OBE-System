export interface MinimalTeacher {
  id: string;
  employeeId?: string;
  employee_id?: string;
  name?: string;
  email?: string;
}

export const matchTeacher = (teacher: MinimalTeacher | null | undefined, targetId: string): boolean => {
  if (!teacher || !targetId) return false;
  const tid = targetId.trim().toUpperCase();
  return (
    teacher.id?.trim().toUpperCase() === tid ||
    teacher.employeeId?.trim().toUpperCase() === tid ||
    (teacher as any).employee_id?.trim().toUpperCase() === tid
  );
};

export const getTeacherId = (teacher: MinimalTeacher): string => {
  return teacher.employeeId || (teacher as any).employee_id || teacher.id;
};
