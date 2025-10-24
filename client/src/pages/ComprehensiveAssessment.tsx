import React, { useState, useEffect } from 'react';
import { Clock, User, BookOpen, Brain, Heart, Target, Briefcase, Star, Eye } from 'lucide-react';

interface AssessmentQuestion {
  id: number;
  statement: string;
  domain: 'MI' | 'MBTI' | 'RIASEC' | 'VALUES' | 'APTITUDE';
  subdomain: string;
  reverse?: boolean;
}

interface StudentInfo {
  name: string;
  grade: string;
  age: string;
  school: string;
  date: string;
}

interface Response {
  questionId: number;
  score: number;
}

const ComprehensiveAssessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'info' | 'assessment' | 'results'>('info');
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '',
    grade: '',
    age: '',
    school: '',
    date: new Date().toLocaleDateString()
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [assessmentStartTime, setAssessmentStartTime] = useState<Date | null>(null);

  // Comprehensive 60-question assessment covering all 5 domains
  const questions: AssessmentQuestion[] = [
    // Multiple Intelligences (12 questions)
    { id: 1, statement: "I enjoy solving mathematical problems and puzzles", domain: 'MI', subdomain: 'Logical-Mathematical' },
    { id: 2, statement: "I prefer to express my ideas through writing rather than speaking", domain: 'MI', subdomain: 'Linguistic' },
    { id: 3, statement: "I can easily visualize objects from different angles in my mind", domain: 'MI', subdomain: 'Spatial' },
    { id: 4, statement: "I often tap my feet or move to music", domain: 'MI', subdomain: 'Musical' },
    { id: 5, statement: "I learn better when I can move around or use my hands", domain: 'MI', subdomain: 'Bodily-Kinesthetic' },
    { id: 6, statement: "I enjoy spending time in nature and notice details about plants and animals", domain: 'MI', subdomain: 'Naturalistic' },
    { id: 7, statement: "I am good at understanding other people's emotions and motivations", domain: 'MI', subdomain: 'Interpersonal' },
    { id: 8, statement: "I have a clear understanding of my own strengths and weaknesses", domain: 'MI', subdomain: 'Intrapersonal' },
    { id: 9, statement: "I can remember song lyrics and melodies easily", domain: 'MI', subdomain: 'Musical' },
    { id: 10, statement: "I enjoy reading books and playing with words", domain: 'MI', subdomain: 'Linguistic' },
    { id: 11, statement: "I can see patterns and relationships in numbers quickly", domain: 'MI', subdomain: 'Logical-Mathematical' },
    { id: 12, statement: "I am good at drawing, painting, or other visual arts", domain: 'MI', subdomain: 'Spatial' },

    // MBTI Indicators (12 questions)
    { id: 13, statement: "I gain energy from being around other people", domain: 'MBTI', subdomain: 'Extraversion' },
    { id: 14, statement: "I prefer to focus on details and specific facts", domain: 'MBTI', subdomain: 'Sensing' },
    { id: 15, statement: "I make decisions based on logical analysis", domain: 'MBTI', subdomain: 'Thinking' },
    { id: 16, statement: "I like to have things planned and organized", domain: 'MBTI', subdomain: 'Judging' },
    { id: 17, statement: "I prefer to work alone or in small groups", domain: 'MBTI', subdomain: 'Introversion' },
    { id: 18, statement: "I enjoy exploring new possibilities and ideas", domain: 'MBTI', subdomain: 'Intuition' },
    { id: 19, statement: "I consider how my decisions will affect other people", domain: 'MBTI', subdomain: 'Feeling' },
    { id: 20, statement: "I like to keep my options open and be flexible", domain: 'MBTI', subdomain: 'Perceiving' },
    { id: 21, statement: "I think out loud when solving problems", domain: 'MBTI', subdomain: 'Extraversion' },
    { id: 22, statement: "I trust my hunches and gut feelings", domain: 'MBTI', subdomain: 'Intuition' },
    { id: 23, statement: "I value harmony and try to avoid conflict", domain: 'MBTI', subdomain: 'Feeling' },
    { id: 24, statement: "I like to complete tasks well before deadlines", domain: 'MBTI', subdomain: 'Judging' },

    // RIASEC Career Interests (12 questions)
    { id: 25, statement: "I enjoy working with tools and machines", domain: 'RIASEC', subdomain: 'Realistic' },
    { id: 26, statement: "I like to investigate and solve complex problems", domain: 'RIASEC', subdomain: 'Investigative' },
    { id: 27, statement: "I enjoy creative activities like drawing, music, or writing", domain: 'RIASEC', subdomain: 'Artistic' },
    { id: 28, statement: "I like to help people learn and grow", domain: 'RIASEC', subdomain: 'Social' },
    { id: 29, statement: "I am comfortable taking charge and leading others", domain: 'RIASEC', subdomain: 'Enterprising' },
    { id: 30, statement: "I prefer tasks that are well-organized and follow clear procedures", domain: 'RIASEC', subdomain: 'Conventional' },
    { id: 31, statement: "I enjoy outdoor activities and physical work", domain: 'RIASEC', subdomain: 'Realistic' },
    { id: 32, statement: "I like to conduct experiments and research", domain: 'RIASEC', subdomain: 'Investigative' },
    { id: 33, statement: "I value originality and creative expression", domain: 'RIASEC', subdomain: 'Artistic' },
    { id: 34, statement: "I enjoy working in teams and collaborating", domain: 'RIASEC', subdomain: 'Social' },
    { id: 35, statement: "I am motivated by competition and winning", domain: 'RIASEC', subdomain: 'Enterprising' },
    { id: 36, statement: "I like to follow established rules and procedures", domain: 'RIASEC', subdomain: 'Conventional' },

    // Values (12 questions)
    { id: 37, statement: "Having job security is very important to me", domain: 'VALUES', subdomain: 'Security' },
    { id: 38, statement: "I want to achieve excellence and be recognized for it", domain: 'VALUES', subdomain: 'Achievement' },
    { id: 39, statement: "I value having the freedom to make my own decisions", domain: 'VALUES', subdomain: 'Independence' },
    { id: 40, statement: "Helping others and making a difference is meaningful to me", domain: 'VALUES', subdomain: 'Altruism' },
    { id: 41, statement: "I enjoy variety and new challenges in my work", domain: 'VALUES', subdomain: 'Variety' },
    { id: 42, statement: "Having a good work-life balance is essential", domain: 'VALUES', subdomain: 'Lifestyle' },
    { id: 43, statement: "I am motivated by financial rewards and earning potential", domain: 'VALUES', subdomain: 'Economic' },
    { id: 44, statement: "I want to be seen as an expert in my field", domain: 'VALUES', subdomain: 'Prestige' },
    { id: 45, statement: "I prefer stable, predictable work environments", domain: 'VALUES', subdomain: 'Security' },
    { id: 46, statement: "I strive to continuously improve and excel", domain: 'VALUES', subdomain: 'Achievement' },
    { id: 47, statement: "I value creativity and artistic expression", domain: 'VALUES', subdomain: 'Creativity' },
    { id: 48, statement: "I want to work in a supportive, friendly environment", domain: 'VALUES', subdomain: 'Relationships' },

    // Aptitude (12 questions)
    { id: 49, statement: "I am good at understanding and using language effectively", domain: 'APTITUDE', subdomain: 'Verbal' },
    { id: 50, statement: "I can quickly solve mathematical calculations in my head", domain: 'APTITUDE', subdomain: 'Numerical' },
    { id: 51, statement: "I can easily understand maps, diagrams, and charts", domain: 'APTITUDE', subdomain: 'Spatial' },
    { id: 52, statement: "I have good hand-eye coordination and motor skills", domain: 'APTITUDE', subdomain: 'Motor' },
    { id: 53, statement: "I can quickly identify patterns and relationships", domain: 'APTITUDE', subdomain: 'Abstract' },
    { id: 54, statement: "I have a good memory for names, faces, and details", domain: 'APTITUDE', subdomain: 'Memory' },
    { id: 55, statement: "I can concentrate on tasks for long periods", domain: 'APTITUDE', subdomain: 'Attention' },
    { id: 56, statement: "I am good at organizing information and planning", domain: 'APTITUDE', subdomain: 'Organization' },
    { id: 57, statement: "I learn new concepts and skills quickly", domain: 'APTITUDE', subdomain: 'Learning' },
    { id: 58, statement: "I can think of creative solutions to problems", domain: 'APTITUDE', subdomain: 'Creative' },
    { id: 59, statement: "I am good at analyzing and breaking down complex information", domain: 'APTITUDE', subdomain: 'Analytical' },
    { id: 60, statement: "I can adapt quickly to new situations and changes", domain: 'APTITUDE', subdomain: 'Adaptability' }
  ];

  const domainColors = {
    MI: '#e74c3c',
    MBTI: '#3498db', 
    RIASEC: '#2ecc71',
    VALUES: '#f39c12',
    APTITUDE: '#9b59b6'
  };

  const domainIcons = {
    MI: Brain,
    MBTI: User,
    RIASEC: Briefcase,
    VALUES: Heart,
    APTITUDE: Target
  };

  const handleStudentInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentInfo.name && studentInfo.grade && studentInfo.age) {
      setCurrentStep('assessment');
      setAssessmentStartTime(new Date());
    }
  };

  const handleResponse = (score: number) => {
    const newResponse: Response = {
      questionId: questions[currentQuestion].id,
      score: score
    };

    setResponses(prev => [...prev.filter(r => r.questionId !== newResponse.questionId), newResponse]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setCurrentStep('results');
    }
  };

  const calculateProgress = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getCurrentResponse = () => {
    return responses.find(r => r.questionId === questions[currentQuestion]?.id)?.score;
  };

  if (currentStep === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Comprehensive Career Assessment</h1>
            <p className="text-gray-600">Discover your unique talents, personality, interests, values, and aptitudes</p>
          </div>

          {/* Assessment Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">What You'll Discover:</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(domainColors).map(([domain, color]) => {
                const Icon = domainIcons[domain as keyof typeof domainIcons];
                const descriptions = {
                  MI: 'Multiple Intelligences - Your unique ways of learning',
                  MBTI: 'Personality Type - How you think and make decisions', 
                  RIASEC: 'Career Interests - What activities energize you',
                  VALUES: 'Work Values - What matters most to you',
                  APTITUDE: 'Natural Abilities - Your cognitive strengths'
                };
                
                return (
                  <div key={domain} className="flex items-center p-3 rounded-lg border" style={{ borderColor: color, backgroundColor: `${color}10` }}>
                    <Icon className="w-6 h-6 mr-3" style={{ color }} />
                    <div>
                      <div className="font-medium text-gray-800" style={{ color }}>{domain}</div>
                      <div className="text-sm text-gray-600">{descriptions[domain as keyof typeof descriptions]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Information Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Student Information</h2>
            <form onSubmit={handleStudentInfoSubmit}>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={studentInfo.name}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade *</label>
                  <select
                    value={studentInfo.grade}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Grade</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                    ))}
                    <option value="College">College</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    value={studentInfo.age}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your age"
                    min="5"
                    max="25"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School/Institution</label>
                  <input
                    type="text"
                    value={studentInfo.school}
                    onChange={(e) => setStudentInfo(prev => ({ ...prev, school: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your school name"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <Clock className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Assessment Instructions</h3>
                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                      <li>This assessment contains 60 carefully designed questions</li>
                      <li>Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree)</li>
                      <li>Answer honestly - there are no right or wrong answers</li>
                      <li>Estimated time: 15-20 minutes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Start Assessment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const { generateSampleResults } = require('../utils/assessmentScoring');
                    const sampleResults = generateSampleResults();
                    const ResultsDashboard = require('./ResultsDashboard').default;
                    setCurrentStep('results');
                    // This would show sample results
                  }}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Sample Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'assessment') {
    const currentQ = questions[currentQuestion];
    const progress = calculateProgress();
    const currentResponse = getCurrentResponse();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Question {currentQuestion + 1} of {questions.length}</h2>
                <p className="text-sm text-gray-600">{currentQ.domain} - {currentQ.subdomain}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ backgroundColor: `${domainColors[currentQ.domain]}20` }}
              >
                {React.createElement(domainIcons[currentQ.domain], { 
                  className: "w-8 h-8", 
                  style: { color: domainColors[currentQ.domain] } 
                })}
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{currentQ.statement}</h3>
              <p className="text-gray-600">How much do you agree with this statement?</p>
            </div>

            {/* Rating Scale */}
            <div className="grid grid-cols-5 gap-4 max-w-3xl mx-auto">
              {[
                { value: 1, label: 'Strongly Disagree', color: '#ef4444' },
                { value: 2, label: 'Disagree', color: '#f97316' },
                { value: 3, label: 'Neutral', color: '#eab308' },
                { value: 4, label: 'Agree', color: '#22c55e' },
                { value: 5, label: 'Strongly Agree', color: '#16a34a' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    currentResponse === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: option.color }}
                  >
                    {option.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="text-sm text-gray-500 flex items-center">
                Domain: <span className="ml-1 font-medium" style={{ color: domainColors[currentQ.domain] }}>{currentQ.domain}</span>
              </div>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => setCurrentStep('results')}
                  disabled={!currentResponse}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Assessment
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={!currentResponse}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results processing
  if (currentStep === 'results') {
    const { calculateDomainScores, calculateMBTIType, calculateCareerClusters } = require('../utils/assessmentScoring');
    
    const domainScores = calculateDomainScores(responses);
    const mbtiType = calculateMBTIType(domainScores.MBTI);
    const careerClusters = calculateCareerClusters(domainScores);
    
    const results = {
      studentInfo,
      responses,
      domainScores,
      mbtiType,
      topCareerClusters: careerClusters.slice(0, 3)
    };

    const ResultsDashboard = require('./ResultsDashboard').default;
    
    return (
      <ResultsDashboard 
        results={results}
        onGeneratePDF={() => {
          // PDF generation will be implemented
          console.log('Generating PDF...');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Analyzing Your Results...</h2>
        <p className="text-gray-600">Creating your personalized career assessment report</p>
      </div>
    </div>
  );
};

export default ComprehensiveAssessment;
