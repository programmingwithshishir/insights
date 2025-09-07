import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageNav from '../components/PageNav';
import { MessageSquare, BookOpen, Users, BarChart2, Menu, X, User, Upload, Download, Trash2, Send, FileText } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, orderBy, deleteDoc } from 'firebase/firestore';
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
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [tests, setTests] = useState([]);
  const [testSubmissions, setTestSubmissions] = useState({});
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    questions: [],
    timeLimit: 30, // minutes
  });
  const [currentTest, setCurrentTest] = useState(null);
  const [testResponses, setTestResponses] = useState({});
  const [testStartTime, setTestStartTime] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });
  const [reports, setReports] = useState([]);

  const tabs = [
    ...(user.role === 'student' ? [{ id: 'chat', label: 'Chat', icon: MessageSquare }] : []),
    { id: 'materials', label: 'Materials', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'tests', label: 'Tests', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
  ];

  // Set initial active tab based on user role
  useEffect(() => {
    if (user.role === 'teacher' && activeTab === 'chat') {
      setActiveTab('materials');
    }
  }, [user.role, activeTab]);

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
        try {
          // Convert ArrayBuffer to base64 using a more efficient method
          const arrayBuffer = e.target.result;
          const base64String = btoa(
            new Uint8Array(arrayBuffer)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          
          await uploadPDF(classroomId, file.name, base64String, user.uid);
          await fetchMaterials();
        } catch (err) {
          console.error('Error processing file:', err);
          setUploadError('Failed to process file');
        }
      };
      reader.onerror = () => {
        setUploadError('Error reading file');
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

      // Convert base64 back to Uint8Array
      const binaryString = atob(pdf.file_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and download
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
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

  // Listen for chat messages
  useEffect(() => {
    if (activeTab === 'chat' && user.role === 'student') {
      const messagesRef = collection(db, 'classrooms', classroomId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messagesData);
      });

      return () => unsubscribe();
    }
  }, [activeTab, classroomId, user.role]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || user.role !== 'student') return;

    setIsSending(true);
    try {
      const messagesRef = collection(db, 'classrooms', classroomId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: user.uid,
        senderName: user.name,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Fetch tests and submissions when tests tab is active
  useEffect(() => {
    if (activeTab === 'tests') {
      fetchTests();
      if (user.role === 'student') {
        fetchTestSubmissions();
      }
    }
  }, [activeTab, classroomId, user.role]);

  const fetchTests = async () => {
    try {
      const testsRef = collection(db, 'classrooms', classroomId, 'tests');
      const q = query(testsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const testsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTests(testsData);
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError('Failed to load tests');
    }
  };

  const fetchTestSubmissions = async () => {
    try {
      const responsesRef = collection(db, 'classrooms', classroomId, 'testResponses');
      const q = query(responsesRef, where('studentId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const submissions = {};
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        submissions[data.testId] = {
          score: data.score,
          submittedAt: data.endTime?.toDate?.() || data.endTime,
          timeSpent: data.timeSpent
        };
      });
      setTestSubmissions(submissions);
    } catch (err) {
      console.error('Error fetching test submissions:', err);
      setError('Failed to load test submissions');
    }
  };

  const handleCreateTest = async () => {
    if (!newTest.title.trim() || newTest.questions.length === 0) {
      setError('Please provide a title and at least one question');
      return;
    }

    setIsCreatingTest(true);
    try {
      const testsRef = collection(db, 'classrooms', classroomId, 'tests');
      await addDoc(testsRef, {
        ...newTest,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'draft'
      });
      setNewTest({
        title: '',
        description: '',
        questions: [],
        timeLimit: 30,
      });
      await fetchTests();
    } catch (err) {
      console.error('Error creating test:', err);
      setError('Failed to create test');
    } finally {
      setIsCreatingTest(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      await deleteDoc(doc(db, 'classrooms', classroomId, 'tests', testId));
      await fetchTests();
    } catch (err) {
      console.error('Error deleting test:', err);
      setError('Failed to delete test');
    }
  };

  const handleStartTest = async (test) => {
    setCurrentTest(test);
    setTestStartTime(new Date());
    setTestResponses({});
  };

  const handleSubmitTest = async () => {
    if (!currentTest || !testStartTime) return;

    try {
      const endTime = new Date();
      const timeSpent = endTime - testStartTime;
      const score = calculateScore();
      const correctAnswers = Math.round((score / 100) * currentTest.questions.length);

      // Store test response
      const responsesRef = collection(db, 'classrooms', classroomId, 'testResponses');
      await addDoc(responsesRef, {
        testId: currentTest.id,
        studentId: user.uid,
        studentName: user.name,
        responses: testResponses,
        startTime: testStartTime,
        endTime: endTime,
        timeSpent: timeSpent,
        score: score,
        totalQuestions: currentTest.questions.length,
        correctAnswers: correctAnswers,
        testTitle: currentTest.title,
        submittedAt: serverTimestamp()
      });

      // Update testSubmissions immediately
      setTestSubmissions(prev => ({
        ...prev,
        [currentTest.id]: {
          score: score,
          submittedAt: endTime,
          timeSpent: timeSpent,
          totalQuestions: currentTest.questions.length,
          correctAnswers: correctAnswers,
          testTitle: currentTest.title
        }
      }));

      setCurrentTest(null);
      setTestStartTime(null);
      setTestResponses({});
    } catch (err) {
      console.error('Error submitting test:', err);
      setError('Failed to submit test');
    }
  };

  const calculateScore = () => {
    if (!currentTest) return 0;
    let correct = 0;
    Object.entries(testResponses).forEach(([questionId, answer]) => {
      const question = currentTest.questions.find(q => q.id === questionId);
      if (question && question.correctAnswer === answer) {
        correct++;
      }
    });
    return (correct / currentTest.questions.length) * 100;
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.text.trim() || !currentQuestion.correctAnswer) {
      setError('Please provide question text and select a correct answer');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      setError('Please fill in all options');
      return;
    }

    setNewTest({
      ...newTest,
      questions: [
        ...newTest.questions,
        {
          id: Date.now().toString(),
          ...currentQuestion
        }
      ]
    });

    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    });
  };

  const handleRemoveQuestion = (questionId) => {
    setNewTest({
      ...newTest,
      questions: newTest.questions.filter(q => q.id !== questionId)
    });
  };

  // Fetch reports when reports tab is active
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, classroomId]);

  const fetchReports = async () => {
    try {
      const responsesRef = collection(db, 'classrooms', classroomId, 'testResponses');
      let q;
      
      if (user.role === 'teacher') {
        // Teachers can see all reports
        q = query(responsesRef, orderBy('submittedAt', 'desc'));
      } else {
        // Students can only see their own reports
        q = query(
          responsesRef,
          where('studentId', '==', user.uid)
        );
      }

      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          // Sort by submittedAt in memory
          const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt);
          const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt);
          return dateB - dateA;
        });
      
      setReports(reportsData);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="h-[600px] bg-gray-50 rounded-lg p-4 flex flex-col">
            {user.role === 'teacher' ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Teachers cannot access the chat.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === user.uid
                            ? 'bg-dominant text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {message.senderName}
                        </p>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp?.toDate().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-dominant"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="bg-dominant text-white px-4 py-2 rounded-lg hover:bg-dominant/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </>
            )}
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
      case 'tests':
        return (
          <div className="h-[600px] bg-gray-50 rounded-lg p-4">
            {user.role === 'teacher' ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Test</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={newTest.title}
                        onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dominant focus:ring-dominant"
                        placeholder="Enter test title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={newTest.description}
                        onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dominant focus:ring-dominant"
                        rows={3}
                        placeholder="Enter test description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
                      <input
                        type="number"
                        value={newTest.timeLimit}
                        onChange={(e) => setNewTest({ ...newTest, timeLimit: parseInt(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dominant focus:ring-dominant"
                        min={1}
                      />
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Add Questions</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Question Text</label>
                          <textarea
                            value={currentQuestion.text}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dominant focus:ring-dominant"
                            rows={2}
                            placeholder="Enter your question"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Options</label>
                          {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={currentQuestion.correctAnswer === option}
                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: option })}
                                className="text-dominant focus:ring-dominant"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...currentQuestion.options];
                                  newOptions[index] = e.target.value;
                                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                }}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-dominant focus:ring-dominant"
                                placeholder={`Option ${index + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleAddQuestion}
                          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                        >
                          Add Question
                        </button>
                      </div>
                    </div>

                    {newTest.questions.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Added Questions ({newTest.questions.length})</h4>
                        <div className="space-y-4">
                          {newTest.questions.map((question, index) => (
                            <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{index + 1}. {question.text}</p>
                                  <div className="mt-2 space-y-1">
                                    {question.options.map((option, optionIndex) => (
                                      <p
                                        key={optionIndex}
                                        className={`text-sm ${
                                          option === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'
                                        }`}
                                      >
                                        {optionIndex + 1}. {option}
                                        {option === question.correctAnswer && ' ✓'}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveQuestion(question.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleCreateTest}
                      disabled={isCreatingTest || newTest.questions.length === 0}
                      className="w-full bg-dominant text-white px-4 py-2 rounded-lg hover:bg-dominant/90 disabled:opacity-50"
                    >
                      {isCreatingTest ? 'Creating...' : 'Create Test'}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Tests</h3>
                  {tests.length === 0 ? (
                    <p className="text-gray-500">No tests created yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {tests.map((test) => (
                        <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{test.title}</h4>
                            <p className="text-sm text-gray-500">{test.description}</p>
                            <p className="text-sm text-gray-500">
                              {test.questions.length} questions • {test.timeLimit} minutes
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {currentTest ? (
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{currentTest.title}</h3>
                      <button
                        onClick={handleSubmitTest}
                        className="bg-dominant text-white px-4 py-2 rounded-lg hover:bg-dominant/90"
                      >
                        Submit Test
                      </button>
                    </div>
                    <div className="space-y-6">
                      {currentTest.questions.map((question, index) => (
                        <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                          <p className="font-medium mb-2">
                            {index + 1}. {question.text}
                          </p>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <label
                                key={optionIndex}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={option}
                                  checked={testResponses[question.id] === option}
                                  onChange={(e) =>
                                    setTestResponses({
                                      ...testResponses,
                                      [question.id]: e.target.value,
                                    })
                                  }
                                  className="text-dominant focus:ring-dominant"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Tests</h3>
                    {tests.length === 0 ? (
                      <p className="text-gray-500">No tests available.</p>
                    ) : (
                      <div className="space-y-4">
                        {tests.map((test) => {
                          const submission = testSubmissions[test.id];
                          return (
                            <div
                              key={test.id}
                              className={`p-4 rounded-lg ${
                                submission
                                  ? 'bg-gray-50 cursor-not-allowed'
                                  : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                              }`}
                              onClick={() => !submission && handleStartTest(test)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">{test.title}</h4>
                                  <p className="text-sm text-gray-500">{test.description}</p>
                                  <p className="text-sm text-gray-500">
                                    {test.questions.length} questions • {test.timeLimit} minutes
                                  </p>
                                </div>
                                {submission ? (
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                      Score: {submission.score.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Submitted: {submission.submittedAt instanceof Date 
                                        ? submission.submittedAt.toLocaleDateString()
                                        : new Date(submission.submittedAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Time spent: {Math.round(submission.timeSpent / 1000 / 60)} minutes
                                    </p>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartTest(test);
                                    }}
                                    className="bg-dominant text-white px-4 py-2 rounded-lg hover:bg-dominant/90"
                                  >
                                    Start Test
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'reports':
        return (
          <div className="h-[600px] bg-gray-50 rounded-lg p-4">
            {reports.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No reports available yet.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[calc(100%-2rem)]">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white p-4 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{report.testTitle}</h3>
                        {user.role === 'teacher' && (
                          <p className="text-sm text-gray-500">Student: {report.studentName}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        report.score >= 90 ? 'bg-green-100 text-green-800' :
                        report.score >= 70 ? 'bg-blue-100 text-blue-800' :
                        report.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.score.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {user.role === 'teacher' && (
                        <div>
                          <p className="text-sm text-gray-500">Student ID</p>
                          <p className="font-medium">{report.studentId}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="font-medium">
                          {report.submittedAt?.toDate().toLocaleDateString() || 
                           new Date(report.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time Spent</p>
                        <p className="font-medium">{Math.round(report.timeSpent / 1000 / 60)} minutes</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Questions</p>
                        <p className="font-medium">{report.correctAnswers}/{report.totalQuestions} correct</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Analysis</h4>
                      <div className="space-y-2">
                        {report.score >= 90 ? (
                          <>
                            <p className="text-sm text-green-600">Excellent performance! {user.role === 'teacher' ? 'The student has' : 'You have'} demonstrated a strong understanding of the material.</p>
                            <p className="text-sm text-gray-600">{user.role === 'teacher' ? 'Consider assigning more advanced topics.' : 'Consider helping your peers or exploring more advanced topics.'}</p>
                          </>
                        ) : report.score >= 70 ? (
                          <>
                            <p className="text-sm text-blue-600">Good performance! {user.role === 'teacher' ? 'The student has' : 'You have'} a solid understanding of most concepts.</p>
                            <p className="text-sm text-gray-600">{user.role === 'teacher' ? 'Suggest focusing on specific areas for improvement.' : 'Focus on the areas where you made mistakes to improve further.'}</p>
                          </>
                        ) : report.score >= 50 ? (
                          <>
                            <p className="text-sm text-yellow-600">Satisfactory performance. There is room for improvement.</p>
                            <p className="text-sm text-gray-600">{user.role === 'teacher' ? 'Consider providing additional practice materials.' : 'Review the incorrect answers and practice similar questions.'}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-red-600">Needs improvement. {user.role === 'teacher' ? 'The student should' : 'Consider'} reviewing the material thoroughly.</p>
                            <p className="text-sm text-gray-600">{user.role === 'teacher' ? 'Schedule a one-on-one session to address knowledge gaps.' : 'Focus on understanding the basic concepts before moving forward.'}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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