import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Brain, Target, Lightbulb, TrendingUp } from 'lucide-react';
import SrichakraText from '@/components/custom/SrichakraText';
import sriYantraLogo from '../assets/images/logo/sri-yantra.png';

const CareerAssessmentIntro = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header with Logo */}
          <div className="flex flex-col items-center mb-12">
            <div className="h-24 w-24 mb-6">
              <img 
                src={sriYantraLogo} 
                alt="Sri Yantra Symbol" 
                className="h-full w-full object-cover rounded-full shadow-2xl"
              />
            </div>
            <SrichakraText size="4xl" color="text-white" decorative={true} withBorder={false}>
              Srichakra Academy
            </SrichakraText>
            <p className="text-white text-xl mt-3 font-medium text-center">
              The School To identify Your Child's Divine Gift!!
            </p>
          </div>

          {/* Main Content Card */}
          <Card className="bg-white bg-opacity-95 shadow-2xl">
            <CardContent className="p-12">
              {/* Title Section */}
              <div className="text-center mb-10">
                <h1 className="text-5xl font-bold text-teal-700 mb-4">
                  SCOPE
                </h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                  Student Career & Opportunity Pathway Evaluation
                </h2>
                <p className="text-xl text-teal-600 font-medium italic">
                  Discover your strengths. Explore your possibilities. Shape your future.
                </p>
              </div>

              <div className="h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 rounded-full mb-10"></div>

              {/* Welcome Message */}
              <div className="space-y-6 mb-12">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Welcome to <strong className="text-teal-700">SCOPE</strong>, a comprehensive career assessment created by 
                  <strong className="text-teal-700"> Srichakra Career Consultancy</strong> to help you uncover the path that's right for you.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Through an exciting exploration of your <strong>Multiple Intelligences</strong>, <strong>Personality</strong>, 
                  <strong> Work Interests</strong>, and <strong>Aptitude</strong>, SCOPE helps you understand what makes you unique — 
                  and connects you to careers that match your strengths and passions.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl shadow-md border-l-4 border-teal-500">
                  <Brain className="h-10 w-10 text-teal-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-teal-700 mb-2">Multiple Intelligences</h3>
                    <p className="text-gray-600">Discover your natural learning style and cognitive strengths across 8 intelligence types.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md border-l-4 border-blue-500">
                  <Target className="h-10 w-10 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-blue-700 mb-2">Personality Assessment</h3>
                    <p className="text-gray-600">Understand your unique personality traits and how they influence your career choices.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md border-l-4 border-purple-500">
                  <Lightbulb className="h-10 w-10 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-purple-700 mb-2">Work Interests</h3>
                    <p className="text-gray-600">Identify what motivates and excites you in a professional environment.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md border-l-4 border-green-500">
                  <TrendingUp className="h-10 w-10 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-green-700 mb-2">Aptitude Analysis</h3>
                    <p className="text-gray-600">Measure your natural abilities and potential for success in different career fields.</p>
                  </div>
                </div>
              </div>

              {/* What You'll Get */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-xl mb-10 border-2 border-amber-200">
                <h3 className="text-2xl font-bold text-amber-800 mb-6 text-center">What You'll Receive</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">Comprehensive 10+ page personalized career report</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">Detailed analysis of your strengths across multiple domains</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">Brain hemisphere dominance insights</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">Personalized career recommendations and pathways</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">90-day action plan for career development</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">Learning style recommendations and resources</span>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 mb-6">
                  Take the test. Discover yourself. Your future starts here!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/career-assessment">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-10 py-6 text-lg font-bold shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      Start Assessment
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  </Link>
                  
                  <Link href="/">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="px-10 py-6 text-lg border-2 border-teal-600 text-teal-700 hover:bg-teal-50"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                  ⏱️ Takes approximately 15-20 minutes to complete
                </p>
              </div>

              {/* Footer Note */}
              <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center">
                <p className="text-gray-600">
                  <strong>Need assistance?</strong> Contact us at{' '}
                  <a href="tel:+919843030697" className="text-teal-600 hover:underline font-semibold">
                    +91-98430 30697
                  </a>
                  {' '}or visit{' '}
                  <a href="https://srichakraacademy.org" className="text-teal-600 hover:underline font-semibold">
                    srichakraacademy.org
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareerAssessmentIntro;
