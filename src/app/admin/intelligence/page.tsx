import type { Metadata } from "next";
import { getTex7PrismaClient } from "@/lib/tex7/database/providers/prisma-client";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Asset Intelligence | Gallery 015 Admin",
};

export const dynamic = "force-dynamic";

interface IntelligenceRow {
  id: string;
  mediaId: string;
  artworkId: string;
  checksum: string;
  resolution: string | null;
  dominantColors: string[] | null;
  qualityScore: number | null;
  rightsComplete: boolean | null;
  hasFrame: boolean | null;
  visualComplexity: number | null;
  duplicateGroup: string | null;
  processingVersion: string;
  processedAt: Date | null;
  confidence: Record<string, number> | null;
}

export default async function IntelligencePage() {
  const prisma = getTex7PrismaClient();
  const records = await prisma.assetIntelligence.findMany({
    take: 100,
    orderBy: { processedAt: "desc" },
  });

  const stats = {
    total: records.length,
    withFrame: records.filter(r => r.hasFrame).length,
    rightsComplete: records.filter(r => r.rightsComplete).length,
    highQuality: records.filter(r => (r.qualityScore ?? 0) >= 0.75).length,
    duplicates: records.filter(r => r.exactDuplicateGroup != null).length,
  };

  const rows = records.map(r => ({
    id: r.id,
    mediaId: r.mediaId,
    artworkId: r.artworkId,
    checksum: r.checksum?.substring(0, 10) ?? "—",
    resolution: typeof r.dimensions === "object" && r.dimensions ? `${(r.dimensions as any).w}x${(r.dimensions as any).h}` : "—",
    dominantColors: Array.isArray(r.dominantColors) ? r.dominantColors.slice(0, 3) : null,
    qualityScore: r.qualityScore,
    rightsComplete: r.rightsComplete,
    hasFrame: r.hasFrame,
    visualComplexity: r.visualComplexity,
    duplicateGroup: r.exactDuplicateGroup?.substring(0, 8) ?? null,
    processingVersion: r.processingVersion,
    processedAt: r.processedAt,
    confidence: r.confidence as Record<string, number> | null,
  }));

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>Asset Intelligence</h1>
          <p style={{ color: "#666", margin: "0.25rem 0 0" }}>Visual metadata, duplicates, frame analysis, and quality scoring</p>
        </div>
        <Link href="/admin" style={{ color: "#333", fontSize: "0.875rem" }}>← Admin</Link>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total", value: stats.total },
          { label: "With Frame", value: stats.withFrame },
          { label: "Rights OK", value: stats.rightsComplete },
          { label: "High Quality", value: stats.highQuality },
          { label: "Duplicates", value: stats.duplicates },
        ].map(s => (
          <div key={s.label} style={{ background: "#f4f1e9", padding: "1rem", borderRadius: "2px" }}>
            <div style={{ fontSize: "0.75rem", color: "#77746E", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            <div style={{ fontSize: "2rem", fontWeight: 600, color: "#151513" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["All", "Has Frame", "Rights Incomplete", "Low Quality", "Duplicates", "Unreviewed"].map(f => (
          <button key={f} style={{
            padding: "6px 14px", border: "1px solid #d9d5cd", background: "transparent",
            fontSize: "0.75rem", cursor: "pointer", borderRadius: "2px", color: "#171715",
          }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #d9d5cd", textAlign: "left" }}>
              <th style={{ padding: "10px 12px", fontWeight: 500, color: "#77746E" }}>Media ID</th>
              <th style={{ padding: "10px 12px", fontWeight: 500, color: "#77746E" }}>Artwork</th>
              <th style={{ padding: "10px 12px", fontWeight: 500, color: "#77746E" }}>Resolution</th>
              <th style={{ padding: "10px 12px", fontWeight: 500, color: "#77746E" }}>Quality</th>
              <th style={{ padding: "10px 12px", fontWeight: 500, color: "#77746E" }}>Frame</th>
              <th style={{ padding: "10px 12px", fontWeight: 500, color: "#77746E" }}>Rights</th>
              <th style={{ padding: "10px 12px", fontWeight: 500, color: "#77746E" }}>Duplicate</th>
              <th style={{ padding: "10px 12px", fontWeight: 500, color: "#77746E" }}>Palette</th>
              <th style={{ padding: "10px 12px", fontWeight: 500, color: "#77746E" }}>Version</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "#999" }}>No intelligence records yet. Run `scripts/asset-intelligence-process.cjs` to generate.</td></tr>
            ) : rows.map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid #e8e4dc" }}>
                <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: "0.75rem" }}>{row.mediaId}</td>
                <td style={{ padding: "8px 12px" }}>{row.artworkId}</td>
                <td style={{ padding: "8px 12px", color: "#666" }}>{row.resolution}</td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: "2px", fontSize: "0.6875rem",
                    background: (row.qualityScore ?? 0) >= 0.75 ? "#e8f5e9" : (row.qualityScore ?? 0) >= 0.5 ? "#fff8e1" : "#fbe9e7",
                    color: (row.qualityScore ?? 0) >= 0.75 ? "#2e7d32" : (row.qualityScore ?? 0) >= 0.5 ? "#f57f17" : "#c62828",
                  }}>
                    {row.qualityScore != null ? `${(row.qualityScore * 100).toFixed(0)}%` : "—"}
                  </span>
                </td>
                <td style={{ padding: "8px 12px" }}>{row.hasFrame ? "Framed" : "—"}</td>
                <td style={{ padding: "8px 12px" }}>{row.rightsComplete ? "Complete" : <span style={{ color: "#c62828" }}>Incomplete</span>}</td>
                <td style={{ padding: "8px 12px" }}>{row.duplicateGroup ? <span style={{ color: "#1565c0" }}>{row.duplicateGroup}</span> : "—"}</td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {row.dominantColors?.map((c: any, i: number) => (
                      <span key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: String(c), display: "inline-block", border: "1px solid rgba(0,0,0,.1)" }} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: "8px 12px", color: "#999", fontSize: "0.6875rem" }}>{row.processingVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
