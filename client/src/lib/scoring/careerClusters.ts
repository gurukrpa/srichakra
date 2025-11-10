import clusters from '@shared/career-clusters.json';

type Item = {
  id: number;
  domain?: string;
  reverse?: boolean;
  weight?: number;
  type?: string; // 'likert' | 'objective'
  correctAnswer?: any;
  maxScore?: number;
  careerClusters?: string[];
};

type Answers = Record<number, any>;

type ClusterScore = {
  id: number;
  key: string;
  name: string;
  description?: string;
  scorePercent: number; // 0-100
  rawScore: number;
  possibleScore: number;
  matchedItems: number;
};

export function computeClusterScoresFromItems(items: Item[], answers: Answers): ClusterScore[] {
  const map: Record<string, { raw: number; possible: number; matched: number; id?: number; name?: string; description?: string }> = {};

  const getClustersForItem = (it: Item) => {
    if (it.careerClusters && it.careerClusters.length > 0) return it.careerClusters;
    // fallback: map using domain membership in clusters.json
    if (!it.domain) return [];
    return clusters
      .filter((c: any) => Array.isArray(c.domains) && c.domains.includes(it.domain))
      .map((c: any) => c.key);
  };

  items.forEach((it) => {
    const ans = answers[it.id];
    if (ans === undefined || ans === null) return;
    const w = typeof it.weight === 'number' && it.weight > 0 ? it.weight : 1;
    let raw = 0;
    let possible = 0;

    if (it.type === 'objective' && it.correctAnswer !== undefined) {
      const max = typeof it.maxScore === 'number' ? it.maxScore : 1;
      raw = (ans === it.correctAnswer) ? max : 0;
      possible = max;
      raw *= w;
      possible *= w;
    } else {
      // likert-style (1-5)
      const r = Number(ans);
      if (Number.isFinite(r)) {
        const val = it.reverse ? (6 - r) : r;
        raw = val * w;
        possible = 5 * w;
      } else return; // skip non-numeric answers
    }

    const cls = getClustersForItem(it);
    cls.forEach((key) => {
      if (!map[key]) {
        const def = (clusters as any[]).find(c => c.key === key) || { id: undefined, name: key, description: undefined };
        map[key] = { raw: 0, possible: 0, matched: 0, id: def.id, name: def.name, description: def.description };
      }
      map[key].raw += raw;
      map[key].possible += possible;
      map[key].matched += 1;
    });
  });

  const out: ClusterScore[] = Object.keys(map).map((k) => {
    const v = map[k];
    const scorePercent = v.possible > 0 ? Math.round((v.raw / v.possible) * 100) : 0;
    return {
      id: v.id || 0,
      key: k,
      name: v.name || k,
      description: v.description,
      scorePercent,
      rawScore: v.raw,
      possibleScore: v.possible,
      matchedItems: v.matched,
    };
  }).sort((a, b) => b.scorePercent - a.scorePercent);

  return out;
}
/*
  Career Cluster Scoring Module
  ---------------------------------
  WHAT: Computes scores for 20 career clusters based on domain and (optionally) RIASEC aggregate scores.
  HOW: Weighted linear combination (cluster.domainWeights * userDomainScore) normalized to 0–5.
  WHY: Provides interpretable pathway guidance linking assessment output to career direction.

  Integration Steps:
    1. Ensure finalScores (domain means) available from existing report.
    2. (Future) Add riasecScores array once RIASEC scoring implemented.
    3. Call computeClusterScores(finalScores, riasecScores?) to produce ordered cluster list.
    4. Merge into report object and PDF generator.

  NOTE: Domain names in cluster definitions must match those produced in finalScores.
*/

export type DomainScore = { domain: string; score: number; count?: number; percent?: number };
export type RiaSecScore = { code: string; score: number };

export interface CareerClusterDefinition {
  id: number;
  name: string;
  domainWeights?: Record<string, number>; // weights sum ~1 (soft requirement)
  domains?: string[]; // simple domain list fallback when domainWeights not provided
  riasecWeights?: Record<string, number>; // optional
}

export interface CareerClusterScore {
  id: number;
  name: string;
  rawScore: number;      // weighted sum on 0–5 scale
  percent: number;       // rawScore / 5 * 100
  contributingDomains: Array<{ domain: string; weight: number; domainScore: number }>; // transparency
}

// Lazy load cluster definitions (bundled via import path alias if configured)
import clustersRaw from '@shared/career-clusters.json';

const CLUSTERS: CareerClusterDefinition[] = clustersRaw as unknown as CareerClusterDefinition[];

// Utility: build quick lookup for domain scores
function makeDomainMap(finalScores: DomainScore[]): Record<string, number> {
  const map: Record<string, number> = {};
  finalScores.forEach(d => { map[d.domain] = d.score; });
  return map;
}

// Utility: optional RIASEC map
function makeRiaSecMap(riaSecScores?: RiaSecScore[]): Record<string, number> {
  const map: Record<string, number> = {};
  (riaSecScores || []).forEach(r => { map[r.code] = r.score; });
  return map;
}

export function computeClusterScores(finalScores: DomainScore[], riaSecScores?: RiaSecScore[]): CareerClusterScore[] {
  const domainMap = makeDomainMap(finalScores);
  const riaSecMap = makeRiaSecMap(riaSecScores);

  return CLUSTERS.map(cluster => {
    let aggregate = 0;
    const contributing: Array<{ domain: string; weight: number; domainScore: number }> = [];

    // Domain portion
    // Support two cluster shapes: domainWeights (explicit) or domains[] (simple list fallback)
    const domainWeights: Record<string, number> = (cluster.domainWeights && Object.keys(cluster.domainWeights).length)
      ? cluster.domainWeights
      : ((cluster as any).domains && (cluster as any).domains.length)
        ? (cluster as any).domains.reduce((acc: Record<string, number>, d: string) => { acc[d] = 1 / (cluster as any).domains.length; return acc; }, {})
        : {};

    let domainWeightTotal = 0;
    Object.entries(domainWeights).forEach(([domain, weight]) => {
      domainWeightTotal += weight;
      const ds = domainMap[domain] ?? 0; // default 0 if missing
      aggregate += ds * weight; // ds already 0–5
      contributing.push({ domain, weight, domainScore: ds });
    });

    // RIASEC portion (if present)
    if (cluster.riasecWeights) {
      Object.entries(cluster.riasecWeights).forEach(([code, weight]) => {
        const rs = riaSecMap[code] ?? 0;
        aggregate += rs * weight; // treat rs same scale 0–5
      });
    }

    // Optional normalization if weights don't sum to 1
    const totalWeight = domainWeightTotal + (cluster.riasecWeights ? Object.values(cluster.riasecWeights).reduce((a,b)=>a+b,0) : 0);
    const normalized = totalWeight > 0 ? aggregate / totalWeight : 0; // keep scale 0–5

    return {
      id: cluster.id,
      name: cluster.name,
      rawScore: normalized,
      percent: Math.round((normalized / 5) * 100),
      contributingDomains: contributing.sort((a,b)=>b.weight-a.weight)
    };
  }).sort((a,b) => b.rawScore - a.rawScore);
}

// Helper: produce top N cluster names for quick recommendations
export function topClusterRecommendations(clusterScores: CareerClusterScore[], limit = 5): CareerClusterScore[] {
  return clusterScores.slice(0, limit);
}

/* Future Extensions:
  - Add minimum count threshold for a domain before including (to reduce noise).
  - Introduce scaling factor or logistic transform to highlight differentiation.
  - Integrate normative data to output percentile ranks per cluster.
  - Add explanation generator mapping each cluster to narrative text.
*/
