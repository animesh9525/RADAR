import { analyzeBlockConflictsFor } from '../services/conflicts';
import {
  getBlockPriorityScore, calculateSuitabilityScore, generateAIRecommendation,
  calculateRecommendationStrength, generateAIExplanation
} from '../services/ai';
import { calculateTrainImpact } from '../services/whatif';

// Binds service functions to the live session for a component render.
export function makeAnalyzer(blocks, trains, taskData) {
  const session = { blocks: blocks || [], trainSchedule: trains || [], taskData: taskData || {} };
  return {
    session,
    analyze: b => analyzeBlockConflictsFor(b, blocks || [], trains || []),
    pri: b => getBlockPriorityScore(b, session),
    sui: b => calculateSuitabilityScore(b, session),
    rec: b => generateAIRecommendation(b, session),
    strength: b => calculateRecommendationStrength(b, session).strength,
    explain: b => generateAIExplanation(b, session),
    impact: b => calculateTrainImpact(b, session),
  };
}

// Percent-style util for factor bars
export function tone(value) {
  if (value >= 85) return 'var(--green)';
  if (value >= 70) return 'var(--green2)';
  if (value >= 55) return 'var(--orange)';
  if (value >= 40) return '#f97316';
  return 'var(--red)';
}