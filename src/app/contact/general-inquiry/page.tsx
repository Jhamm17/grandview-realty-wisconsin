import Image from 'next/image';
import ContactForm from '@/components/ContactForm';

export default function GeneralInquiry() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <Image
              src="/contactbg.png"
              alt="Contact Grandview Realty"
              fill
              style={{ objectFit: "cover", objectPosition: "center center" }}
              priority
              quality={75}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#081d36]/70" />
          </div>
        </div>
        <div className="container-padding relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            General Inquiry
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Have a question? We&apos;re here to help
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container-padding">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Send Us a Message</h2>
            <ContactForm 
              pageTitle="General Inquiry"
              fields={{
                name: true,
                email: true,
                phone: true,
                message: true
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
} 