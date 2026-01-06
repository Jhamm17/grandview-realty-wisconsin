'use client';

import { useState } from 'react';
import JobApplicationForm from '@/components/JobApplicationForm';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Career {
  id: string;
  title: string;
  type: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary_range?: string;
  sort_order: number;
}

interface CareersClientProps {
  careers: Career[];
}

export default function CareersClient({ careers }: CareersClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string>('');

  const handleApplyClick = (jobTitle: string) => {
    setSelectedJob(jobTitle);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedJob('');
  };

  return (
    <>
      {/* Open Positions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-padding">
          <h2 className="text-3xl font-bold mb-12 text-center">Open Positions</h2>
          
          <div className="grid gap-6">
            {careers.map((position) => (
              <div key={position.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {position.type}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {position.location}
                      </span>
                      {position.salary_range && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {position.salary_range}
                        </span>
                      )}
                    </div>
                    <MarkdownRenderer content={position.description} className="mb-4" />
                    
                    {/* Requirements */}
                    {position.requirements && position.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
                        <div className="flex flex-wrap gap-2">
                          {position.requirements.map((req, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Benefits */}
                    {position.benefits && position.benefits.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Benefits:</h4>
                        <div className="flex flex-wrap gap-2">
                          {position.benefits.map((benefit, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="md:ml-6 mt-4 md:mt-0">
                    <button 
                      onClick={() => handleApplyClick(position.title)}
                      className="btn-primary whitespace-nowrap"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {careers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No open positions at the moment.</p>
                <p className="text-gray-400 mt-2">Please check back later or contact us for opportunities.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Job Application Form */}
      <JobApplicationForm
        jobTitle={selectedJob}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </>
  );
}

