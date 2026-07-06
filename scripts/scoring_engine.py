#!/usr/bin/env python3
"""
Benchmark Justice™ Core Scoring Engine Calculations Module
Implements calculations for BJI (Judicial), PDI (Prosecutor), and LII (Legislator) scores,
incorporating sample size normalization and confidence weighting.
"""

import math
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ScoringEngine")

class ScoringEngine:
    @staticmethod
    def calculate_bji(sentences: list, guidelines: list) -> tuple:
        """
        Computes the Benchmark Judge Index (BJI) as a standard deviation z-score (-3.0 to +3.0).
        Calculates sentencing length deviation from guideline baseline.
        
        Formula:
          z = (Sentence - Guideline_Median) / Guideline_SD
          BJI = Mean(z) * Normalization_Factor(N)
        """
        N = len(sentences)
        if N == 0:
            return 0.0, 0.0

        deviations = []
        for s, g_med, g_sd in zip(sentences, guidelines, [5.0]*len(sentences)):
            z = (s - g_med) / g_sd
            deviations.append(z)

        raw_mean_bji = sum(deviations) / N
        
        # Sample size normalization factor (logistic curve: low confidence for N < 30)
        # Reaches ~0.95 at N=30
        normalization_factor = 1.0 / (1.0 + math.exp(-(N - 15) / 5.0))
        
        # Confidence weight is a function of sample size and standard deviation of sentencing
        variance = sum((d - raw_mean_bji)**2 for d in deviations) / N if N > 1 else 1.0
        confidence = normalization_factor * (1.0 / (1.0 + math.sqrt(variance)))

        final_bji = raw_mean_bji * normalization_factor
        # Clamp between -3.0 and +3.0
        final_bji = max(-3.0, min(3.0, final_bji))

        return round(final_bji, 4), round(confidence, 4)

    @staticmethod
    def calculate_pdi(conviction_rate: float, charge_reduction_rate: float, dismissal_rate: float, sample_size: int) -> tuple:
        """
        Computes the Prosecutor Deviation Index (PDI) Aggressiveness Score.
        Aggregates conviction efficiency and charging reduction trends.
        
        Formula:
          Raw_PDI = (Conviction_Rate * 0.4) + ((1 - Charge_Reduction_Rate) * 0.4) - (Dismissal_Rate * 0.2)
          Centered around 0.0 with deviation range [-2.0 to +2.0]
        """
        # Weighted formula
        raw_pdi = (conviction_rate * 0.4) + ((1.0 - charge_reduction_rate) * 0.4) - (dismissal_rate * 0.2)
        
        # Center around peer median (assumed baseline of 0.50 score)
        centered_pdi = (raw_pdi - 0.50) * 4.0 # Scale to [-2.0, +2.0] range
        
        # Normalization factor by sample size
        norm_factor = 1.0 / (1.0 + math.exp(-(sample_size - 10) / 4.0))
        final_pdi = centered_pdi * norm_factor

        # Confidence weight
        confidence = norm_factor

        return round(final_pdi, 4), round(confidence, 4)

    @staticmethod
    def calculate_lii(sponsored_bills_passed: int, sponsored_bills_total: int, voting_attendance: float, party_alignment: float, sample_size: int) -> tuple:
        """
        Computes the Legislative Influence Index (LII).
        Measures legislative consensus, sponsored bills efficacy, and district voting alignment.
        """
        passage_efficiency = sponsored_bills_passed / sponsored_bills_total if sponsored_bills_total > 0 else 0.0
        
        # Weighted metric
        raw_lii = (passage_efficiency * 0.4) + (voting_attendance * 0.3) + (party_alignment * 0.3)
        
        # Center and scale to [-3.0, +3.0]
        centered_lii = (raw_lii - 0.60) * 5.0
        
        norm_factor = 1.0 / (1.0 + math.exp(-(sample_size - 20) / 5.0))
        final_lii = centered_lii * norm_factor

        return round(final_lii, 4), round(norm_factor, 4)

def run_scoring_demos():
    logger.info("Executing mathematical scoring runs for sample entities...")
    
    # 1. Judge Aileen Cannon Demo
    # Sentences: 120mo, 110mo, 95mo (Guidelines: 110mo baseline median)
    judge_bji, judge_conf = ScoringEngine.calculate_bji(
        sentences=[120.0, 110.0, 95.0, 115.0, 130.0],
        guidelines=[110.0, 110.0, 100.0, 110.0, 120.0]
    )
    logger.info(f"Judicial BJI (Judge Cannon): Score = {judge_bji} z-score (Confidence: {judge_conf * 100}%)")

    # 2. Prosecutor Alvin Bragg Demo
    # Conviction: 85%, Charge Reductions: 45%, Dismissal: 15%, Sample: 45 cases
    proc_pdi, proc_conf = ScoringEngine.calculate_pdi(
        conviction_rate=0.85,
        charge_reduction_rate=0.45,
        dismissal_rate=0.15,
        sample_size=45
    )
    logger.info(f"Prosecutorial PDI (DA Bragg): Score = {proc_pdi:+0.2f} (Confidence: {proc_conf * 100}%)")

    # 3. Legislator Chuck Schumer Demo
    # Sponsored passed: 5, Total sponsored: 25, Attendance: 95%, Party Alignment: 88%, Sample: 110 bills
    leg_lii, leg_conf = ScoringEngine.calculate_lii(
        sponsored_bills_passed=5,
        sponsored_bills_total=25,
        voting_attendance=0.95,
        party_alignment=0.88,
        sample_size=110
    )
    logger.info(f"Legislative LII (Sen. Schumer): Score = {leg_lii:+0.2f} (Confidence: {leg_conf * 100}%)")

if __name__ == "__main__":
    run_scoring_demos()
