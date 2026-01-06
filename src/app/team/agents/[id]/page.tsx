import Link from 'next/link';
import AgentListings from '@/components/AgentListings';
import { AgentCacheService } from '@/lib/agent-cache';
import MarkdownRenderer from '@/components/MarkdownRenderer';

// Force dynamic rendering - no static generation to avoid API calls during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AgentPage({ params }: { params: { id: string } }) {
  const cachedAgent = await AgentCacheService.getAgentWithListings(params.id);

  if (!cachedAgent || !cachedAgent.agent) {
    return (
      <div className="container-padding py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Agent Not Found</h1>
          <p className="text-gray-600 mb-8">The agent you&apos;re looking for could not be found.</p>
          <Link 
            href="/team/agents" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to All Agents
          </Link>
        </div>
      </div>
    );
  }

  const { agent, listings } = cachedAgent;

  return (
    <div className="container-padding py-16">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/team/agents" className="text-[#60a5fa] hover:text-[#3b82f6] underline flex items-center">
          ← Back to Agents
        </Link>
      </div>

      {/* Agent Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        {/* Agent Image */}
        <div className="lg:col-span-1">
          <div className="relative h-96 bg-gray-200 rounded-lg">
            {agent.image_url ? (
              <img
                src={agent.image_url}
                alt={agent.name}
                className={`w-full h-full rounded-lg ${
                  agent.slug === 'sam-tousi' || agent.slug === 'adam-turner' 
                    ? 'object-contain' 
                    : agent.slug === 'chris-clark'
                    ? 'object-cover'
                    : 'object-cover object-bottom'
                }`}
                style={agent.slug === 'chris-clark' ? { objectPosition: 'center 25%' } : undefined}
              />
            ) : agent.logo_url ? (
              // Show logo for agents without headshots (Christopher Lobrillo and Lynda Werner)
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <img
                  src={agent.logo_url}
                  alt={`${agent.name} Logo`}
                  className="max-w-full max-h-full object-contain p-4"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-500">
                      {agent.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <p className="text-lg">Photo Coming Soon</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agent Info */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-2">{agent.name}</h1>
          <p className="text-2xl text-[#60a5fa] font-semibold mb-6">{agent.title}</p>
          
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3D9BE9' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-lg">{agent.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3D9BE9' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-lg">{agent.email}</span>
              </div>
              {agent.experience && (
                <div className="flex items-center text-gray-600">
                                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3D9BE9' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                  <span className="text-lg">{agent.experience} experience</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {agent.languages && agent.languages.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.languages.map((language: string, index: number) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {agent.service_areas && agent.service_areas.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Service Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.service_areas.map((area: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specialties */}
          {agent.specialties && agent.specialties.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold text-gray-800 mb-3">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {agent.specialties.map((specialty: string, index: number) => (
                  <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {agent.description && (
            <div className="mb-8">
              <h4 className="font-semibold text-gray-800 mb-3">About</h4>
              <MarkdownRenderer content={agent.description} />
            </div>
          )}

          {/* Bio */}
          {agent.bio && (
            <div className="mb-8">
              <h4 className="font-semibold text-gray-800 mb-3">Bio</h4>
              <MarkdownRenderer content={agent.bio} />
            </div>
          )}

          {/* Achievements */}
          {agent.achievements && agent.achievements.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold text-gray-800 mb-3">Achievements & Certifications</h4>
              <ul className="space-y-2">
                {agent.achievements.map((achievement: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Agent Listings */}
      <AgentListings agentId={agent.slug} agentName={agent.name} listings={listings} />
    </div>
  );
} 