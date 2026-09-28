export type KeywordSearchMode = "metrics" | "ideas";

export type KeywordMetric = {
  keyword: string;
  closeVariants: string[];
  avgMonthlySearches: number | null;
  threeMonthChangePct: number | null;
  yoyChangePct: number | null;
  competition: "HIGH" | "MEDIUM" | "LOW" | "UNSPECIFIED";
  competitionIndex: number | null;
  lowTopOfPageBidEur: number | null;
  highTopOfPageBidEur: number | null;
  monthlySearches: Array<{ year: number; month: number; searches: number }>;
};

export const KEYWORD_PLANNER_PRESETS = [
  "shoe cabinet",
  "nightstand",
  "kitchen cart",
  "tall storage cabinet",
  "entryway furniture",
  "bedside table",
  "bathroom shelf",
  "standing desk",
];
