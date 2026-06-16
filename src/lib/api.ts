const API_BASE = 'http://localhost:8000/api';

export interface SearchItem {
  id: string;
  type: 'judge' | 'prosecutor' | 'legislator';
  display_name: string;
  state: string;
  current_score: number;
}

export interface JudgeProfile {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  jurisdiction: string;
  current_bji: number;
  confidence_weight: number;
  sample_size: number;
  party_affiliation: string | null;
  biography: string | null;
  avatar_url: string | null;
}

export interface HistoricalBJIPoint {
  year: number;
  average_bji: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  deviation: number;
}

export interface JudgeScoresResponse {
  historical_bji: HistoricalBJIPoint[];
  case_distribution: CategoryBreakdown[];
}

export interface ProsecutorProfile {
  id: string;
  first_name: string;
  last_name: string;
  office_name: string;
  pdi_aggressiveness: number;
  charge_reduction_rate: number;
  conviction_rate: number;
  dismissal_rate: number;
  confidence_weight: number;
  sample_size: number;
  avatar_url: string | null;
}

export interface LegislatorProfile {
  id: string;
  first_name: string;
  last_name: string;
  party: string;
  chamber: string;
  district: string | null;
  legislative_influence_index: number;
  participation_rate: number;
  district_alignment: number;
  confidence_weight: number;
  sample_size: number;
  biography: string | null;
  avatar_url: string | null;
}

export interface CourtListenerResult {
  absolute_url: string;
  caseName?: string;
  caseNameFull?: string;
  citation?: string[];
  citeCount?: number;
  cluster_id?: number;
  court?: string;
  court_citation_string?: string;
  court_id?: string;
  dateArgued?: string | null;
  dateFiled?: string;
  docketNumber?: string;
  docket_id?: number;
  id?: number | string;
  document_type?: 'opinion' | 'docket' | 'audio';
  snippet?: string;
}

export interface CourtListenerSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CourtListenerResult[];
}

// -----------------------------------------------------------------------------
// SEEDED FALLBACK MOCK DATA (For when local backend API is down)
// -----------------------------------------------------------------------------

const MOCK_SEARCH_ITEMS: SearchItem[] = [
  { id: 'cannon', type: 'judge', display_name: 'Hon. Aileen Cannon', state: 'US', current_score: 1.5 },
  { id: 'alito', type: 'judge', display_name: 'Hon. Samuel Alito', state: 'US', current_score: 2.1 },
  { id: 'bragg', type: 'prosecutor', display_name: 'Alvin Bragg', state: 'NY', current_score: 0.85 },
  { id: 'schumer', type: 'legislator', display_name: 'Chuck Schumer', state: 'NY', current_score: 1.4 },
  { id: 'ito', type: 'judge', display_name: 'Hon. Lance Ito', state: 'CA', current_score: 0.1 },
  { id: 'gascon', type: 'prosecutor', display_name: 'George Gascón', state: 'CA', current_score: -1.1 },
  { id: 'evans', type: 'judge', display_name: 'Hon. Sarah Evans', state: 'TX', current_score: -0.6 },
  { id: 'cruz', type: 'legislator', display_name: 'Ted Cruz', state: 'TX', current_score: -1.8 }
];

