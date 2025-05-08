import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Classroom from './pages/Classroom';
import ClassroomDetail from './pages/ClassroomDetail';
import JoinClassroom from './pages/JoinClassroom';
import MyClassrooms from './pages/MyClassrooms';
import ProfilePage from './pages/Profile';

// Protected Route component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// Public Route component
function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
}

// Teacher Route component
function TeacherRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'teacher' ? children : <Navigate to="/" />;
}

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/classroom/create"
          element={
            <ProtectedRoute>
              <TeacherRoute>
                <Classroom />
              </TeacherRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom/:classroomId"
          element={
            <ProtectedRoute>
              <ClassroomDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom/join"
          element={
            <ProtectedRoute>
              <JoinClassroom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-classrooms"
          element={
            <ProtectedRoute>
              <MyClassrooms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;