'use client';

import { useState, useRef } from 'react';

interface ContactFormProps {
  pageTitle: string;
  fields?: {
    name?: boolean;
    email?: boolean;
    phone?: boolean;
    subject?: boolean;
    message?: boolean;
    [key: string]: boolean | undefined;
  };
  customFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    rows?: number;
  }>;
}

export default function ContactForm({ pageTitle, fields = {}, customFields = [] }: ContactFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Default fields if none specified
  const defaultFields = {
    name: true,
    email: true,
    phone: true,
    message: true,
    ...fields
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Prepare form data
      const submitData = {
        ...formData,
        pageTitle
      };

      // Submit form
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.fallback) {
          // Fallback to mailto link
          window.location.href = result.mailtoLink;
        }
        setSubmitStatus('success');
        // Reset form
        setFormData({});
        if (formRef.current) {
          formRef.current.reset();
        }
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const renderField = (fieldName: string, fieldConfig: any) => {
    if (!fieldConfig) return null;

    const commonProps = {
      name: fieldName,
      value: formData[fieldName] || '',
      onChange: handleInputChange,
      className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary",
      required: fieldConfig.required !== false
    };

    switch (fieldConfig.type) {
      case 'email':
        return (
          <input
            {...commonProps}
            type="email"
            placeholder={fieldConfig.placeholder || "Enter your email address"}
          />
        );
      case 'tel':
        return (
          <input
            {...commonProps}
            type="tel"
            placeholder={fieldConfig.placeholder || "Enter your phone number"}
          />
        );
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{fieldConfig.placeholder || `Select ${fieldConfig.label.toLowerCase()}`}</option>
            {fieldConfig.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={fieldConfig.rows || 4}
            placeholder={fieldConfig.placeholder || `Enter your ${fieldConfig.label.toLowerCase()}`}
          />
        );
      default:
        return (
          <input
            {...commonProps}
            type="text"
            placeholder={fieldConfig.placeholder || `Enter your ${fieldConfig.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div>
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">Thank you! Your message has been sent successfully. We will get back to you soon.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Default fields */}
        {defaultFields.name && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            {renderField('name', { type: 'text', required: true, label: 'Name' })}
          </div>
        )}

        {defaultFields.email && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            {renderField('email', { type: 'email', required: true, label: 'Email' })}
          </div>
        )}

        {defaultFields.phone && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            {renderField('phone', { type: 'tel', required: false, label: 'Phone' })}
          </div>
        )}

        {defaultFields.subject && (
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            {renderField('subject', { 
              type: 'select', 
              required: true, 
              label: 'Subject',
              options: [
                { value: 'buying', label: 'Buying a Property' },
                { value: 'selling', label: 'Selling a Property' },
                { value: 'careers', label: 'Career Opportunities' },
                { value: 'other', label: 'Other' }
              ]
            })}
          </div>
        )}

        {defaultFields.message && (
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            {renderField('message', { 
              type: 'textarea', 
              required: true, 
              label: 'Message',
              rows: 6,
              placeholder: 'Tell us how we can help you...'
            })}
          </div>
        )}

        {/* Custom fields */}
        {customFields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && '*'}
            </label>
            {renderField(field.name, field)}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Your message will be sent directly to our team.
        </p>
      </form>
    </div>
  );
} 