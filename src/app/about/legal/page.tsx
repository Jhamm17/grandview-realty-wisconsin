import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Legal & Compliance - Grandview Realty',
  description: 'Legal information, compliance details, and important disclaimers for Grandview Realty LLC.',
  openGraph: {
    title: 'Legal & Compliance - Grandview Realty',
    description: 'Legal information and compliance details.',
  },
};

export default function LegalPage() {
  return (
    <main className="container-padding py-12 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Legal & Compliance</h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          Important legal information and compliance details for Grandview Realty LLC.
        </p>

        {/* Legal Disclaimer Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Legal Disclaimer</h2>
            <div className="prose prose-lg max-w-none">
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-primary">
                <p className="text-gray-700 leading-relaxed">
                  Information on this site is deemed reliable but not guaranteed. All properties, prices, and availability are subject to change without notice. Buyers and sellers should independently verify all information. Grandview Realty LLC complies with the Fair Housing Act and Equal Opportunity Act.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Compliance & Fair Housing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Fair Housing Act */}
              <div className="text-center">
                <div className="bg-blue-50 rounded-lg p-6 h-32 flex items-center justify-center mb-4">
                  <div className="text-blue-600">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Fair Housing Act Compliance</h3>
                <p className="text-sm text-gray-600">
                  Grandview Realty LLC is committed to equal housing opportunity and does not discriminate based on race, color, religion, sex, handicap, familial status, or national origin.
                </p>
              </div>

              {/* Equal Opportunity */}
              <div className="text-center">
                <div className="bg-green-50 rounded-lg p-6 h-32 flex items-center justify-center mb-4">
                  <div className="text-green-600">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Equal Opportunity</h3>
                <p className="text-sm text-gray-600">
                  We provide equal opportunity in all aspects of our business operations, including employment, services, and client relationships.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Important Information Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Important Information</h2>
            <div className="space-y-6">
              
              {/* Property Information */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold mb-2 text-primary">Property Information</h3>
                <p className="text-gray-600">
                  All property information, including but not limited to square footage, lot size, room dimensions, and property features, 
                  should be independently verified by buyers and their agents. While we strive for accuracy, information may be subject to 
                  change and should not be relied upon without verification.
                </p>
              </div>

              {/* Pricing Information */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold mb-2 text-primary">Pricing & Availability</h3>
                <p className="text-gray-600">
                  All prices, terms, and availability are subject to change without notice. Market conditions, property status, 
                  and other factors may affect pricing and availability. Contact us for the most current information.
                </p>
              </div>

              {/* Professional Services */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold mb-2 text-primary">Professional Services</h3>
                <p className="text-gray-600">
                  Grandview Realty LLC provides real estate brokerage services in accordance with applicable state and federal laws. 
                  We recommend that clients consult with qualified professionals, including attorneys, accountants, and inspectors, 
                  as appropriate for their specific situation.
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary">Contact Information</h3>
                <p className="text-gray-600">
                  For questions about our legal policies or compliance practices, please contact us directly. 
                  We are committed to transparency and are happy to address any concerns you may have.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="bg-primary text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Questions About Our Legal Policies?</h2>
            <p className="text-lg mb-6">
              We're here to help clarify any legal or compliance questions you may have about our services.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </main>
  );
} 