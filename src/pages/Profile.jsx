import { useAuth } from '../context/AuthContext';
import { User, Mail, GraduationCap, Calendar } from 'lucide-react';
import PageNav from '../components/PageNav';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNav />

      {/* Hero Section */}
      <section className="hidden md:block pt-32 pb-12 md:pt-40 md:pb-20 bg-gradient-to-br from-dominant/5 to-highlight/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              My Profile
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              View and manage your account information
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
                {/* Profile Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-dominant/10 text-dominant mb-4">
                    <User size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600 mt-1">
                    {user.role === 'teacher' ? 'Teacher' : 'Student'}
                  </p>
                </div>

                {/* Profile Details */}
                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-6 h-6 text-dominant mr-4" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-dominant mr-4" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="text-gray-900 capitalize">{user.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-dominant mr-4" />
                    <div>
                      <p className="text-sm text-gray-500">Account Created</p>
                      <p className="text-gray-900">
                        {new Date(user.metadata.creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {user.role === 'teacher' && (
                    <div className="mt-8 p-4 bg-dominant/5 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Teacher Features</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Create and manage classrooms</li>
                        <li>• Generate unique classroom codes</li>
                        <li>• Track student progress</li>
                        <li>• Delete classrooms when needed</li>
                      </ul>
                    </div>
                  )}

                  {user.role === 'student' && (
                    <div className="mt-8 p-4 bg-dominant/5 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Features</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Join classrooms using codes</li>
                        <li>• Access learning materials</li>
                        <li>• View assignments and progress</li>
                        <li>• Participate in classroom activities</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 