import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageNav from '../components/PageNav';
import { MessageSquare, BookOpen, Users, BarChart2, Menu, X, User } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function ClassroomDetail() {
  const { classroomId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'materials', label: 'Materials', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching students for classroom:', classroomId);

        // Get classroom document
        const classroomRef = doc(db, 'classrooms', classroomId);
        const classroomDoc = await getDoc(classroomRef);
        
        if (!classroomDoc.exists()) {
          console.error('Classroom not found:', classroomId);
          throw new Error('Classroom not found');
        }

        const classroomData = classroomDoc.data();
        console.log('Classroom data:', classroomData);
        
        const studentIds = classroomData.students || [];
        console.log('Student IDs:', studentIds);

        if (studentIds.length === 0) {
          console.log('No students found in classroom');
          setStudents([]);
          setLoading(false);
          return;
        }

        // Get student details from auth collection
        const studentsData = [];
        for (const studentId of studentIds) {
          try {
            const studentRef = doc(db, 'users', studentId);
            const studentDoc = await getDoc(studentRef);
            
            if (studentDoc.exists()) {
              studentsData.push({
                id: studentDoc.id,
                ...studentDoc.data()
              });
            } else {
              console.log('Student document not found:', studentId);
            }
          } catch (err) {
            console.error('Error fetching student:', studentId, err);
          }
        }
        
        console.log('Fetched students data:', studentsData);
        setStudents(studentsData);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'students') {
      fetchStudents();
    }
  }, [classroomId, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="h-[600px] bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 text-center">Chat functionality coming soon...</p>
          </div>
        );
      case 'materials':
        return (
          <div className="h-[600px] bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 text-center">Learning materials will be available here...</p>
          </div>
        );
      case 'students':
        return (
          <div className="h-[600px] bg-gray-50 rounded-lg p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading students...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-500">{error}</p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No students enrolled in this classroom yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Enrolled Students ({students.length})
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-dominant/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-dominant" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.displayName || student.name || 'Anonymous Student'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'reports':
        return (
          <div className="h-[600px] bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 text-center">Performance reports and analytics coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNav />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Menu Button */}
          <div className="sm:hidden flex justify-end mb-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} mb-4`}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 text-sm font-medium
                      transition-colors duration-200
                      ${activeTab === tab.id
                        ? 'bg-dominant/10 text-dominant'
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 h-5 w-5
                        ${activeTab === tab.id ? 'text-dominant' : 'text-gray-400'}
                      `}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:block border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      transition-all duration-200 ease-in-out
                      ${activeTab === tab.id
                        ? 'border-dominant text-dominant'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                      cursor-pointer
                      hover:bg-gray-50 rounded-t-lg
                    `}
                  >
                    <Icon
                      className={`
                        -ml-0.5 mr-2 h-5 w-5
                        transition-colors duration-200
                        ${activeTab === tab.id
                          ? 'text-dominant'
                          : 'text-gray-400 group-hover:text-gray-500'
                        }
                      `}
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="h-[calc(100vh-16rem)] sm:h-[600px] overflow-y-auto">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 