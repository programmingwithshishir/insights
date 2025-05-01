import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, BarChart2 } from 'lucide-react';

export default function HomePage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-dominant font-bold text-2xl">Insights</Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-dominant hover:text-highlight transition-colors">Login</Link>
              <Link to="/signup" className="bg-accent hover:bg-highlight text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMenu}
                className="text-gray-600 hover:text-highlight focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t mt-2">
            <div className="px-4 py-4 flex flex-col items-center space-y-3">
              <Link 
                to="/login" 
                className="w-full text-dominant hover:bg-gray-50 py-3 px-4 text-center font-medium rounded-lg border border-gray-200 transition-colors" 
                onClick={toggleMenu}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="w-full bg-accent hover:bg-highlight text-white py-3 px-4 text-center font-medium rounded-lg transition-colors" 
                onClick={toggleMenu}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-dominant/5 to-highlight/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Data Into <span className="text-dominant">Powerful Insights</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl">
                Unlock the full potential of your data with our intuitive analytics platform. Make informed decisions faster and drive growth with actionable insights.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/signup" 
                  className="bg-accent hover:bg-highlight text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="bg-white p-4 rounded-xl shadow-xl">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="p-6 text-center">
                    <BarChart2 size={64} className="mx-auto text-dominant mb-4" />
                    <p className="text-gray-500">Analytics Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-dominant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to get started?</h2>
            <p className="mt-4 text-xl text-white/80 max-w-3xl mx-auto">
              Join thousands of businesses already using Insights to transform their data.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/signup" 
                className="bg-white text-dominant hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-center transition-colors"
              >
                Sign Up Now
              </Link>
              <Link 
                to="/login" 
                className="bg-transparent border border-white text-white hover:bg-white/10 font-medium py-3 px-8 rounded-lg text-center transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Insights</h3>
            <p className="text-gray-400 max-w-lg mx-auto">
              Transform your data into actionable insights with our powerful analytics platform.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link to="/login" className="text-gray-400 hover:text-highlight transition-colors">Login</Link>
              <Link to="/signup" className="text-gray-400 hover:text-highlight transition-colors">Sign Up</Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Insights. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}