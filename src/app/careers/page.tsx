import { CareersService } from '@/lib/careers-service';
import CareersClient from '@/components/CareersClient';

// Force dynamic rendering - no static generation to avoid API calls during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CareersPage() {
  const careers = await CareersService.getAllCareers();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[30vh] min-h-[250px] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <img
              src="/careersbg.jpg"
              alt="Join Our Team"
              className="w-full h-full object-cover"
              style={{ objectPosition: "left center" }}
            />
            <div className="absolute inset-0 bg-[#2C5282]/60" />
          </div>
        </div>
        <div className="container-padding relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Build your career with Chicagoland&apos;s premier real estate agency
          </p>
        </div>
      </section>

      {/* Careers Client Component (handles interactive form) */}
      <CareersClient careers={careers} />
    </div>
  );
} 