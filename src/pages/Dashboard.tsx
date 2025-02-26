import React, { useEffect, useState } from 'react';
import { Link, } from 'react-router-dom';
import { FileText, Plus, } from 'lucide-react';
import { format } from 'date-fns';
import { contractsApi } from '../services/api';
import type { Database } from '../types/supabase';

type Contract = Database['public']['Tables']['contracts']['Row'];

export default function Dashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
//   const { user, signOut } = useAuth();
//   const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, []);

  async function fetchContracts() {
    try {
      setLoading(true);
      const response = await contractsApi.getAll();
      setContracts(response.data || []);
    } catch (err: unknown) {
      console.error('Error fetching contracts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  }

//   async function handleSignOut() {
//     try {
//       await signOut();
//       navigate('/login');
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   }

  function getStatusColor(status: Contract['status']) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Contract Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      <main className="max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Contracts</h2>
            <Link
              to="/contracts/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Link>
          </div>

          {error && (
            <div style={{ color: 'red' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading contracts...</div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No contracts</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new contract.</p>
              <div className="mt-6">
                <Link
                  to="/contracts/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Contract
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {contracts.map((contract) => (
                  <li key={contract.id}>
                    <Link
                      to={`/contracts/${contract.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {contract.title}
                            </p>
                            <span
                              className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                contract.status
                              )}`}
                            >
                              {contract.status}
                            </span>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="text-sm text-gray-500">
                              Expires {format(new Date(contract.expiry_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 truncate">
                            {contract.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
