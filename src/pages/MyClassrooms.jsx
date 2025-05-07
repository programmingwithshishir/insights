import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Users, Calendar, BookOpen, FileText, Trash2 } from 'lucide-react';
import { deleteClassroom } from '../utils/classroom';
import PageNav from '../components/PageNav';

export default function MyClassroomsPage() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClassrooms = async () => {
    try {
      const classroomsRef = collection(db, 'classrooms');
      let q;

      if (user.role === 'teacher') {
        // For teachers, get classrooms they created
        q = query(classroomsRef, where('teacherId', '==', user.uid));
      } else {
        // For students, get classrooms they're enrolled in
        q = query(classroomsRef, where('students', 'array-contains', user.uid));
      }

      const querySnapshot = await getDocs(q);
      const classroomsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClassrooms(classroomsData);
    } catch (err) {
      setError('Failed to load classrooms');
      console.error('Error fetching classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [user]);

  const handleDeleteClassroom = async (classroomId) => {
    if (!window.confirm('Are you sure you want to delete this classroom? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteClassroom(classroomId);
      await fetchClassrooms(); // Refresh the list
    } catch (err) {
      setError('Failed to delete classroom');
      console.error('Error deleting classroom:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Loading classrooms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNav />

      {/* Hero Section */}
      <section className="hidden md:block pt-32 pb-12 md:pt-40 md:pb-20 bg-gradient-to-br from-dominant/5 to-highlight/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {user.role === 'teacher' ? 'My Created Classrooms' : 'My Enrolled Classrooms'}
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              {user.role === 'teacher'
                ? 'Manage your classrooms and track student progress'
                : 'Access your learning materials and assignments'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {classrooms.length === 0 ? (
            <div className="bg-white shadow-xl rounded-xl p-8 text-center">
              <div className="text-dominant mb-4">
                <BookOpen size={48} className="mx-auto" />
              </div>
              <p className="text-gray-600 text-lg">
                {user.role === 'teacher'
                  ? "You haven't created any classrooms yet."
                  : "You haven't joined any classrooms yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {classrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  className="bg-white shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {classroom.name}
                      </h3>
                      <div className="text-dominant">
                        <BookOpen size={24} />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <FileText size={20} className="mr-2" />
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {classroom.code}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar size={20} className="mr-2" />
                        <span>
                          Created: {new Date(classroom.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {user.role === 'teacher' && (
                        <>
                          <div className="flex items-center text-gray-600">
                            <Users size={20} className="mr-2" />
                            <span>
                              {classroom.students.length} {classroom.students.length === 1 ? 'Student' : 'Students'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteClassroom(classroom.id)}
                            disabled={isDeleting}
                            className="w-full mt-4 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <Trash2 size={20} className="mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete Classroom'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 