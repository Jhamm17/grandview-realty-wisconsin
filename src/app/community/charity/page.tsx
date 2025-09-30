import { Metadata } from "next";
import Image from "next/image";
import { Footer } from "../../components/Navigation";
import ScrollController from "./ScrollController";

export const metadata: Metadata = {
  title: 'Charity & Community Involvement - Grandview Realty',
  description: 'Join us for our adoption event "Miracle on State Street" featuring Anderson Dogs looking for their "fur-ever" home!',
  openGraph: {
    title: 'Charity & Community Involvement - Grandview Realty',
    description: 'Adoption event featuring Anderson Dogs looking for their forever homes.',
  },
};

export default function CharityPage() {

  return (
    <>
      <ScrollController />
      <div className="relative charity-page min-h-screen">
        {/* Background Image - Fixed and spans full width */}
        <div className="fixed inset-0 z-0">
          <img
            src="/community/communitybackground.jpg"
            alt="Community Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Main Content - Floating over background */}
        <div className="relative z-10 min-h-screen">
          {/* Content wrapper */}
          <div className="relative">
        {/* Hero Section - PawtyTime logo that disappears behind nav */}
        <section className="h-[40vh] md:h-[50vh] flex items-end justify-center text-center text-white pb-16">
          <div className="max-w-4xl">
            <img
              src="/community/PawtyTime.png"
              alt="PawtyTime"
              className="w-auto h-24 md:h-48 mx-auto mb-4"
            />
          </div>
        </section>

        {/* Main Content Section - Full width white background */}
        <section className="bg-white w-full charity-content">
          <div className="px-4 md:px-8 lg:px-12 pt-8 md:pt-12 lg:pt-16">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4">
                Miracle on State Street
              </h1>
              <p className="text-xl md:text-2xl font-medium text-gray-700">
                Anderson Dogs looking for their &ldquo;fur-ever&rdquo; home!
              </p>
            </div>
            <div className="prose prose-lg mx-auto text-center max-w-4xl">
              <p className="text-xl leading-relaxed text-gray-700 mb-8">
                We proudly partner with <a 
                  href="https://ahconnects.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline font-semibold"
                >
                  Anderson Humane
                </a> to host adoption events at least once a year — fun-filled days with games, snacks, and, most importantly, plenty of lovable pups ready to meet their forever families.
              </p>
              
              <p className="text-xl leading-relaxed text-gray-700 mb-8">
                All dogs at these events are available for adoption, and each gathering is a great opportunity to support a wonderful cause. Stay tuned for details on our next event — we&apos;d love to see you, your family, and friends there!
              </p>
              
              <p className="text-xl leading-relaxed text-gray-700 mb-8">
                A big thank you to Anderson Humane for continuing to help us make these events a success.
              </p>
            </div>

            {/* Bones Bar Section with Quote */}
            <div className="relative h-32 md:h-40 overflow-hidden shadow-none -mx-4 md:-mx-8 lg:-mx-12">
              <img
                src="/community/bonesbar.jpg"
                alt="Bones Bar Background"
                className="w-full h-full object-cover"
              />
              {/* Quote Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl lg:text-5xl font-black italic" style={{ fontFamily: 'cursive', color: '#081d36' }}>
                    &ldquo;Rescue is our favorite breed&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Split Section: Anderson Humane & Mission */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Left Side: Anderson Humane */}
              <div className="relative h-[30rem] lg:h-[42rem] overflow-hidden shadow-2xl">
                <img
                  src="/community/ahbackground.jpg"
                  alt="Anderson Humane Background"
                  className="w-full h-full object-cover"
                />
                {/* Overlay for better logo visibility */}
                <div className="absolute inset-0 bg-black/30"></div>
                {/* Anderson Humane Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/community/ansersonhumane.png"
                    alt="Anderson Humane"
                    className="w-auto h-48 md:h-60"
                  />
                </div>
              </div>

              {/* Right Side: Mission Statement */}
              <div className="flex flex-col justify-center p-8 bg-gray-50 rounded-lg">
                <div className="max-w-md">
                  <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-primary text-left font-poppins">Our Mission</h2>
                  <p className="text-xl leading-relaxed text-gray-700 mb-10 text-left font-poppins">
                    Pawty Time is committed to creating a brighter future for our furry friends. Teaming up with Anderson Humane and our generous sponsors, we strive to make a difference in the lives of dogs by organizing adoption events that connect them with loving families.
                  </p>
                  <a 
                    href="https://ahconnects.org/aboutus/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-white px-10 py-4 hover:bg-primary/80 transition-colors font-semibold text-lg w-fit font-poppins"
                  >
                    Anderson Humane
                  </a>
                </div>
              </div>
            </div>



            {/* Become a Sponsor Contact Form */}
            <div className="mt-16 bg-[#081d36] px-8 md:px-12 lg:px-16 pt-8 md:pt-12 lg:pt-16 pb-8 md:pb-12 lg:pb-16 -mx-4 md:-mx-8 lg:-mx-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Become a Sponsor!</h2>
                <p className="text-lg text-white/80">
                  Interested in supporting our community events? Join our sponsor family!
                </p>
              </div>
              
              <form className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-white mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-4">
                  <button
                    type="submit"
                    className="bg-primary text-white px-12 py-4 text-lg font-semibold hover:bg-primary/80 transition-colors"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
        
        {/* Footer - Floating above background */}
        <Footer />
        </div>
      </div>
    </div>
    </>
  );
} 