const MOCK_JUDGES: Record<string, JudgeProfile> = {
  cannon: {
    id: 'cannon',
    first_name: 'Aileen',
    last_name: 'Cannon',
    middle_name: 'M.',
    jurisdiction: 'U.S. District Court, Southern District of Florida',
    current_bji: 1.5,
    confidence_weight: 0.9,
    sample_size: 45,
    party_affiliation: 'Republican Appointee',
    biography: 'Aileen Mercedes Cannon is a United States District Judge of the United States District Court for the Southern District of Florida. She was appointed in 2020.',
    avatar_url: null
  },
  alito: {
    id: 'alito',
    first_name: 'Samuel',
    last_name: 'Alito',
    middle_name: 'A.',
    jurisdiction: 'Supreme Court of the United States',
    current_bji: 2.1,
    confidence_weight: 0.95,
    sample_size: 110,
    party_affiliation: 'Republican Appointee',
    biography: 'Samuel Anthony Alito Jr. is an associate justice of the Supreme Court of the United States. He was nominated by President George W. Bush in 2005.',
    avatar_url: null
  },
  ito: {
    id: 'ito',
    first_name: 'Lance',
    last_name: 'Ito',
    middle_name: 'A.',
    jurisdiction: 'California Superior Court, Los Angeles County',
    current_bji: 0.1,
    confidence_weight: 0.8,
    sample_size: 30,
    party_affiliation: 'Non-partisan Elected',
    biography: 'Lance Allan Ito is a retired American judge best known for presiding over the murder trial of O. J. Simpson in 1995.',
    avatar_url: null
  },
  evans: {
    id: 'evans',
    first_name: 'Sarah',
    last_name: 'Evans',
    middle_name: null,
    jurisdiction: 'Texas State District Court, Harris County',
    current_bji: -0.6,
    confidence_weight: 0.75,
    sample_size: 25,
    party_affiliation: 'Democratic Elected',
    biography: 'Sarah Evans has served as a State District Judge in Texas since 2018, focusing on civil and juvenile dockets.',
    avatar_url: null
  }
};

const MOCK_JUDGE_SCORES: Record<string, JudgeScoresResponse> = {
  cannon: {
    historical_bji: [
      { year: 2021, average_bji: 0.8 },
      { year: 2022, average_bji: 1.1 },
      { year: 2023, average_bji: 1.3 },
      { year: 2024, average_bji: 1.5 }
    ],
    case_distribution: [
      { category: 'White Collar Crime', count: 12, deviation: 1.8 },
      { category: 'Drug Offenses', count: 18, deviation: 1.2 },
      { category: 'Violent Crime', count: 15, deviation: 1.6 }
    ]
  },
  alito: {
    historical_bji: [
      { year: 2021, average_bji: 1.8 },
      { year: 2022, average_bji: 1.9 },
      { year: 2023, average_bji: 2.0 },
      { year: 2024, average_bji: 2.1 }
    ],
    case_distribution: [
      { category: 'Constitutional Law', count: 50, deviation: 2.5 },
      { category: 'Administrative Law', count: 40, deviation: 1.9 },
      { category: 'Criminal Appeals', count: 20, deviation: 1.6 }
    ]
  },
  ito: {
    historical_bji: [
      { year: 2021, average_bji: 0.0 },
      { year: 2022, average_bji: 0.1 },
      { year: 2023, average_bji: 0.1 },
      { year: 2024, average_bji: 0.1 }
    ],
    case_distribution: [
      { category: 'Homicide', count: 10, deviation: 0.05 },
      { category: 'Theft/Burglary', count: 12, deviation: 0.15 },
      { category: 'Drug Possession', count: 8, deviation: 0.1 }
    ]
  },
  evans: {
    historical_bji: [
      { year: 2021, average_bji: -0.3 },
      { year: 2022, average_bji: -0.4 },
      { year: 2023, average_bji: -0.5 },
      { year: 2024, average_bji: -0.6 }
    ],
    case_distribution: [
      { category: 'Juvenile Offenses', count: 15, deviation: -0.8 },
      { category: 'Property Damage', count: 5, deviation: -0.4 },
      { category: 'Assault', count: 5, deviation: -0.3 }
    ]
  }
};

const MOCK_PROSECUTORS: Record<string, ProsecutorProfile> = {
  bragg: {
    id: 'bragg',
    first_name: 'Alvin',
    last_name: 'Bragg',
    office_name: 'Manhattan District Attorney Office (NY)',
    pdi_aggressiveness: 0.85,
    charge_reduction_rate: 0.45,
    conviction_rate: 0.78,
    dismissal_rate: 0.15,
    confidence_weight: 0.85,
    sample_size: 150,
    avatar_url: null
  },
  gascon: {
    id: 'gascon',
    first_name: 'George',
    last_name: 'Gascón',
    office_name: 'Los Angeles County District Attorney (CA)',
    pdi_aggressiveness: -1.1,
    charge_reduction_rate: 0.65,
    conviction_rate: 0.60,
    dismissal_rate: 0.28,
    confidence_weight: 0.9,
    sample_size: 200,
    avatar_url: null
  }
};

