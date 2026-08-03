/**
 * Smart Crop Backfill CLI
 *
 * Usage:
 *   npx tsx scripts/smart-crop.ts [flags]
 *
 * Flags:
 *   --dry-run        Analyze without writing
 *   --limit N        Process only N artworks
 *   --artwork-id ID  Process a single artwork
 *   --force          Reprocess already-done works
 *   --confidence N   Minimum confidence threshold (0–1)
 *   --resume         Skip already-processed (default)
 */

import { runImageBackfill } from "../src/lib/imaging/pipeline";

async function main() {
  const args = process.argv.slice(2);
  const options: Record<string, string | boolean | number> = {
    resume: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--limit" && args[i + 1]) options.limit = parseInt(args[++i], 10);
    else if (arg === "--artwork-id" && args[i + 1]) options.artworkId = args[++i];
    else if (arg === "--confidence" && args[i + 1]) options.minConfidence = parseFloat(args[++i]);
    else if (arg === "--resume") options.resume = true;
    else if (arg === "--help") {
      console.log(`
Smart Crop Backfill — Gallery 015
===================================
Analyzes artwork images and removes photographed background.

Usage:
  npx tsx scripts/smart-crop.ts [flags]

Flags:
  --dry-run          Analyze without writing files or database
  --limit N          Process maximum N artworks
  --artwork-id ID    Process a single artwork by ID
  --force            Reprocess already-processed artworks
  --confidence N     Minimum auto-approve threshold (0–1)
  --resume           Skip already-processed artworks (default)
  --help             Show this help
`);
      process.exit(0);
    }
  }

  console.log("Gallery 015 — Smart Crop Backfill");
  console.log(`Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);
  if (options.limit) console.log(`Limit: ${options.limit} artworks`);
  if (options.artworkId) console.log(`Target: artwork ${options.artworkId}`);
  if (options.force) console.log("Force: YES (will reprocess all)");
  console.log("");

  const report = await runImageBackfill(options as any);

  console.log("═══════════════════════════════════════");
  console.log("  BACKFILL REPORT");
  console.log("═══════════════════════════════════════");
  console.log(`  Total artworks found:     ${report.total}`);
  console.log(`  Processed:                ${report.processed}`);
  console.log(`  Auto-approved:            ${report.autoApproved}`);
  console.log(`  Needs review:             ${report.needsReview}`);
  console.log(`  Already cropped:          ${report.alreadyCropped}`);
  console.log(`  Skipped (already done):   ${report.skipped}`);
  console.log(`  Failed:                   ${report.failed}`);
  console.log("───────────────────────────────────────");

  if (report.results.length > 0) {
    console.log("\n  DETAILS:");
    for (const r of report.results) {
      const icon = r.status === "AUTO_APPROVED" ? "✓"
        : r.status === "NEEDS_REVIEW" ? "?"
        : r.status === "ALREADY_CROPPED" ? "="
        : r.status === "PROCESSING_FAILED" ? "✗"
        : "-";
      const confidence = r.confidence != null ? ` (${(r.confidence * 100).toFixed(0)}%)` : "";
      console.log(`  ${icon} ${r.artworkSlug}: ${r.status}${confidence}${r.error ? ` — ${r.error}` : ""}`);
    }
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
