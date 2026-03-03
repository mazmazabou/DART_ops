import { useMemo } from 'react';

export function useClockStatus(employees, userId) {
  return useMemo(() => {
    const employee = employees.find(e => e.id === userId);
    return {
      isActive: employee?.active || false,
      employee,
    };
  }, [employees, userId]);
}
