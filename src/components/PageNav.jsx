import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageNav() {
  return (
    <nav className="fixed w-full z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-dominant transition-colors duration-200"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </nav>
  );
} 