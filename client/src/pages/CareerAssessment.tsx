import { useState, useEffect, useMemo } from 'react';
import itemBank from '@shared/assessment-items.json';
import jsPDF from 'jspdf';
import { computeClusterScores, computeClusterScoresFromItems, topClusterRecommendations } from '@/lib/scoring/careerClusters';
import clusterDefinitions from '@shared/career-clusters.json';
import { computeAptitudeScores } from '@/lib/scoring/aptitude';
import { buildApiUrl } from '@/config/api';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Users, Award, ArrowRight, Star } from 'lucide-react';
import { getUserSession, isAuthenticated, trackUserActivity } from '@/lib/auth';
import SrichakraText from '@/components/custom/SrichakraText';
import sriYantraLogo from '../assets/images/logo/sri-yantra.png';

// Item metadata contract
type AssessmentItem = {
  id: number;
  text: string;
  domain: string; // e.g., Analytical, Verbal, Creative, Technical, Social, Musical, Naturalistic, Executive, Conscientiousness, Learning
  frameworks: string[]; // canonical tags; multi-mapping allowed
  reverse?: boolean; // reverse-keyed item (1↔5)
  required?: boolean; // default true
  // Extended fields to support objective/weighted items and cluster mapping
  subDomain?: string;
  weight?: number;
  type?: 'likert' | 'objective';
  correctAnswer?: any;
  maxScore?: number;
  careerClusters?: string[];
};

