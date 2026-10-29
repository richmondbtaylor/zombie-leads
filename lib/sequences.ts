// A sequence is a short list of outreach steps. Sending is NOT built, we only plan them.
export type Step = { day: number; message: string };
export type Sequence = { id: string; name: string; steps: Step[] };

// One lead on one sequence. "step" is the step the lead is on now (1, 2 or 3).
export type Enrollment = { id: string; sequenceId: string; leadId: string; step: number; addedAt: string };

// Turns "Hi {firstName}" into "Hi Maria" for one lead.
// ZOMBIE: bug. If a lead has no first name, the {firstName} placeholder is left in the
// text as-is, so the message says "Hi {firstName}," to a real person. Use a safe fallback.
export function fillTemplate(message: string, lead: { firstName?: string; company: string }): string {
  const withCompany = message.replaceAll("{company}", lead.company);
  return lead.firstName ? withCompany.replaceAll("{firstName}", lead.firstName) : withCompany;
}
