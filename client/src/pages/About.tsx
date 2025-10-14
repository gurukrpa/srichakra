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
              <div className="text-xl">The School To identify Your Child's Divine Gift!!</div>
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
          <h1 className="text-3xl font-bold mb-6 text-[#006D77]">About Srichakra</h1>
          
          <div className="space-y-6 text-gray-700">
            <p className="leading-relaxed">
              Srichakra Educational Consultancy is a pioneering institution dedicated to unlocking the innate potential of every child through scientific and holistic assessment methods. Founded on the principle that each child possesses unique talents and abilities, Srichakra aims to guide students and parents in making informed educational and career decisions.
            </p>
            
            <h2 className="text-xl font-semibold text-[#006D77] mt-8">Our Vision</h2>
            <p className="leading-relaxed">
              To create a world where every child's natural talents are recognized, nurtured, and channeled toward a fulfilling educational journey and career path. We envision a future where education is personalized to individual strengths, leading to happier, more successful individuals who contribute meaningfully to society.
            </p>
            
            <h2 className="text-xl font-semibold text-[#006D77] mt-8">Our Mission</h2>
            <p className="leading-relaxed">
              To provide cutting-edge assessment tools and expert guidance that reveal a child's innate potential, empowering parents and educators to make informed decisions about educational pathways, career options, and personal development strategies.
            </p>
            
            <h2 className="text-xl font-semibold text-[#006D77] mt-8">Our Approach</h2>
            <p className="leading-relaxed">
              Srichakra combines traditional wisdom with modern scientific methods to provide a comprehensive understanding of each child's potential. Our flagship services include:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-medium">Dermatoglyphics Multiple Intelligence Test (DMIT):</span> A scientific analysis of fingerprint patterns to reveal inborn talents, learning styles, and brain dominance.</li>
              <li><span className="font-medium">Career Counseling:</span> Personalized guidance based on aptitude, interests, and market trends to help students make informed career choices.</li>
              <li><span className="font-medium">Overseas Admission Support:</span> Comprehensive assistance for students aspiring to study abroad, including university selection, application processes, and visa guidance.</li>
              <li><span className="font-medium">Bridging Courses:</span> Specialized programs designed to fill academic gaps and prepare students for advanced education or career transitions.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-[#006D77] mt-8">Our Commitment</h2>
            <p className="leading-relaxed">
              At Srichakra, we are committed to maintaining the highest standards of integrity, expertise, and personalized attention. We believe in building lasting relationships with our clients, supporting them throughout their educational journey, and celebrating their successes as our own.
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link href="/contact">
              <Button className="bg-[#006D77] hover:bg-[#005964]">
                Contact Us
              </Button>
            </Link>
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
