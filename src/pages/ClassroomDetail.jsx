import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageNav from '../components/PageNav';
import { MessageSquare, BookOpen, Users, BarChart2, Menu, X, User, Upload, Download, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { initDatabase, uploadPDF, getClassroomPDFs, getPDFById, deletePDF } from '../utils/database';

export default function ClassroomDetail() {
  const { classroomId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [materials, setMaterials] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'materials', label: 'Materials', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
  ];

  // Initialize database on component mount
  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

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

  // Fetch materials when materials tab is active
  useEffect(() => {
    if (activeTab === 'materials') {
      fetchMaterials();
    }
  }, [activeTab, classroomId]);

  const fetchMaterials = async () => {
    try {
      const materialsList = await getClassroomPDFs(classroomId);
      setMaterials(materialsList);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target.result;
        await uploadPDF(classroomId, file.name, fileData, user.uid);
        await fetchMaterials();
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (pdfId, fileName) => {
    try {
      const pdf = await getPDFById(pdfId);
      if (!pdf) throw new Error('PDF not found');

      // Convert the binary data to a Blob
      const blob = new Blob([pdf.file_data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const handleDelete = async (pdfId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await deletePDF(pdfId, user.uid);
      await fetchMaterials();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

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
            {user.role === 'teacher' && (
              <div className="mb-6">
                <label className="block">
                  <span className="sr-only">Choose PDF file</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-dominant file:text-white
                      hover:file:bg-dominant/90
                      disabled:opacity-50 disabled:cursor-not-allowed
                      cursor-pointer"
                  />
                </label>
                {uploadError && (
                  <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                )}
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {materials.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No materials available yet.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[calc(100%-2rem)]">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <BookOpen className="h-5 w-5 text-dominant flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{material.file_name}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded {new Date(material.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleDownload(material.id, material.file_name)}
                        className="p-2 text-gray-600 hover:text-dominant rounded-md hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                        title="Download"
                      >
                        <Download size={20} />
                      </button>
                      {user.role === 'teacher' && (
                        <button
                          onClick={() => handleDelete(material.id)}
                          className="p-2 text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 cursor-pointer transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          <div className="sm:hidden flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
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