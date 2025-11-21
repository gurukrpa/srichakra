// Aptitude scoring for objective items (direct answers)

export type AptitudeItem = {
  id: number;
  domain?: string;
  subDomain?: string;
  type?: 'likert' | 'objective';
  correctAnswer?: any;
  maxScore?: number; // default 1
  weight?: number;   // default 1
};

export type Answers = Record<number, any>;

export type AptitudeAggregate = {
  key: string; // domain or subDomain key
  correctCount: number;      // number of items fully correct (if maxScore used, count increments when full marks)
  totalCount: number;        // number of objective items considered
  raw: number;               // weighted raw points earned
  possible: number;          // weighted possible points
  percent: number;           // Math.round(raw/possible*100)
};

export type AptitudeScores = {
  total: AptitudeAggregate;
  byDomain: AptitudeAggregate[];
  bySubDomain: AptitudeAggregate[];
};

function inc(map: Record<string, AptitudeAggregate>, key: string, add: { correct: number; total: number; raw: number; possible: number }) {
  if (!map[key]) map[key] = { key, correctCount: 0, totalCount: 0, raw: 0, possible: 0, percent: 0 };
  map[key].correctCount += add.correct;
  map[key].totalCount += add.total;
  map[key].raw += add.raw;
  map[key].possible += add.possible;
}

export function computeAptitudeScores(items: AptitudeItem[], answers: Answers): AptitudeScores {
  const domainMap: Record<string, AptitudeAggregate> = {};
  const subDomainMap: Record<string, AptitudeAggregate> = {};

  let totalRaw = 0;
  let totalPossible = 0;
  let totalCorrect = 0;
  let totalCount = 0;

  items.forEach((it) => {
    if (it.type !== 'objective' || it.correctAnswer === undefined) return;
    const ans = answers[it.id];
    if (ans === undefined || ans === null) return;
    const w = typeof it.weight === 'number' && it.weight > 0 ? it.weight : 1;
    const max = typeof it.maxScore === 'number' && it.maxScore > 0 ? it.maxScore : 1;
    const correct = ans === it.correctAnswer ? 1 : 0;
    const raw = correct ? max * w : 0;
    const possible = max * w;

    totalRaw += raw;
    totalPossible += possible;
    totalCorrect += correct;
    totalCount += 1;

    if (it.domain) inc(domainMap, it.domain, { correct, total: 1, raw, possible });
    if (it.subDomain) inc(subDomainMap, it.subDomain, { correct, total: 1, raw, possible });
  });

  const toList = (map: Record<string, AptitudeAggregate>) => Object.values(map).map(v => ({
    ...v,
    percent: v.possible > 0 ? Math.round((v.raw / v.possible) * 100) : 0
  })).sort((a,b) => b.percent - a.percent);

  const total: AptitudeAggregate = {
    key: 'overall',
    correctCount: totalCorrect,
    totalCount,
    raw: totalRaw,
    possible: totalPossible,
    percent: totalPossible > 0 ? Math.round((totalRaw / totalPossible) * 100) : 0
  };

  return {
    total,
    byDomain: toList(domainMap),
    bySubDomain: toList(subDomainMap)
  };
}
