import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { firebaseFunctions } from '@/lib/firebase-client';
import { Student } from '@/types';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const getStudents = httpsCallable(firebaseFunctions, 'getStudents');
      const result = await getStudents();
      setStudents(result.data as Student[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    try {
      const createStudent = httpsCallable(firebaseFunctions, 'createStudent');
      const result = await createStudent(student);
      const newStudent = result.data as Student;
      setStudents((prev) => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updateStudentFn = httpsCallable(firebaseFunctions, 'updateStudent');
      const result = await updateStudentFn({ id, updates });
      const updated = result.data as Student;
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
      );
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const deleteStudentFn = httpsCallable(firebaseFunctions, 'deleteStudent');
      await deleteStudentFn({ id });
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  };

  return {
    students,
    loading,
    error,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
  };
}
