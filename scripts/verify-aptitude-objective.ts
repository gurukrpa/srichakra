import fs from 'fs';
import path from 'path';

interface ObjectiveItem {
  id: number;
  section: string;
  domain: string;
  qnum: number;
  text: string;
  options: string[];
  correct: string; // letter A-D
  concept: string;
}

// Load JSON dataset
const filePath = path.resolve(__dirname, '../shared/aptitude-objective.json');
const raw = fs.readFileSync(filePath, 'utf-8');
const items: ObjectiveItem[] = JSON.parse(raw);

// Basic integrity checks
const errors: string[] = [];
const idSet = new Set<number>();

items.forEach((item) => {
  if (idSet.has(item.id)) {
    errors.push(`Duplicate id: ${item.id}`);
  }
  idSet.add(item.id);
  if (!/^Part [AB]$/.test(item.section)) errors.push(`Invalid section for id ${item.id}`);
  if (!item.text || item.text.length < 5) errors.push(`Suspicious short text for id ${item.id}`);
  if (!Array.isArray(item.options) || item.options.length < 4) errors.push(`Need 4 options for id ${item.id}`);
  if (!['A', 'B', 'C', 'D'].includes(item.correct)) errors.push(`Correct must be A-D for id ${item.id}`);
  const index = item.correct.charCodeAt(0) - 65;
  if (!item.options[index]) errors.push(`Correct letter out of range for id ${item.id}`);
});

// Domain summary
const byDomain: Record<string, number> = {};
items.forEach((i) => {
  byDomain[i.domain] = (byDomain[i.domain] || 0) + 1;
});

// Sample scoring simulation: assume a hypothetical student answers first 10 correctly, rest randomly
function simulatePerformance() {
  let score = 0;
  items.forEach((item, idx) => {
    let answer: string;
    if (idx < 10) {
      answer = item.correct; // mastered first 10
    } else {
      // random guess
      answer = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
    }
    if (answer === item.correct) score += 1;
  });
  return { total: items.length, score, percent: (score / items.length) * 100 };
}

const simulation = simulatePerformance();

const report = {
  totalItems: items.length,
  domainDistribution: byDomain,
  integrityErrors: errors,
  sampleSimulation: simulation,
  exampleFirstItem: items[0]
};

console.log(JSON.stringify(report, null, 2));

if (errors.length) {
  process.exitCode = 1;
}
