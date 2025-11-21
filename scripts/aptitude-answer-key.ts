import fs from 'fs';
import path from 'path';

type Letter = 'A' | 'B' | 'C' | 'D';

interface Item {
  id: number;
  section: string; // Part A / Part B
  domain: string;
  qnum: number;
  text: string;
  options: string[];
  correct: Letter;
  concept: string;
}

// Use process.cwd() to avoid ESM __dirname issues
const dataPath = path.resolve(process.cwd(), 'shared/aptitude-objective.json');
const raw = fs.readFileSync(dataPath, 'utf8');
const items: Item[] = JSON.parse(raw);

// Print header
console.log('Aptitude Objective Answer Key');
console.log('===============================================');

// Summary by section and domain
const bySection: Record<string, number> = {};
const byDomain: Record<string, number> = {};
for (const it of items) {
  bySection[it.section] = (bySection[it.section] || 0) + 1;
  byDomain[it.domain] = (byDomain[it.domain] || 0) + 1;
}
console.log('Summary:');
console.log('  Sections:', Object.entries(bySection).map(([k,v]) => `${k}=${v}`).join(', '));
console.log('  Domains :', Object.entries(byDomain).map(([k,v]) => `${k}=${v}`).join(', '));
console.log('');

// Sort by section, then qnum
items.sort((a, b) => a.section.localeCompare(b.section) || a.qnum - b.qnum);

// Print key lines
for (const it of items) {
  const idx = it.correct.charCodeAt(0) - 65; // 0..3
  const ans = it.options[idx];
  console.log(`${it.section} Q${it.qnum.toString().padStart(2, '0')} [${it.domain}] -> ${it.correct}. ${ans} | Concept: ${it.concept}`);
}
