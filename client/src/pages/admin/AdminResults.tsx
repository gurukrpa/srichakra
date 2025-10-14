import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Users, Eye, Calendar, Mail, Phone } from 'lucide-react';
import SrichakraText from '@/components/custom/SrichakraText';
import sriYantraLogo from '../../assets/images/logo/sri-yantra.png';

interface AssessmentResult {
  id: number;
  userEmail: string;
  userName: string;
  phone?: string;
  completedAt: string;
  results: {
    domain: string;
    score: number;
    count: number;
  }[];
  answers: Record<number, number>;
}

const AdminResults = () => {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockResults: AssessmentResult[] = [
        {
          id: 1,
          userEmail: 'student1@example.com',
          userName: 'Rahul Sharma',
          phone: '+91 9876543210',
          completedAt: '2025-01-10T14:30:00Z',
          results: [
            { domain: 'Analytical', score: 4.2, count: 8 },
            { domain: 'Technical', score: 3.8, count: 6 },
            { domain: 'Creative', score: 3.5, count: 4 },
            { domain: 'Social', score: 3.2, count: 5 },
            { domain: 'Verbal', score: 4.0, count: 7 }
          ],
          answers: { 1: 4, 2: 5, 3: 4, 4: 3, 5: 4 }
        },
        {
          id: 2,
          userEmail: 'student2@example.com',
          userName: 'Priya Patel',
          phone: '+91 8765432109',
          completedAt: '2025-01-09T10:15:00Z',
          results: [
            { domain: 'Creative', score: 4.5, count: 6 },
            { domain: 'Verbal', score: 4.1, count: 8 },
            { domain: 'Social', score: 3.9, count: 7 },
            { domain: 'Analytical', score: 3.4, count: 5 },
            { domain: 'Technical', score: 3.0, count: 4 }
          ],
          answers: { 1: 3, 2: 4, 3: 5, 4: 4, 5: 3 }
        },
        {
          id: 3,
          userEmail: 'student3@example.com',
          userName: 'Arjun Kumar',
          phone: '+91 7654321098',
          completedAt: '2025-01-08T16:45:00Z',
          results: [
            { domain: 'Technical', score: 4.7, count: 9 },
            { domain: 'Analytical', score: 4.3, count: 8 },
            { domain: 'Verbal', score: 3.6, count: 6 },
            { domain: 'Social', score: 3.1, count: 4 },
            { domain: 'Creative', score: 2.8, count: 3 }
          ],
          answers: { 1: 5, 2: 4, 3: 5, 4: 3, 5: 4 }
        }
      ];
      setResults(mockResults);
      setIsLoading(false);
    }, 1000);
  }, []);

  const generatePDF = async (result: AssessmentResult) => {
    // Create a simple HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Career Assessment Report - ${result.userName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4A9B9B; padding-bottom: 20px; }
          .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
          .title { color: #4A9B9B; font-size: 28px; font-weight: bold; margin: 10px 0; }
          .subtitle { color: #666; font-size: 16px; }
          .section { margin: 30px 0; }
          .section h2 { color: #4A9B9B; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .user-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .result-card { background: #fff; border: 2px solid #e9ecef; border-radius: 8px; padding: 15px; text-align: center; }
          .result-card.top { border-color: #4A9B9B; background: #f0f9f9; }
          .score { font-size: 24px; font-weight: bold; color: #4A9B9B; }
          .domain { font-size: 14px; color: #666; margin-top: 5px; }
          .recommendations { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Srichakra Academy</div>
          <div class="subtitle">Career Assessment Report</div>
          <div class="subtitle">The School To identify Your Child's Divine Gift!!</div>
        </div>
        
        <div class="user-info">
          <h2>Student Information</h2>
          <p><strong>Name:</strong> ${result.userName}</p>
          <p><strong>Email:</strong> ${result.userEmail}</p>
          <p><strong>Phone:</strong> ${result.phone || 'N/A'}</p>
          <p><strong>Assessment Date:</strong> ${new Date(result.completedAt).toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h2>Assessment Results</h2>
          <div class="results-grid">
            ${result.results.map((r, index) => `
              <div class="result-card ${index < 2 ? 'top' : ''}">
                <div class="score">${r.score.toFixed(1)}/5.0</div>
                <div class="domain">${r.domain}</div>
                <div style="font-size: 12px; color: #888;">${r.count} questions</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="recommendations">
          <h2>Career Recommendations</h2>
          <p>Based on your assessment results, here are your top domain strengths:</p>
          <ul>
            ${result.results.slice(0, 3).map(r => `
              <li><strong>${r.domain}:</strong> Score ${r.score.toFixed(1)} - ${getCareerSuggestion(r.domain)}</li>
            `).join('')}
          </ul>
        </div>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} | Srichakra Academy</p>
          <p>For detailed career guidance, contact us at info@srichakra.com</p>
        </div>
      </body>
      </html>
    `;

    // Create and download the PDF
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Career_Assessment_${result.userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCareerSuggestion = (domain: string): string => {
    const suggestions: Record<string, string> = {
      'Analytical': 'Data Science, Research, Engineering, Finance',
      'Technical': 'Software Development, IT, Engineering, Technology',
      'Creative': 'Design, Arts, Media, Marketing, Architecture', 
      'Social': 'Teaching, Counseling, Human Resources, Social Work',
      'Verbal': 'Writing, Journalism, Law, Communications',
      'Musical': 'Music, Sound Engineering, Entertainment',
      'Naturalistic': 'Environmental Science, Biology, Agriculture'
    };
    return suggestions[domain] || 'Various career paths available';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-teal-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading assessment results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-600">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 mb-4">
            <img 
              src={sriYantraLogo} 
              alt="Sri Yantra Symbol" 
              className="h-full w-full object-cover rounded-full shadow-lg"
            />
          </div>
          <SrichakraText size="3xl" color="text-white" decorative={true} withBorder={false}>
            Srichakra Academy
          </SrichakraText>
          <p className="text-white text-lg mt-2 font-medium">
            Admin - Career Assessment Results
          </p>
        </div>

        {!selectedResult ? (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white bg-opacity-90 rounded-2xl p-6 shadow-xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Users className="mr-2" />
                  Assessment Results ({results.length})
                </h2>
                <Badge variant="secondary" className="text-sm">
                  Admin Panel
                </Badge>
              </div>
            </div>

            <div className="grid gap-6">
              {results.map((result) => (
                <Card key={result.id} className="bg-white bg-opacity-95 hover:bg-opacity-100 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-gray-800">{result.userName}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {result.userEmail}
                          </div>
                          {result.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {result.phone}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(result.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedResult(result)}
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => generatePDF(result)}
                          className="bg-teal-600 hover:bg-teal-700 flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {result.results.slice(0, 5).map((r, index) => (
                        <div key={r.domain} className={`text-center p-3 rounded-lg ${
                          index === 0 ? 'bg-teal-100 border-2 border-teal-500' : 'bg-gray-100'
                        }`}>
                          <div className={`text-lg font-bold ${
                            index === 0 ? 'text-teal-700' : 'text-gray-700'
                          }`}>
                            {r.score.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-600">{r.domain}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {results.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white bg-opacity-90 rounded-2xl p-8 max-w-md mx-auto">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Yet</h3>
                  <p className="text-gray-600">Assessment results will appear here once students complete the test.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Detailed view
          <div className="max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-95 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedResult(null)}
                  className="mb-4"
                >
                  ← Back to Results
                </Button>
                <Button
                  onClick={() => generatePDF(selectedResult)}
                  className="bg-teal-600 hover:bg-teal-700 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </Button>
              </div>

              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedResult.userName}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                    <div>Email: {selectedResult.userEmail}</div>
                    <div>Phone: {selectedResult.phone || 'N/A'}</div>
                    <div>Assessment Date: {new Date(selectedResult.completedAt).toLocaleDateString()}</div>
                    <div>Assessment Time: {new Date(selectedResult.completedAt).toLocaleTimeString()}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Domain Scores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedResult.results.map((result, index) => (
                      <div key={result.domain} className={`p-4 rounded-lg border-2 ${
                        index < 2 ? 'bg-teal-50 border-teal-500' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${
                            index < 2 ? 'text-teal-700' : 'text-gray-700'
                          }`}>
                            {result.score.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{result.domain}</div>
                          <div className="text-xs text-gray-500 mt-1">{result.count} questions</div>
                          {index < 2 && <Badge className="mt-2 bg-teal-600">Top Strength</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Career Recommendations</h3>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {selectedResult.results.slice(0, 3).map((result) => (
                        <li key={result.domain} className="flex justify-between">
                          <span className="font-medium">{result.domain}:</span>
                          <span className="text-gray-600">{getCareerSuggestion(result.domain)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResults;
