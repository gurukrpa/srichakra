// Assessment Scoring and Analysis System

export interface AssessmentResponse {
  questionId: number;
  score: number;
}

export interface DomainScores {
  MI: { [key: string]: number };
  MBTI: { [key: string]: number };
  RIASEC: { [key: string]: number };
  VALUES: { [key: string]: number };
  APTITUDE: { [key: string]: number };
}

export interface CareerCluster {
  name: string;
  score: number;
  description: string;
  careers: string[];
  requiredDomains: {
    MI?: string[];
    RIASEC?: string[];
    VALUES?: string[];
    APTITUDE?: string[];
  };
}

// Question mapping to subdomains
const questionMapping = {
  // Multiple Intelligences
  1: { domain: 'MI', subdomain: 'Logical-Mathematical' },
  2: { domain: 'MI', subdomain: 'Linguistic' },
  3: { domain: 'MI', subdomain: 'Spatial' },
  4: { domain: 'MI', subdomain: 'Musical' },
  5: { domain: 'MI', subdomain: 'Bodily-Kinesthetic' },
  6: { domain: 'MI', subdomain: 'Naturalistic' },
  7: { domain: 'MI', subdomain: 'Interpersonal' },
  8: { domain: 'MI', subdomain: 'Intrapersonal' },
  9: { domain: 'MI', subdomain: 'Musical' },
  10: { domain: 'MI', subdomain: 'Linguistic' },
  11: { domain: 'MI', subdomain: 'Logical-Mathematical' },
  12: { domain: 'MI', subdomain: 'Spatial' },
  
  // MBTI
  13: { domain: 'MBTI', subdomain: 'Extraversion' },
  14: { domain: 'MBTI', subdomain: 'Sensing' },
  15: { domain: 'MBTI', subdomain: 'Thinking' },
  16: { domain: 'MBTI', subdomain: 'Judging' },
  17: { domain: 'MBTI', subdomain: 'Introversion' },
  18: { domain: 'MBTI', subdomain: 'Intuition' },
  19: { domain: 'MBTI', subdomain: 'Feeling' },
  20: { domain: 'MBTI', subdomain: 'Perceiving' },
  21: { domain: 'MBTI', subdomain: 'Extraversion' },
  22: { domain: 'MBTI', subdomain: 'Intuition' },
  23: { domain: 'MBTI', subdomain: 'Feeling' },
  24: { domain: 'MBTI', subdomain: 'Judging' },
  
  // RIASEC
  25: { domain: 'RIASEC', subdomain: 'Realistic' },
  26: { domain: 'RIASEC', subdomain: 'Investigative' },
  27: { domain: 'RIASEC', subdomain: 'Artistic' },
  28: { domain: 'RIASEC', subdomain: 'Social' },
  29: { domain: 'RIASEC', subdomain: 'Enterprising' },
  30: { domain: 'RIASEC', subdomain: 'Conventional' },
  31: { domain: 'RIASEC', subdomain: 'Realistic' },
  32: { domain: 'RIASEC', subdomain: 'Investigative' },
  33: { domain: 'RIASEC', subdomain: 'Artistic' },
  34: { domain: 'RIASEC', subdomain: 'Social' },
  35: { domain: 'RIASEC', subdomain: 'Enterprising' },
  36: { domain: 'RIASEC', subdomain: 'Conventional' },
  
  // VALUES
  37: { domain: 'VALUES', subdomain: 'Security' },
  38: { domain: 'VALUES', subdomain: 'Achievement' },
  39: { domain: 'VALUES', subdomain: 'Independence' },
  40: { domain: 'VALUES', subdomain: 'Altruism' },
  41: { domain: 'VALUES', subdomain: 'Variety' },
  42: { domain: 'VALUES', subdomain: 'Lifestyle' },
  43: { domain: 'VALUES', subdomain: 'Economic' },
  44: { domain: 'VALUES', subdomain: 'Prestige' },
  45: { domain: 'VALUES', subdomain: 'Security' },
  46: { domain: 'VALUES', subdomain: 'Achievement' },
  47: { domain: 'VALUES', subdomain: 'Creativity' },
  48: { domain: 'VALUES', subdomain: 'Relationships' },
  
  // APTITUDE
  49: { domain: 'APTITUDE', subdomain: 'Verbal' },
  50: { domain: 'APTITUDE', subdomain: 'Numerical' },
  51: { domain: 'APTITUDE', subdomain: 'Spatial' },
  52: { domain: 'APTITUDE', subdomain: 'Motor' },
  53: { domain: 'APTITUDE', subdomain: 'Abstract' },
  54: { domain: 'APTITUDE', subdomain: 'Memory' },
  55: { domain: 'APTITUDE', subdomain: 'Attention' },
  56: { domain: 'APTITUDE', subdomain: 'Organization' },
  57: { domain: 'APTITUDE', subdomain: 'Learning' },
  58: { domain: 'APTITUDE', subdomain: 'Creative' },
  59: { domain: 'APTITUDE', subdomain: 'Analytical' },
  60: { domain: 'APTITUDE', subdomain: 'Adaptability' }
};

