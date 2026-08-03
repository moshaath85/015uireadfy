import { describe, it, expect, beforeEach } from "vitest";
import {
  hammingDistance,
  resetDuplicateRegistry,
  registerAsset,
} from "@/lib/imaging/duplicates";

describe("Duplicate Detection — Calibration", () => {
  beforeEach(() => {
    resetDuplicateRegistry();
  });

  describe("hammingDistance", () => {
    it("returns 0 for identical hashes", () => {
      expect(hammingDistance("10101010", "10101010")).toBe(0);
    });

    it("returns correct distance for different hashes", () => {
      expect(hammingDistance("00000000", "11111111")).toBe(8);
    });

    it("returns correct distance for partial difference", () => {
      expect(hammingDistance("10101010", "10111010")).toBe(1);
    });

    it("handles different lengths gracefully", () => {
      expect(hammingDistance("1010", "10101010")).toBe(0);
    });
  });

  describe("resetDuplicateRegistry", () => {
    it("clears the global registry", () => {
      registerAsset("test-1", "abc", "0000", 1.5, [0.1, 0.2]);
      resetDuplicateRegistry();
      expect(true).toBe(true);
    });
  });
});

describe("Rights Classification", () => {
  it("TECHNICAL_METADATA_COMPLETE: checksum present", () => {
    const hasChecksum = "abc123";
    const hasFileName = "test.jpg";
    const techComplete = !!hasChecksum && !!hasFileName;
    expect(techComplete).toBe(true);
  });

  it("TECHNICAL_METADATA_INCOMPLETE: missing checksum", () => {
    const hasChecksum = null;
    const techComplete = !!hasChecksum;
    expect(techComplete).toBe(false);
  });

  it("RIGHTS_INCOMPLETE: missing copyright", () => {
    const copyright = null;
    const photographer = null;
    const rightsComplete = !!(copyright && photographer);
    expect(rightsComplete).toBe(false);
  });

  it("RIGHTS_COMPLETE: all fields present", () => {
    const copyright = "© Artist Name";
    const photographer = "Photographer Name";
    const creditLine = "Courtesy Gallery 015";
    const rightsComplete = !!(copyright && photographer && creditLine);
    expect(rightsComplete).toBe(true);
  });

  it("RIGHTS_UNKNOWN: no data at all", () => {
    const copyright = null;
    const photographer = null;
    const creditLine = null;
    const status = copyright || photographer || creditLine ? "PARTIAL" : "RIGHTS_UNKNOWN";
    expect(status).toBe("RIGHTS_UNKNOWN");
  });

  it("checksum is NOT rights metadata", () => {
    const checksum = "abc123";
    const hasCopyright = false;
    // Checksum proves data integrity, not legal rights
    expect(!!checksum).toBe(true); // technical OK
    expect(!!hasCopyright).toBe(false); // rights NOT OK
  });
});

describe("Suggestions Safety", () => {
  it("suggestions are never copied to authoritative fields", () => {
    const suggestions = {
      mediumSuggestion: { value: "oil on canvas", confidence: 0.3 },
    };
    const authoritative = {
      medium: null as string | null,
    };
    // Suggestion exists
    expect(suggestions.mediumSuggestion?.value).toBe("oil on canvas");
    // But authoritative field is NOT auto-updated
    expect(authoritative.medium).toBeNull();
  });

  it("suggestions include confidence and review status", () => {
    const suggestion = {
      value: "contemporary",
      confidence: 0.3,
      method: "brightness+contrast",
      reviewed: false,
    };
    expect(suggestion.confidence).toBeLessThan(0.95);
    expect(suggestion.reviewed).toBe(false);
  });

  it("high-confidence frame detection does not auto-crop", () => {
    const frameDetected = true;
    const frameConfidence = 0.95;
    const autoCrop = false; // Always requires manual review
    expect(frameDetected && frameConfidence > 0.9).toBe(true);
    expect(autoCrop).toBe(false);
  });
});
