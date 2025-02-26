import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Edit, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { contractsApi } from '../services/api';
import type { Contract } from '../types/contracts';  // We'll create this type

export default function ContractDetails() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContract(id);
    }
  }, [id]);

  async function fetchContract(contractId: string) {
    try {
      setLoading(true);
      const response = await contractsApi.getById(contractId);
      setContract(response.data);
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contract');
    } finally {
      setLoading(false);
    }
  }

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contract?')) {
      return;
    }

    try {
      setIsDeleting(true);
      if (!id) throw new Error('Contract ID is missing');
      await contractsApi.delete(id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting contract:', err);
      setError('Failed to delete contract');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-gray-600">Contract not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {contract.title}
              </h3>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                  contract.status
                )}`}
              >
                {contract.status}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{contract.description}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(contract.expiry_date), 'MMMM d, yyyy')}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(contract.created_at), 'MMMM d, yyyy')}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Parties Involved</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {contract.parties_involved.map((party, index) => (
                      <li
                        key={index}
                        className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                      >
                        {party}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>

              {contract.pdf_url && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-700">Contract Document</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          if (!contract.pdf_url) throw new Error('PDF URL not found');
                          const fileName = contract.pdf_url.split('/').pop();
                          if (!fileName) throw new Error('Invalid PDF URL');

                          // Get a signed URL for viewing
                          const signedUrl = await contractsApi.getPdfUrl(contract.id.toString(), fileName);
                          window.open(signedUrl, '_blank');
                        } catch (err) {
                          console.error('Error viewing PDF:', err);
                          alert('Failed to view PDF. Please try again later.');
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View PDF
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (!contract.pdf_url) throw new Error('PDF URL not found');
                          const fileName = contract.pdf_url.split('/').pop();
                          if (!fileName) throw new Error('Invalid PDF URL');

                          const pdfBlob = await contractsApi.downloadPdf(contract.id.toString(), fileName);
                          const url = window.URL.createObjectURL(pdfBlob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${contract.title}-contract.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch (err) {
                          console.error('Error downloading PDF:', err);
                          alert('Failed to download PDF. Please try again later.');
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <Link
            to={`/contracts/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Contract
          </Link>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Contract'}
          </button>
        </div>
      </div>
    </div>
  );
}