// Career Clusters with weighted mapping
const careerClusters: CareerCluster[] = [
  {
    name: "STEM & Engineering",
    description: "Science, Technology, Engineering, and Mathematics careers requiring analytical thinking and problem-solving skills.",
    careers: ["Software Engineer", "Data Scientist", "Mechanical Engineer", "Research Scientist", "Biotechnology Specialist"],
    score: 0,
    requiredDomains: {
      MI: ['Logical-Mathematical', 'Spatial'],
      RIASEC: ['Investigative', 'Realistic'],
      APTITUDE: ['Numerical', 'Abstract', 'Analytical']
    }
  },
  {
    name: "Healthcare & Medicine",
    description: "Medical and healthcare professions focused on helping others and scientific knowledge.",
    careers: ["Doctor", "Nurse", "Pharmacist", "Physical Therapist", "Medical Researcher"],
    score: 0,
    requiredDomains: {
      MI: ['Interpersonal', 'Logical-Mathematical'],
      RIASEC: ['Social', 'Investigative'],
      VALUES: ['Altruism', 'Achievement'],
      APTITUDE: ['Memory', 'Learning']
    }
  },
  {
    name: "Creative Arts & Design",
    description: "Artistic and creative fields emphasizing innovation, aesthetics, and self-expression.",
    careers: ["Graphic Designer", "Artist", "Musician", "Writer", "Interior Designer"],
    score: 0,
    requiredDomains: {
      MI: ['Spatial', 'Musical', 'Linguistic'],
      RIASEC: ['Artistic'],
      VALUES: ['Creativity', 'Independence'],
      APTITUDE: ['Creative', 'Spatial']
    }
  },
  {
    name: "Education & Training",
    description: "Teaching and educational roles that help others learn and develop skills.",
    careers: ["Teacher", "Professor", "Corporate Trainer", "Educational Consultant", "School Counselor"],
    score: 0,
    requiredDomains: {
      MI: ['Interpersonal', 'Linguistic'],
      RIASEC: ['Social'],
      VALUES: ['Altruism', 'Relationships'],
      APTITUDE: ['Verbal', 'Organization']
    }
  },
  {
    name: "Business & Entrepreneurship",
    description: "Leadership, management, and business development roles in various industries.",
    careers: ["CEO", "Business Analyst", "Marketing Manager", "Entrepreneur", "Sales Director"],
    score: 0,
    requiredDomains: {
      MI: ['Interpersonal', 'Logical-Mathematical'],
      RIASEC: ['Enterprising', 'Conventional'],
      VALUES: ['Achievement', 'Economic', 'Prestige'],
      APTITUDE: ['Analytical', 'Organization']
    }
  },
  {
    name: "Law & Legal Services",
    description: "Legal professions requiring analytical thinking, communication, and ethical reasoning.",
    careers: ["Lawyer", "Judge", "Legal Consultant", "Paralegal", "Legal Researcher"],
    score: 0,
    requiredDomains: {
      MI: ['Linguistic', 'Logical-Mathematical'],
      RIASEC: ['Enterprising', 'Investigative'],
      VALUES: ['Achievement', 'Prestige'],
      APTITUDE: ['Verbal', 'Analytical', 'Memory']
    }
  },
  {
    name: "Media & Communications",
    description: "Journalism, broadcasting, and digital media careers focused on information sharing.",
    careers: ["Journalist", "Public Relations Specialist", "Social Media Manager", "Broadcaster", "Content Creator"],
    score: 0,
    requiredDomains: {
      MI: ['Linguistic', 'Interpersonal'],
      RIASEC: ['Artistic', 'Enterprising'],
      VALUES: ['Creativity', 'Variety'],
      APTITUDE: ['Verbal', 'Creative', 'Adaptability']
    }
  },
  {
    name: "Psychology & Counseling",
    description: "Mental health and human behavior professions helping individuals and communities.",
    careers: ["Psychologist", "Counselor", "Social Worker", "Therapist", "Human Resources Specialist"],
    score: 0,
    requiredDomains: {
      MI: ['Interpersonal', 'Intrapersonal'],
      RIASEC: ['Social', 'Investigative'],
      VALUES: ['Altruism', 'Relationships'],
      APTITUDE: ['Memory', 'Learning', 'Adaptability']
    }
  },
  {
    name: "Finance & Economics",
    description: "Financial analysis, investment, and economic planning careers requiring numerical skills.",
    careers: ["Financial Analyst", "Investment Banker", "Economist", "Accountant", "Financial Planner"],
    score: 0,
    requiredDomains: {
      MI: ['Logical-Mathematical'],
      RIASEC: ['Conventional', 'Enterprising'],
      VALUES: ['Economic', 'Achievement', 'Security'],
      APTITUDE: ['Numerical', 'Analytical', 'Organization']
    }
  },
  {
    name: "Sports & Fitness",
    description: "Athletic, fitness, and sports management careers emphasizing physical abilities.",
    careers: ["Professional Athlete", "Fitness Trainer", "Sports Coach", "Physical Therapist", "Sports Manager"],
    score: 0,
    requiredDomains: {
      MI: ['Bodily-Kinesthetic', 'Interpersonal'],
      RIASEC: ['Realistic', 'Social'],
      VALUES: ['Achievement', 'Lifestyle'],
      APTITUDE: ['Motor', 'Adaptability']
    }
  },
  {
    name: "Environmental Sciences",
    description: "Environmental protection, sustainability, and natural resource management careers.",
    careers: ["Environmental Scientist", "Conservation Biologist", "Sustainability Consultant", "Park Ranger", "Climate Researcher"],
    score: 0,
    requiredDomains: {
      MI: ['Naturalistic', 'Logical-Mathematical'],
      RIASEC: ['Investigative', 'Realistic'],
      VALUES: ['Altruism', 'Independence'],
      APTITUDE: ['Analytical', 'Learning']
    }
  },
  {
    name: "Hospitality & Tourism",
    description: "Service industry careers focused on customer experience and cultural exchange.",
    careers: ["Hotel Manager", "Event Planner", "Travel Agent", "Chef", "Tourism Director"],
    score: 0,
    requiredDomains: {
      MI: ['Interpersonal'],
      RIASEC: ['Enterprising', 'Social'],
      VALUES: ['Relationships', 'Variety'],
      APTITUDE: ['Organization', 'Adaptability']
    }
  },
  {
    name: "Agriculture & Food Science",
    description: "Food production, agricultural technology, and nutrition science careers.",
    careers: ["Agricultural Engineer", "Food Scientist", "Nutritionist", "Farm Manager", "Veterinarian"],
    score: 0,
    requiredDomains: {
      MI: ['Naturalistic', 'Logical-Mathematical'],
      RIASEC: ['Realistic', 'Investigative'],
      VALUES: ['Security', 'Altruism'],
      APTITUDE: ['Learning', 'Organization']
    }
  },
  {
    name: "Transportation & Logistics",
    description: "Supply chain, transportation, and logistics management careers.",
    careers: ["Logistics Manager", "Pilot", "Transportation Engineer", "Supply Chain Analyst", "Fleet Manager"],
    score: 0,
    requiredDomains: {
      MI: ['Spatial', 'Logical-Mathematical'],
      RIASEC: ['Realistic', 'Conventional'],
      VALUES: ['Security', 'Organization'],
      APTITUDE: ['Spatial', 'Organization', 'Attention']
    }
  },
  {
    name: "Public Service & Government",
    description: "Government and public sector careers serving communities and society.",
    careers: ["Civil Servant", "Policy Analyst", "Urban Planner", "Diplomat", "Public Administrator"],
    score: 0,
    requiredDomains: {
      MI: ['Interpersonal', 'Linguistic'],
      RIASEC: ['Social', 'Enterprising'],
      VALUES: ['Altruism', 'Security', 'Prestige'],
      APTITUDE: ['Organization', 'Analytical']
    }
  },
  {
    name: "Manufacturing & Production",
    description: "Industrial production, quality control, and manufacturing management careers.",
    careers: ["Production Manager", "Quality Control Specialist", "Industrial Engineer", "Manufacturing Technician", "Operations Manager"],
    score: 0,
    requiredDomains: {
      MI: ['Logical-Mathematical', 'Spatial'],
      RIASEC: ['Realistic', 'Conventional'],
      VALUES: ['Security', 'Achievement'],
      APTITUDE: ['Organization', 'Attention', 'Motor']
    }
  },
  {
    name: "Real Estate & Construction",
    description: "Property development, construction management, and real estate careers.",
    careers: ["Real Estate Agent", "Construction Manager", "Architect", "Property Developer", "Building Inspector"],
    score: 0,
    requiredDomains: {
      MI: ['Spatial', 'Interpersonal'],
      RIASEC: ['Enterprising', 'Realistic'],
      VALUES: ['Economic', 'Independence'],
      APTITUDE: ['Spatial', 'Organization']
    }
  },
  {
    name: "Information Technology",
    description: "Computer systems, software development, and digital technology careers.",
    careers: ["Software Developer", "IT Manager", "Cybersecurity Specialist", "Database Administrator", "Systems Analyst"],
    score: 0,
    requiredDomains: {
      MI: ['Logical-Mathematical'],
      RIASEC: ['Investigative', 'Conventional'],
      VALUES: ['Achievement', 'Economic'],
      APTITUDE: ['Analytical', 'Abstract', 'Learning']
    }
  },
  {
    name: "Retail & Customer Service",
    description: "Sales, customer service, and retail management careers.",
    careers: ["Retail Manager", "Sales Representative", "Customer Service Manager", "Merchandiser", "Store Manager"],
    score: 0,
    requiredDomains: {
      MI: ['Interpersonal'],
      RIASEC: ['Enterprising', 'Conventional'],
      VALUES: ['Relationships', 'Economic'],
      APTITUDE: ['Organization', 'Adaptability']
    }
  },
  {
    name: "Research & Development",
    description: "Scientific research, innovation, and product development careers.",
    careers: ["Research Scientist", "R&D Manager", "Lab Technician", "Innovation Consultant", "Patent Analyst"],
    score: 0,
    requiredDomains: {
      MI: ['Logical-Mathematical', 'Intrapersonal'],
      RIASEC: ['Investigative'],
      VALUES: ['Achievement', 'Independence'],
      APTITUDE: ['Analytical', 'Learning', 'Abstract']
    }
  }
];

