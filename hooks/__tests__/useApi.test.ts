/**
 * @jest-environment jsdom
 */
// FIX: Add explicit imports for Jest globals to resolve type errors.
import { describe, test, expect } from '@jest/globals';
import {
  enrollInCourse,
  dropCourse,
  staffLogin,
  studentLogin,
  useApi,
} from '../useApi';

// Note: To test this module properly, we would need to be able to import and inspect
// the mock data arrays (e.g., MOCK_ENROLLMENTS). For this example, we'll
// test the functions based on their expected return values and side effects
// that can be inferred from successive calls. A refactor to make the mock data
// exportable would allow for more direct state assertions.

describe('API Utility Functions', () => {

  // A mock student ID for testing purposes.
  const mockStudentId = 'student-1';
  const initiallyEnrolledCourseId = 'c1';
  const courseToEnrollInId = 'c12'; // Cybersecurity Essentials
  const courseToDropId = 'c4'; // Principles of Management

  describe('Course Enrollment and Dropping', () => {
    
    test('should allow a student to enroll in a new course', async () => {
      // First, ensure the student is not already enrolled.
      // This is an indirect test; a direct check of MOCK_ENROLLMENTS would be better.
      const dropResult = await dropCourse(mockStudentId, courseToEnrollInId);
      // It might fail if not enrolled, which is fine for setup. We proceed regardless.

      const result = await enrollInCourse(mockStudentId, courseToEnrollInId);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully enrolled in course.');
    });

    test('should prevent a student from enrolling in the same course twice', async () => {
      // First, ensure the student is enrolled.
      await enrollInCourse(mockStudentId, initiallyEnrolledCourseId);
      
      // Then, try to enroll again.
      const result = await enrollInCourse(mockStudentId, initiallyEnrolledCourseId);
      expect(result.success).toBe(false);
      expect(result.message).toBe('You are already enrolled in this course.');
    });

    test('should allow a student to drop an enrolled course', async () => {
      // First, ensure the student is enrolled in the course to be dropped.
      await enrollInCourse(mockStudentId, courseToDropId);

      const result = await dropCourse(mockStudentId, courseToDropId);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully dropped course.');
    });

    test('should return an error when trying to drop a course the student is not enrolled in', async () => {
      // First, ensure the student is NOT enrolled.
      await dropCourse(mockStudentId, 'c99');

      const result = await dropCourse(mockStudentId, 'c99');
      expect(result.success).toBe(false);
      expect(result.message).toBe('You are not enrolled in this course.');
    });
  });

  describe('User Authentication', () => {

    // --- Staff Login ---
    describe('staffLogin', () => {
        test('should successfully log in a staff member with correct credentials', async () => {
            const result = await staffLogin('admin@crestview.edu.ng', 'AdminPass1!');
            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
            expect(result.user?.email).toBe('admin@crestview.edu.ng');
        });

        test('should fail to log in a staff member with an incorrect password', async () => {
            const result = await staffLogin('admin@crestview.edu.ng', 'WrongPassword');
            expect(result.success).toBe(false);
            expect(result.user).toBeUndefined();
            expect(result.message).toBe('Incorrect email or password.');
        });

         test('should fail to log in with a non-existent staff email', async () => {
            const result = await staffLogin('nonexistent@crestview.edu.ng', 'anypassword');
            expect(result.success).toBe(false);
            expect(result.user).toBeUndefined();
            expect(result.message).toBe('Incorrect email or password.');
        });
    });
    
    // --- Student Login ---
    describe('studentLogin', () => {
        test('should successfully log in a student with correct credentials', async () => {
            const result = await studentLogin('CST/21/001', 'StudentPass1!');
            expect(result.success).toBe(true);
            expect(result.student).toBeDefined();
            expect(result.student?.studentId).toBe('CST/21/001');
        });

        test('should fail to log in a student with an incorrect password', async () => {
            const result = await studentLogin('CST/21/001', 'WrongPassword');
            expect(result.success).toBe(false);
            expect(result.student).toBeUndefined();
            expect(result.message).toBe('Incorrect Student ID or password.');
        });

        test('should fail to log in with a non-existent student ID', async () => {
            const result = await studentLogin('CST/99/999', 'anypassword');
            expect(result.success).toBe(false);
            expect(result.student).toBeUndefined();
            expect(result.message).toBe('Incorrect Student ID or password.');
        });
    });
  });
});