const MOCK_LEGISLATORS: Record<string, LegislatorProfile> = {
  schumer: {
    id: 'schumer',
    first_name: 'Chuck',
    last_name: 'Schumer',
    party: 'Democratic',
    chamber: 'senate',
    district: 'New York',
    legislative_influence_index: 1.4,
    participation_rate: 0.98,
    district_alignment: 0.88,
    confidence_weight: 0.95,
    sample_size: 120,
    biography: 'Charles Ellis Schumer is an American politician serving as Senate Majority Leader. A Democrat, he is the senior United States Senator from New York.',
    avatar_url: null
  },
  cruz: {
    id: 'cruz',
    first_name: 'Ted',
    last_name: 'Cruz',
    party: 'Republican',
    chamber: 'senate',
    district: 'Texas',
    legislative_influence_index: -1.8,
    participation_rate: 0.92,
    district_alignment: 0.91,
    confidence_weight: 0.92,
    sample_size: 98,
    biography: 'Rafael Edward Cruz is an American politician serving as the junior United States Senator from Texas. A Republican, he has served since 2013.',
    avatar_url: null
  }
};

const defaultJudge = (id: string): JudgeProfile => ({
  id,
  first_name: id.charAt(0).toUpperCase() + id.slice(1),
  last_name: 'Juris',
  middle_name: null,
  jurisdiction: 'State District Court',
  current_bji: 0.0,
  confidence_weight: 0.6,
  sample_size: 20,
  party_affiliation: 'Non-partisan',
  biography: 'Judicial tracking profile generated by automation records indexer.',
  avatar_url: null
});

const defaultJudgeScores = (): JudgeScoresResponse => ({
  historical_bji: [
    { year: 2022, average_bji: 0.0 },
    { year: 2023, average_bji: 0.05 },
    { year: 2024, average_bji: 0.0 }
  ],
  case_distribution: [
    { category: 'General Criminal Dockets', count: 20, deviation: 0.0 }
  ]
});

const defaultProsecutor = (id: string): ProsecutorProfile => ({
  id,
  first_name: id.charAt(0).toUpperCase() + id.slice(1),
  last_name: 'Counsel',
  office_name: 'County Prosecutor Office',
  pdi_aggressiveness: 0.0,
  charge_reduction_rate: 0.5,
  conviction_rate: 0.7,
  dismissal_rate: 0.2,
  confidence_weight: 0.5,
  sample_size: 50,
  avatar_url: null
});

const defaultLegislator = (id: string): LegislatorProfile => ({
  id,
  first_name: id.charAt(0).toUpperCase() + id.slice(1),
  last_name: 'Representative',
  party: 'Independent',
  chamber: 'house',
  district: 'At-Large',
  legislative_influence_index: 0.0,
  participation_rate: 0.9,
  district_alignment: 0.8,
  confidence_weight: 0.5,
  sample_size: 30,
  biography: 'Legislative roll call tracking and consensus metrics record sheet.',
  avatar_url: null
});

