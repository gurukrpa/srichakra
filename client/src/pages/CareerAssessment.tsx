import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Users, Award, ArrowRight, Star } from 'lucide-react';
import { getUserSession, isAuthenticated } from '@/lib/auth';
import SrichakraText from '@/components/custom/SrichakraText';
import sriYantraLogo from '../assets/images/logo/sri-yantra.png';

const CareerAssessmentPage = () => {
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [report, setReport] = useState<{
    finalScores: { domain: string; score: number; count: number }[];
    totalAnswered: number;
  } | null>(null);

  // Sample questions from your assessment logic
  const questions = [
    { id: 1, text: "Do you enjoy solving puzzles, riddles, or brain teasers?", domain: "Analytical", framework: "Aptitude" },
    { id: 2, text: "When faced with a problem, do you prefer to break it into smaller steps before solving?", domain: "General", framework: "Aptitude" },
    { id: 3, text: "How confident are you with numbers and data interpretation?", domain: "Analytical", framework: "Aptitude" },
    { id: 4, text: "Do you find patterns easily (in math, music, or behavior)?", domain: "Analytical", framework: "RIASEC/Artistic" },
    { id: 5, text: "Do you like reasoning-based subjects such as Mathematics or Physics?", domain: "Analytical", framework: "Aptitude" },
    { id: 6, text: "Do you enjoy reading books, writing essays, or debating ideas?", domain: "Verbal", framework: "Aptitude" },
    { id: 7, text: "Do you easily express your thoughts in words (spoken or written)?", domain: "Verbal", framework: "Aptitude" },
    { id: 8, text: "Are you interested in learning new languages?", domain: "Verbal", framework: "LearningStyle/MI" },
    { id: 9, text: "I enjoy designing or creating visual art.", domain: "Creative", framework: "RIASEC/Artistic" },
    { id: 10, text: "I like building or fixing mechanical things.", domain: "Technical", framework: "Aptitude" },
    { id: 11, text: "I enjoy coding or working with computers.", domain: "Technical", framework: "Aptitude" },
    { id: 12, text: "I prefer working in teams rather than alone.", domain: "Social", framework: "RIASEC/Social" },
    { id: 13, text: "I often volunteer to help others learn.", domain: "Social", framework: "RIASEC/Social" },
    { id: 14, text: "I enjoy experiments and hands-on science.", domain: "Technical", framework: "Aptitude" },
    { id: 15, text: "I can concentrate on tasks for a long time.", domain: "General", framework: "LearningStyle/MI" },
    { id: 16, text: "I remember facts and details easily.", domain: "General", framework: "LearningStyle/MI" },
    { id: 17, text: "I prefer practical tasks over theoretical work.", domain: "Technical", framework: "Values" },
    { id: 18, text: "I like to plan things ahead and follow a schedule.", domain: "General", framework: "Values" },
    { id: 19, text: "I get excited by entrepreneurial ideas.", domain: "General", framework: "Values" },
    { id: 20, text: "I value job security and stability.", domain: "General", framework: "Values" },
    { id: 21, text: "I enjoy reading and writing regularly.", domain: "Verbal", framework: "Aptitude" },
    { id: 22, text: "I notice patterns in nature or data.", domain: "Naturalistic", framework: "LearningStyle/MI" },
    { id: 23, text: "I like performing or creating music.", domain: "Musical", framework: "RIASEC/Artistic" },
    { id: 24, text: "I enjoy learning about people and emotions.", domain: "Social", framework: "RIASEC/Social" },
    { id: 25, text: "I am organized and detail-oriented.", domain: "General", framework: "Values" },
    { id: 26, text: "I like solving mathematical puzzles.", domain: "Analytical", framework: "Aptitude" },
    { id: 27, text: "I enjoy exploring new technologies.", domain: "Technical", framework: "Aptitude" },
    { id: 28, text: "I prefer creative freedom in work.", domain: "Creative", framework: "Values" },
  { id: 29, text: "I feel energized by social interactions.", domain: "Social", framework: "RIASEC/Social" },
  { id: 30, text: "I like to research and dig deep into topics.", domain: "Analytical", framework: "Aptitude" },
  // Additional questions (31-60) without repeating existing prompts
  { id: 31, text: "I enjoy presenting ideas to a group.", domain: "Verbal", framework: "Aptitude" },
  { id: 32, text: "I like organizing events or activities.", domain: "General", framework: "Values" },
  { id: 33, text: "I often think of innovative solutions to problems.", domain: "Creative", framework: "RIASEC/Artistic" },
  { id: 34, text: "I am comfortable interpreting charts and graphs.", domain: "Analytical", framework: "Aptitude" },
  { id: 35, text: "I like repairing gadgets or assembling kits.", domain: "Technical", framework: "Aptitude" },
  { id: 36, text: "I enjoy tutoring or mentoring others.", domain: "Social", framework: "RIASEC/Social" },
  { id: 37, text: "I pay attention to subtle details others may miss.", domain: "General", framework: "LearningStyle/MI" },
  { id: 38, text: "I enjoy writing stories, blogs, or journals.", domain: "Verbal", framework: "Aptitude" },
  { id: 39, text: "I like experimenting with new tools or software.", domain: "Technical", framework: "Aptitude" },
  { id: 40, text: "I prefer jobs with clear structure and process.", domain: "General", framework: "Values" },
  { id: 41, text: "I enjoy nature trails, gardening, or wildlife content.", domain: "Naturalistic", framework: "LearningStyle/MI" },
  { id: 42, text: "I can keep calm and focused under pressure.", domain: "General", framework: "LearningStyle/MI" },
  { id: 43, text: "I like analyzing news, research, or complex topics.", domain: "Analytical", framework: "Aptitude" },
  { id: 44, text: "I feel motivated by helping a community or cause.", domain: "Social", framework: "Values" },
  { id: 45, text: "I enjoy creating designs, posters, or visuals.", domain: "Creative", framework: "RIASEC/Artistic" },
  { id: 46, text: "I like planning finances, budgets, or resources.", domain: "Analytical", framework: "Aptitude" },
  { id: 47, text: "I feel confident speaking to new people.", domain: "Social", framework: "RIASEC/Social" },
  { id: 48, text: "I prefer step-by-step instructions for tasks.", domain: "General", framework: "LearningStyle/MI" },
  { id: 49, text: "I enjoy logical games such as Sudoku or strategy games.", domain: "Analytical", framework: "Aptitude" },
  { id: 50, text: "I like maintaining or improving systems and processes.", domain: "Technical", framework: "Aptitude" },
  { id: 51, text: "I enjoy composing music or identifying rhythms.", domain: "Musical", framework: "RIASEC/Artistic" },
  { id: 52, text: "I like coordinating group tasks and responsibilities.", domain: "General", framework: "Values" },
  { id: 53, text: "I often reflect on my thoughts to improve myself.", domain: "General", framework: "LearningStyle/MI" },
  { id: 54, text: "I like setting goals and tracking progress.", domain: "General", framework: "Values" },
  { id: 55, text: "I enjoy learning about how things work internally.", domain: "Technical", framework: "Aptitude" },
  { id: 56, text: "I like collaborating with diverse teams.", domain: "Social", framework: "RIASEC/Social" },
  { id: 57, text: "I prefer careers with measurable impact.", domain: "General", framework: "Values" },
  { id: 58, text: "I enjoy public speaking or debating.", domain: "Verbal", framework: "Aptitude" },
  { id: 59, text: "I can quickly spot inconsistencies or errors.", domain: "Analytical", framework: "Aptitude" },
  { id: 60, text: "I like turning ideas into working prototypes.", domain: "Technical", framework: "Aptitude" }
  ];

  const responseOptions = [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" }
  ];

  useEffect(() => {
    // TEMPORARY: Skip authentication for development
    // TODO: Re-enable authentication when development is complete
    
    // Set a mock user for development
    setUser({
      email: 'dev@srichakra.com',
      fullName: 'Development User'
    });
    
    /* 
    // UNCOMMENT THIS WHEN READY FOR PRODUCTION:
    
    // Check if user is authenticated with new system
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    const userSession = getUserSession();
    if (userSession) {
      setUser({
        email: userSession.email,
        fullName: userSession.fullName || userSession.email.split('@')[0]
      });
    }
    */
  }, []);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete assessment
      setIsCompleted(true);
      generateReport();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateReport = () => {
    // Simple scoring logic based on domains
    const domainScores: Record<string, number[]> = {};
    
    questions.forEach(q => {
      const answer = answers[q.id];
      if (answer) {
        if (!domainScores[q.domain]) {
          domainScores[q.domain] = [];
        }
        domainScores[q.domain].push(answer);
      }
    });

    // Calculate average scores per domain
    const finalScores = Object.keys(domainScores).map(domain => ({
      domain,
      score: domainScores[domain].reduce((a, b) => a + b, 0) / domainScores[domain].length,
      count: domainScores[domain].length
    })).sort((a, b) => b.score - a.score);

    console.log('Assessment Results:', finalScores);
    setReport({ finalScores, totalAnswered: Object.keys(answers).length });
  };

  const downloadPDF = () => {
    if (!report) return;
    
    const { finalScores, totalAnswered } = report;
    const maxScore = Math.max(...finalScores.map(s => s.score));
    
    // Generate bar chart data
    const barChartSVG = finalScores.map((score, index) => {
      const percentage = (score.score / 5) * 100; // Convert to percentage (max score is 5)
      const colors = ['#006D77', '#83C5BE', '#FFDDD2', '#E29578', '#5390D9', '#7209B7', '#F72585', '#4CC9F0'];
      return `
        <g>
          <rect x="50" y="${index * 40 + 20}" width="${percentage * 3}" height="30" fill="${colors[index % colors.length]}" rx="5"/>
          <text x="60" y="${index * 40 + 40}" fill="white" font-size="14" font-weight="bold">${score.domain}</text>
          <text x="${percentage * 3 + 60}" y="${index * 40 + 40}" fill="#333" font-size="12">${score.score.toFixed(1)}</text>
        </g>
      `;
    }).join('');

    // Generate pie chart data
    const total = finalScores.reduce((sum, s) => sum + s.score, 0);
    let currentAngle = 0;
    const pieSlices = finalScores.map((score, index) => {
      const percentage = (score.score / total) * 100;
      const angle = (score.score / total) * 360;
      const x1 = 150 + 120 * Math.cos((currentAngle * Math.PI) / 180);
      const y1 = 150 + 120 * Math.sin((currentAngle * Math.PI) / 180);
      const x2 = 150 + 120 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
      const y2 = 150 + 120 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
      const largeArc = angle > 180 ? 1 : 0;
      const colors = ['#006D77', '#83C5BE', '#FFDDD2', '#E29578', '#5390D9', '#7209B7', '#F72585', '#4CC9F0'];
      
      const slice = `
        <path d="M 150 150 L ${x1} ${y1} A 120 120 0 ${largeArc} 1 ${x2} ${y2} Z" 
              fill="${colors[index % colors.length]}" stroke="white" stroke-width="2"/>
        <text x="${150 + 140 * Math.cos(((currentAngle + angle/2) * Math.PI) / 180)}" 
              y="${150 + 140 * Math.sin(((currentAngle + angle/2) * Math.PI) / 180)}" 
              text-anchor="middle" fill="#333" font-size="11" font-weight="bold">
          ${score.domain.length > 8 ? score.domain.substring(0,8)+'...' : score.domain}
        </text>
      `;
      currentAngle += angle;
      return slice;
    }).join('');

    // Brain hemisphere analysis
    const leftBrainDomains = ['Analytical', 'Verbal', 'General'];
    const rightBrainDomains = ['Creative', 'Musical', 'Naturalistic'];
    const balancedDomains = ['Social', 'Technical'];
    
    const leftBrainScore = finalScores
      .filter(s => leftBrainDomains.includes(s.domain))
      .reduce((sum, s) => sum + s.score, 0) / leftBrainDomains.length;
    const rightBrainScore = finalScores
      .filter(s => rightBrainDomains.includes(s.domain))
      .reduce((sum, s) => sum + s.score, 0) / rightBrainDomains.length;
    
    const dominantHemisphere = leftBrainScore > rightBrainScore ? 'Left' : rightBrainScore > leftBrainScore ? 'Right' : 'Balanced';
    
    // Career recommendations based on top domains
    const topDomains = finalScores.slice(0, 3);
    const careerSuggestions = {
      'Analytical': ['Data Scientist', 'Financial Analyst', 'Research Scientist', 'Engineer'],
      'Verbal': ['Writer', 'Journalist', 'Teacher', 'Lawyer', 'Public Relations'],
      'Creative': ['Graphic Designer', 'Artist', 'Architect', 'Marketing Creative'],
      'Technical': ['Software Developer', 'IT Specialist', 'Engineer', 'Technician'],
      'Social': ['Counselor', 'Human Resources', 'Social Worker', 'Sales'],
      'Musical': ['Musician', 'Music Teacher', 'Sound Engineer', 'Music Therapist'],
      'Naturalistic': ['Environmental Scientist', 'Biologist', 'Park Ranger', 'Veterinarian'],
      'General': ['Project Manager', 'Administrator', 'Consultant', 'Coordinator']
    };

    const w = window.open("", "_blank");
    if (!w) return;
    
    w.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Srichakra Career Assessment Report</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; padding: 0; 
              background: linear-gradient(135deg, #83C5BE 0%, #006D77 100%);
              color: #333;
            }
            .page { 
              min-height: 100vh; 
              padding: 40px; 
              background: white; 
              margin: 20px; 
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              page-break-after: always;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #006D77; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .logo { 
              width: 80px; 
              height: 80px; 
              border-radius: 50%; 
              background: linear-gradient(45deg, #006D77, #83C5BE); 
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
            }
            h1 { color: #006D77; font-size: 2.5em; margin: 10px 0; }
            h2 { color: #006D77; border-left: 5px solid #83C5BE; padding-left: 15px; }
            h3 { color: #E29578; }
            .chart-container { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 10px; 
              margin: 20px 0;
              text-align: center;
            }
            .brain-diagram {
              display: flex;
              justify-content: space-around;
              align-items: center;
              margin: 30px 0;
            }
            .brain-half {
              text-align: center;
              padding: 20px;
              border-radius: 15px;
              width: 45%;
            }
            .left-brain { background: linear-gradient(135deg, #5390D9, #7209B7); color: white; }
            .right-brain { background: linear-gradient(135deg, #F72585, #4CC9F0); color: white; }
            .score-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              color: white;
              font-weight: bold;
              margin: 5px;
            }
            .score-high { background: #006D77; }
            .score-medium { background: #83C5BE; }
            .score-low { background: #FFDDD2; color: #333; }
            .recommendations {
              background: linear-gradient(135deg, #FFDDD2, #E29578);
              padding: 25px;
              border-radius: 15px;
              margin: 20px 0;
            }
            .career-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-top: 20px;
            }
            .career-item {
              background: white;
              padding: 15px;
              border-radius: 10px;
              box-shadow: 0 3px 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            .summary-stats {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin: 30px 0;
            }
            .stat-card {
              text-align: center;
              padding: 20px;
              border-radius: 12px;
              background: linear-gradient(135deg, #83C5BE, #006D77);
              color: white;
            }
            .stat-number { font-size: 2.5em; font-weight: bold; }
            .stat-label { font-size: 0.9em; opacity: 0.9; }
            @media print {
              body { background: white; }
              .page { margin: 0; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          
          <!-- Page 1: Cover & Summary -->
          <div class="page">
            <div class="header">
              <div class="logo">SY</div>
              <h1>Career Assessment Report</h1>
              <p style="font-size: 1.2em; color: #666;">Srichakra Academy - The School To identify Your Child's Divine Gift!!</p>
              <p style="color: #83C5BE; font-size: 1.1em;">Comprehensive Psychometric Analysis</p>
            </div>
            
            <div class="summary-stats">
              <div class="stat-card">
                <div class="stat-number">${totalAnswered}</div>
                <div class="stat-label">Questions Answered</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${finalScores.length}</div>
                <div class="stat-label">Domains Analyzed</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${dominantHemisphere}</div>
                <div class="stat-label">Brain Dominance</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${Math.round((totalAnswered/questions.length)*100)}%</div>
                <div class="stat-label">Completion Rate</div>
              </div>
            </div>

            <h2>Your Top Strengths</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;">
              ${topDomains.map(score => 
                `<span class="score-badge ${score.score >= 4 ? 'score-high' : score.score >= 3 ? 'score-medium' : 'score-low'}">
                  ${score.domain}: ${score.score.toFixed(1)}/5.0
                </span>`
              ).join('')}
            </div>

            <div class="recommendations">
              <h3 style="margin-top: 0; color: #006D77;">Executive Summary</h3>
              <p style="font-size: 1.1em; line-height: 1.6;">
                Based on your responses to ${totalAnswered} questions across multiple assessment frameworks (RIASEC, Multiple Intelligence, Learning Styles), 
                your profile shows strongest alignment with <strong>${topDomains[0].domain}</strong> activities and thinking patterns. 
                This suggests you have natural talents in areas requiring ${topDomains[0].domain.toLowerCase()} skills.
              </p>
              <p style="font-size: 1.1em; line-height: 1.6;">
                Your brain dominance analysis indicates a <strong>${dominantHemisphere} Brain</strong> preference, which influences your learning style, 
                problem-solving approach, and career satisfaction factors.
              </p>
            </div>
          </div>

          <!-- Page 2: Detailed Charts -->
          <div class="page">
            <div class="header">
              <h1>Detailed Analysis & Charts</h1>
            </div>

            <h2>Domain Scores Breakdown</h2>
            <div class="chart-container">
              <h3>Bar Chart Analysis</h3>
              <svg width="100%" height="${finalScores.length * 40 + 60}" viewBox="0 0 600 ${finalScores.length * 40 + 60}">
                <defs>
                  <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#006D77;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#83C5BE;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <text x="300" y="20" text-anchor="middle" font-size="16" font-weight="bold" fill="#006D77">
                  Your Aptitude Scores (Scale: 1-5)
                </text>
                ${barChartSVG}
                <line x1="350" y1="30" x2="350" y2="${finalScores.length * 40 + 40}" stroke="#ddd" stroke-width="1"/>
                <text x="355" y="35" font-size="10" fill="#666">Average (3.0)</text>
              </svg>
            </div>

            <div class="chart-container">
              <h3>Pie Chart Distribution</h3>
              <svg width="100%" height="320" viewBox="0 0 300 320">
                <text x="150" y="20" text-anchor="middle" font-size="16" font-weight="bold" fill="#006D77">
                  Domain Distribution
                </text>
                ${pieSlices}
                <circle cx="150" cy="150" r="40" fill="white" stroke="#006D77" stroke-width="3"/>
                <text x="150" y="155" text-anchor="middle" font-size="14" font-weight="bold" fill="#006D77">Total</text>
                <text x="150" y="170" text-anchor="middle" font-size="12" fill="#666">${total.toFixed(1)}</text>
              </svg>
            </div>
          </div>

          <!-- Page 3: Brain Analysis -->
          <div class="page">
            <div class="header">
              <h1>Brain Hemisphere Analysis</h1>
            </div>

            <div class="brain-diagram">
              <div class="brain-half left-brain">
                <h3>Left Brain (${leftBrainScore.toFixed(1)}/5.0)</h3>
                <p><strong>Logical • Analytical • Sequential</strong></p>
                <ul style="text-align: left;">
                  <li>Mathematical thinking</li>
                  <li>Verbal processing</li>
                  <li>Linear reasoning</li>
                  <li>Detail-oriented</li>
                  <li>Structured approach</li>
                </ul>
                <div style="margin-top: 15px;">
                  <strong>Your Scores:</strong><br>
                  ${finalScores.filter(s => leftBrainDomains.includes(s.domain)).map(s => 
                    `${s.domain}: ${s.score.toFixed(1)}`
                  ).join('<br>')}
                </div>
              </div>
              
              <div class="brain-half right-brain">
                <h3>Right Brain (${rightBrainScore.toFixed(1)}/5.0)</h3>
                <p><strong>Creative • Intuitive • Holistic</strong></p>
                <ul style="text-align: left;">
                  <li>Visual-spatial thinking</li>
                  <li>Creative expression</li>
                  <li>Pattern recognition</li>
                  <li>Artistic abilities</li>
                  <li>Imaginative approach</li>
                </ul>
                <div style="margin-top: 15px;">
                  <strong>Your Scores:</strong><br>
                  ${finalScores.filter(s => rightBrainDomains.includes(s.domain)).map(s => 
                    `${s.domain}: ${s.score.toFixed(1)}`
                  ).join('<br>')}
                </div>
              </div>
            </div>

            <div class="recommendations">
              <h3 style="color: #006D77;">Brain Dominance Insights</h3>
              <p style="font-size: 1.1em;">
                <strong>Your ${dominantHemisphere} Brain Dominance</strong> suggests you naturally prefer 
                ${dominantHemisphere === 'Left' ? 'structured, analytical approaches to problem-solving. You likely excel in logical reasoning, mathematical concepts, and verbal communication.' : 
                  dominantHemisphere === 'Right' ? 'creative, intuitive approaches to challenges. You likely excel in visual-spatial tasks, artistic expression, and seeing the big picture.' : 
                  'a balanced approach combining both analytical and creative thinking. This gives you flexibility in various career paths.'}
              </p>
            </div>

            <h2>Five Senses Learning Profile</h2>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin: 20px 0;">
              <div class="career-item" style="background: linear-gradient(135deg, #FF6B6B, #4ECDC4);">
                <h4 style="color: white; margin: 0;">👁️ Visual</h4>
                <p style="color: white; font-size: 0.9em;">Charts, diagrams, colors</p>
              </div>
              <div class="career-item" style="background: linear-gradient(135deg, #45B7D1, #96CEB4);">
                <h4 style="color: white; margin: 0;">👂 Auditory</h4>
                <p style="color: white; font-size: 0.9em;">Discussions, music, sounds</p>
              </div>
              <div class="career-item" style="background: linear-gradient(135deg, #F39C12, #E67E22);">
                <h4 style="color: white; margin: 0;">✋ Kinesthetic</h4>
                <p style="color: white; font-size: 0.9em;">Hands-on, movement</p>
              </div>
              <div class="career-item" style="background: linear-gradient(135deg, #9B59B6, #8E44AD);">
                <h4 style="color: white; margin: 0;">👃 Olfactory</h4>
                <p style="color: white; font-size: 0.9em;">Scents, environment</p>
              </div>
              <div class="career-item" style="background: linear-gradient(135deg, #E74C3C, #C0392B);">
                <h4 style="color: white; margin: 0;">👅 Gustatory</h4>
                <p style="color: white; font-size: 0.9em;">Taste, experiential</p>
              </div>
            </div>
          </div>

          <!-- Page 4: Career Recommendations -->
          <div class="page">
            <div class="header">
              <h1>Career Recommendations</h1>
            </div>

            <h2>Recommended Career Paths</h2>
            <p style="font-size: 1.1em; color: #666; margin-bottom: 30px;">
              Based on your top domain scores, here are career suggestions aligned with your natural strengths:
            </p>

            ${topDomains.map((domain, index) => `
              <div class="recommendations" style="margin: 25px 0;">
                <h3 style="color: #006D77; margin-top: 0;">
                  ${index + 1}. ${domain.domain} Careers (Score: ${domain.score.toFixed(1)}/5.0)
                </h3>
                <div class="career-grid">
                  ${(careerSuggestions[domain.domain as keyof typeof careerSuggestions] || ['General roles']).map((career: string) => 
                    `<div class="career-item">
                      <strong>${career}</strong>
                      <p style="font-size: 0.9em; color: #666; margin: 5px 0 0 0;">
                        High ${domain.domain.toLowerCase()} aptitude required
                      </p>
                    </div>`
                  ).join('')}
                </div>
              </div>
            `).join('')}

            <h2>Next Steps & Recommendations</h2>
            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; border-left: 5px solid #006D77;">
              <h3 style="margin-top: 0; color: #006D77;">Action Plan</h3>
              <ol style="font-size: 1.1em; line-height: 1.8;">
                <li><strong>Explore Further:</strong> Research the recommended career paths that align with your top ${topDomains[0].domain} score.</li>
                <li><strong>Skill Development:</strong> Consider developing skills in your secondary strength areas: ${topDomains.slice(1,3).map(d => d.domain).join(' and ')}.</li>
                <li><strong>Educational Path:</strong> Look into degree programs or certifications that support your career interests.</li>
                <li><strong>Gain Experience:</strong> Seek internships, volunteer work, or projects in your areas of strength.</li>
                <li><strong>Consult an Expert:</strong> Schedule a follow-up consultation with our career counselors for personalized guidance.</li>
              </ol>
            </div>

            <div style="margin-top: 40px; text-align: center; padding: 20px; background: linear-gradient(135deg, #83C5BE, #006D77); border-radius: 15px; color: white;">
              <h3 style="margin: 0 0 10px 0;">Thank You for Taking the Assessment</h3>
              <p style="margin: 0; opacity: 0.9;">This report is generated by Srichakra Academy's comprehensive career assessment system.</p>
              <p style="margin: 5px 0 0 0; font-size: 0.9em; opacity: 0.8;">For questions or consultation, contact us through our website.</p>
            </div>
          </div>

          <script>
            window.onload = () => { 
              setTimeout(() => window.print(), 500); 
            };
          </script>
        </body>
      </html>`);
    w.document.close();
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  if (!user) {
    return (
      <div className="min-h-screen bg-teal-600">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              {/* Srichakra Logo and Banner */}
              <div className="flex flex-col items-center mb-8">
                <div className="h-20 w-20 mb-4">
                  <img 
                    src={sriYantraLogo} 
                    alt="Sri Yantra Symbol" 
                    className="h-full w-full object-cover rounded-full shadow-lg"
                  />
                </div>
                <SrichakraText size="4xl" color="text-white" decorative={true} withBorder={false}>
                  Srichakra Academy
                </SrichakraText>
                <p className="text-white text-lg mt-2 font-medium">
                  The School To identify Your Child's Divine Gift!!
                </p>
              </div>
              
              <div className="bg-white bg-opacity-90 rounded-2xl p-8 shadow-xl">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Star className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Career Assessment Test
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Discover your ideal career path with our comprehensive psychometric assessment
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">15-20 Minutes</h3>
                  <p className="text-gray-600">Complete assessment at your own pace</p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Trusted by 10,000+</h3>
                  <p className="text-gray-600">Students and professionals worldwide</p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Comprehensive Report</h3>
                  <p className="text-gray-600">Detailed career insights and recommendations</p>
                </CardContent>
              </Card>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">What You'll Get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Personalized career path recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Skills and strengths analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Recommended career paths and educational programs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Actionable steps for career development</span>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-lg text-gray-700 mb-6">
                Please log in to access your personalized career assessment
              </p>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
                    Login to Continue
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="px-8 py-3">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-teal-600">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Srichakra Logo and Banner */}
            <div className="flex flex-col items-center mb-8">
              <div className="h-20 w-20 mb-4">
                <img 
                  src={sriYantraLogo} 
                  alt="Sri Yantra Symbol" 
                  className="h-full w-full object-cover rounded-full shadow-lg"
                />
              </div>
              <SrichakraText size="4xl" color="text-white" decorative={true} withBorder={false}>
                Srichakra Academy
              </SrichakraText>
              <p className="text-white text-lg mt-2 font-medium">
                The School To identify Your Child's Divine Gift!!
              </p>
            </div>
            
            <div className="bg-white bg-opacity-90 rounded-2xl p-8 shadow-xl mb-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Assessment Complete!
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Thank you for completing the Career Assessment. Your personalized report is being generated.
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4">What's Next?</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Your detailed report will be emailed within 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Schedule a consultation with our career experts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Access exclusive career resources and guidance</span>
                  </div>
                </div>
                <div className="mt-8 flex gap-3 justify-center">
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2">
                      Return to Home
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={downloadPDF} className="px-6 py-2">
                    Download PDF Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-teal-600">
      <div className="container mx-auto px-4 py-8">
        {/* Srichakra Logo and Banner */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 mb-3">
            <img 
              src={sriYantraLogo} 
              alt="Sri Yantra Symbol" 
              className="h-full w-full object-cover rounded-full shadow-lg"
            />
          </div>
          <SrichakraText size="2xl" color="text-white" decorative={true} withBorder={false}>
            Srichakra Academy
          </SrichakraText>
          <p className="text-white text-sm mt-1 font-medium">
            The School To identify Your Child's Divine Gift!!
          </p>
        </div>
        
        {/* Header */}
        <div className="text-center mb-6 bg-white bg-opacity-90 rounded-xl p-4 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Career Assessment</h1>
          <p className="text-gray-600">Question {currentStep + 1} of {questions.length}</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <Progress value={Math.min(100, Math.max(0, progress))} />
          <p className="text-sm text-white mt-2 text-center">{Math.round(progress)}% Complete</p>
        </div>

        {/* Question Card */}
        <Card className="max-w-3xl mx-auto bg-white bg-opacity-95">
          <CardHeader>
            <div className="hidden mb-4">
              <Badge variant="secondary" className="text-xs">
                {currentQuestion.domain} • {currentQuestion.framework}
              </Badge>
              <div className="text-sm text-gray-500">
                {currentStep + 1} / {questions.length}
              </div>
            </div>
            <CardTitle className="text-xl leading-relaxed text-gray-800">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-8">
              {responseOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-blue-300 ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.value}
                    checked={answers[currentQuestion.id] === option.value}
                    onChange={() => handleAnswer(currentQuestion.id, option.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-4 ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id] === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1" />
                    )}
                  </div>
                  <span className="text-lg text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-6 py-2"
              >
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={!answers[currentQuestion.id]}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2"
              >
                {currentStep === questions.length - 1 ? 'Complete Assessment' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareerAssessmentPage;
