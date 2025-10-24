import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ChevronDown, Search, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SrichakraText from '@/components/custom/SrichakraText';
// Import Accordion components
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { isDevBypassEnabled } from '@/config/featureFlags';
import { getUserSession, logout as authLogout } from '@/lib/auth';
// Import the Sri Yantra logo
import sriYantraLogo from '../assets/images/logo/sri-yantra.png';
// Import children images for slideshow
import child1 from '../assets/images/slideshow/child1.jpg';
import child2 from '../assets/images/slideshow/child2.jpg';
import child3 from '../assets/images/slideshow/child3.jpg';
import child4 from '../assets/images/slideshow/child4.jpg';
import brain from '../assets/images/slideshow/brain.png';
import careerImage from '../assets/images/slideshow/career.png';
import bridgeImage from '../assets/images/slideshow/bridge.jpg';
import dmitWonder from '../assets/images/slideshow/dmit-wonder.png'; // This is the old one
import careerAssessment from '../assets/images/slideshow/career-assessment.png'; // Career Assessment Test image
import fingerprintDmit from '../assets/images/slideshow/DMIT.png'; // Import from the assets directory

const SrichakraHome = () => {
  const [language, setLanguage] = useState('English');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const slideshowRef = useRef<HTMLDivElement>(null);
  const slidesCount = 6; // Updated after removing iQuery image
  
  // For tracking if we need to reset
  const lastSlideRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add state to track which accordion is open
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const devBypass = isDevBypassEnabled();
  const hasAccess = !!user; // Only allow access if user is logged in

  // Check for user session on component mount
  useEffect(() => {
    try {
      const userSession = getUserSession();
      if (userSession) {
        setUser({
          name: userSession.name || userSession.email?.split('@')[0] || 'User',
          email: userSession.email
        });
      }
    } catch (error) {
      console.error('Error retrieving user session:', error);
    }
  }, []);

  // Add click outside listener to close accordion
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node) && openAccordion) {
        setOpenAccordion(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openAccordion]);

  // Handle logout
  const handleLogout = () => {
    authLogout(); // This will clear session and redirect to login
  };

  // Handle smooth continuous slideshow rotation with 5 second interval
  useEffect(() => {
    // Clear any existing timers to prevent memory leaks
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set a new timer
    timerRef.current = setTimeout(() => {
      // Only advance the slide if we're not on the last slide or if we already showed the last slide for 5 seconds
      if (currentSlide !== slidesCount - 1 || lastSlideRef.current) {
        goToNextSlide();
        lastSlideRef.current = false;
      } else {
        // We're on the last slide but haven't shown it for 5 seconds yet
        lastSlideRef.current = true;
        // Restart the timer to show the last slide for 5 seconds
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          goToNextSlide();
          lastSlideRef.current = false;
        }, 5000);
      }
    }, 5000);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentSlide, slidesCount]);

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
    dmitWonder, // Last slide duplicated at the beginning
    child1, 
    child2, 
    child3, 
    child4,
    brain,
    dmitWonder,  // DMIT Wonder logo added as the last slide
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
          <div className="flex items-center">
            {/* Sri Yantra Logo */}
            <div className="h-16 w-16 mr-3">
              <img 
                src={sriYantraLogo} 
                alt="Sri Yantra Symbol" 
                className="h-full w-full object-cover rounded-full"
              />
            </div>
            <div>
              <SrichakraText size="3xl" color="text-white" decorative={true}>
                Srichakra
              </SrichakraText>
              <p className="text-sm text-gray-200 -mt-1">
                The School To identify Your Child's Divine Gift!!
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-white">
                  <span className="font-medium">Welcome, {user.name}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-[#005964] flex items-center gap-1"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            ) : (
              // Show login/signup buttons when not logged in
              <>
                <Link href="/login">
                  <Button variant="outline" className="text-white border-white hover:bg-[#005964]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-white text-[#006D77] hover:bg-gray-100">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Navigation menu - shifted items to the right */}
      <nav className="bg-white border-b shadow-sm" ref={navRef}>
        <div className="container mx-auto flex justify-end items-center">
          <ul className="flex">
            <li className="relative group">
              <Accordion 
                type="single" 
                collapsible 
                className="w-full"
                value={openAccordion ?? undefined}
                onValueChange={setOpenAccordion}
              >
                <AccordionItem value="dmit" className="border-none">
                  <AccordionTrigger className="py-3 px-4 hover:bg-gray-100">
                    DMIT
                  </AccordionTrigger>
                  <AccordionContent className="bg-white shadow-md rounded-b-md px-4 py-3 absolute z-10 w-80">
                    <h3 className="font-medium mb-2">What is DMIT?</h3>
                    <p className="text-sm text-gray-700">
                      DMIT (Dermatoglyphics Multiple Intelligence Test) is a scientific tool that analyzes a child's fingerprint patterns to reveal their inborn talents, learning style, memory capacity, and dominant brain traits.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      It helps parents understand their child's natural potential and make informed decisions about education, career, and personal development.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </li>
            <li className="relative group">
              <Accordion 
                type="single" 
                collapsible 
                className="w-full"
                value={openAccordion ?? undefined}
                onValueChange={setOpenAccordion}
              >
                <AccordionItem value="career" className="border-none">
                  <AccordionTrigger className="py-3 px-4 hover:bg-gray-100">
                    Career Counseling
                  </AccordionTrigger>
                  <AccordionContent className="bg-white shadow-md rounded-b-md px-4 py-3 absolute z-10 w-80">
                    <h3 className="font-medium mb-2">What is Career Counseling?</h3>
                    <p className="text-sm text-gray-700">
                      Career counseling is a guided process that helps students and individuals discover their strengths, interests, and aptitudes to make smart educational and career choices.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      It provides clarity, direction, and confidence to pursue the right academic path or profession that aligns with their true potential.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </li>
            <li className="relative group">
              <Accordion 
                type="single" 
                collapsible 
                className="w-full"
                value={openAccordion ?? undefined}
                onValueChange={setOpenAccordion}
              >
                <AccordionItem value="overseas" className="border-none">
                  <AccordionTrigger className="py-3 px-4 hover:bg-gray-100">
                    Overseas Admission
                  </AccordionTrigger>
                  <AccordionContent className="bg-white shadow-md rounded-b-md px-4 py-3 absolute z-10 w-80">
                    <h3 className="font-medium mb-2">What is Overseas Admission?</h3>
                    <p className="text-sm text-gray-700">
                      Overseas admission guidance helps students explore global education opportunities by assisting with course selection, university applications, visa processes, and scholarships.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      It opens the door to world-class learning and international career prospects.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </li>
            <li className="relative group">
              <Accordion 
                type="single" 
                collapsible 
                className="w-full"
                value={openAccordion ?? undefined}
                onValueChange={setOpenAccordion}
              >
                <AccordionItem value="bridging" className="border-none">
                  <AccordionTrigger className="py-3 px-4 hover:bg-gray-100">
                    Bridging Courses
                  </AccordionTrigger>
                  <AccordionContent className="bg-white shadow-md rounded-b-md px-4 py-3 absolute z-50 w-96 max-h-[400px] overflow-y-auto right-0">
                    <h3 className="font-medium mb-2">What are Bridging Courses?</h3>
                    <p className="text-sm text-gray-700">
                      Bridging courses are short-term programs designed to fill academic or skill gaps, helping students prepare for advanced education or career transitions.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      They are ideal for aligning with international standards or meeting prerequisites for specialized fields.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </li>
            <li>
              <Link href="/school/login">
                <button className="py-3 px-4 hover:bg-gray-100 transition-colors duration-200">
                  Schools
                </button>
              </Link>
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
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <button 
                key={index} 
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                title={`Slide ${index + 1}`}
                className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
        
        {/* Hero section container */}
        <div className="container mx-auto relative z-10 h-full">
          {/* Left side text */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white z-20">
            <h1 className="text-xl font-bold mb-2">Delivering for children</h1>
          </div>
          
          {/* Right side menu items */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white z-20 text-right">
            <h3 className="font-bold text-xl mb-2">DMIT</h3>
            <h3 className="font-bold text-xl mb-2">Career Counseling</h3>
            <h3 className="font-bold text-xl mb-2">Overseas Admission</h3>
            <h3 className="font-bold text-xl">Bridging Courses</h3>
          </div>
        </div>
      </section>

      {/* Replace the style element with this */}
      <style dangerouslySetInnerHTML={{ __html: `
        .slideshow-track {
          will-change: transform;
        }
        
        .slide {
          box-sizing: border-box;
        }
      `}} />

      {/* Poster Grid Section */}
      <section className="py-12 bg-[#F7EDE2]">
        <div className="container mx-auto px-4">
          {/* Removed "Our Services" heading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">  {/* Changed lg:grid-cols-5 to lg:grid-cols-4 */}
            {/* DMIT Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 max-w-[220px] w-full mx-auto">
              <div className="h-40 overflow-hidden">  
                <img 
                  src={fingerprintDmit} // Use the new fingerprint image here
                  alt="DMIT Fingerprint"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">  
                <h3 className="text-lg font-semibold mb-1 text-[#006D77]">DMIT</h3>  
                <p className="text-gray-600 mb-3 text-sm">Discover your child's inborn talents through fingerprint analysis.</p>  
        <Link href={hasAccess ? "/dmit" : "/login"}>
                  <Button className="w-full bg-[#006D77] hover:bg-[#005964]">
          {hasAccess ? "Learn More" : "Login to Access"}
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Career Counseling Card - Made narrower */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 max-w-[220px] w-full mx-auto">
              <div className="h-40 overflow-hidden">  
                <img 
                  src={careerImage} 
                  alt="Career Counseling" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">  
                <h3 className="text-lg font-semibold mb-1 text-[#006D77]">Career Counseling</h3>  
                <p className="text-gray-600 mb-3 text-sm">Get expert guidance for making informed career decisions.</p>  
        <Link href={hasAccess ? "/career" : "/login"}>
                  <Button className="w-full bg-[#006D77] hover:bg-[#005964]">
          {hasAccess ? "Learn More" : "Login to Access"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Career Assessment Test Card - Made narrower */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 max-w-[220px] w-full mx-auto">
              <div className="h-40 overflow-hidden">  
                <img 
                  src={careerAssessment} 
                  alt="Career Assessment Test" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">  
                <h3 className="text-lg font-semibold mb-1 text-[#006D77]">Career Assessment</h3>  
                <p className="text-gray-600 mb-3 text-sm">Discover your ideal career path with comprehensive assessment.</p>  
  <Link href="/career-assessment">
      <Button className="w-full bg-[#006D77] hover:bg-[#005964]">
    Take Test
      </Button>
    </Link>
              </div>
            </div>

            {/* Overseas Admission Card - Made narrower */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 max-w-[220px] w-full mx-auto">
              <div className="h-40 overflow-hidden">  
                <img 
                  src={bridgeImage} 
                  alt="Overseas Admission" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">  
                <h3 className="text-lg font-semibold mb-1 text-[#006D77]">Overseas Admission</h3>  
                <p className="text-gray-600 mb-3 text-sm">Explore global education opportunities with our assistance.</p>  
        <Link href={hasAccess ? "/overseas" : "/login"}>
                  <Button className="w-full bg-[#006D77] hover:bg-[#005964]">
          {hasAccess ? "Learn More" : "Login to Access"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Schools Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 max-w-[220px] w-full mx-auto">
              <div className="h-40 flex items-center justify-center bg-gradient-to-br from-[#006D77] to-[#005964]">  
                <div className="text-center text-white">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L21 9l-9-6zM18.82 9L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                  </svg>
                  <h4 className="font-semibold">Schools</h4>
                </div>
              </div>
              <div className="p-3">  
                <h3 className="text-lg font-semibold mb-1 text-[#006D77]">School Portal</h3>  
                <p className="text-gray-600 mb-3 text-sm">Access your school dashboard and manage student assessments.</p>  
                <Link href="/school/login">
                  <Button className="w-full bg-[#006D77] hover:bg-[#005964]">
                    School Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Updated Footer with About and Contact links */}
      <footer className="bg-[#1a1a1a] text-white py-8">
        <div className="container mx-auto px-4">
          {/* Important links */}
          <div className="flex flex-col md:flex-row justify-center items-center mb-6">
            <Link href="/about" className="text-white hover:text-[#FFDDD2] mx-4 my-2">
              About Srichakra
            </Link>
            <Link href="/contact" className="text-white hover:text-[#FFDDD2] mx-4 my-2">
              Contact Us
            </Link>
          </div>
          
          {/* Social media icons */}
          <div className="flex justify-center gap-4 mb-6">
            <a href="#" className="hover:text-[#FFDDD2]" aria-label="Facebook">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" className="hover:text-[#FFDDD2]" aria-label="Twitter">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="hover:text-[#FFDDD2]" aria-label="Instagram">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
              </svg>
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-sm text-gray-400 text-center">
            <p>© 2023 Srichakra. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SrichakraHome;
