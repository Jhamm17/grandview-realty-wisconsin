import Image from 'next/image';
import Link from 'next/link';

export default function MissionStatement() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <Image
              src="/mission.jpg"
              alt="Grandview Realty Mission"
              fill
              style={{ objectFit: "cover" }}
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#081d36]/80 to-[#081d36]/60" />
          </div>
        </div>
        
        <div className="container-padding relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Our Mission
            </h1>
            <div className="w-32 h-2 bg-gradient-to-r from-white to-white/60 mb-6" />
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl leading-relaxed">
              Helping families find their perfect place to call home through integrity, expertise, and community commitment.
            </p>
          </div>
        </div>
      </section>

      {/* Main Mission Statement */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container-padding max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block bg-[#081d36]/10 text-[#081d36] px-4 py-2 rounded-full text-sm font-medium">
                Our Promise
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#081d36] leading-tight">
                Exceptional Real Estate Experiences
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                At Grandview Realty, LLC, our mission is to help individuals and families confidently find their perfect place to call home. We are committed to delivering exceptional real estate experiences through integrity, local expertise, and personalized service.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#081d36] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg font-medium text-[#081d36]">Trusted by Wisconsin families since 2017</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/mission.jpg"
                  alt="Grandview Realty Team"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081d36]/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6 max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Serving Wisconsin Communities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Focus Section */}
      <section className="py-20 bg-white">
        <div className="container-padding max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#081d36] mb-6">
              Rooted in Our Communities
            </h2>
            <div className="w-24 h-1 bg-[#081d36] mx-auto mb-8" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just selling homes—we're building relationships and strengthening the neighborhoods we serve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#081d36]/10 to-[#081d36]/5 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-[#081d36] mb-4">Local Expertise</h3>
                <p className="text-gray-700 leading-relaxed">
                  Rooted in the communities we serve across Wisconsin, we strive to build lasting relationships, support local causes, and make every client feel confident and cared for throughout their real estate journey.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-[#081d36]/5 to-[#081d36]/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-[#081d36] mb-4">Maximum Value</h3>
                <p className="text-gray-700 leading-relaxed">
                  We strive to maximize the value of every transaction while maintaining the highest standards of service. We are proud to be accessible, responsive, and fully invested in the success of our clients.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-[#081d36] rounded-xl p-6 text-white text-center">
                    <div className="text-3xl font-bold mb-2">500+</div>
                    <div className="text-sm opacity-90">Happy Families</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#081d36]/20 to-[#081d36]/10 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-[#081d36] mb-2">15+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-gradient-to-br from-[#081d36]/20 to-[#081d36]/10 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-[#081d36] mb-2">100%</div>
                    <div className="text-sm text-gray-600">Client Satisfaction</div>
                  </div>
                  <div className="bg-[#081d36] rounded-xl p-6 text-white text-center">
                    <div className="text-3xl font-bold mb-2">24/7</div>
                    <div className="text-sm opacity-90">Support Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-[#081d36] to-[#0a2a4a]">
        <div className="container-padding max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Core Values
            </h2>
            <div className="w-24 h-1 bg-white/80 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Integrity</h3>
              <p className="text-white/90 leading-relaxed">We conduct business with honesty, transparency, and unwavering ethical standards in every transaction.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Community</h3>
              <p className="text-white/90 leading-relaxed">We're dedicated to strengthening and supporting the communities we serve through partnerships and charitable initiatives.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Expertise</h3>
              <p className="text-white/90 leading-relaxed">We bring deep local knowledge and professional excellence to every transaction, ensuring the best outcomes for our clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-white">
        <div className="container-padding max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#081d36] mb-6">
              Ready to Find Your Perfect Home?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you're buying your first home, selling your last, or planning your next move, Grandview Realty is here to support your journey every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="inline-block bg-[#081d36] text-white px-8 py-4 rounded-xl hover:bg-[#081d36]/90 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Connect With Us
              </Link>
              <Link 
                href="/properties"
                className="inline-block bg-white text-[#081d36] border-2 border-[#081d36] px-8 py-4 rounded-xl hover:bg-[#081d36] hover:text-white transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View Properties
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 