/**
 * Asset Intelligence CLI
 *
 * Usage:
 *   npm run assets:intelligence [--dry-run] [--limit N] [--force]
 */

import { runIntelligence } from "../src/lib/imaging/intelligence.js";

async function main() {
  const args = process.argv.slice(2);
  const options: Record<string, boolean | number> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") options.dryRun = true;
    else if (args[i] === "--force") options.force = true;
    else if (args[i] === "--limit" && args[i + 1]) options.limit = parseInt(args[++i], 10);
  }

  console.log("Gallery 015 — Asset Intelligence");
  console.log(`Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);
  if (options.limit) console.log(`Limit: ${options.limit}`);
  console.log("");

  const report = await runIntelligence(options as any);

  console.log("═══════════════════════════════════════════");
  console.log("  ASSET INTELLIGENCE REPORT");
  console.log("═══════════════════════════════════════════");
  console.log(`  Total assets:         ${report.total}`);
  console.log(`  Completed:            ${report.completed}`);
  console.log(`  Failed:               ${report.failed}`);
  console.log("───────────────────────────────────────────");
  console.log(`  Exact duplicates:     ${report.exactDuplicates}`);
  console.log(`  Near duplicates:      ${report.nearDuplicates}`);
  console.log(`  Has frame:            ${report.hasFrame}`);
  console.log(`  Has internal mat:     ${report.hasMat}`);
  console.log(`  Rights complete:      ${report.rightsComplete}`);
  console.log(`  Rights incomplete:    ${report.rightsIncomplete}`);
  console.log(`  Avg quality score:    ${(report.avgQuality * 100).toFixed(0)}%`);
  console.log("═══════════════════════════════════════════");

  if (!options.dryRun && report.results.length > 0) {
    console.log("\n  Sample results:");
    for (const r of report.results.slice(0, 10)) {
      const q = r.quality?.overall ?? "?";
    const dup = r.duplicates?.classification ?? "—";
    const frame = r.curatorial?.hasFrame ? "FRM" : "—";
      const mat = r.curatorial?.hasInternalMat ? "MAT" : "—";
      console.log(`  ${r.status === "COMPLETED" ? "✓" : "✗"} [${q.padEnd(8)}] [${dup.padEnd(4)}] [${frame}/${mat}] ${r.mediaId}`);
    }
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
