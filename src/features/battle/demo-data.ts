// ============================================================
// DEMO DATA — Battle
// ------------------------------------------------------------
// Same approach as the Progress dashboard: deliberately fake,
// fixed data ported from the original kruai-competition.html
// static demo. Real matchmaking/live battles are Month 3 work
// per the project roadmap — this keeps the screen polished and
// crash-proof until that backend exists.
// ============================================================

export const myFighter = {
  name: "You",
  grade: "Grade 12 · Science",
  avatarSeed: "panharith",
  score: "6/10",
  hpPct: 62,
};

export const liveOpponent = {
  name: "Srey Roth",
  grade: "Grade 12 · Science",
  avatarSeed: "sreyroth",
  score: "4/10",
  hpPct: 38,
};

export const liveBattle = {
  subject: "⚗️ Chemistry",
  questionProgress: "Q7/10",
  timer: "01:24",
};

export const battleStats = {
  wins: 24,
  losses: 8,
  draws: 3,
  winRate: 75,
  winPct: 69,
  drawPct: 9,
  lossPct: 22,
};

export interface Opponent {
  name: string;
  avatarSeed: string;
  meta: string;
  wins: number;
  avgScore: number;
  rank: number;
  online: boolean;
  color: "pink" | "blue" | "mint" | "yellow";
}

export const opponents: Opponent[] = [
  {
    name: "Visal Prum",
    avatarSeed: "visal",
    meta: "Grade 12 · Science",
    wins: 31,
    avgScore: 87,
    rank: 2,
    online: true,
    color: "pink",
  },
  {
    name: "Kimnak Dara",
    avatarSeed: "kimnak",
    meta: "Grade 12 · Science",
    wins: 28,
    avgScore: 81,
    rank: 3,
    online: true,
    color: "blue",
  },
  {
    name: "Sokha Tith",
    avatarSeed: "sokhatin",
    meta: "Grade 12 · Science",
    wins: 19,
    avgScore: 76,
    rank: 6,
    online: false,
    color: "mint",
  },
  {
    name: "Daravuth Meas",
    avatarSeed: "daravuth",
    meta: "Grade 12 · Science",
    wins: 22,
    avgScore: 79,
    rank: 4,
    online: true,
    color: "yellow",
  },
];

export interface BattleHistoryItem {
  result: "WIN" | "LOSS" | "DRAW";
  opponentName: string;
  avatarSeed: string;
  subject: string;
  score: string;
  date: string;
}

export const battleHistory: BattleHistoryItem[] = [
  {
    result: "WIN",
    opponentName: "Visal Prum",
    avatarSeed: "visal",
    subject: "🧮 Mathematics",
    score: "9 – 7",
    date: "Today, 2:30pm",
  },
  {
    result: "LOSS",
    opponentName: "Srey Roth",
    avatarSeed: "sreyroth",
    subject: "⚗️ Chemistry",
    score: "5 – 8",
    date: "Yesterday, 5:10pm",
  },
  {
    result: "WIN",
    opponentName: "Kimnak Dara",
    avatarSeed: "kimnak",
    subject: "🔭 Physics",
    score: "10 – 6",
    date: "2 days ago",
  },
  {
    result: "DRAW",
    opponentName: "Daravuth Meas",
    avatarSeed: "daravuth",
    subject: "🌿 Biology",
    score: "7 – 7",
    date: "3 days ago",
  },
];
