import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, LogOut, Users, Calendar, FileText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || isMenuOpen 
          ? 'bg-white shadow-md py-2' 
          : 'md:bg-transparent bg-white py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-dominant font-bold text-2xl">Insights</Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/my-classrooms"
                    className="bg-dominant hover:bg-dominant/90 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    My Classrooms
                  </Link>
                  {user.role === 'teacher' && (
                    <Link
                      to="/classroom/create"
                      className="text-gray-600 hover:text-dominant px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Create Classroom
                    </Link>
                  )}
                  <Link
                    to="/classroom/join"
                    className="text-gray-600 hover:text-dominant px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Join Classroom
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center text-gray-600 hover:text-dominant transition-colors duration-200"
                  >
                    <User size={20} className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-dominant px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-dominant px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-accent hover:bg-highlight text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-dominant focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white shadow-lg rounded-lg mt-2">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {user ? (
                  <>
                    <Link
                      to="/my-classrooms"
                      className="block bg-dominant hover:bg-dominant/90 text-white px-3 py-2 rounded-md text-base font-medium"
                    >
                      My Classrooms
                    </Link>
                    {user.role === 'teacher' && (
                      <Link
                        to="/classroom/create"
                        className="block text-gray-600 hover:text-dominant px-3 py-2 rounded-md text-base font-medium"
                      >
                        Create Classroom
                      </Link>
                    )}
                    <Link
                      to="/classroom/join"
                      className="block text-gray-600 hover:text-dominant px-3 py-2 rounded-md text-base font-medium"
                    >
                      Join Classroom
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center text-gray-600 hover:text-dominant px-3 py-2 rounded-md text-base font-medium"
                    >
                      <User size={20} className="mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left text-gray-600 hover:text-dominant px-3 py-2 rounded-md text-base font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block text-gray-600 hover:text-dominant px-3 py-2 rounded-md text-base font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block bg-accent hover:bg-highlight text-white px-3 py-2 rounded-md text-base font-medium"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-dominant/5 to-highlight/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Virtual <span className="text-dominant">Classroom</span> Made Simple
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl">
                Insights connects teachers and students in an intuitive platform designed to streamline assignments, foster collaboration, and enhance the learning experience.
              </p>
              {!user && (
                <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link 
                    to="/signup" 
                    className="bg-accent hover:bg-highlight text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
                  >
                    Join as Teacher
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-dominant hover:bg-dominant/90 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
                  >
                    Join as Student
                  </Link>
                </div>
              )}
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="bg-white p-4 rounded-xl shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-center justify-center">
                    <FileText size={40} className="text-dominant mb-3" />
                    <p className="text-gray-900 font-medium">Assignments</p>
                    <p className="text-gray-500 text-sm text-center">Create and submit with ease</p>
                  </div>
                  <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-center justify-center">
                    <Users size={40} className="text-dominant mb-3" />
                    <p className="text-gray-900 font-medium text-center">Class Discussion</p>
                    <p className="text-gray-500 text-sm text-center mt-1">Engage and collaborate</p>
                  </div>
                  <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-center justify-center">
                    <Calendar size={40} className="text-dominant mb-3" />
                    <p className="text-gray-900 font-medium">Schedule</p>
                    <p className="text-gray-500 text-sm text-center">Track deadlines and events</p>
                  </div>
                  <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-center justify-center">
                    <BookOpen size={40} className="text-dominant mb-3" />
                    <p className="text-gray-900 font-medium">Resources</p>
                    <p className="text-gray-500 text-sm text-center">Share learning materials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features highlights without navigation links */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Designed for Modern Education</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to create an engaging virtual classroom experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="text-dominant mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Simplified Assignments</h3>
              <p className="text-gray-600">
                Create, distribute, and grade assignments with ease. Students can submit work and receive feedback all in one place.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="text-dominant mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Classroom</h3>
              <p className="text-gray-600">
                Foster discussion and collaboration through classroom posts, comments, and real-time updates.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="text-dominant mb-4">
                <Calendar size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Organized Schedule</h3>
              <p className="text-gray-600">
                Keep track of assignment due dates, class schedules, and important events with our integrated calendar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-dominant">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Join your virtual classroom today</h2>
              <p className="mt-4 text-xl text-white/80 max-w-3xl mx-auto">
                Thousands of educators and students are already using Insights to enhance their teaching and learning experience.
              </p>
              <div className="mt-8 flex justify-center">
                <Link 
                  to="/signup" 
                  className="bg-white text-dominant hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-center transition-colors"
                >
                  Create an Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold mb-4">Insights</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Connecting teachers and students in a streamlined virtual classroom environment.
            </p>
            <div className="mt-6 flex justify-center space-x-6">
              {!user && (
                <>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
                  <Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link>
                </>
              )}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Insights Educational Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}