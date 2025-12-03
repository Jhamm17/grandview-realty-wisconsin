import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Fair Housing Policy - Grandview Realty',
  description: 'Grandview Realty is committed to equal housing opportunity and Fair Housing Act compliance.',
  openGraph: {
    title: 'Fair Housing Policy - Grandview Realty',
    description: 'Our commitment to equal housing opportunity and Fair Housing Act compliance.',
  },
};

export default function FairHousingPage() {
  return (
    <main className="container-padding py-16 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Fair Housing Policy</h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          Grandview Realty LLC is committed to equal housing opportunity and compliance with all applicable fair housing laws.
        </p>

        {/* Fair Housing Act Statement */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900">Our Commitment</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Grandview Realty LLC supports and complies with the Fair Housing Act, which prohibits discrimination in the sale, 
                rental, and financing of housing based on race, color, religion, sex, national origin, familial status, or disability. 
                We are committed to providing equal professional service to all persons, without regard to any of these protected classes.
              </p>
            </div>
          </div>
        </section>

        {/* Protected Classes */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Protected Classes</h2>
            <p className="mb-4 text-gray-700">
              The Fair Housing Act prohibits discrimination based on:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Race</h3>
                  <p className="text-sm text-gray-600">We do not discriminate based on race or ethnicity.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Color</h3>
                  <p className="text-sm text-gray-600">We provide equal service regardless of skin color.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Religion</h3>
                  <p className="text-sm text-gray-600">We respect all religious beliefs and practices.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sex</h3>
                  <p className="text-sm text-gray-600">We provide equal service regardless of gender or gender identity.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">National Origin</h3>
                  <p className="text-sm text-gray-600">We serve clients regardless of their country of origin or ancestry.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Familial Status</h3>
                  <p className="text-sm text-gray-600">We do not discriminate against families with children under 18.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 md:col-span-2">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Disability</h3>
                  <p className="text-sm text-gray-600">We provide reasonable accommodations and modifications for persons with disabilities.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What This Means */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">What This Means for You</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Equal Access</h3>
                <p className="text-gray-700">
                  All clients receive equal access to our services, property listings, and professional expertise regardless of 
                  their protected class status.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Fair Treatment</h3>
                <p className="text-gray-700">
                  We treat all clients with respect and professionalism, providing the same level of service and attention to everyone.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">No Discrimination</h3>
                <p className="text-gray-700">
                  We do not engage in any discriminatory practices, including steering, blockbusting, or redlining. All properties 
                  are available to all qualified buyers and renters.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Reasonable Accommodations</h3>
                <p className="text-gray-700">
                  We provide reasonable accommodations and modifications for persons with disabilities, including accessible 
                  property viewings and communication accommodations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Prohibited Practices */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Prohibited Practices</h2>
            <p className="mb-4 text-gray-700">
              Grandview Realty LLC and its agents do not engage in any of the following discriminatory practices:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Refusing to show, rent, or sell housing based on protected class status</li>
              <li>Setting different terms, conditions, or privileges for housing based on protected class status</li>
              <li>Providing different housing services or facilities based on protected class status</li>
              <li>Falsely denying that housing is available for inspection, sale, or rental</li>
              <li>Steering or directing clients to or away from certain neighborhoods based on protected class status</li>
              <li>Blockbusting or encouraging property owners to sell or rent based on the entry of protected classes into a neighborhood</li>
              <li>Making discriminatory statements or advertisements</li>
              <li>Refusing to make reasonable accommodations for persons with disabilities</li>
              <li>Refusing to allow reasonable modifications for persons with disabilities</li>
            </ul>
          </div>
        </section>

        {/* Reporting Discrimination */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Reporting Discrimination</h2>
            <p className="mb-4 text-gray-700">
              If you believe you have been discriminated against in connection with housing, you have the right to file a complaint. 
              You can file a complaint with:
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">U.S. Department of Housing and Urban Development (HUD)</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Phone: 1-800-669-9777 (Toll-free) or 1-800-927-9275 (TTY)
                </p>
                <p className="text-sm text-gray-600">
                  Website: <a href="https://www.hud.gov/fairhousing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.hud.gov/fairhousing</a>
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Wisconsin Department of Safety and Professional Services</h3>
                <p className="text-sm text-gray-600 mb-2">
                  For state-level fair housing complaints
                </p>
                <p className="text-sm text-gray-600">
                  Website: <a href="https://dsps.wi.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dsps.wi.gov</a>
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Grandview Realty LLC</h3>
                <p className="text-sm text-gray-600 mb-2">
                  We take all complaints seriously and investigate them promptly. If you have concerns about fair housing practices, 
                  please contact us directly.
                </p>
                <p className="text-sm text-gray-600">
                  Contact: <a href="/contact" className="text-blue-600 hover:underline">Contact Us</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Equal Housing Opportunity Logo */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-6">Equal Housing Opportunity</h2>
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className="text-6xl">🏠</div>
              <div className="text-4xl font-bold text-blue-600">=</div>
              <div className="text-6xl">👥</div>
            </div>
            <p className="text-gray-700 text-lg">
              We are pledged to the letter and spirit of U.S. policy for the achievement of equal housing opportunity 
              throughout the Nation. We encourage and support an affirmative advertising and marketing program in which 
              there are no barriers to obtaining housing because of race, color, religion, sex, handicap, familial status, 
              or national origin.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="bg-[#081d36] text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Questions About Fair Housing?</h2>
            <p className="text-lg mb-6 text-white/90">
              We're committed to ensuring equal housing opportunity for all. If you have questions or concerns about 
              our fair housing practices, please don't hesitate to contact us.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-white text-[#081d36] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

