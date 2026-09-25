import { Department, Subject } from '../types';

/**
 * Checks if a subject is accessible based on the candidate's registered department:
 * - Sciences students access Science subjects.
 * - Commercial students access Commercial subjects.
 * - Arts students access Arts subjects.
 * - Use of English is locked for everyone by default (can be unlocked via Study Pass / Access Key).
 */
export function isSubjectAccessible(
  subject: Subject,
  department: Department = 'Sciences',
  englishUnlocked: boolean = false
): boolean {
  // Use of English is locked for everyone
  if (
    subject.id === 'english' ||
    subject.name === 'Use of English' ||
    subject.category === 'Languages'
  ) {
    return !!englishUnlocked;
  }

  // Sciences students access Science subjects
  if (department === 'Sciences' && subject.category === 'Sciences') {
    return true;
  }

  // Commercial students access Commercial subjects
  if (department === 'Commercial' && subject.category === 'Commercial') {
    return true;
  }

  // Arts students access Arts subjects
  if (department === 'Arts' && subject.category === 'Arts') {
    return true;
  }

  return false;
}

export function getSubjectRestrictionReason(
  subject: Subject,
  userDepartment: Department = 'Sciences',
  englishUnlocked: boolean = false
): string | null {
  if (isSubjectAccessible(subject, userDepartment, englishUnlocked)) {
    return null;
  }

  if (
    subject.id === 'english' ||
    subject.name === 'Use of English' ||
    subject.category === 'Languages'
  ) {
    return 'Locked for everyone (Compulsory Core Subject)';
  }

  if (subject.category === 'Sciences') {
    return 'Restricted to Science candidates';
  }
  if (subject.category === 'Commercial') {
    return 'Restricted to Commercial candidates';
  }
  if (subject.category === 'Arts') {
    return 'Restricted to Arts candidates';
  }

  return 'Restricted to your registered department';
}