// Calculate domain scores
export const calculateDomainScores = (responses: AssessmentResponse[]): DomainScores => {
  const tempScores: Record<string, Record<string, number[]>> = {
    MI: {},
    MBTI: {},
    RIASEC: {},
    VALUES: {},
    APTITUDE: {}
  };

  // Initialize subdomain scores
  responses.forEach(response => {
    const mapping = questionMapping[response.questionId as keyof typeof questionMapping];
    if (mapping) {
      const { domain, subdomain } = mapping;
      if (!tempScores[domain][subdomain]) {
        tempScores[domain][subdomain] = [];
      }
      tempScores[domain][subdomain].push(response.score);
    }
  });

  // Calculate averages
  const scores: DomainScores = {
    MI: {},
    MBTI: {},
    RIASEC: {},
    VALUES: {},
    APTITUDE: {}
  };

  Object.keys(tempScores).forEach(domain => {
    Object.keys(tempScores[domain]).forEach(subdomain => {
      const subdomainScores = tempScores[domain][subdomain];
      scores[domain as keyof DomainScores][subdomain] = 
        subdomainScores.reduce((sum, score) => sum + score, 0) / subdomainScores.length;
    });
  });

  return scores;
};

// Calculate MBTI type
export const calculateMBTIType = (mbtiScores: { [key: string]: number }): string => {
  const dimensions = {
    'E/I': mbtiScores.Extraversion > mbtiScores.Introversion ? 'E' : 'I',
    'S/N': mbtiScores.Sensing > mbtiScores.Intuition ? 'S' : 'N',
    'T/F': mbtiScores.Thinking > mbtiScores.Feeling ? 'T' : 'F',
    'J/P': mbtiScores.Judging > mbtiScores.Perceiving ? 'J' : 'P'
  };

  return dimensions['E/I'] + dimensions['S/N'] + dimensions['T/F'] + dimensions['J/P'];
};