// -----------------------------------------------------------------------------
// CORE FETCH & API WRAPPERS
// -----------------------------------------------------------------------------

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const api = {
  search: async (q: string, type?: string, state?: string): Promise<SearchItem[]> => {
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (type) params.append('type', type);
      if (state) params.append('state', state);
      return await apiFetch<SearchItem[]>(`/search?${params.toString()}`);
    } catch (err) {
      console.warn('[API Fetch Error - Falling back to local Mock Database]:', err);
      let results = MOCK_SEARCH_ITEMS;
      if (state) {
        // Handle US Federal case mapping to US state code
        results = results.filter(item => item.state.toLowerCase() === state.toLowerCase());
      }
      if (type) {
        results = results.filter(item => item.type === type);
      }
      if (q) {
        const queryLower = q.toLowerCase();
        results = results.filter(item => 
          item.display_name.toLowerCase().includes(queryLower) ||
          item.id.toLowerCase().includes(queryLower)
        );
      }
      return results;
    }
  },

  getJudge: async (id: string): Promise<JudgeProfile> => {
    try {
      return await apiFetch<JudgeProfile>(`/judges/${id}`);
    } catch (err) {
      console.warn(`[API Fallback - Judge Profile ${id}]:`, err);
      return MOCK_JUDGES[id] || defaultJudge(id);
    }
  },

  getJudgeScores: async (id: string): Promise<JudgeScoresResponse> => {
    try {
      return await apiFetch<JudgeScoresResponse>(`/judges/${id}/scores`);
    } catch (err) {
      console.warn(`[API Fallback - Judge Scores ${id}]:`, err);
      return MOCK_JUDGE_SCORES[id] || defaultJudgeScores();
    }
  },

  recalculateJudge: async (id: string): Promise<{ status: string; calculated_score: number }> => {
    try {
      return await apiFetch<{ status: string; calculated_score: number }>(`/judges/${id}/recalculate`, { method: 'POST' });
    } catch (err) {
      console.warn(`[API Fallback - Recalculate Judge ${id}]:`, err);
      const score = MOCK_JUDGES[id]?.current_bji ?? 0.0;
      return { status: 'success', calculated_score: score };
    }
  },

  getProsecutor: async (id: string): Promise<ProsecutorProfile> => {
    try {
      return await apiFetch<ProsecutorProfile>(`/prosecutors/${id}`);
    } catch (err) {
      console.warn(`[API Fallback - Prosecutor ${id}]:`, err);
      return MOCK_PROSECUTORS[id] || defaultProsecutor(id);
    }
  },

  recalculateProsecutor: async (id: string): Promise<{ status: string; calculated_score: number }> => {
    try {
      return await apiFetch<{ status: string; calculated_score: number }>(`/prosecutors/${id}/recalculate`, { method: 'POST' });
    } catch (err) {
      console.warn(`[API Fallback - Recalculate Prosecutor ${id}]:`, err);
      const score = MOCK_PROSECUTORS[id]?.pdi_aggressiveness ?? 0.0;
      return { status: 'success', calculated_score: score };
    }
  },

  getLegislator: async (id: string): Promise<LegislatorProfile> => {
    try {
      return await apiFetch<LegislatorProfile>(`/legislators/${id}`);
    } catch (err) {
      console.warn(`[API Fallback - Legislator ${id}]:`, err);
      return MOCK_LEGISLATORS[id] || defaultLegislator(id);
    }
  },

  recalculateLegislator: async (id: string): Promise<{ status: string; calculated_score: number }> => {
    try {
      return await apiFetch<{ status: string; calculated_score: number }>(`/legislators/${id}/recalculate`, { method: 'POST' });
    } catch (err) {
      console.warn(`[API Fallback - Recalculate Legislator ${id}]:`, err);
      const score = MOCK_LEGISLATORS[id]?.legislative_influence_index ?? 0.0;
      return { status: 'success', calculated_score: score };
    }
  },

  searchCourtListener: async (q: string, court?: string, cursor?: string, type?: string): Promise<CourtListenerSearchResponse> => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (court) params.append('court', court);
    if (cursor) params.append('cursor', cursor);
    if (type) params.append('type', type);

    const res = await fetch(`/api/courtlistener?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },

  postBug: async (payload: { title: string; description: string; token: string; path: string; attachments?: any[] }): Promise<{ item: any }> => {
    const res = await fetch('https://task.se7eninc.com/api/bugs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        source: {
          panel: 'Justic Frontend',
          path: payload.path
        },
        attachments: payload.attachments || []
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || err.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },

  uploadFile: async (file: File, token: string): Promise<{ attachment: { fileName: string; url: string; mimeType: string; size: number } }> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('https://task.se7eninc.com/api/messages/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || err.error || `Upload failed! status: ${res.status}`);
    }
    return res.json();
  },
};
