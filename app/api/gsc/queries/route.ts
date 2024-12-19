import { NextRequest, NextResponse } from "next/server";
import webmasters from "@/lib/googleSearchConsole";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start") || "2023-01-01";
  const end = url.searchParams.get("end") || "2023-01-31";
  const siteUrl = "https://app.vikmoney.com/";

  try {
    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: ["query"],
        rowLimit: 50,
      },
    });

    const rows = response.data.rows || [];
    const data = rows.map((row) => ({
      query: row.keys?.[0] || "",
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Lỗi khi lấy dữ liệu GSC" },
      { status: 500 }
    );
  }
}
