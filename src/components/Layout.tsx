import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Plus, LogOut, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'New Contract', href: '/contracts/new', icon: Plus },
  ];

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 md:text-xl text-[18px] font-bold text-gray-900 ">
                    Contract Manager
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                        isCurrentPath(item.href)
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Menu and Mobile Menu Button */}
            <div className="flex items-center">
              {/* User Email - Desktop */}
              <span className="hidden sm:block text-sm text-gray-600 mr-4">
                {user?.email}
              </span>

              {/* Sign Out Button - Desktop */}
              <button
                onClick={handleSignOut}
                className="hidden sm:inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium ${
                    isCurrentPath(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-500">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
}
