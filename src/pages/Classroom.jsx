import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createClassroom, getUserClassrooms } from '../utils/classroom';
import { BookOpen, Plus } from 'lucide-react';
import PageNav from '../components/PageNav';
import { useNavigate } from 'react-router-dom';

export default function ClassroomPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classroomName, setClassroomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const userClassrooms = await getUserClassrooms(user.uid, user.role);
        setClassrooms(userClassrooms);
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        setError('Failed to load classrooms');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassrooms();
  }, [user]);

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    if (!classroomName.trim()) {
      setError('Please enter a classroom name');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      const classroom = await createClassroom(classroomName, user.uid);
      setSuccess(`Classroom created successfully! Code: ${classroom.code}`);
      setClassroomName('');
      setClassrooms([...classrooms, classroom]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClassroomClick = (classroomId) => {
    navigate(`/classroom/${classroomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Your Classrooms
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your virtual classrooms and connect with your students
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-3xl mx-auto">
            {/* Classrooms List */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Classrooms</h2>
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Loading classrooms...</p>
                </div>
              ) : classrooms.length > 0 ? (
                <div className="grid gap-4">
                  {classrooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      onClick={() => handleClassroomClick(classroom.id)}
                      className="block bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{classroom.name}</h3>
                          <p className="text-sm text-gray-500">Code: {classroom.code}</p>
                        </div>
                        <BookOpen className="h-5 w-5 text-dominant" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">No classrooms found</p>
                  {user.role === 'teacher' && (
                    <p className="mt-2 text-sm text-gray-500">
                      Create your first classroom using the form below
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Create Classroom Form - Only show for teachers */}
            {user.role === 'teacher' && (
              <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dominant/10 text-dominant mb-4">
                      <Plus size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create New Classroom</h2>
                  </div>

                  <form onSubmit={handleCreateClassroom} className="space-y-6">
                    <div>
                      <label htmlFor="classroomName" className="block text-sm font-medium text-gray-700">
                        Classroom Name
                      </label>
                      <input
                        type="text"
                        id="classroomName"
                        value={classroomName}
                        onChange={(e) => setClassroomName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dominant focus:ring-dominant sm:text-sm"
                        placeholder="Enter classroom name"
                      />
                    </div>

                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                          </div>
                        </div>
                      </div>
                    )}

                    {success && (
                      <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">{success}</h3>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isCreating}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dominant hover:bg-dominant/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dominant disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? 'Creating...' : 'Create Classroom'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 