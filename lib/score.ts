// Simple rule-based lead score: title seniority + company size + has-email.
export type ScoreResult = { score: number; why: string };

export function scoreLead(lead: { title: string; companySize: number; email: string }): ScoreResult {
  const title = lead.title.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  // Seniority: up to 40 points
  if (/(chief|ceo|cfo|cto|founder|owner|vp|president)/.test(title)) {
    score += 40;
    reasons.push("senior title +40");
  } else if (/(director|head)/.test(title)) {
    score += 30;
    reasons.push("director level +30");
  } else if (/manager/.test(title)) {
    score += 20;
    reasons.push("manager +20");
  } else {
    score += 10;
    reasons.push("other title +10");
  }

  // Company size: up to 30 points
  if (lead.companySize >= 200) {
    score += 30;
    reasons.push("200+ staff +30");
  } else if (lead.companySize >= 50) {
    score += 20;
    reasons.push("50+ staff +20");
  } else {
    score += 10;
    reasons.push("small company +10");
  }

  // Email: should be a small bonus for having one.
  if (lead.email) {
    score += 30;
    reasons.push("has email +30");
  } else {
    // ZOMBIE: bug. A missing email costs 50 points, so good leads with no email
    // score near zero. It should only skip the +30 bonus. Fix the formula.
    score -= 50;
    reasons.push("no email -50");
  }

  return { score: Math.max(0, Math.min(100, score)), why: reasons.join(", ") };
}
