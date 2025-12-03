import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Affiliations & Accreditation - Grandview Realty',
  description: 'Learn about Grandview Realty&apos;s professional affiliations, BBB accreditation, and industry recognitions.',
  openGraph: {
    title: 'Affiliations & Accreditation - Grandview Realty',
    description: 'Professional affiliations and industry recognitions.',
  },
};

export default function AffiliationsPage() {
  return (
    <main className="container-padding py-12 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Affiliations & Accreditation</h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          Grandview Realty is proud to maintain the highest standards of professional excellence through our affiliations and accreditations.
        </p>

        {/* BBB Accreditation Section */}
        {/* <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">BBB Accreditation</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="text-center">
                <a 
                  href="https://www.bbb.org/us/il/geneva/profile/real-estate-broker/grandview-realty-0654-90017168" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-80 transition-opacity bg-gray-800 rounded-lg p-4"
                >
                  <Image
                    src="/bbb-seal.png"
                    alt="BBB Accredited Business"
                    width={120}
                    height={120}
                    className="h-24 w-auto"
                  />
                </a>
                <p className="text-sm text-gray-500 mt-2">Click to view our BBB profile</p>
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-semibold mb-3">Better Business Bureau Accredited</h3>
                <p className="text-gray-600 mb-4">
                  Grandview Realty is proud to be an accredited business with the Better Business Bureau. 
                  This accreditation demonstrates our commitment to ethical business practices and customer satisfaction.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• A+ Rating</li>
                  <li>• Accredited since 2020</li>
                  <li>• Zero complaints in the last 3 years</li>
                  <li>• Commitment to resolving customer issues</li>
                </ul>
              </div>
            </div>
          </div>
        </section> */}

        {/* Professional Associations Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Professional Associations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Realtor Association */}
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-6 h-32 flex items-center justify-center mb-4">
                  <div className="text-gray-400">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">National Association of Realtors®</h3>
                <p className="text-sm text-gray-600">
                  Member of the largest professional association in real estate, upholding the highest ethical standards.
                </p>
              </div>

              {/* MLS */}
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-6 h-32 flex items-center justify-center mb-4">
                  <div className="text-gray-400">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">MLS Access</h3>
                <p className="text-sm text-gray-600">
                  Full access to Multiple Listing Service for comprehensive property data and market insights.
                </p>
              </div>

              {/* Local Association */}
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-6 h-32 flex items-center justify-center mb-4">
                  <div className="text-gray-400">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Local Real Estate Associations</h3>
                <p className="text-sm text-gray-600">
                  Active member of local and regional real estate associations serving the Chicagoland area.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Awards & Recognitions Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Awards & Recognitions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Top Producer Award */}
              <div className="text-center">
                <div className="bg-yellow-50 rounded-lg p-6 h-32 flex items-center justify-center mb-4">
                  <div className="text-yellow-600">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Top Producer Award</h3>
                <p className="text-sm text-gray-600">
                  Recognized for exceptional sales performance and outstanding client service in Wisconsin.
                </p>
              </div>

              {/* Customer Service Excellence */}
              <div className="text-center">
                <div className="bg-blue-50 rounded-lg p-6 h-32 flex items-center justify-center mb-4">
                  <div className="text-blue-600">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Customer Service Excellence</h3>
                <p className="text-sm text-gray-600">
                  Consistently high customer satisfaction ratings and positive client testimonials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section>
          <div className="bg-primary text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Our Commitment to Excellence</h2>
            <p className="text-lg mb-6">
              These affiliations and accreditations reflect our ongoing commitment to providing the highest level of 
              professional service to our clients throughout Wisconsin.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Ethical Standards</h3>
                <p>Adherence to the highest ethical standards in real estate</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Professional Development</h3>
                <p>Ongoing education and training to stay current with industry best practices</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Client Advocacy</h3>
                <p>Dedicated to protecting and advancing our clients&apos; interests</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 