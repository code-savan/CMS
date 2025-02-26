import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { contractsApi } from '../services/api';
import type { Contract } from '../types/contracts';

export default function EditContract() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Contract['status'],
    expiry_date: '',
    parties_involved: [] as string[]
  });

  useEffect(() => {
    if (id) fetchContract(id);
  }, [id]);

  async function fetchContract(contractId: string) {
    try {
      setLoading(true);
      const response = await contractsApi.getById(contractId);
      const contract = response.data;
      setFormData({
        title: contract.title,
        description: contract.description,
        status: contract.status,
        expiry_date: contract.expiry_date.split('T')[0],
        parties_involved: contract.parties_involved
      });
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Failed to fetch contract');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!id) throw new Error('Contract ID is missing');
      await contractsApi.update(id, formData);
      navigate(`/contracts/${id}`);
    } catch (err) {
      console.error('Error updating contract:', err);
      setError('Failed to update contract');
    }
  }

  const handlePartyChange = (index: number, value: string) => {
    const newParties = [...formData.parties_involved];
    newParties[index] = value;
    setFormData({ ...formData, parties_involved: newParties });
  };

  const addParty = () => {
    setFormData({
      ...formData,
      parties_involved: [...formData.parties_involved, '']
    });
  };

  const removeParty = (index: number) => {
    const newParties = formData.parties_involved.filter((_, i) => i !== index);
    setFormData({ ...formData, parties_involved: newParties });
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

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-200 border focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-200 border focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Contract['status'] })}
              className="mt-1 block w-full rounded-md border-slate-200 border focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-200 border focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parties Involved</label>
            {formData.parties_involved.map((party, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={party}
                  onChange={(e) => handlePartyChange(index, e.target.value)}
                  className="block w-full rounded-md border-slate-200 border focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  placeholder="Enter party name"
                />
                <button
                  type="button"
                  onClick={() => removeParty(index)}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addParty}
              className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Add Party
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
