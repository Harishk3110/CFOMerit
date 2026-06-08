import { NextResponse } from "next/server";
import {
  generateDailyBriefing,
  generateFinanceReport,
  generateInvestorOutreach,
  generateInvestorUpdate,
  generateLinkedInOutreach,
  generateWeeklyReview,
} from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action as string;

    if (action === "linkedin_outreach") {
      return NextResponse.json(await generateLinkedInOutreach(body.input));
    }
    if (action === "investor_outreach") {
      return NextResponse.json(await generateInvestorOutreach(body.input));
    }
    if (action === "investor_update") {
      return NextResponse.json(await generateInvestorUpdate(body.input));
    }
    if (action === "weekly_review") {
      return NextResponse.json(await generateWeeklyReview(body.input));
    }
    if (action === "finance_report") {
      return NextResponse.json(await generateFinanceReport(body.input));
    }
    if (action === "daily_briefing") {
      return NextResponse.json(await generateDailyBriefing());
    }

    return NextResponse.json({ error: "Unknown AI action" }, { status: 400 });
  } catch (error) {
    console.error("AI route error", error);
    return NextResponse.json({ error: "Could not generate AI output" }, { status: 500 });
  }
}
