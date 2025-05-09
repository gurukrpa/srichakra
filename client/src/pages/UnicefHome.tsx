import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ChevronDown, Search, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SrichakraText from '@/components/custom/SrichakraText';
// Import the Sri Yantra image
import sriYantraLogo from '../assets/images/logo/sri-yantra.png';
// Import children images for slideshow
import child1 from '../assets/images/slideshow/child1.jpg';
import child2 from '../assets/images/slideshow/child2.jpg';
import child3 from '../assets/images/slideshow/child3.jpg';
import child4 from '../assets/images/slideshow/child4.jpg';
import brain from '../assets/images/slideshow/brain.png';

const UnicefHome = () => {
  const [language, setLanguage] = useState('English');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideshowRef = useRef<HTMLDivElement>(null);
  const slidesCount = 5; // Updated count to include brain image
  
  // Handle smooth continuous slideshow rotation with 5 second interval
  useEffect(() => {
    const interval = setInterval(() => {
      goToNextSlide();
    }, 5000); // Changed from 2500 to 5000 milliseconds (5 seconds)
    
    return () => clearInterval(interval);
  }, []);

  // Function to handle going to the next slide with smooth looping
  const goToNextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slidesCount);
  };
  
  // Handle the transition end to implement the loop
  useEffect(() => {
    if (!slideshowRef.current) return;
    
    const handleTransitionEnd = () => {
      // If we've reached the duplicate last slide, jump to the real first slide without transition
      if (currentSlide === slidesCount - 1) {
        setIsTransitioning(false);
        // Use a timeout to ensure the transition is fully complete
        setTimeout(() => {
          if (slideshowRef.current) {
            slideshowRef.current.style.transition = 'none';
            setCurrentSlide(0);
            // Re-enable transitions after the jump
            setTimeout(() => {
              if (slideshowRef.current) {
                slideshowRef.current.style.transition = "transform 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95)";
              }
            }, 50);
          }
        }, 50);
      } else {
        setIsTransitioning(false);
      }
    };
    
    slideshowRef.current.addEventListener('transitionend', handleTransitionEnd);
    return () => {
      if (slideshowRef.current) {
        slideshowRef.current.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [currentSlide, slidesCount]);

  // Array of slides with duplicates at the beginning and end for smooth looping
  const slides = [
    child4, // Last slide duplicated at the beginning
    child1, 
    child2, 
    child3, 
    child4,
    brain,  // Added brain image
    child1  // First slide duplicated at the end
  ];

  return (
    <div className="min-h-screen bg-[#83C5BE]">
      {/* Top bar with language selector */}
      <div className="bg-white p-2 flex justify-end items-center">
        <div className="flex items-center gap-1 cursor-pointer">
          <Globe className="h-4 w-4" />
          <span className="text-sm">{language}</span>
          <ChevronDown className="h-3 w-3" />
        </div>
      </div>

      {/* Header with logo and buttons - updated background color */}
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
          <div className="flex gap-2">
            <Button variant="outline" className="text-white border-white hover:bg-[#005964]">
              Press centre
            </Button>
            <Button className="bg-white text-[#006D77] hover:bg-gray-100">
              Donate
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation menu - shifted items to the right */}
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto flex justify-end items-center">
          <ul className="flex">
            <li className="relative group">
              <a href="#" className="block px-4 py-3 hover:bg-gray-100 flex items-center">
                What we do
                <ChevronDown className="h-4 w-4 ml-1" />
              </a>
            </li>
            <li className="relative group">
              <a href="#" className="block px-4 py-3 hover:bg-gray-100 flex items-center">
                Research and reports
                <ChevronDown className="h-4 w-4 ml-1" />
              </a>
            </li>
            <li className="relative group">
              <a href="#" className="block px-4 py-3 hover:bg-gray-100 flex items-center">
                Stories
                <ChevronDown className="h-4 w-4 ml-1" />
              </a>
            </li>
            <li className="relative group">
              <a href="#" className="block px-4 py-3 hover:bg-gray-100 flex items-center">
                Who we are
                <ChevronDown className="h-4 w-4 ml-1" />
              </a>
            </li>
            <li className="relative group">
              <a href="#" className="block px-4 py-3 hover:bg-gray-100 flex items-center">
                Take action
                <ChevronDown className="h-4 w-4 ml-1" />
              </a>
            </li>
          </ul>
          <div className="pl-4">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </nav>

      {/* Hero section with updated background color F7EDE2 and animated slideshow */}
      <section className="relative h-[500px] bg-[#F7EDE2] overflow-hidden">
        {/* Slideshow container with Apple-like smooth transitions */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div 
            ref={slideshowRef}
            className="slideshow-track flex h-full" 
            style={{ 
              transform: `translateX(-${(currentSlide + 1) * 100}%)`, // +1 to account for the duplicate slide at beginning
              transition: isTransitioning ? "transform 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95)" : "none"
            }}
          >
            {slides.map((image, index) => (
              <div 
                key={index}
                className="slide min-w-full h-full flex-shrink-0"
              >
                <div 
                  className="w-full h-full bg-center"
                  style={{ 
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-black/30 z-[2]"></div>
          
          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <button 
                key={index} 
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
        
        <div className="container mx-auto relative z-10 flex items-center h-full">
          <div className="text-white p-6 max-w-lg">
            <h1 className="text-4xl font-bold mb-2">Delivering for hildren</h1>
            <Button className="bg-[#83C5BE] hover:bg-[#70B0A8] text-black uppercase font-bold">
              I AM
            </Button>
          </div>
        </div>
      </section>

      {/* Remove the old CSS animation that's no longer needed */}
      <style jsx global>{`
        .slideshow-track {
          will-change: transform;
        }
        
        .slide {
          box-sizing: border-box;
        }
      `}</style>

      {/* Content sections would go here */}
      <section className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">Child protection</h3>
              <p className="text-gray-600">Protecting children from violence, exploitation, abuse and neglect.</p>
              <Button variant="link" className="text-[#FFDDD2] p-0 mt-2">
                Learn more
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">Education</h3>
              <p className="text-gray-600">Every child has the right to learn and access quality education.</p>
              <Button variant="link" className="text-[#FFDDD2] p-0 mt-2">
                Learn more
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">Health & nutrition</h3>
              <p className="text-gray-600">Working toward the best possible health outcomes for children worldwide.</p>
              <Button variant="link" className="text-[#FFDDD2] p-0 mt-2">
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="font-bold mb-4">About Srichakra</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Who we are</a></li>
                <li><a href="#" className="hover:underline">What we do</a></li>
                <li><a href="#" className="hover:underline">Where we work</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Take action</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Donate</a></li>
                <li><a href="#" className="hover:underline">Volunteer</a></li>
                <li><a href="#" className="hover:underline">Partner with us</a></li>
                <li><a href="#" className="hover:underline">Corporate partnerships</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Research and reports</a></li>
                <li><a href="#" className="hover:underline">Publications</a></li>
                <li><a href="#" className="hover:underline">Data</a></li>
                <li><a href="#" className="hover:underline">Press center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow us</h4>
              <div className="flex gap-4">
                <a href="#" className="hover:text-[#FFDDD2]">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#FFDDD2]">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#FFDDD2]">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-sm text-gray-400">
            <p>© 2023 UNICEF. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UnicefHome;
