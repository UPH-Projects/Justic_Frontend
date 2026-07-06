/**
 * Benchmark Justice™ Core Scoring Engine Calculations Module
 * Implements BJI, PDI, and LII score algorithms with sample size normalization and confidence weighting.
 */

class ScoringEngine {
  /**
   * Computes the Benchmark Judge Index (BJI) as a standard deviation z-score (-3.0 to +3.0).
   */
  static calculateBji(sentences: number[], guidelines: number[]): { bji: number; confidence: number } {
    const N = sentences.length;
    if (N === 0) return { bji: 0.0, confidence: 0.0 };

    const deviations: number[] = [];
    const gdSd = 5.0; // Standard deviation baseline

    for (let i = 0; i < N; i++) {
      const z = (sentences[i] - guidelines[i]) / gdSd;
      deviations.push(z);
    }

    const rawMeanBji = deviations.reduce((acc, v) => acc + v, 0) / N;

    // Sample size normalization factor (logistic curve: low confidence for N < 30)
    const normalizationFactor = 1.0 / (1.0 + Math.exp(-(N - 15) / 5.0));

    // Calculate variance
    const variance = deviations.reduce((acc, d) => acc + Math.pow(d - rawMeanBji, 2), 0) / N;
    const confidence = normalizationFactor * (1.0 / (1.0 + Math.sqrt(variance || 1.0)));

    let finalBji = rawMeanBji * normalizationFactor;
    // Clamp to [-3.0, +3.0]
    finalBji = Math.max(-3.0, Math.min(3.0, finalBji));

    return {
      bji: parseFloat(finalBji.toFixed(4)),
      confidence: parseFloat(confidence.toFixed(4))
    };
  }

  /**
   * Computes the Prosecutor Deviation Index (PDI) Aggressiveness Score.
   */
  static calculatePdi(convictionRate: number, chargeReductionRate: number, dismissalRate: number, sampleSize: number): { pdi: number; confidence: number } {
    const rawPdi = (convictionRate * 0.4) + ((1.0 - chargeReductionRate) * 0.4) - (dismissalRate * 0.2);
    const centeredPdi = (rawPdi - 0.50) * 4.0; // Scale to [-2.0, +2.0]

    const normFactor = 1.0 / (1.0 + Math.exp(-(sampleSize - 10) / 4.0));
    const finalPdi = centeredPdi * normFactor;

    return {
      pdi: parseFloat(finalPdi.toFixed(4)),
      confidence: parseFloat(normFactor.toFixed(4))
    };
  }

  /**
   * Computes the Legislative Influence Index (LII).
   */
  static calculateLii(sponsoredBillsPassed: number, sponsoredBillsTotal: number, votingAttendance: number, partyAlignment: number, sampleSize: number): { lii: number; confidence: number } {
    const passageEfficiency = sponsoredBillsTotal > 0 ? sponsoredBillsPassed / sponsoredBillsTotal : 0.0;
    const rawLii = (passageEfficiency * 0.4) + (votingAttendance * 0.3) + (partyAlignment * 0.3);
    const centeredLii = (rawLii - 0.60) * 5.0; // Scale to [-3.0, +3.0]

    const normFactor = 1.0 / (1.0 + Math.exp(-(sampleSize - 20) / 5.0));
    const finalLii = centeredLii * normFactor;

    return {
      lii: parseFloat(finalLii.toFixed(4)),
      confidence: parseFloat(normFactor.toFixed(4))
    };
  }
}

// Run scoring demonstrations
function runScoringDemos() {
  console.log('[ScoringEngine] Executing mathematical scoring runs for sample entities...');

  // 1. Judge Cannon
  const judge = ScoringEngine.calculateBji(
    [120, 110, 95, 115, 130],
    [110, 110, 100, 110, 120]
  );
  console.log(`[ScoringEngine] Judicial BJI (Judge Cannon): Score = ${judge.bji} z-score (Confidence: ${(judge.confidence * 100).toFixed(1)}%)`);

  // 2. Prosecutor Alvin Bragg
  const proc = ScoringEngine.calculatePdi(0.85, 0.45, 0.15, 45);
  console.log(`[ScoringEngine] Prosecutorial PDI (DA Bragg): Score = ${proc.pdi >= 0 ? '+' : ''}${proc.pdi.toFixed(2)} (Confidence: ${(proc.confidence * 100).toFixed(1)}%)`);

  // 3. Legislator Chuck Schumer
  const leg = ScoringEngine.calculateLii(5, 25, 0.95, 0.88, 110);
  console.log(`[ScoringEngine] Legislative LII (Sen. Schumer): Score = ${leg.lii >= 0 ? '+' : ''}${leg.lii.toFixed(2)} (Confidence: ${(leg.confidence * 100).toFixed(1)}%)`);
}

runScoringDemos();
export { ScoringEngine };
