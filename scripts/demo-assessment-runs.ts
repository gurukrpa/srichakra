/*
  Demo Assessment Runs (Synthetic Profiles)
  ----------------------------------------
  PURPOSE: Generate three illustrative assessment outcome profiles WITHOUT using real student data.
  These outputs are for validating scoring logic only.

  Profiles:
    1. analyticalTechnicalFocus: High Analytical & Technical, neutral elsewhere.
    2. creativeVerbalSocialFocus: High Creative, Verbal, Social, neutral elsewhere.
    3. naturalisticMusicalExecutiveFocus: High Naturalistic, Musical, Executive + balanced others.

  IMPORTANT: Not real student answers; do not use for decisions.
*/

import fs from 'fs';
import path from 'path';

type Item = {
  id: number;
  text: string;
  domain: string;
  reverse?: boolean;
  frameworks?: string[];
};

const itemBankPath = path.resolve('shared/assessment-items.json');
const clusterPath = path.resolve('shared/career-clusters.json');

const items: Item[] = JSON.parse(fs.readFileSync(itemBankPath, 'utf8'));
const clusters: { key: string; name: string; domains: string[] }[] = JSON.parse(fs.readFileSync(clusterPath, 'utf8'));

// Helper: build answer set respecting reverse items (if we want a high score for reverse item, we answer 1, else 5)
function makeAnswers(targetDomains: Record<string, number>, baseline = 3): Record<number, number> {
  const answers: Record<number, number> = {};
  items.forEach(it => {
    const boost = targetDomains[it.domain];
    if (boost != null) {
      // Map desired intensity (0..1) to a high answer (5) or low (1) if reverse
      const desired = boost >= 0.75 ? 5 : boost >= 0.5 ? 4 : boost >= 0.25 ? 3 : baseline;
      answers[it.id] = it.reverse ? (6 - desired) : desired; // If reverse, invert planned answer
    } else {
      answers[it.id] = it.reverse ? (6 - baseline) : baseline;
    }
  });
  return answers;
}

// Scoring domain means
function scoreDomains(answers: Record<number, number>) {
  const agg: Record<string, number[]> = {};
  items.forEach(it => {
    const raw = answers[it.id];
    if (typeof raw === 'number') {
      const val = it.reverse ? (6 - raw) : raw;
      (agg[it.domain] = agg[it.domain] || []).push(val);
    }
  });
  return Object.keys(agg).map(domain => {
    const arr = agg[domain];
    const mean = arr.reduce((a,b)=>a+b,0)/arr.length;
    return { domain, score: mean, count: arr.length, percent: Math.round((mean/5)*100) };
  }).sort((a,b)=>b.score - a.score);
}

// VAK scoring using existing hard-coded map
const VAK_MAP: Record<'Visual'|'Auditory'|'Kinesthetic', number[]> = {
  Visual: [9,34,45], // Creative + Analytical design indicators (approx from existing code)
  Auditory: [23,31,36,58],
  Kinesthetic: [10,14,55,60]
};
function scoreVAK(answers: Record<number, number>) {
  const vakRaw: { Visual: number; Auditory: number; Kinesthetic: number } = { Visual:0, Auditory:0, Kinesthetic:0 };
  let totalAnswered = 0;
  (Object.keys(VAK_MAP) as Array<'Visual'|'Auditory'|'Kinesthetic'>).forEach(k => {
    const vals = VAK_MAP[k].map(id => answers[id]).filter(v => typeof v === 'number');
    totalAnswered += vals.length;
    vakRaw[k] = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
  });
  let dominant: 'Visual' | 'Auditory' | 'Kinesthetic' | null = null;
  if (totalAnswered > 0) {
    const arr = ['Visual','Auditory','Kinesthetic'] as const;
    dominant = arr[0];
    for (let i = 1; i < arr.length; i++) {
      const cur = arr[i];
      if (vakRaw[cur] > vakRaw[dominant]) dominant = cur;
    }
  }
  return { vak: vakRaw, vakDominant: dominant };
}

// Cluster scoring (domain-based simple equal weighting among listed domains)
function scoreClusters(finalScores: { domain: string; score: number }[]) {
  const domainMap: Record<string, number> = {};
  finalScores.forEach(d => domainMap[d.domain] = d.score);
  return clusters.map(c => {
    const ds = c.domains.map(d => domainMap[d] ?? 0);
    const mean = ds.length ? ds.reduce((a,b)=>a+b,0)/ds.length : 0;
    return { key: c.key, name: c.name, rawScore: mean, percent: Math.round((mean/5)*100) };
  }).sort((a,b)=>b.rawScore - a.rawScore);
}

// Combined top cluster logic (same as domain-based only here)
function topClusters(clusterScores: { name: string; rawScore: number; percent: number }[], limit=3) {
  return clusterScores.slice(0, limit);
}

// Profiles definition (boost scale 0..1)
const profiles: Record<string, Record<string, number>> = {
  analyticalTechnicalFocus: { Analytical: 1, Technical: 1, Conscientiousness: 0.4, Executive: 0.3 },
  creativeVerbalSocialFocus: { Creative: 1, Verbal: 1, Social: 1, Analytical: 0.3 },
  naturalisticMusicalExecutiveFocus: { Naturalistic: 1, Musical: 1, Executive: 0.8, Analytical: 0.4, Social: 0.4 }
};

interface RunOutput {
  profile: string;
  finalScores: { domain: string; score: number; count: number; percent: number }[];
  vak: { Visual: number; Auditory: number; Kinesthetic: number };
  vakDominant: string | null;
  topClusters: { name: string; rawScore: number; percent: number }[];
}

const results: RunOutput[] = [];

Object.entries(profiles).forEach(([key, boosts]) => {
  const answers = makeAnswers(boosts);
  const finalScores = scoreDomains(answers);
  const { vak, vakDominant } = scoreVAK(answers);
  const clusterScores = scoreClusters(finalScores);
  const top = topClusters(clusterScores, 3);
  results.push({ profile: key, finalScores, vak, vakDominant, topClusters: top });
});

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), runs: results }, null, 2));
