import { scoreLead } from "./score";

export type Note = { id: string; at: string; text: string };
export type Activity = { at: string; text: string };

export type Lead = {
  id: string;
  name: string;
  firstName?: string;
  title: string;
  company: string;
  companySize: number;
  email: string;
  industry: string;
  city: string;
  status: string;
  optedOut?: boolean; // true if the person asked not to be emailed
  notes?: Note[];
  activity?: Activity[]; // newest first
};

export type List = { id: string; name: string; leadIds: string[] };

export const STATUSES = ["New", "Contacted", "Replied", "Booked"];

// Adds the score and the short "why" to a lead.
export function withScore(lead: Lead) {
  return { ...lead, ...scoreLead(lead) };
}

// Adds one line to the top of a lead's activity log.
export function logActivity(lead: Lead, text: string) {
  if (!lead.activity) lead.activity = [];
  lead.activity.unshift({ at: new Date().toISOString(), text });
}

// "2026-10-20T14:05:00.000Z" -> "2026-10-20 14:05"
export function shortTime(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}
