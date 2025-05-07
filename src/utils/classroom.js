import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Generate a random 6-character code
const generateClassCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Check if a class code already exists
const isCodeUnique = async (code) => {
  const classroomsRef = collection(db, 'classrooms');
  const q = query(classroomsRef, where('code', '==', code));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

// Create a new classroom
export const createClassroom = async (teacherId, name) => {
  let code;
  let isUnique = false;
  
  // Generate a unique code
  while (!isUnique) {
    code = generateClassCode();
    isUnique = await isCodeUnique(code);
  }

  // Create the classroom document
  const classroomData = {
    name,
    code,
    teacherId,
    createdAt: new Date().toISOString(),
    students: []
  };

  const docRef = await addDoc(collection(db, 'classrooms'), classroomData);
  return { id: docRef.id, ...classroomData };
};

// Join a classroom using a code
export const joinClassroom = async (studentId, classroomCode) => {
  try {
    const classroomsRef = collection(db, 'classrooms');
    const q = query(classroomsRef, where('code', '==', classroomCode.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Invalid classroom code');
    }

    const classroomDoc = querySnapshot.docs[0];
    const classroomData = classroomDoc.data();

    // Check if student is already in the classroom
    if (classroomData.students.includes(studentId)) {
      throw new Error('You are already in this classroom');
    }

    // Add student to the classroom
    await updateDoc(doc(db, 'classrooms', classroomDoc.id), {
      students: [...classroomData.students, studentId]
    });

    return { id: classroomDoc.id, ...classroomData };
  } catch (error) {
    console.error('Error joining classroom:', error);
    throw error;
  }
};

export const deleteClassroom = async (classroomId) => {
  try {
    const classroomRef = doc(db, 'classrooms', classroomId);
    await deleteDoc(classroomRef);
  } catch (error) {
    throw new Error('Failed to delete classroom');
  }
}; 