// Calculate career cluster matches
export const calculateCareerClusters = (domainScores: DomainScores): CareerCluster[] => {
  const clustersWithScores = careerClusters.map(cluster => {
    let totalScore = 0;
    let weightSum = 0;

    // Calculate weighted scores based on required domains
    Object.entries(cluster.requiredDomains).forEach(([domain, subdomains]) => {
      if (subdomains && domainScores[domain as keyof DomainScores]) {
        subdomains.forEach(subdomain => {
          const score = domainScores[domain as keyof DomainScores][subdomain];
          if (score) {
            totalScore += score;
            weightSum += 1;
          }
        });
      }
    });

    const averageScore = weightSum > 0 ? (totalScore / weightSum) : 0;
    const percentageScore = Math.round((averageScore / 5) * 100);

    return {
      ...cluster,
      score: percentageScore
    };
  });

  // Sort by score and return top matches
  return clustersWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
};

// Generate sample data for testing
export const generateSampleResults = () => {
  return {
    studentInfo: {
      name: "Sample Student",
      grade: "Grade 10",
      age: "16",
      school: "Demo High School",
      date: new Date().toLocaleDateString()
    },
    responses: [],
    domainScores: {
      MI: {
        'Logical-Mathematical': 4.2,
        'Linguistic': 3.8,
        'Spatial': 4.0,
        'Musical': 2.8,
        'Bodily-Kinesthetic': 3.2,
        'Naturalistic': 3.5,
        'Interpersonal': 4.1,
        'Intrapersonal': 3.9
      },
      MBTI: {
        'Extraversion': 3.8,
        'Introversion': 2.2,
        'Sensing': 2.9,
        'Intuition': 4.1,
        'Thinking': 4.3,
        'Feeling': 2.7,
        'Judging': 3.6,
        'Perceiving': 2.4
      },
      RIASEC: {
        'Realistic': 2.8,
        'Investigative': 4.4,
        'Artistic': 3.2,
        'Social': 3.7,
        'Enterprising': 3.9,
        'Conventional': 2.6
      },
      VALUES: {
        'Security': 3.1,
        'Achievement': 4.5,
        'Independence': 4.2,
        'Altruism': 3.8,
        'Variety': 3.9,
        'Lifestyle': 3.4,
        'Economic': 3.6,
        'Prestige': 3.3,
        'Creativity': 3.7,
        'Relationships': 3.5
      },
      APTITUDE: {
        'Verbal': 4.1,
        'Numerical': 4.3,
        'Spatial': 3.8,
        'Motor': 2.9,
        'Abstract': 4.2,
        'Memory': 3.6,
        'Attention': 3.8,
        'Organization': 3.9,
        'Learning': 4.0,
        'Creative': 3.7,
        'Analytical': 4.4,
        'Adaptability': 3.8
      }
    },
    mbtiType: "ENTJ",
    topCareerClusters: [
      {
        name: "STEM & Engineering",
        score: 89,
        description: "Science, Technology, Engineering, and Mathematics careers requiring analytical thinking and problem-solving skills.",
        careers: ["Software Engineer", "Data Scientist", "Mechanical Engineer", "Research Scientist", "Biotechnology Specialist"]
      },
      {
        name: "Business & Entrepreneurship", 
        score: 85,
        description: "Leadership, management, and business development roles in various industries.",
        careers: ["CEO", "Business Analyst", "Marketing Manager", "Entrepreneur", "Sales Director"]
      },
      {
        name: "Law & Legal Services",
        score: 78,
        description: "Legal professions requiring analytical thinking, communication, and ethical reasoning.",
        careers: ["Lawyer", "Judge", "Legal Consultant", "Paralegal", "Legal Researcher"]
      }
    ]
  };
};
