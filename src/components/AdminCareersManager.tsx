'use client';

import { useState, useEffect } from 'react';

interface Career {
  id: string;
  title: string;
  type: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary_range?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface AdminCareersManagerProps {
  onClose: () => void;
}

export default function AdminCareersManager({ onClose }: AdminCareersManagerProps) {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    description: '',
    requirements: [] as string[],
    benefits: [] as string[],
    salary_range: '',
    sort_order: 0,
    is_active: true
  });

  const typeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const requirementOptions = [
    'Real Estate License', 'Bachelor\'s degree', 'Master\'s degree', '2+ years experience',
    '5+ years experience', 'Strong communication skills', 'Attention to detail',
    'Customer service skills', 'Social media expertise', 'Marketing experience',
    'Sales experience', 'Team leadership', 'Project management'
  ];
  const benefitOptions = [
    'Health insurance', 'Dental insurance', 'Vision insurance', '401(k)',
    'Paid time off', 'Flexible schedule', 'Remote work', 'Professional development',
    'Training & mentorship', 'Marketing support', 'Competitive commission',
    'Performance bonuses', 'Gym membership', 'Company car'
  ];

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      setRefreshing(true);
      const timestamp = Date.now();
      const response = await fetch(`/api/admin/careers?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch careers');
      }
      const data = await response.json();
      setCareers(data.careers);
    } catch (error) {
      setError('Failed to load careers');
      console.error('Error fetching careers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCareer 
        ? `/api/admin/careers/${editingCareer.id}`
        : '/api/admin/careers';
      
      const method = editingCareer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || 'Failed to save career';
        throw new Error(errorMessage);
      }

      await fetchCareers();
      
      // Invalidate cache for careers page
      await fetch('/api/admin/invalidate-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/careers' })
      });

      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save career';
      setError(errorMessage);
      console.error('Error saving career:', error);
    }
  };

  const handleDelete = async (careerId: string) => {
    if (!confirm('Are you sure you want to delete this career position?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/careers/${careerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete career');
      }

      await fetchCareers();
      
      // Invalidate cache for careers page
      await fetch('/api/admin/invalidate-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/careers' })
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete career';
      setError(errorMessage);
      console.error('Error deleting career:', error);
    }
  };

  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setFormData({
      title: career.title,
      type: career.type,
      location: career.location,
      description: career.description,
      requirements: career.requirements || [],
      benefits: career.benefits || [],
      salary_range: career.salary_range || '',
      sort_order: career.sort_order,
      is_active: career.is_active
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: '',
      location: '',
      description: '',
      requirements: [],
      benefits: [],
      salary_range: '',
      sort_order: 0,
      is_active: true
    });
    setEditingCareer(null);
    setShowAddForm(false);
  };

  const handleRequirementChange = (requirement: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requirements: checked 
        ? [...prev.requirements, requirement]
        : prev.requirements.filter(r => r !== requirement)
    }));
  };

  const handleBenefitChange = (benefit: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      benefits: checked 
        ? [...prev.benefits, benefit]
        : prev.benefits.filter(b => b !== benefit)
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading careers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Careers</h2>
            <div className="space-x-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Position
              </button>
              <button
                onClick={fetchCareers}
                disabled={refreshing}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
          
          {/* Cache Notice */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Cache Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Changes made in the admin portal may take 15-30 minutes to appear on the public website due to caching. 
                  The admin portal shows real-time data, but the public pages are cached for performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {showAddForm && (
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4">
              {editingCareer ? 'Edit Career Position' : 'Add New Career Position'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., $40,000 - $50,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="admin-textarea"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {requirementOptions.map(requirement => (
                      <label key={requirement} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.requirements.includes(requirement)}
                          onChange={(e) => handleRequirementChange(requirement, e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">{requirement}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {benefitOptions.map(benefit => (
                      <label key={benefit} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.benefits.includes(benefit)}
                          onChange={(e) => handleBenefitChange(benefit, e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">{benefit}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingCareer ? 'Update Position' : 'Add Position'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Positions</h3>
          <div className="space-y-4">
            {careers.map((career) => (
              <div key={career.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">{career.title}</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {career.type}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {career.location}
                      </span>
                      {career.salary_range && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {career.salary_range}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-sm ${career.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {career.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{career.description}</p>
                    <div className="text-xs text-gray-500">
                      Sort Order: {career.sort_order} | Created: {new Date(career.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(career)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(career.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {careers.length === 0 && (
              <p className="text-gray-500 text-center py-8">No career positions found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 