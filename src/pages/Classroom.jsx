import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createClassroom } from '../utils/classroom';
import { BookOpen, Plus } from 'lucide-react';
import PageNav from '../components/PageNav';

export default function ClassroomPage() {
  const { user } = useAuth();
  const [classroomName, setClassroomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsCreating(true);

    try {
      const classroom = await createClassroom(user.uid, classroomName);
      setSuccess(`Classroom created successfully! Code: ${classroom.code}`);
      setClassroomName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNav />

      {/* Hero Section */}
      <section className="hidden md:block pt-32 pb-12 md:pt-40 md:pb-20 bg-gradient-to-br from-dominant/5 to-highlight/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Create a New Classroom
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              Set up your virtual classroom and invite students to join using a unique code
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dominant/10 text-dominant mb-4">
                    <BookOpen size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Classroom Details</h2>
                </div>

                <form onSubmit={handleCreateClassroom} className="space-y-6">
                  <div>
                    <label htmlFor="classroomName" className="block text-sm font-medium text-gray-700">
                      Classroom Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="classroomName"
                        id="classroomName"
                        value={classroomName}
                        onChange={(e) => setClassroomName(e.target.value)}
                        required
                        className="shadow-sm focus:ring-dominant focus:border-dominant block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter classroom name"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-green-700">{success}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dominant hover:bg-dominant/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dominant disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isCreating ? (
                        'Creating...'
                      ) : (
                        <>
                          <Plus size={20} className="mr-2" />
                          Create Classroom
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 