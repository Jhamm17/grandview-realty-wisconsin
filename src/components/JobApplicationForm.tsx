'use client';

import { useState } from 'react';

interface JobApplicationFormProps {
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobApplicationForm({ jobTitle, isOpen, onClose }: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('jobTitle', jobTitle);
      
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile);
      }

      // Send job application email with file
      const response = await fetch('/api/job-application', {
        method: 'POST',
        body: formDataToSend, // Don't set Content-Type header, browser will set it with boundary
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.fallback) {
          // Fallback to mailto link
          window.location.href = result.mailtoLink;
        }
        // Reset form and close modal
        setFormData({ name: '', email: '', phone: '' });
        setResumeFile(null);
        // Reset file input
        const fileInput = document.getElementById('resume') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        setIsSubmitting(false);
        onClose();
        
        // Show success message (you could add a toast notification here)
        alert('Thank you! Your application has been sent successfully. We will contact you soon.');
      } else {
        throw new Error(result.error || 'Failed to send application');
      }
    } catch (error) {
      console.error('Job application error:', error);
      alert('Failed to send application. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, Word document (.doc, .docx), or text file.');
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        e.target.value = '';
        return;
      }
      
      setResumeFile(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Apply for {jobTitle}</h2>
          <button
            onClick={() => {
              setResumeFile(null);
              const fileInput = document.getElementById('resume') as HTMLInputElement;
              if (fileInput) {
                fileInput.value = '';
              }
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
              Resume (Optional)
            </label>
            <input
              type="file"
              id="resume"
              name="resume"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {resumeFile && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: PDF, Word (.doc, .docx), or Text (.txt). Max size: 5MB
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setResumeFile(null);
                const fileInput = document.getElementById('resume') as HTMLInputElement;
                if (fileInput) {
                  fileInput.value = '';
                }
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending Application...' : 'Submit Application'}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Your application will be sent directly to our hiring team.
        </p>
      </div>
    </div>
  );
} 