const CareerAssessmentPage = () => {
  // Allow guest access (no login required) specifically for Career Assessment
  const CAREER_ASSESSMENT_PAUSED = false;
  const [user, setUser] = useState<any>({ email: 'guest@local', fullName: 'Guest User', isGuest: true });
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [report, setReport] = useState<{
    finalScores: { domain: string; score: number; count: number }[];
    totalAnswered: number;
    vak?: { Visual: number; Auditory: number; Kinesthetic: number };
    vakDominant?: 'Visual' | 'Auditory' | 'Kinesthetic' | null;
  } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Source of truth: shared JSON item bank
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const RAW_QUESTIONS: any[] = (itemBank as any[]);

  // Reverse and domain mapping now come directly from the JSON (reverse, domain fields)

  // Transform raw questions into canonical metadata and optionally shuffle deterministically by user
  const transformQuestions = (raw: any[]): AssessmentItem[] => raw.map((q) => ({
    id: q.id,
    text: q.text,
    domain: q.domain,
    frameworks: Array.isArray(q.frameworks) ? q.frameworks : (q.framework ? String(q.framework).split('/').filter(Boolean) : []),
    reverse: !!q.reverse,
    required: q.required !== false,
    subDomain: q.subDomain || q.facet || undefined,
    weight: typeof q.weight === 'number' ? q.weight : (q.weight ? Number(q.weight) : 1),
    type: q.type || (q.correctAnswer !== undefined ? 'objective' : 'likert'),
    correctAnswer: q.correctAnswer,
    maxScore: typeof q.maxScore === 'number' ? q.maxScore : (q.maxScore ? Number(q.maxScore) : undefined),
    careerClusters: Array.isArray(q.careerClusters) ? q.careerClusters : (q.careerClusters ? String(q.careerClusters).split(/[,;|]/).map((s:string)=>s.trim()).filter(Boolean) : []),
  }));

  // Simple deterministic PRNG (xorshift32) and shuffler
  const seedFromString = (s: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  const xorshift32 = (seed: number) => () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; // eslint-disable-line no-param-reassign
    return (seed >>> 0) / 4294967296;
  };
  const shuffleDeterministic = <T,>(arr: T[], seedNum: number): T[] => {
    const rnd = xorshift32(seedNum);
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const [questions, setQuestions] = useState<AssessmentItem[]>(transformQuestions(RAW_QUESTIONS));

  // Compute a stable seed per user (guest -> 'guest') and shuffle once user is known
  const userSeed = useMemo(() => seedFromString((user?.email || 'guest') + '-scope-v1'), [user?.email]);
  useEffect(() => {
    setQuestions(shuffleDeterministic(transformQuestions(RAW_QUESTIONS), userSeed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSeed]);

  const responseOptions = [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" }
  ];

  useEffect(() => {
    if (CAREER_ASSESSMENT_PAUSED) return;
    const userSession = getUserSession();
    if (userSession) {
      setUser({
        email: userSession.email || 'user@srichakra.com',
        fullName: userSession.name || userSession.email?.split('@')[0] || 'User',
        isGuest: false,
      });
      trackUserActivity('activity', userSession);
    } else {
      // Guest mode: allow taking the assessment without login
      setUser({ email: 'guest@local', fullName: 'Guest User', isGuest: true });
    }
  }, []);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextStep = () => {
    // Enforce an answer for the current question before proceeding
    if (currentStep >= 0 && currentStep < questions.length) {
      const qid = questions[currentStep]?.id;
      if (qid && answers[qid] == null) {
        alert('Please select an answer to continue.');
        return;
      }
    }
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
    // Scoring: mean per domain (after reverse keying), displayed on 0–5 scale; charts normalize to percent via /5
    const domainScores: Record<string, number[]> = {};

    questions.forEach((q) => {
      const raw = answers[q.id];
      if (typeof raw === 'number') {
        const val = q.reverse ? 6 - raw : raw; // reverse-keyed
        if (!domainScores[q.domain]) domainScores[q.domain] = [];
        domainScores[q.domain].push(val);
      }
    });

    // Calculate mean per domain and return sorted list
    const finalScores = Object.keys(domainScores)
      .map((domain) => {
        const vals = domainScores[domain];
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        return { domain, score: mean, count: vals.length, percent: Math.round((mean / 5) * 100) };
      })
      .sort((a, b) => b.score - a.score);

    console.log('Assessment Results:', finalScores);
    // VAK learning style scoring based on selected indicators
    const VAK_MAP: Record<'Visual' | 'Auditory' | 'Kinesthetic', number[]> = {
      Visual: [9, 34, 45],
      Auditory: [23, 31, 36, 58],
      Kinesthetic: [10, 14, 55, 60]
    };
    const vakRaw: { Visual: number; Auditory: number; Kinesthetic: number } = { Visual: 0, Auditory: 0, Kinesthetic: 0 };
    let vakAnsweredCount = 0;
    (Object.keys(VAK_MAP) as Array<'Visual' | 'Auditory' | 'Kinesthetic'>).forEach(key => {
      const vals = VAK_MAP[key]
        .map(id => answers[id])
        .filter((v): v is number => typeof v === 'number');
      vakAnsweredCount += vals.length;
      vakRaw[key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    });
    const vakDominant = vakAnsweredCount === 0 ? null : (['Visual', 'Auditory', 'Kinesthetic'] as const)
      .reduce<(typeof VAK_MAP extends any ? 'Visual' | 'Auditory' | 'Kinesthetic' : never) | null>((best, cur) => {
        if (best === null) return cur as 'Visual' | 'Auditory' | 'Kinesthetic';
        return vakRaw[cur as 'Visual' | 'Auditory' | 'Kinesthetic'] > vakRaw[best as 'Visual' | 'Auditory' | 'Kinesthetic']
          ? (cur as 'Visual' | 'Auditory' | 'Kinesthetic')
          : best;
      }, null);

    // Compute career cluster scores from two approaches: domain-weights & item-level mapping
    const clusterScoresFromDomain = computeClusterScores(finalScores as any);
    const clusterScoresFromItems = computeClusterScoresFromItems(questions, answers);

    // Combine both approaches into a single ranked list (average percent when both present)
    const combinedMap: Record<string, { name: string; domainPercent?: number; itemPercent?: number; combinedPercent?: number }> = {};
    clusterScoresFromDomain.forEach((c: any) => {
      const name = c.name || `cluster_${c.id}`;
      combinedMap[name] = combinedMap[name] || { name };
      combinedMap[name].domainPercent = c.percent ?? Math.round((c.rawScore/5)*100);
    });
    clusterScoresFromItems.forEach((c: any) => {
      const def = (clusterDefinitions as any[]).find(d => d.key === c.key);
      const name = def?.name || c.key;
      combinedMap[name] = combinedMap[name] || { name };
      combinedMap[name].itemPercent = c.scorePercent;
    });

    const combinedList = Object.keys(combinedMap).map(k => {
      const v = combinedMap[k];
      const counts = (v.domainPercent !== undefined ? 1 : 0) + (v.itemPercent !== undefined ? 1 : 0);
      const sum = (v.domainPercent || 0) + (v.itemPercent || 0);
      const combinedPercent = counts > 0 ? Math.round(sum / counts) : 0;
      return { name: v.name, domainPercent: v.domainPercent ?? null, itemPercent: v.itemPercent ?? null, combinedPercent };
    }).sort((a,b) => b.combinedPercent - a.combinedPercent);

    const suggestedClusters = combinedList.slice(0, 3);

    const reportData = {
      finalScores,
      totalAnswered: Object.keys(answers).length,
      vak: vakRaw,
      vakDominant,
      careerClusters: {
        fromDomain: clusterScoresFromDomain,
        fromItems: clusterScoresFromItems,
        combined: combinedList
      },
      suggestedClusters,
      aptitude: computeAptitudeScores(questions as any, answers)
    } as any;
    setReport(reportData);
    
  // Save assessment results and update user status
  saveAssessmentResults(reportData);
  // Generate and upload PDF (non-blocking)
  generateAndUploadPdf(reportData).catch(() => {});
  };

  const saveAssessmentResults = (reportData: any) => {
    if (!user) return;

    const assessmentResult = {
      userId: user.email,
  studentName: user.fullName || user.email.split('@')[0],
      completedAt: new Date().toISOString(),
      results: reportData,
      answers: answers,
      assessmentType: 'Career Assessment',
      status: 'completed'
    };

  // Send to server later when endpoint exists; for now, rely on PDF upload persistence
  console.log('Assessment completed; PDF will be persisted.');
  };

  // Generate a compact PDF and upload to Supabase via API
  const generateAndUploadPdf = async (reportData: any) => {
    try {
      if (!user) return;
      // In guest mode we don't upload to the server; user can still use the Download button
      if (user.isGuest) {
        return;
      }
      setSaving(true);
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Srichakra Career Assessment Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Student: ${user.fullName || user.email}`, 14, 30);
      doc.text(`Email: ${user.email}`, 14, 36);
      doc.text(`Completed: ${new Date().toLocaleString()}`, 14, 42);
      // Add learning style summary if available
      if (reportData?.vak && reportData?.vakDominant) {
        const v = reportData.vak;
        doc.text(`Learning Style: ${reportData.vakDominant} (V ${Math.round((v.Visual/5)*100)}% / A ${Math.round((v.Auditory/5)*100)}% / K ${Math.round((v.Kinesthetic/5)*100)}%)`, 14, 54);
        doc.text('Top Domains:', 14, 62);
      } else {
        doc.text('Top Domains:', 14, 54);
      }
  const top = reportData.finalScores.slice(0, 5);
  const startY = (reportData?.vak && reportData?.vakDominant) ? 72 : 64;
      top.forEach((t: any, i: number) => {
        doc.text(`${i + 1}. ${t.domain}: ${t.score.toFixed(2)}`, 20, startY + i * 8);
      });
      let y = startY + top.length * 8 + 6;
      // Insert Top Career Clusters (if available)
      if (reportData?.topClusters?.length) {
        doc.text('Top Career Clusters:', 14, y);
        y += 6;
        reportData.topClusters.forEach((c: any, i: number) => {
          doc.text(`${i + 1}. ${c.name}: ${c.rawScore.toFixed(2)} (${c.percent}%)`, 20, y);
          y += 6;
        });
        y += 4;
      }
      // Aptitude objective items summary
      if (reportData?.aptitude?.total?.totalCount) {
        doc.text('Aptitude (Objective Items):', 14, y);
        y += 6;
        const total = reportData.aptitude.total;
        doc.text(`Overall: ${total.correctCount}/${total.totalCount} correct (${total.percent}%)`, 20, y);
        y += 6;
        const topAptDomains = (reportData.aptitude.byDomain || []).slice(0, 5);
        topAptDomains.forEach((d: any) => {
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(`${d.key}: ${d.correctCount}/${d.totalCount} (${d.percent}%)`, 22, y);
          y += 6;
        });
        y += 4;
      }
      doc.text('All Domains:', 14, y);
      y += 6;
      reportData.finalScores.forEach((t: any) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(`${t.domain}: ${t.score.toFixed(2)} (${t.count})`, 20, y);
        y += 6;
      });

      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const filename = `reports/${user.email}/${Date.now()}-career-report.pdf`;
      const res = await fetch(buildApiUrl('/pdfs/upload'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bucket: 'student-pdfs', path: filename, contentBase64: pdfBase64, contentType: 'application/pdf', upsert: true, userEmail: user.email })
      });
      const data = await res.json();
      if (data?.success) {
        const urlRes = await fetch(buildApiUrl(`/pdfs/signed-url?bucket=student-pdfs&path=${encodeURIComponent(filename)}&expiresIn=604800`), { credentials: 'include' });
        const urlData = await urlRes.json();
        if (urlData?.success && urlData.url) setPdfUrl(urlData.url);
      }
    } catch (e) {
      console.log('PDF upload failed', e);
    } finally {
      setSaving(false);
    }
  };

  const generateSamplePDF = () => {
    // Create sample data for demonstration
    const sampleReport = {
      finalScores: [
        { domain: 'Analytical', score: 4.2, count: 8 },
        { domain: 'Technical', score: 3.8, count: 7 },
        { domain: 'Social', score: 3.5, count: 6 },
        { domain: 'Creative', score: 3.2, count: 5 },
        { domain: 'Verbal', score: 3.0, count: 6 },
        { domain: 'Musical', score: 2.8, count: 4 },
        { domain: 'Naturalistic', score: 2.5, count: 3 },
        { domain: 'General', score: 3.6, count: 12 }
      ],
  totalAnswered: 66,
  vak: { Visual: 4.1, Auditory: 3.6, Kinesthetic: 3.2 },
  vakDominant: 'Visual'
    };
    
    generatePDFWithData(sampleReport, true);
  };

  const downloadPDF = () => {
    if (!report) return;
    generatePDFWithData(report, false);
  };

  const generatePDFWithData = (reportData: any, isSample: boolean = false) => {
  const { finalScores, totalAnswered } = reportData;
  const vak = reportData?.vak as { Visual: number; Auditory: number; Kinesthetic: number } | undefined;
  const vakDominant = (reportData?.vakDominant as ('Visual'|'Auditory'|'Kinesthetic'|null|undefined)) || null;
  const maxScore = Math.max(...finalScores.map((s: any) => s.score));
    
    // Generate bar chart data with improved spacing and labels
  const barChartSVG = finalScores.map((score: any, index: number) => {
      const percentage = (score.score / 5) * 100; // Convert to percentage (max score is 5)
      const colors = ['#006D77', '#83C5BE', '#FFDDD2', '#E29578', '#5390D9', '#7209B7', '#F72585', '#4CC9F0'];
      const yPosition = index * 50 + 50; // Increased spacing between bars
      return `
        <g>
          <rect x="80" y="${yPosition}" width="${percentage * 3}" height="35" fill="${colors[index % colors.length]}" rx="8"/>
          <text x="90" y="${yPosition + 23}" fill="white" font-size="13" font-weight="bold">${score.domain}</text>
          <text x="${percentage * 3 + 90}" y="${yPosition + 23}" fill="#333" font-size="12" font-weight="bold">${score.score.toFixed(1)}/5.0</text>
          <text x="70" y="${yPosition + 23}" fill="#666" font-size="11" text-anchor="end">${index + 1}.</text>
        </g>
      `;
    }).join('');

    // Generate pie chart data with better positioning
  const total = finalScores.reduce((sum: number, s: any) => sum + s.score, 0);
    let currentAngle = 0;
  const pieSlices = finalScores.map((score: any, index: number) => {
      const percentage = (score.score / total) * 100;
      const angle = (score.score / total) * 360;
      const centerX = 160, centerY = 160, radius = 130;
      const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
      const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
      const largeArc = angle > 180 ? 1 : 0;
      const colors = ['#006D77', '#83C5BE', '#FFDDD2', '#E29578', '#5390D9', '#7209B7', '#F72585', '#4CC9F0'];
      
      // Calculate label position
      const labelAngle = currentAngle + angle/2;
      const labelRadius = radius + 20;
      const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
      const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);
      
      const slice = `
        <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" 
              fill="${colors[index % colors.length]}" stroke="white" stroke-width="3"/>
        <text x="${labelX}" y="${labelY}" 
              text-anchor="middle" fill="#333" font-size="11" font-weight="bold">
          ${score.domain.length > 10 ? score.domain.substring(0,8)+'...' : score.domain}
        </text>
        <text x="${labelX}" y="${labelY + 12}" 
              text-anchor="middle" fill="#666" font-size="9">
          ${score.score.toFixed(1)}
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
      .filter((s: any) => leftBrainDomains.includes(s.domain))
      .reduce((sum: number, s: any) => sum + s.score, 0) / leftBrainDomains.length;
    const rightBrainScore = finalScores
      .filter((s: any) => rightBrainDomains.includes(s.domain))
      .reduce((sum: number, s: any) => sum + s.score, 0) / rightBrainDomains.length;
    
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
          <title>Srichakra Career Assessment Report${isSample ? ' - Sample' : ''}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            
            @media print {
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              body { background: white !important; margin: 0; }
              .page { 
                margin: 0; 
                border-radius: 0; 
                box-shadow: none;
                padding: 20px;
              }
            }
            
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; padding: 0; 
              background: linear-gradient(135deg, #83C5BE 0%, #006D77 100%);
              color: #333;
            }
            .page { 
              min-height: 297mm;
              width: 210mm;
              padding: 40px; 
              background: white; 
              margin: 20px auto; 
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              page-break-after: always;
              box-sizing: border-box;
            }
            .page:last-child {
              page-break-after: avoid;
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
              <h1>Career Assessment Report${isSample ? ' - SAMPLE REPORT' : ''}</h1>
              <p style="font-size: 1.2em; color: #666;">Srichakra Academy - The School To identify Your Child's Divine Gift!!</p>
              <p style="color: #83C5BE; font-size: 1.1em;">Comprehensive Psychometric Analysis</p>
              ${isSample ? '<p style="color: #E29578; font-size: 1em; font-weight: bold; background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0;">🔍 This is a sample report showing the layout and format. Complete the assessment to get your personalized results.</p>' : ''}
            </div>
            
            <div class="summary-stats">
              <div class="stat-card">
                <div class="stat-number">${totalAnswered}</div>
                <div class="stat-label">Questions Answered</div>
              </div>
              <div class="stat-card">
                ${vakDominant ? `
                  <div class="stat-number">${vakDominant}</div>
                  <div class="stat-label">Learning Style</div>
                ` : `
                  <div class="stat-number">${finalScores.length}</div>
                  <div class="stat-label">Domains Analyzed</div>
                `}
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
              ${topDomains.map((score: any) => 
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
            <div style="background: #f8f9fa; padding: 30px; border-radius: 15px; margin: 20px 0; border: 1px solid #e9ecef;">
              <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #006D77, #83C5BE); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
                  <span style="color: white; font-size: 1.5em; font-weight: bold;">📊</span>
                </div>
                <div>
                  <h3 style="margin: 0; color: #006D77; font-size: 1.3em;">Your Aptitude Scores Analysis</h3>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 1em;">Detailed breakdown of your strengths across different domains (Scale: 1-5)</p>
                </div>
              </div>
              <svg width="100%" height="${finalScores.length * 50 + 80}" viewBox="0 0 650 ${finalScores.length * 50 + 80}" style="background: white; border-radius: 10px; padding: 10px;">
                <defs>
                  <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#006D77;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#83C5BE;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <text x="325" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#006D77">
                  Your Aptitude Profile
                </text>
                ${barChartSVG}
                <line x1="380" y1="40" x2="380" y2="${finalScores.length * 50 + 50}" stroke="#ddd" stroke-width="2"/>
                <text x="385" y="45" font-size="12" fill="#666">Average (3.0)</text>
                <text x="50" y="${finalScores.length * 50 + 70}" font-size="10" fill="#888">💡 Higher scores indicate stronger natural aptitudes in those areas</text>
              </svg>
            </div>
          </div>

          <!-- Page 3: Domain Distribution & Brain Analysis -->
          <div class="page">
            <div class="header">
              <h1>Domain Distribution & Brain Analysis</h1>
            </div>

            <!-- Domain Distribution Overview (Pie Chart) -->
            <div style="background: #f8f9fa; padding: 30px; border-radius: 15px; margin: 20px 0; border: 1px solid #e9ecef;">
              <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #E29578, #FFDDD2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
                  <span style="color: white; font-size: 1.5em; font-weight: bold;">🍰</span>
                </div>
                <div>
                  <h3 style="margin: 0; color: #006D77; font-size: 1.3em;">Domain Distribution Overview</h3>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 1em;">Visual representation of how your abilities are distributed across different areas</p>
                </div>
              </div>
              <div style="background: white; border-radius: 10px; padding: 20px; display: flex; align-items: center; gap: 20px;">
                <div style="flex: 0 0 auto; text-align: left;">
                  <h3 style="margin: 0 0 10px 0; color: #006D77; font-size: 18px; font-weight: bold;">Your Talent Distribution</h3>
                  <p style="margin: 0; color: #666; font-size: 12px; max-width: 150px; line-height: 1.4;">💡 Larger sections represent your strongest talent areas</p>
                </div>
                <div style="flex: 1; text-align: center;">
                  <svg width="320" height="320" viewBox="0 0 320 320">
                    ${pieSlices.replace(/cx="175"/g, 'cx="160"').replace(/cy="180"/g, 'cy="160"')}
                    <circle cx="160" cy="160" r="45" fill="white" stroke="#006D77" stroke-width="3"/>
                    <text x="160" y="155" text-anchor="middle" font-size="14" font-weight="bold" fill="#006D77">Total</text>
                    <text x="160" y="170" text-anchor="middle" font-size="12" fill="#666">${total.toFixed(1)}</text>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Brain Hemisphere Analysis -->
            <h2 style="margin-top: 30px;">Brain Hemisphere Analysis</h2>

            <div style="margin: 30px 0;">
              <!-- Left Brain Analysis -->
              <div style="display: flex; align-items: flex-start; margin: 25px 0; padding: 25px; background: linear-gradient(135deg, #2c5282, #553c9a); border-radius: 15px; color: white;">
                <div style="width: 120px; height: 120px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 25px; flex-shrink: 0; border: 3px solid rgba(255,255,255,0.3);">
                  <div style="text-align: center;">
                    <div style="font-size: 2.5em; margin-bottom: 5px;">🧠</div>
                    <div style="font-size: 0.8em; font-weight: bold;">LEFT</div>
                  </div>
                </div>
                <div style="flex: 1;">
                  <h3 style="margin: 0 0 15px 0; font-size: 1.5em;">Left Brain Dominance (${leftBrainScore.toFixed(1)}/5.0)</h3>
                  <p style="margin: 0 0 8px 0; font-size: 1.1em; line-height: 1.6;">
                    <strong>Characteristics:</strong> Logical • Analytical • Sequential • Detail-oriented
                  </p>
                  <p style="margin: 0 0 8px 0; font-size: 1em; line-height: 1.5;">
                    You excel in structured thinking, mathematical concepts, and systematic problem-solving approaches.
                  </p>
                  <p style="margin: 0 0 15px 0; font-size: 1em; line-height: 1.5;">
                    This brain preference supports careers in research, accounting, engineering, and analytical fields.
                  </p>
                  <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: bold;">Why Left Brain Matters:</p>
                    <p style="margin: 0; line-height: 1.5;">
                      Left brain dominance indicates strength in mathematical thinking, verbal processing, linear reasoning, and structured approaches. 
                      People with left brain dominance excel in careers requiring systematic analysis, clear communication, and logical problem-solving.
                    </p>
                  </div>
                  <div style="margin-top: 15px;">
                    <strong>Your Left Brain Scores:</strong><br>
                    ${finalScores.filter((s: any) => leftBrainDomains.includes(s.domain)).map((s: any) => 
                      `<span style="display: inline-block; background: rgba(255,255,255,0.25); padding: 5px 10px; border-radius: 15px; margin: 3px 5px 3px 0; font-size: 0.9em;">${s.domain}: ${s.score.toFixed(1)}</span>`
                    ).join('')}
                  </div>
                </div>
              </div>
              
              <!-- Right Brain Analysis -->
              <div style="display: flex; align-items: flex-start; margin: 25px 0; padding: 25px; background: linear-gradient(135deg, #b83280, #2980b9); border-radius: 15px; color: white;">
                <div style="width: 120px; height: 120px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 25px; flex-shrink: 0; border: 3px solid rgba(255,255,255,0.3);">
                  <div style="text-align: center;">
                    <div style="font-size: 2.5em; margin-bottom: 5px;">🎨</div>
                    <div style="font-size: 0.8em; font-weight: bold;">RIGHT</div>
                  </div>
                </div>
                <div style="flex: 1;">
                  <h3 style="margin: 0 0 15px 0; font-size: 1.5em;">Right Brain Dominance (${rightBrainScore.toFixed(1)}/5.0)</h3>
                  <p style="margin: 0 0 8px 0; font-size: 1.1em; line-height: 1.6;">
                    <strong>Characteristics:</strong> Creative • Intuitive • Holistic • Artistic
                  </p>
                  <p style="margin: 0 0 8px 0; font-size: 1em; line-height: 1.5;">
                    You thrive in visual-spatial thinking, creative expression, and seeing the big picture connections.
                  </p>
                  <p style="margin: 0 0 15px 0; font-size: 1em; line-height: 1.5;">
                    This brain preference supports careers in design, arts, innovation, and creative problem-solving fields.
                  </p>
                  <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: bold;">Why Right Brain Matters:</p>
                    <p style="margin: 0; line-height: 1.5;">
                      Right brain dominance indicates strength in visual-spatial thinking, creative expression, pattern recognition, and imaginative approaches. 
                      People with right brain dominance excel in careers requiring innovation, artistic vision, and holistic problem-solving.
                    </p>
                  </div>
                  <div style="margin-top: 15px;">
                    <strong>Your Right Brain Scores:</strong><br>
                    ${finalScores.filter((s: any) => rightBrainDomains.includes(s.domain)).map((s: any) => 
                      `<span style="display: inline-block; background: rgba(255,255,255,0.25); padding: 5px 10px; border-radius: 15px; margin: 3px 5px 3px 0; font-size: 0.9em;">${s.domain}: ${s.score.toFixed(1)}</span>`
                    ).join('')}
                  </div>
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

            <!-- Individual Domain Explanations -->
            <h2 style="margin-top: 40px;">Your Strength Profile</h2>
            <div style="margin: 30px 0;">
              ${finalScores.slice(0, 5).map((score: any, index: number) => {
                const domainIcons = {
                  'Analytical': '🧮',
                  'Technical': '⚙️',
                  'Social': '🤝',
                  'Creative': '🎨',
                  'Verbal': '📝',
                  'Executive': '🎯',
                  'Musical': '🎵',
                  'Naturalistic': '🌿',
                  'Conscientiousness': '✅',
                  'Learning': '📚'
                };
                const domainExplanations = {
                  'Analytical': [
                    'You excel at logical thinking, problem-solving, and data analysis.',
                    'Your strength lies in breaking down complex information systematically.',
                    'This skill supports careers in research, finance, and analytical fields.'
                  ],
                  'Technical': [
                    'You have strong practical skills and enjoy working with tools and technology.',
                    'You learn best through hands-on experimentation and technical problem-solving.',
                    'This aptitude suits engineering, IT, and technical trades careers.'
                  ],
                  'Social': [
                    'You thrive in collaborative environments and enjoy helping others.',
                    'Your interpersonal skills make you effective in team settings and leadership roles.',
                    'This strength supports careers in education, healthcare, and community services.'
                  ],
                  'Creative': [
                    'You have innovative thinking and enjoy artistic expression and design.',
                    'Your imagination and originality help you generate unique solutions.',
                    'This talent suits careers in arts, design, marketing, and creative industries.'
                  ],
                  'Verbal': [
                    'You communicate effectively and enjoy reading, writing, and discussion.',
                    'Your language skills help you express ideas clearly and persuasively.',
                    'This strength supports careers in teaching, writing, law, and communications.'
                  ],
                  'Executive': [
                    'You excel at planning, organization, and leading projects to completion.',
                    'Your decision-making and coordination skills drive successful outcomes.',
                    'This aptitude suits management, administration, and leadership roles.'
                  ],
                  'Musical': [
                    'You have sensitivity to rhythm, melody, and musical expression.',
                    'Your auditory perception and creativity shine in musical contexts.',
                    'This talent supports careers in music, performance, and audio production.'
                  ],
                  'Naturalistic': [
                    'You connect deeply with nature and understand environmental patterns.',
                    'Your observation skills and environmental awareness are highly developed.',
                    'This aptitude suits careers in science, conservation, and outdoor education.'
                  ],
                  'Conscientiousness': [
                    'You are detail-oriented, responsible, and committed to quality work.',
                    'Your thoroughness and reliability ensure tasks are completed properly.',
                    'This trait supports careers requiring precision and dependability.'
                  ],
                  'Learning': [
                    'You have effective study habits and enjoy continuous personal growth.',
                    'Your learning strategies help you acquire new knowledge efficiently.',
                    'This skill supports lifelong learning and academic success.'
                  ]
                };
                
                const explanations = domainExplanations[score.domain as keyof typeof domainExplanations] || [
                  'You show balanced abilities in this area.',
                  'This domain contributes to your overall skill profile.',
                  'Consider how this strength can support your career goals.'
                ];
                
                return `
                  <div style="display: flex; align-items: flex-start; margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 5px solid ${['#006D77', '#83C5BE', '#FFDDD2', '#E29578', '#5390D9'][index % 5]};">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, ${['#006D77', '#83C5BE', '#FFDDD2', '#E29578', '#5390D9'][index % 5]}, #ffffff); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0; border: 3px solid rgba(0,0,0,0.1);">
                      <span style="font-size: 2em;">${domainIcons[score.domain as keyof typeof domainIcons] || '⭐'}</span>
                    </div>
                    <div style="flex: 1;">
                      <h3 style="margin: 0 0 12px 0; color: ${['#006D77', '#83C5BE', '#FFDDD2', '#E29578', '#5390D9'][index % 5]}; font-size: 1.3em;">${score.domain} (${score.score.toFixed(1)}/5.0)</h3>
                      <p style="margin: 0 0 6px 0; line-height: 1.5; color: #555; font-size: 1em;">
                        ${explanations[0]}
                      </p>
                      <p style="margin: 0 0 6px 0; line-height: 1.5; color: #555; font-size: 1em;">
                        ${explanations[1]}
                      </p>
                      <p style="margin: 0; line-height: 1.5; color: #555; font-size: 1em;">
                        ${explanations[2]}
                      </p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <h2>Five Senses Learning Profile</h2>
            <div style="margin: 30px 0;">
              <!-- Visual Learning Style -->
              <div style="display: flex; align-items: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 5px solid #FF6B6B;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #FF6B6B, #4ECDC4); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0;">
                  <span style="font-size: 2em;">👁️</span>
                </div>
                <div style="flex: 1;">
                  <h3 style="color: #FF6B6B; margin: 0 0 8px 0;">Visual Learning Style</h3>
                  <p style="margin: 0 0 6px 0; line-height: 1.5; color: #555;">
                    <strong>You learn best through:</strong> Charts, diagrams, colors, images, and visual representations.
                  </p>
                  <p style="margin: 0 0 6px 0; line-height: 1.5; color: #555;">
                    <strong>Study tips:</strong> Use mind maps, color-coded notes, and visual organizers to remember information.
                  </p>
                  <p style="margin: 0; line-height: 1.5; color: #555;">
                    <strong>Career match:</strong> Design, architecture, data visualization, and visual arts fields.
                  </p>
                </div>
              </div>

              <!-- Auditory Learning Style -->
              <div style="display: flex; align-items: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 5px solid #45B7D1;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #45B7D1, #96CEB4); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0;">
                  <span style="font-size: 2em;">👂</span>
                </div>
                <div style="flex: 1;">
                  <h3 style="color: #45B7D1; margin: 0 0 8px 0;">Auditory Learning Style</h3>
                  <p style="margin: 0 0 6px 0; line-height: 1.5; color: #555;">
                    <strong>You learn best through:</strong> Discussions, music, sounds, verbal instructions, and listening.
                  </p>
                  <p style="margin: 0 0 6px 0; line-height: 1.5; color: #555;">
                    <strong>Study tips:</strong> Record lectures, discuss topics aloud, and use mnemonic devices with rhythm.
                  </p>
                  <p style="margin: 0; line-height: 1.5; color: #555;">
                    <strong>Career match:</strong> Teaching, counseling, music, public speaking, and communication roles.
                  </p>
                </div>
              </div>

              <!-- Kinesthetic Learning Style -->
              <div style="display: flex; align-items: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; border-left: 5px solid #F39C12;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #F39C12, #E67E22); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0;">
                  <span style="font-size: 2em;">✋</span>
                </div>
                <div style="flex: 1;">
                  <h3 style="color: #F39C12; margin: 0 0 8px 0;">Kinesthetic Learning Style</h3>
                  <p style="margin: 0 0 6px 0; line-height: 1.5; color: #555;">
                    <strong>You learn best through:</strong> Hands-on activities, movement, physical manipulation, and learning by doing.
                  </p>
                  <p style="margin: 0 0 6px 0; line-height: 1.5; color: #555;">
                    <strong>Study tips:</strong> Use physical objects, take breaks for movement, and practice skills hands-on.
                  </p>
                  <p style="margin: 0; line-height: 1.5; color: #555;">
                    <strong>Career match:</strong> Engineering, healthcare, sports, crafts, and practical trades.
                  </p>
                </div>
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

            ${topDomains.map((domain: any, index: number) => {
              const domainIcons = {
                'Analytical': '📊',
                'Verbal': '📝',
                'Creative': '🎨',
                'Technical': '⚙️',
                'Social': '👥',
                'Musical': '🎵',
                'Naturalistic': '🌿',
                'General': '⭐'
              };
              const domainColors = {
                'Analytical': '#004d57',
                'Verbal': '#2d5a5e',
                'Creative': '#b85c42',
                'Technical': '#3a6bb8',
                'Social': '#4a1458',
                'Musical': '#b8185c',
                'Naturalistic': '#2980b9',
                'General': '#d4822a'
              };
              const domainReasons = {
                'Analytical': 'Your high analytical score indicates strong logical reasoning, problem-solving abilities, and comfort with data analysis. These skills are essential for making informed decisions and understanding complex systems.',
                'Verbal': 'Your verbal strength shows excellent communication skills, language proficiency, and ability to express ideas clearly. This is crucial for leadership, teaching, and client-facing roles.',
                'Creative': 'Your creative aptitude demonstrates innovative thinking, artistic vision, and ability to generate original solutions. This skill set is valuable for design, marketing, and problem-solving roles.',
                'Technical': 'Your technical competency shows aptitude for understanding systems, working with tools/technology, and hands-on problem solving. This is essential for engineering and technical fields.',
                'Social': 'Your social intelligence indicates strong interpersonal skills, empathy, and ability to work effectively with others. This is vital for roles involving teamwork and human interaction.',
                'Musical': 'Your musical abilities show pattern recognition, rhythm sensitivity, and auditory processing skills. These talents can enhance creativity and structure in various career paths.',
                'Naturalistic': 'Your naturalistic intelligence demonstrates environmental awareness, pattern recognition in nature, and systematic thinking. This supports careers in science and environmental fields.',
                'General': 'Your general aptitude shows well-rounded abilities and adaptability across multiple areas. This versatility allows flexibility in career choices and management roles.'
              };
              
              return `
              <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 15px; border-left: 5px solid ${domainColors[domain.domain as keyof typeof domainColors] || '#006D77'};">
                <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                  <div style="width: 80px; height: 80px; background: ${domainColors[domain.domain as keyof typeof domainColors] || '#006D77'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <span style="font-size: 2.2em;">${domainIcons[domain.domain as keyof typeof domainIcons] || '⭐'}</span>
                  </div>
                  <div style="flex: 1;">
                    <h3 style="color: ${domainColors[domain.domain as keyof typeof domainColors] || '#006D77'}; margin: 0 0 10px 0; font-size: 1.4em;">
                      ${index + 1}. ${domain.domain} Careers (Score: ${domain.score.toFixed(1)}/5.0)
                    </h3>
                    <p style="margin: 0 0 15px 0; line-height: 1.6; color: #555; font-size: 1em;">
                      <strong>Why this matters for you:</strong> ${domainReasons[domain.domain as keyof typeof domainReasons] || 'This area represents one of your key strengths and natural talents.'}
                    </p>
                  </div>
                </div>
                
                  <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                  <h4 style="margin: 0 0 15px 0; color: #333; font-size: 1.1em;">Recommended Career Paths:</h4>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
                    ${(careerSuggestions[domain.domain as keyof typeof careerSuggestions] || ['General roles']).map((career: string) => 
                      `<div style="background: linear-gradient(135deg, ${domainColors[domain.domain as keyof typeof domainColors] || '#004d57'}, ${domainColors[domain.domain as keyof typeof domainColors] || '#004d57'}dd); color: white; padding: 18px; border-radius: 8px; text-align: center; box-shadow: 0 3px 12px rgba(0,0,0,0.2);">
                        <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 8px;">${career}</div>
                        <div style="font-size: 0.85em; opacity: 0.95;">High ${domain.domain.toLowerCase()} aptitude required</div>
                      </div>`
                    ).join('')}
                  </div>
                </div>
              </div>
            `}).join('')}

            <h2>Next Steps & Recommendations</h2>
            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; border-left: 5px solid #006D77;">
              <h3 style="margin-top: 0; color: #006D77;">Action Plan</h3>
              <ol style="font-size: 1.1em; line-height: 1.8;">
                <li><strong>Explore Further:</strong> Research the recommended career paths that align with your top ${topDomains[0].domain} score.</li>
                <li><strong>Skill Development:</strong> Consider developing skills in your secondary strength areas: ${topDomains.slice(1,3).map((d: any) => d.domain).join(' and ')}.</li>
                <li><strong>Educational Path:</strong> Look into degree programs or certifications that support your career interests.</li>
                <li><strong>Gain Experience:</strong> Seek internships, volunteer work, or projects in your areas of strength.</li>
                <li><strong>Consult an Expert:</strong> Schedule a follow-up consultation with our career counselors for personalized guidance.</li>
              </ol>
            </div>

            <div style="margin-top: 40px; display: flex; align-items: center; justify-content: space-between; padding: 25px; background: linear-gradient(135deg, #004d57, #2d5a5e); border-radius: 15px; color: white;">
              <div style="flex: 1;">
                <h3 style="margin: 0 0 10px 0;">Thank You for Taking the Assessment</h3>
                <p style="margin: 0 0 10px 0; opacity: 0.9;">This report is generated by Srichakra Academy's comprehensive career assessment system.</p>
                <p style="margin: 0; font-size: 0.9em; opacity: 0.8;">For questions or consultation, contact us through our website.</p>
                <div style="margin-top: 15px;">
                  <strong style="font-size: 1.1em;">🌐 Visit: srichakraacademy.org</strong>
                </div>
              </div>
              <div style="margin-left: 30px; text-align: center; background: white; padding: 20px; border-radius: 12px;">
                <div style="font-size: 12px; color: #666; font-weight: bold; margin-bottom: 8px;">🌐 srichakraacademy.org</div>
                <div style="font-size: 12px; color: #666; font-weight: bold;">📞 +91-98430 30697</div>
              </div>
            </div>
          </div>

          <!-- Page 5: Learning Styles & Five Senses Profile -->
          <div class="page">
            <div class="header">
              <h1>Learning Styles & Multiple Intelligences</h1>
            </div>

            <h2>Your Learning Profile</h2>
            <p style="font-size: 1.1em; margin-bottom: 30px; color: #666;">
              Understanding how you learn best helps optimize your educational journey and career development.
            </p>
            
            <div style="background: linear-gradient(135deg, #FFDDD2, #E29578); padding: 25px; border-radius: 15px; margin-bottom: 30px;">
              <h3 style="margin-top: 0;">VAK Learning Style Analysis${vakDominant ? ` — <span style='color:#006D77'>Dominant: <strong>${vakDominant}</strong></span>` : ''}</h3>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
                  <h4 style="color: #006D77; margin-bottom: 10px;">👁️ Visual ${vakDominant==='Visual' ? '<span style="background:#006D77;color:white;padding:4px 8px;border-radius:12px;font-size:0.8em;">Dominant</span>' : ''}</h4>
                  ${vak ? `<div style="margin: 6px 0 12px; font-weight: 700; color: #333;">Score: ${Math.round((vak.Visual/5)*100)}%</div>` : ''}
                  <p style="font-size: 0.95em; line-height: 1.6;">You learn best with diagrams, charts, colors, and spatial understanding. Recommended: Mind maps, infographics, color coding notes.</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
                  <h4 style="color: #006D77; margin-bottom: 10px;">👂 Auditory ${vakDominant==='Auditory' ? '<span style="background:#006D77;color:white;padding:4px 8px;border-radius:12px;font-size:0.8em;">Dominant</span>' : ''}</h4>
                  ${vak ? `<div style="margin: 6px 0 12px; font-weight: 700; color: #333;">Score: ${Math.round((vak.Auditory/5)*100)}%</div>` : ''}
                  <p style="font-size: 0.95em; line-height: 1.6;">You excel with lectures, discussions, and verbal explanations. Recommended: Audio recordings, group discussions, verbal repetition.</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
                  <h4 style="color: #006D77; margin-bottom: 10px;">✋ Kinesthetic ${vakDominant==='Kinesthetic' ? '<span style="background:#006D77;color:white;padding:4px 8px;border-radius:12px;font-size:0.8em;">Dominant</span>' : ''}</h4>
                  ${vak ? `<div style="margin: 6px 0 12px; font-weight: 700; color: #333;">Score: ${Math.round((vak.Kinesthetic/5)*100)}%</div>` : ''}
                  <p style="font-size: 0.95em; line-height: 1.6;">Hands-on learning through doing and movement works best. Recommended: Lab work, physical models, role-play activities.</p>
                </div>
              </div>
            </div>

            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px;">
              <h3 style="margin-top: 0;">Five Senses Learning Integration</h3>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px;">
                <div style="background: white; padding: 20px; border-radius: 10px; border-left: 5px solid #5390D9;">
                  <h4 style="color: #5390D9; margin-bottom: 10px;">👁️ Visual Processing</h4>
                  <p style="font-size: 0.9em; margin-bottom: 10px;">Prefer diagrams, colors, spatial layouts, and written instructions.</p>
                  <ul style="font-size: 0.85em; line-height: 1.8;">
                    <li>Use highlighters and color-coded notes</li>
                    <li>Create visual summaries and concept maps</li>
                    <li>Watch educational videos and demonstrations</li>
                  </ul>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; border-left: 5px solid #7209B7;">
                  <h4 style="color: #7209B7; margin-bottom: 10px;">👂 Auditory Processing</h4>
                  <p style="font-size: 0.9em; margin-bottom: 10px;">Excel with spoken information, discussions, and rhythmic patterns.</p>
                  <ul style="font-size: 0.85em; line-height: 1.8;">
                    <li>Record lectures and listen multiple times</li>
                    <li>Participate in study groups</li>
                    <li>Use mnemonic devices and songs</li>
                  </ul>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; border-left: 5px solid #F72585;">
                  <h4 style="color: #F72585; margin-bottom: 10px;">✋ Kinesthetic/Tactile</h4>
                  <p style="font-size: 0.9em; margin-bottom: 10px;">Learn through physical activity, touch, and hands-on experience.</p>
                  <ul style="font-size: 0.85em; line-height: 1.8;">
                    <li>Use physical models and manipulatives</li>
                    <li>Take frequent study breaks with movement</li>
                    <li>Engage in lab work and practical projects</li>
                  </ul>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; border-left: 5px solid #4CC9F0;">
                  <h4 style="color: #4CC9F0; margin-bottom: 10px;">👃👅 Olfactory & Gustatory</h4>
                  <p style="font-size: 0.9em; margin-bottom: 10px;">Memory associations with scents and tastes enhance recall.</p>
                  <ul style="font-size: 0.85em; line-height: 1.8;">
                    <li>Use specific scents during study sessions</li>
                    <li>Associate concepts with sensory experiences</li>
                    <li>Create contextual learning environments</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Page 6: Detailed Aptitude Breakdown -->
          <div class="page">
            <div class="header">
              <h1>Detailed Aptitude Analysis</h1>
            </div>

            <h2>Complete Domain Assessment</h2>
            <p style="font-size: 1.1em; margin-bottom: 30px; color: #666;">
              A comprehensive breakdown of your performance across all assessed domains.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.95em;">
              <thead>
                <tr style="background: linear-gradient(135deg, #006D77, #83C5BE); color: white;">
                  <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Rank</th>
                  <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Domain</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Score</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Questions</th>
                  <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Proficiency Level</th>
                </tr>
              </thead>
              <tbody>
                ${finalScores.map((score: any, index: number) => {
                  const level = score.score >= 4.0 ? 'Excellent' : score.score >= 3.5 ? 'Strong' : score.score >= 3.0 ? 'Good' : score.score >= 2.5 ? 'Moderate' : 'Developing';
                  const levelColor = score.score >= 4.0 ? '#006D77' : score.score >= 3.5 ? '#83C5BE' : score.score >= 3.0 ? '#FFDDD2' : score.score >= 2.5 ? '#E29578' : '#ccc';
                  return `
                    <tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">#${index + 1}</td>
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600;">${score.domain}</td>
                      <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 1.2em; font-weight: bold; color: ${levelColor};">${score.score.toFixed(2)}/5.0</td>
                      <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${score.count}</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">
                        <span style="background: ${levelColor}; color: ${score.score >= 3.0 ? 'white' : '#333'}; padding: 6px 12px; border-radius: 15px; font-size: 0.9em; font-weight: 600;">${level}</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 25px; border-radius: 15px; margin-top: 30px;">
              <h3 style="margin-top: 0; color: #006D77;">Score Interpretation Guide</h3>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #006D77;">
                  <h4 style="margin: 0 0 10px 0; color: #006D77;">4.0 - 5.0: Excellent</h4>
                  <p style="font-size: 0.9em; margin: 0;">This is a core strength area. You show exceptional aptitude and should consider careers heavily utilizing this domain.</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #83C5BE;">
                  <h4 style="margin: 0 0 10px 0; color: #83C5BE;">3.0 - 3.9: Strong/Good</h4>
                  <p style="font-size: 0.9em; margin: 0;">You have solid competence in this area. With focused development, this can become a primary strength.</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #E29578;">
                  <h4 style="margin: 0 0 10px 0; color: #E29578;">2.0 - 2.9: Developing</h4>
                  <p style="font-size: 0.9em; margin: 0;">This area shows potential for growth. Consider skill-building activities if it aligns with career interests.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Page 7: Educational Pathways -->
          <div class="page">
            <div class="header">
              <h1>Educational Pathways & Skill Development</h1>
            </div>

            <h2>Recommended Educational Routes</h2>
            <p style="font-size: 1.1em; margin-bottom: 30px; color: #666;">
              Based on your top strengths, here are educational paths and skill development recommendations.
            </p>

            ${topDomains.slice(0, 3).map((domain: any, idx: number) => `
              <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 25px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #006D77;">
                <h3 style="margin-top: 0; color: #006D77;">${idx + 1}. ${domain.domain} Development Path (Score: ${domain.score.toFixed(1)}/5.0)</h3>
                
                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                  <h4 style="color: #333; margin-bottom: 15px;">🎓 Degree Programs</h4>
                  <ul style="line-height: 1.8; font-size: 0.95em;">
                    ${domain.domain === 'Analytical' ? `
                      <li>Bachelor's/Master's in Data Science, Mathematics, or Statistics</li>
                      <li>Engineering programs (Computer Science, Electrical, Mechanical)</li>
                      <li>Economics, Finance, or Business Analytics</li>
                    ` : domain.domain === 'Technical' ? `
                      <li>Computer Science or Software Engineering</li>
                      <li>Information Technology or Cybersecurity</li>
                      <li>Engineering disciplines (Mechanical, Civil, Electrical)</li>
                    ` : domain.domain === 'Creative' ? `
                      <li>Graphic Design, Fine Arts, or Visual Communication</li>
                      <li>Architecture or Interior Design</li>
                      <li>Creative Writing or Digital Media</li>
                    ` : domain.domain === 'Social' ? `
                      <li>Psychology, Counseling, or Social Work</li>
                      <li>Human Resources Management</li>
                      <li>Education or Teaching degrees</li>
                    ` : domain.domain === 'Verbal' ? `
                      <li>English Literature, Journalism, or Communications</li>
                      <li>Law or Legal Studies</li>
                      <li>Public Relations or Marketing</li>
                    ` : `
                      <li>Interdisciplinary studies aligned with ${domain.domain}</li>
                      <li>Professional certification programs</li>
                      <li>Vocational training relevant to your interests</li>
                    `}
                  </ul>
                </div>

                <div style="background: white; padding: 20px; border-radius: 10px;">
                  <h4 style="color: #333; margin-bottom: 15px;">💡 Skills to Develop</h4>
                  <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${domain.domain === 'Analytical' ? `
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Statistical Analysis</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Critical Thinking</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Data Visualization</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Research Methods</span>
                    ` : domain.domain === 'Technical' ? `
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Programming</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">System Design</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Problem Solving</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Technical Documentation</span>
                    ` : domain.domain === 'Creative' ? `
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Design Thinking</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Visual Communication</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Innovation</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Portfolio Building</span>
                    ` : `
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Core Competencies</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Professional Development</span>
                      <span style="background: #006D77; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">Industry Knowledge</span>
                    `}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Page 8: Action Plan & Next Steps -->
          <div class="page">
            <div class="header">
              <h1>Your Personalized Action Plan</h1>
            </div>

            <h2>90-Day Career Development Roadmap</h2>
            <p style="font-size: 1.1em; margin-bottom: 30px; color: #666;">
              A structured plan to help you take actionable steps toward your ideal career path.
            </p>

            <div style="background: linear-gradient(135deg, #5390D9, #7209B7); color: white; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: white;">Phase 1: Immediate Actions (Days 1-30)</h3>
              <ul style="font-size: 1.05em; line-height: 2;">
                <li>Research at least 5 careers aligned with your top domain: <strong>${topDomains[0].domain}</strong></li>
                <li>Create a LinkedIn profile or update your professional portfolio</li>
                <li>Identify 3 professionals in your field of interest and reach out for informational interviews</li>
                <li>Enroll in one online course or workshop related to your strengths</li>
                <li>Start a learning journal to track your progress and insights</li>
              </ul>
            </div>

            <div style="background: linear-gradient(135deg, #F72585, #4CC9F0); color: white; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: white;">Phase 2: Skill Building (Days 31-60)</h3>
              <ul style="font-size: 1.05em; line-height: 2;">
                <li>Complete your first certification or course in ${topDomains[0].domain}</li>
                <li>Start a personal project showcasing your top skills</li>
                <li>Join professional groups or communities (LinkedIn, Discord, local meetups)</li>
                <li>Attend at least 2 industry webinars or networking events</li>
                <li>Practice your skills through volunteer work or freelance opportunities</li>
              </ul>
            </div>

            <div style="background: linear-gradient(135deg, #E29578, #FFDDD2); color: #333; padding: 25px; border-radius: 15px;">
              <h3 style="margin-top: 0; color: #333;">Phase 3: Career Launch (Days 61-90)</h3>
              <ul style="font-size: 1.05em; line-height: 2;">
                <li>Apply to 5-10 internships, entry-level positions, or educational programs</li>
                <li>Complete your portfolio or resume showcasing all new skills</li>
                <li>Schedule a career counseling session with Srichakra Academy</li>
                <li>Set specific career goals for the next 6 months and 1 year</li>
                <li>Create a personal brand statement reflecting your unique strengths</li>
              </ul>
            </div>
          </div>

          <!-- Page 9: Resources & Support -->
          <div class="page">
            <div class="header">
              <h1>Resources & Continued Support</h1>
            </div>

            <h2>Tools & Platforms for Your Journey</h2>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin-bottom: 25px;">
              <h3 style="margin-top: 0; color: #006D77;">📚 Online Learning Platforms</h3>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
                <div style="background: white; padding: 15px; border-radius: 10px;">
                  <h4 style="margin: 0 0 10px 0;">For Technical Skills</h4>
                  <ul style="font-size: 0.9em; line-height: 1.8;">
                    <li>Coursera, edX, Udacity</li>
                    <li>freeCodeCamp, Codecademy</li>
                    <li>Khan Academy, MIT OpenCourseWare</li>
                  </ul>
                </div>
                <div style="background: white; padding: 15px; border-radius: 10px;">
                  <h4 style="margin: 0 0 10px 0;">For Creative & Business Skills</h4>
                  <ul style="font-size: 0.9em; line-height: 1.8;">
                    <li>LinkedIn Learning, Skillshare</li>
                    <li>Domestika, CreativeLive</li>
                    <li>HubSpot Academy, Google Digital Garage</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #83C5BE, #006D77); color: white; padding: 25px; border-radius: 15px; margin-bottom: 25px;">
              <h3 style="margin-top: 0; color: white;">🎯 Career Exploration Tools</h3>
              <ul style="font-size: 1.05em; line-height: 2;">
                <li><strong>O*NET Online:</strong> Comprehensive occupation database with salary info</li>
                <li><strong>LinkedIn Jobs:</strong> Explore job postings and required skills in your field</li>
                <li><strong>Glassdoor:</strong> Company reviews, salary data, and interview insights</li>
                <li><strong>Indeed Career Guide:</strong> Articles and resources for career planning</li>
                <li><strong>Bureau of Labor Statistics:</strong> Employment projections and trends</li>
              </ul>
            </div>

            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px;">
              <h3 style="margin-top: 0; color: #006D77;">💼 Srichakra Academy Support Services</h3>
              <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 15px;">
                <ul style="font-size: 1.05em; line-height: 2;">
                  <li>One-on-one career counseling sessions</li>
                  <li>Monthly career development workshops</li>
                  <li>Mentorship program with industry professionals</li>
                  <li>Resume and portfolio review services</li>
                  <li>Interview preparation and mock interviews</li>
                  <li>Networking events and alumni connections</li>
                </ul>
                <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #FFDDD2, #E29578); border-radius: 10px; text-align: center;">
                  <h4 style="margin: 0 0 10px 0; color: #333;">📞 Schedule Your Free Consultation</h4>
                  <p style="margin: 0; font-size: 1.1em; font-weight: bold; color: #333;">Call: +91-98430 30697</p>
                  <p style="margin: 5px 0 0 0; font-size: 0.95em; color: #666;">or visit srichakraacademy.org</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Page 10: Important Notes & Disclaimer -->
          <div class="page">
            <div class="header">
              <h1>Important Information</h1>
            </div>

            <div style="background: linear-gradient(135deg, #fff3cd, #ffeaa7); padding: 25px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #f0ad4e;">
              <h2 style="margin-top: 0; color: #8a6d3b;">⚠️ Assessment Disclaimer</h2>
              <p style="font-size: 1.05em; line-height: 1.8; color: #333;">
                This career assessment is designed to provide guidance and insights based on your responses to a comprehensive psychometric questionnaire. 
                While the results are based on validated frameworks including RIASEC, Multiple Intelligences, and VAK learning styles, they should be considered 
                as <strong>one tool</strong> in your career planning process, not the sole determinant of your future path.
              </p>
              <p style="font-size: 1.05em; line-height: 1.8; color: #333;">
                <strong>Please consider:</strong>
              </p>
              <ul style="font-size: 1.05em; line-height: 1.8; color: #333;">
                <li>Your interests, passions, and personal values</li>
                <li>Current job market conditions and future trends</li>
                <li>Educational requirements and financial considerations</li>
                <li>Work-life balance preferences and lifestyle goals</li>
                <li>Opportunities for growth and skill development</li>
              </ul>
            </div>

            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
              <h2 style="margin-top: 0; color: #006D77;">📊 About This Assessment</h2>
              <p style="font-size: 1.05em; line-height: 1.8;">
                <strong>Assessment Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
                <strong>Total Questions:</strong> ${totalAnswered} out of 60<br>
                <strong>Domains Analyzed:</strong> ${finalScores.length}<br>
                <strong>Assessment Type:</strong> Comprehensive Psychometric Evaluation<br>
                <strong>Frameworks Used:</strong> RIASEC, Multiple Intelligences (MI), VAK Learning Styles, Brain Dominance Theory
              </p>
            </div>

            <div style="background: linear-gradient(135deg, #d4edda, #c3e6cb); padding: 25px; border-radius: 15px; border-left: 5px solid #28a745;">
              <h2 style="margin-top: 0; color: #155724;">✅ Next Steps Recommendation</h2>
              <p style="font-size: 1.05em; line-height: 1.8; color: #155724;">
                We strongly encourage you to:
              </p>
              <ol style="font-size: 1.05em; line-height: 1.8; color: #155724;">
                <li><strong>Discuss these results</strong> with parents, teachers, or mentors</li>
                <li><strong>Schedule a consultation</strong> with a Srichakra Academy career counselor</li>
                <li><strong>Explore educational options</strong> aligned with your top domains</li>
                <li><strong>Gain practical experience</strong> through internships or projects</li>
                <li><strong>Reassess periodically</strong> as your interests and skills evolve</li>
              </ol>
            </div>

            <div style="margin-top: 40px; text-align: center; padding: 30px; background: linear-gradient(135deg, #006D77, #83C5BE); border-radius: 15px; color: white;">
              <div style="font-size: 3em; margin-bottom: 15px;">🎓</div>
              <h2 style="margin: 0 0 15px 0; color: white;">Thank You for Choosing Srichakra Academy</h2>
              <p style="font-size: 1.2em; margin: 0 0 20px 0; opacity: 0.95;">
                "The School To identify Your Child's Divine Gift!!"
              </p>
              <div style="background: white; color: #006D77; padding: 20px; border-radius: 10px; display: inline-block;">
                <p style="margin: 0 0 10px 0; font-size: 1.1em; font-weight: bold;">Contact Us</p>
                <p style="margin: 0; font-size: 1.05em;">🌐 www.srichakraacademy.org</p>
                <p style="margin: 5px 0 0 0; font-size: 1.05em;">📞 +91-98430 30697</p>
              </div>
            </div>
          </div>

          <!-- Final Page: Closing -->
          <div class="page">

            window.onload = () => { 
              setTimeout(() => window.print(), 500); 
            };
          </script>
        </body>
      </html>`);
    w.document.close();
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  // If a maintenance window is desired later, toggle CAREER_ASSESSMENT_PAUSED back to true.

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
                  <p className="text-gray-600">Students</p>
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
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Preview Sample Report</h4>
                  <p className="text-blue-600 text-sm mb-3">
                    Want to see what your final report will look like? View our sample report to preview the layout and format.
                  </p>
                  <Button 
                    onClick={generateSamplePDF}
                    variant="outline" 
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    📄 View Sample Report
                  </Button>
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

  // Intro landing page (SCOPE) before starting the assessment
  if (currentStep === -1) {
    return (
      <div className="min-h-screen bg-teal-600">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col items-center mb-10">
              <div className="h-20 w-20 mb-4">
                <img src={sriYantraLogo} alt="Sri Yantra Symbol" className="h-full w-full object-cover rounded-full shadow-lg" />
              </div>
              <SrichakraText size="4xl" color="text-white" decorative={true} withBorder={false}>Srichakra Academy</SrichakraText>
              <p className="text-white text-lg mt-2 font-medium">The School To identify Your Child's Divine Gift!!</p>
            </div>

            {/* SCOPE Hero */}
            <Card className="bg-white bg-opacity-95 shadow-2xl">
              <CardContent className="p-12">
                {/* Title + Tagline */}
                <div className="text-center mb-10">
                  <h1 className="text-5xl font-bold text-teal-700 mb-4">SCOPE</h1>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-6">Student Career & Opportunity Pathway Evaluation</h2>
                  <p className="text-xl text-teal-600 font-medium italic">Discover your strengths. Explore your possibilities. Shape your future.</p>
                </div>

                {/* Divider */}
                <div className="h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 rounded-full mb-8" />

                {/* Quick facts row (as in screenshot) */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Clock className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold mb-1">15–20 Minutes</h3>
                      <p className="text-gray-600">Complete at your own pace</p>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Users className="h-10 w-10 text-green-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold mb-1">Trusted by 10,000+</h3>
                      <p className="text-gray-600">Students</p>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Award className="h-10 w-10 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold mb-1">Comprehensive Report</h3>
                      <p className="text-gray-600">Personalized insights</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Intro copy */}
                <div className="space-y-6 mb-12">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Welcome to <strong className="text-teal-700">SCOPE</strong>, a comprehensive career assessment created by
                    <strong className="text-teal-700"> Srichakra Career Consultancy</strong> to help you uncover the path that's right for you.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Through an exciting exploration of your <strong>Multiple Intelligences</strong>, <strong>Personality</strong>,
                    <strong> Work Interests</strong>, and <strong>Aptitude</strong>, SCOPE helps you understand what makes you unique — and connects
                    you to careers that match your strengths and passions.
                  </p>
                </div>

                {/* Four feature blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-2xl border border-teal-100 flex items-start space-x-4">
                    <div className="h-10 w-10 text-teal-700 flex items-center justify-center mt-1">🧠</div>
                    <div>
                      <h3 className="text-2xl font-bold text-teal-700 mb-2">Multiple Intelligences</h3>
                      <p className="text-gray-600">Discover your natural learning style and cognitive strengths across 8 intelligence types.</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 flex items-start space-x-4">
                    <div className="h-10 w-10 text-indigo-700 flex items-center justify-center mt-1">🎯</div>
                    <div>
                      <h3 className="text-2xl font-bold text-indigo-700 mb-2">Personality Assessment</h3>
                      <p className="text-gray-600">Understand your unique personality traits and how they influence your career choices.</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 flex items-start space-x-4">
                    <div className="h-10 w-10 text-purple-700 flex items-center justify-center mt-1">💡</div>
                    <div>
                      <h3 className="text-2xl font-bold text-purple-700 mb-2">Work Interests</h3>
                      <p className="text-gray-600">Identify what motivates and excites you in a professional environment.</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 flex items-start space-x-4">
                    <div className="h-10 w-10 text-green-700 flex items-center justify-center mt-1">📈</div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-700 mb-2">Aptitude Analysis</h3>
                      <p className="text-gray-600">Measure your natural abilities and potential for success in different career fields.</p>
                    </div>
                  </div>
                </div>

                {/* What you'll receive */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-xl mb-10 border-2 border-amber-200">
                  <h3 className="text-2xl font-bold text-amber-800 mb-6 text-center">What You'll Receive</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3"><CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" /><span className="text-gray-700 text-lg">Comprehensive 10+ page personalized career report</span></div>
                    <div className="flex items-center space-x-3"><CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" /><span className="text-gray-700 text-lg">Detailed analysis of your strengths across multiple domains</span></div>
                    <div className="flex items-center space-x-3"><CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" /><span className="text-gray-700 text-lg">Brain hemisphere dominance insights</span></div>
                    <div className="flex items-center space-x-3"><CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" /><span className="text-gray-700 text-lg">Personalized career recommendations and pathways</span></div>
                    <div className="flex items-center space-x-3"><CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" /><span className="text-gray-700 text-lg">90-day action plan for career development</span></div>
                    <div className="flex items-center space-x-3"><CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" /><span className="text-gray-700 text-lg">Learning style recommendations and resources</span></div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-800">Take the test. Discover yourself. Your future starts here!</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3" onClick={() => setCurrentStep(0)}>
                    Start Assessment
                  </Button>
                  <Button size="lg" variant="outline" className="px-8 py-3 bg-white text-teal-700 border-white hover:bg-gray-100" onClick={generateSamplePDF}>
                    📄 View Sample Report
                  </Button>
                  <Link href="/">
                    <Button size="lg" variant="outline" className="px-8 py-3">Back to Home</Button>
                  </Link>
                </div>
                <p className="text-center text-gray-500 mt-4">⏱️ Takes approximately 15–20 minutes to complete</p>

                {/* Footer helper */}
                <div className="mt-10 pt-6 border-t">
                  <p className="text-center text-gray-600">
                    Need assistance? Contact us at <a href="tel:+919843030697" className="text-teal-700 font-semibold">+91-98430 30697</a> or visit
                    <a href="https://srichakraacademy.org" target="_blank" rel="noreferrer noopener" className="text-teal-700 font-semibold"> srichakraacademy.org</a>
                  </p>
                </div>
              </CardContent>
            </Card>
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
                  {pdfUrl && (
                    <a href={pdfUrl} target="_blank" rel="noreferrer" className="px-6 py-2 border rounded-md text-blue-700 border-blue-300 hover:bg-blue-50">
                      View Saved PDF
                    </a>
                  )}
                  {!pdfUrl && saving && (
                    <span className="text-sm text-gray-500 self-center">Saving PDF…</span>
                  )}
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
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={generateSamplePDF}
              className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              📄 View Sample Report
            </Button>
          </div>
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
                {currentQuestion.domain} • {(currentQuestion.frameworks || []).join(', ')}
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
