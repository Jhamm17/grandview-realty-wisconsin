'use client';

import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import MarkdownHelp from './MarkdownHelp';

interface OfficeStaff {
  id: string;
  name: string;
  title: string;
  image_url?: string;
  phone?: string;
  email?: string;
  responsibilities: string[];
  experience?: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface AdminOfficeStaffManagerProps {
  onClose: () => void;
}

export default function AdminOfficeStaffManager({ onClose }: AdminOfficeStaffManagerProps) {
  const [officeStaff, setOfficeStaff] = useState<OfficeStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<OfficeStaff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    image_url: '',
    phone: '',
    email: '',
    responsibilities: [] as string[],
    experience: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  const responsibilityOptions = [
    'Transaction Management', 'Documentation', 'Closing Support', 'MLS & CRM Updates', 
    'File Organization & Audit Prep', 'Business Growth & Development', 'Agent Mentorship & Development',
    'Brokerage Oversight & Compliance', 'REO Specialist', 'Corporate Closings', 'Real Estate Operations',
    'Administrative Oversight', 'Real Estate Compliance', 'REO Management', 'Agent Support and Development',
    'Office Management', 'Agent Leadership & Support', 'Training & Mentorship', 'Business Development',
    'Recruiting & Retention', 'MLS Data Entry & Verification', 'Detailed Audits & Compliance',
    'Reporting: Feedback, Scrubs, Pricing, MLS Data Reports', 'Designing and Producing Marketing Material'
  ];

  useEffect(() => {
    fetchOfficeStaff();
  }, []);

  const fetchOfficeStaff = async () => {
    try {
      setRefreshing(true);
      // Add cache busting parameter to ensure fresh data
      const timestamp = Date.now();
      const response = await fetch(`/api/admin/office-staff?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch office staff');
      }
      const data = await response.json();
      setOfficeStaff(data.officeStaff);
    } catch (error) {
      setError('Failed to load office staff');
      console.error('Error fetching office staff:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStaff 
        ? `/api/admin/office-staff/${editingStaff.id}`
        : '/api/admin/office-staff';
      
      const method = editingStaff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save office staff');
      }

      // Reset form first
      resetForm();
      
      // Force immediate refresh with cache busting
      await fetchOfficeStaff();
      
      // Invalidate cache to update the public pages
      try {
        await fetch('/api/admin/invalidate-cache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: '/team/office-staff' }),
        });
      } catch (cacheError) {
        console.warn('Cache invalidation failed:', cacheError);
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this office staff member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/office-staff/${staffId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete office staff');
      }

      // Force immediate refresh with cache busting
      await fetchOfficeStaff();
      
      // Invalidate cache to update the public pages
      try {
        await fetch('/api/admin/invalidate-cache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: '/team/office-staff' }),
        });
      } catch (cacheError) {
        console.warn('Cache invalidation failed:', cacheError);
      }
    } catch (error) {
      setError('Failed to delete office staff');
    }
  };

  const handleEdit = (staff: OfficeStaff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      title: staff.title,
      image_url: staff.image_url || '',
      phone: staff.phone || '',
      email: staff.email || '',
      responsibilities: staff.responsibilities,
      experience: staff.experience || '',
      description: staff.description || '',
      sort_order: staff.sort_order,
      is_active: staff.is_active
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      image_url: '',
      phone: '',
      email: '',
      responsibilities: [],
      experience: '',
      description: '',
      sort_order: 0,
      is_active: true
    });
    setEditingStaff(null);
    setShowAddForm(false);
  };

  const handleResponsibilityChange = (responsibility: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: checked 
        ? [...prev.responsibilities, responsibility]
        : prev.responsibilities.filter(r => r !== responsibility)
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading office staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Office Staff</h2>
            <div className="space-x-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Staff Member
              </button>
              <button
                onClick={fetchOfficeStaff}
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
              {editingStaff ? 'Edit Office Staff' : 'Add New Office Staff'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
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
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              <ImageUpload
                label="Profile Image"
                currentImageUrl={formData.image_url}
                onImageUpload={(imageUrl) => setFormData({...formData, image_url: imageUrl})}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {responsibilityOptions.map((responsibility) => (
                    <label key={responsibility} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={formData.responsibilities.includes(responsibility)}
                        onChange={(e) => handleResponsibilityChange(responsibility, e.target.checked)}
                        className="mr-2"
                      />
                      {responsibility}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Markdown supported)
                </label>
                <MarkdownHelp />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={6}
                  className="admin-textarea"
                  placeholder="You can use Markdown formatting here. Click 'Show Markdown Help' for examples."
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

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sort Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {officeStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">{staff.title}</div>
                        <div className="text-xs text-gray-400">{staff.experience}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staff.phone}</div>
                      <div className="text-sm text-gray-500">{staff.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        staff.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {staff.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {staff.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(staff)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 