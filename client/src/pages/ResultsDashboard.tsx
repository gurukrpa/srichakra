import React from 'react';
import { Brain, User, Briefcase, Heart, Target, Download, Share2, Star, TrendingUp } from 'lucide-react';

interface AssessmentResults {
  studentInfo: {
    name: string;
    grade: string;
    age: string;
    school: string;
    date: string;
  };
  responses: Array<{ questionId: number; score: number }>;
  domainScores: {
    MI: { [key: string]: number };
    MBTI: { [key: string]: number };
    RIASEC: { [key: string]: number };
    VALUES: { [key: string]: number };
    APTITUDE: { [key: string]: number };
  };
  mbtiType: string;
  topCareerClusters: Array<{
    name: string;
    score: number;
    description: string;
    careers: string[];
  }>;
}

interface ResultsDashboardProps {
  results: AssessmentResults;
  onGeneratePDF: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, onGeneratePDF }) => {
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

  const getDomainLabel = (domain: string) => {
    if (domain === 'APTITUDE') return 'Interest & Confidence (Self-Reported)';
    return domain;
  };

  const RadarChart: React.FC<{ data: { [key: string]: number }; domain: string }> = ({ data, domain }) => {
    const center = 150;
    const radius = 120;
    const maxValue = 5;

    const dataPoints = Object.entries(data);
    const angleStep = (2 * Math.PI) / dataPoints.length;

    const getPointPosition = (value: number, index: number) => {
      const angle = index * angleStep - Math.PI / 2;
      const distance = (value / maxValue) * radius;
      return {
        x: center + distance * Math.cos(angle),
        y: center + distance * Math.sin(angle)
      };
    };

    const pathData = dataPoints.map((_, index) => {
      const point = getPointPosition(dataPoints[index][1], index);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ') + ' Z';

    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: domainColors[domain as keyof typeof domainColors] }}>
          {getDomainLabel(domain)} Profile
        </h3>
        <svg width="300" height="300" className="mx-auto">
          {/* Grid circles */}
          {[1, 2, 3, 4, 5].map(level => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={(level / maxValue) * radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Grid lines */}
          {dataPoints.map((_, index) => {
            const endPoint = getPointPosition(maxValue, index);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <path
            d={pathData}
            fill={domainColors[domain as keyof typeof domainColors]}
            fillOpacity="0.2"
            stroke={domainColors[domain as keyof typeof domainColors]}
            strokeWidth="2"
          />

          {/* Data points */}
          {dataPoints.map(([key, value], index) => {
            const point = getPointPosition(value, index);
            return (
              <circle
                key={key}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={domainColors[domain as keyof typeof domainColors]}
              />
            );
          })}

          {/* Labels */}
          {dataPoints.map(([key], index) => {
            const labelPoint = getPointPosition(maxValue + 0.5, index);
            return (
              <text
                key={key}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {key.length > 10 ? key.substring(0, 10) + '...' : key}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const BarChart: React.FC<{ data: { [key: string]: number }; domain: string }> = ({ data, domain }) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4" style={{ color: domainColors[domain as keyof typeof domainColors] }}>
          {getDomainLabel(domain)} Breakdown
        </h3>
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{key}</span>
                <span className="text-sm font-bold" style={{ color: domainColors[domain as keyof typeof domainColors] }}>
                  {value.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(value / maxValue) * 100}%`,
                    backgroundColor: domainColors[domain as keyof typeof domainColors]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MBTICard: React.FC = () => {
    const mbtiDescriptions = {
      'INTJ': 'The Architect - Strategic, independent, and innovative thinkers',
      'INTP': 'The Thinker - Analytical, logical, and creative problem-solvers',
      'ENTJ': 'The Commander - Natural leaders who are strategic and decisive',
      'ENTP': 'The Debater - Enthusiastic, creative, and sociable innovators',
      'INFJ': 'The Advocate - Insightful, principled, and passionate idealists',
      'INFP': 'The Mediator - Flexible, charming, and always ready to help',
      'ENFJ': 'The Protagonist - Charismatic, inspiring, and natural leaders',
      'ENFP': 'The Campaigner - Enthusiastic, creative, and people-focused',
      'ISTJ': 'The Logistician - Practical, reliable, and methodical',
      'ISFJ': 'The Protector - Warm-hearted, conscientious, and cooperative',
      'ESTJ': 'The Executive - Organized, practical, and decisive leaders',
      'ESFJ': 'The Consul - Caring, social, and eager to help others',
      'ISTP': 'The Virtuoso - Practical, observant, and adaptable',
      'ISFP': 'The Adventurer - Gentle, caring, and artistically inclined',
      'ESTP': 'The Entrepreneur - Energetic, perceptive, and spontaneous',
      'ESFP': 'The Entertainer - Enthusiastic, friendly, and spontaneous'
    };

    return (
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center mb-4">
          <User className="w-8 h-8 mr-3" />
          <h3 className="text-xl font-bold">Your Personality Type</h3>
        </div>
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{results.mbtiType}</div>
          <div className="text-lg font-medium mb-3">
            {mbtiDescriptions[results.mbtiType as keyof typeof mbtiDescriptions]}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-sm opacity-75">Energy</div>
              <div className="font-bold">
                {results.mbtiType[0] === 'E' ? 'Extraversion' : 'Introversion'}
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-sm opacity-75">Information</div>
              <div className="font-bold">
                {results.mbtiType[1] === 'S' ? 'Sensing' : 'Intuition'}
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-sm opacity-75">Decisions</div>
              <div className="font-bold">
                {results.mbtiType[2] === 'T' ? 'Thinking' : 'Feeling'}
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-sm opacity-75">Structure</div>
              <div className="font-bold">
                {results.mbtiType[3] === 'J' ? 'Judging' : 'Perceiving'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CareerClustersCard: React.FC = () => {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
          <h3 className="text-xl font-bold text-gray-800">Top Career Clusters</h3>
        </div>
        <div className="space-y-4">
          {results.topCareerClusters.map((cluster, index) => (
            <div key={cluster.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                    {index + 1}
                  </div>
                  <h4 className="font-semibold text-lg text-gray-800">{cluster.name}</h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{cluster.score}%</div>
                  <div className="text-xs text-gray-500">Match</div>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{cluster.description}</p>
              <div className="flex flex-wrap gap-2">
                {cluster.careers.slice(0, 4).map(career => (
                  <span key={career} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {career}
                  </span>
                ))}
                {cluster.careers.length > 4 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    +{cluster.careers.length - 4} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {results.studentInfo.name}'s Career Assessment Results
              </h1>
              <div className="text-gray-600 space-y-1">
                <p>Grade: {results.studentInfo.grade} • Age: {results.studentInfo.age}</p>
                {results.studentInfo.school && <p>School: {results.studentInfo.school}</p>}
                <p>Assessment Date: {results.studentInfo.date}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onGeneratePDF}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </button>
            </div>
          </div>
        </div>

        {/* MBTI Personality Type */}
        <div className="mb-6">
          <MBTICard />
        </div>

        {/* Career Clusters */}
        <div className="mb-6">
          <CareerClustersCard />
        </div>

        {/* Domain Analysis Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {Object.entries(results.domainScores).map(([domain, scores]) => (
            <RadarChart key={domain} data={scores} domain={domain} />
          ))}
        </div>

        {/* Detailed Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {Object.entries(results.domainScores).map(([domain, scores]) => (
            <BarChart key={`${domain}-bar`} data={scores} domain={domain} />
          ))}
        </div>

        {/* Summary Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Star className="w-6 h-6 mr-2 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-800">Key Insights & Recommendations</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Your Strengths</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Strong {Object.entries(results.domainScores.MI).reduce((a, b) => results.domainScores.MI[a[0]] > results.domainScores.MI[b[0]] ? a : b)[0]} intelligence
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {results.mbtiType} personality traits align well with leadership roles
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  High interest in {Object.entries(results.domainScores.RIASEC).reduce((a, b) => results.domainScores.RIASEC[a[0]] > results.domainScores.RIASEC[b[0]] ? a : b)[0]} activities
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Development Areas</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Consider developing skills in areas with lower scores
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Explore careers that combine your top interests
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Build experience through internships and projects
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
