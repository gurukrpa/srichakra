import React from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SrichakraText from '@/components/custom/SrichakraText';
import sriYantraLogo from '../assets/images/logo/sri-yantra.png';

const About = () => {
  return (
    <div className="min-h-screen bg-[#83C5BE]">
      {/* Header with logo and back button */}
      <header className="bg-[#006D77] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Sri Yantra Symbol Image */}
            <div className="h-16 w-16 flex-shrink-0">
              <img 
                src={sriYantraLogo} 
                alt="Sri Yantra Symbol" 
                className="h-full w-full object-cover rounded-full"
              />
            </div>
            
            {/* Srichakra Text */}
            <div className="flex flex-col">
              <SrichakraText size="5xl" color="text-[#800000]" decorative={true} withBorder={true}>Srichakra</SrichakraText>
              <div className="text-xl">Srichakra – The School To Identify Your Child’s Divine Gift!!</div>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="text-white border-white hover:bg-[#005964] flex items-center gap-1">
              <ChevronLeft size={16} />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-[#006D77]">About Us</h1>
          <p className="text-lg text-[#1f2937] mb-6">Empowering Every Learner’s Journey</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-[#006D77]">Our Vision</h2>
              <p className="leading-relaxed mt-2">
                To create an inclusive and inspired learning ecosystem where every child’s individuality is celebrated, nurtured, and guided toward lifelong success.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#006D77]">Our Mission</h2>
              <p className="leading-relaxed mt-2">
                To empower every child to access education in the way they learn best, nurturing their confidence and potential through personalized learning approaches — and to help them find career paths that align with their unique strengths and aspirations, both in India and globally.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#006D77]">Who We Are</h2>
              <p className="leading-relaxed mt-2">
                Srichakra is an educational support organization dedicated to complementing diverse curricula and learner needs through personalized and holistic learning solutions. We believe that every child has a unique potential waiting to be discovered — and our mission is to help them enhance their abilities, overcome learning challenges, and achieve their fullest potential through inclusive and strength-based approaches.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#006D77]">What We Do</h2>
              <ul className="mt-2 space-y-4">
                <li>
                  <div className="font-medium">💡 Multiple Intelligence–Based Enrichment Programs</div>
                  <p className="leading-relaxed">
                    Individual and group sessions that help students discover their unique learning styles, build confidence, and develop essential life skills through structured MI-based activities.
                  </p>
                </li>
                <li>
                  <div className="font-medium">🎓 Career Counselling &amp; Guidance</div>
                  <p className="leading-relaxed">
                    We help students find their niche career paths through expert counselling that blends globally recognized frameworks — Multiple Intelligences (MI), MBTI, Holland RIASEC, and Aptitude Assessments — to identify strengths and align them with suitable academic and career choices.
                  </p>
                </li>
                <li>
                  <div className="font-medium">🌍 Overseas Education &amp; University Admissions</div>
                  <p className="leading-relaxed">
                    We provide end-to-end overseas education support, including admission guidance, SOP/LOR preparation, visa documentation, and pre-departure orientation for destinations such as Australia, Canada, New Zealand, Germany, France, USA, UK, Ireland, and Asian countries.
                  </p>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#006D77]">Our Collaboration</h2>
              <p className="leading-relaxed mt-2">
                As a Career Counselling Partner for Schools, we offer on-campus and virtual programs that enable students to explore opportunities, make informed decisions, and build confident, purposeful futures.
              </p>
              <p className="mt-2 font-medium tracking-wide">Discover • Decide • Develop!!</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#006D77]">Our Team</h2>
              <p className="leading-relaxed mt-2">
                At the heart of Srichakra is a dedicated team of educators, counsellors, and psychologists who share a common goal — to empower learners through inclusive education and guided self-discovery.
              </p>
              <div className="mt-4 rounded-md bg-[#f9fafb] p-4 border">
                <div className="font-semibold">Chief Mentor – Eswari</div>
                <div className="text-sm text-gray-600">Certified Career Counsellor | International Education Advisor | Special Educator | Founder – Srichakra</div>
                <p className="leading-relaxed mt-3">
                  With 29 years of cross-sector experience since 1996, Eswari brings together corporate leadership, educational psychology, and international academic guidance into a unified mission — to help every learner realize their strengths and shape a meaningful path forward.
                </p>
                <p className="leading-relaxed mt-3">
                  She founded Srichakra with a sole intention to enrich every child’s potential through inclusive and personalized educational practices. Over the years, her team has successfully guided students with Specific Learning Differences (SLD) and diverse learning needs to achieve excellence in academics and co-curricular areas. Her unique approach blends traditional wisdom with modern pedagogical tools, ensuring that each child discovers their individuality, confidence, and capability to thrive.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#006D77]">Partner with Us!</h2>
              <p className="leading-relaxed mt-2">
                Partner with Srichakra to empower your students with structured career guidance, personalized enrichment programs, and global education opportunities. Together, we can nurture confident, capable, and future-ready learners.
              </p>
              <div className="mt-4">
                <Link href="/contact">
                  <Button className="bg-[#006D77] hover:bg-[#005964]">Get in touch</Button>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#006D77]">Our Partners</h2>
              <p className="leading-relaxed mt-2">
                Proud Career Counselling Partner of Spring Days International School, offering on-campus guidance programs that help students explore possibilities and build meaningful futures.
              </p>
            </section>
          </div>
        </div>
      </div>
      
      {/* Simple Footer */}
      <footer className="bg-[#1a1a1a] text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">© 2023 Srichakra. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
