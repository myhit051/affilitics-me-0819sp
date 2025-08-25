// AI Budget Optimization Service
// Implements simple budget allocation logic based on historical ROI performance

import { AIAnalysisData, AIBudgetOptimization, AIBudgetAllocation, AIBudgetConstraint } from '@/types/ai';
import { SubIdAnalysis, PlatformAnalysis } from './aiPerformanceAnalyzer';

export interface BudgetOptimizationResult {
  currentAllocation: AIBudgetAllocation[];
  recommendedAllocation: AIBudgetAllocation[];
  expectedImprovement: {
    roi: number;
    revenue: number;
    orders: number;
  };
  riskAssessment: 'low' | 'medium' | 'high';
  justification: string[];
  totalBudget: number;
  reallocationAmount: number;
  confidenceScore: number;
}

export interface BudgetConstraints {
  totalBudget: number;
  minBudgetPerSubId?: number;
  maxBudgetPerSubId?: number;
  minBudgetPerPlatform?: number;
  maxBudgetPerPlatform?: number;
  preserveTopPerformers?: boolean;
  maxReallocationPercentage?: number;
}

class AIBudgetOptimizer {
  private readonly MIN_ROI_THRESHOLD = 20; // Minimum ROI to consider for budget allocation
  private readonly HIGH_ROI_THRESHOLD = 50; // High ROI threshold for scaling
  private readonly MIN_ORDERS_FOR_RELIABILITY = 10; // Minimum orders for reliable budget decisions
  private readonly MAX_REALLOCATION_PERCENTAGE = 0.5; // Maximum 50% budget reallocation
  private readonly MIN_BUDGET_ALLOCATION = 0.05; // Minimum 5% budget allocation per Sub ID

  /**
   * Optimize budget allocation based on Sub ID and platform performance
   */
  optimizeBudgetAllocation(
    data: AIAnalysisData,
    subIdPerformance: SubIdAnalysis[],
    platformPerformance: PlatformAnalysis[],
    constraints?: BudgetConstraints
  ): BudgetOptimizationResult {
    console.log('🤖 AI Budget Optimizer: Optimizing budget allocation');
    
    const totalBudget = constraints?.totalBudget ?? data.calculatedMetrics.totalAdsSpent;
    const effectiveConstraints = this.buildConstraints(totalBudget, constraints);
    
    // Calculate current allocation based on historical spend
    const currentAllocation = this.calculateCurrentAllocation(data, subIdPerformance, totalBudget);
    
    // Generate optimized allocation
    const recommendedAllocation = this.generateOptimizedAllocation(
      currentAllocation,
      subIdPerformance,
      platformPerformance,
      effectiveConstraints
    );
    
    // Calculate expected improvements
    const expectedImprovement = this.calculateExpectedImprovement(
      currentAllocation,
      recommendedAllocation,
      subIdPerformance
    );
    
    // Assess risk level
    const riskAssessment = this.assessOptimizationRisk(
      currentAllocation,
      recommendedAllocation,
      subIdPerformance
    );
    
    // Generate justification
    const justification = this.generateJustification(
      currentAllocation,
      recommendedAllocation,
      subIdPerformance,
      expectedImprovement
    );
    
    // Calculate reallocation amount
    const reallocationAmount = this.calculateReallocationAmount(currentAllocation, recommendedAllocation);
    
    // Calculate confidence score
    const confidenceScore = this.calculateOptimizationConfidence(subIdPerformance, data.dailyMetrics.length);

    return {
      currentAllocation,
      recommendedAllocation,
      expectedImprovement,
      riskAssessment,
      justification,
      totalBudget,
      reallocationAmount,
      confidenceScore
    };
  }

  /**
   * Generate budget recommendations based on ROI performance
   */
  generateBudgetRecommendations(
    data: AIAnalysisData,
    subIdPerformance: SubIdAnalysis[],
    platformPerformance: PlatformAnalysis[]
  ): string[] {
    const recommendations: string[] = [];
    const totalBudget = data.calculatedMetrics.totalAdsSpent;
    
    // Identify high and low performers
    const highPerformers = subIdPerformance.filter(s => 
      s.roi > this.HIGH_ROI_THRESHOLD && s.orders >= this.MIN_ORDERS_FOR_RELIABILITY
    );
    const lowPerformers = subIdPerformance.filter(s => 
      s.roi < this.MIN_ROI_THRESHOLD && s.orders >= 5
    );
    
    // High performer scaling recommendations
    if (highPerformers.length > 0) {
      const totalHighPerformerSpend = highPerformers.reduce((sum, s) => sum + s.adSpend, 0);
      const potentialIncrease = Math.min(totalBudget * 0.3, totalHighPerformerSpend * 0.5);
      
      recommendations.push(
        `Scale budget for ${highPerformers.length} high-performing Sub IDs (ROI > ${this.HIGH_ROI_THRESHOLD}%) by up to $${potentialIncrease.toFixed(2)}`
      );
      
      highPerformers.slice(0, 3).forEach(subId => {
        const recommendedIncrease = (subId.adSpend * 0.3).toFixed(2);
        recommendations.push(
          `Increase ${subId.subId} budget by $${recommendedIncrease} (current ROI: ${subId.roi.toFixed(1)}%)`
        );
      });
    }
    
    // Low performer reduction recommendations
    if (lowPerformers.length > 0) {
      const totalLowPerformerSpend = lowPerformers.reduce((sum, s) => sum + s.adSpend, 0);
      const potentialSavings = totalLowPerformerSpend * 0.7;
      
      recommendations.push(
        `Reduce or pause budget for ${lowPerformers.length} underperforming Sub IDs (ROI < ${this.MIN_ROI_THRESHOLD}%) to save $${potentialSavings.toFixed(2)}`
      );
      
      lowPerformers.slice(0, 3).forEach(subId => {
        const recommendedReduction = (subId.adSpend * 0.5).toFixed(2);
        recommendations.push(
          `Reduce ${subId.subId} budget by $${recommendedReduction} (current ROI: ${subId.roi.toFixed(1)}%)`
        );
      });
    }
    
    // Platform-based recommendations
    if (platformPerformance.length > 1) {
      const bestPlatform = platformPerformance[0];
      const worstPlatform = platformPerformance[platformPerformance.length - 1];
      
      if (Math.abs(bestPlatform.roi - worstPlatform.roi) > 5) {
        const reallocationAmount = (worstPlatform.adSpend * 0.2).toFixed(2);
        recommendations.push(
          `Reallocate $${reallocationAmount} from ${worstPlatform.platform} (${worstPlatform.roi.toFixed(1)}% ROI) to ${bestPlatform.platform} (${bestPlatform.roi.toFixed(1)}% ROI)`
        );
      }
    }
    
    // Overall budget efficiency recommendations
    const overallROI = data.calculatedMetrics.roi;
    if (overallROI < this.MIN_ROI_THRESHOLD) {
      recommendations.push(
        `Overall ROI of ${overallROI.toFixed(1)}% is below target. Consider reducing total budget by 20% and focusing on proven performers`
      );
    } else if (overallROI > this.HIGH_ROI_THRESHOLD) {
      recommendations.push(
        `Strong overall ROI of ${overallROI.toFixed(1)}% indicates opportunity to scale total budget by 20-30%`
      );
    }
    
    return recommendations;
  }

  /**
   * Calculate ROI improvement estimation based on budget reallocation
   */
  estimateROIImprovement(
    currentAllocation: AIBudgetAllocation[],
    recommendedAllocation: AIBudgetAllocation[],
    subIdPerformance: SubIdAnalysis[]
  ): number {
    let currentWeightedROI = 0;
    let recommendedWeightedROI = 0;
    let totalCurrentBudget = 0;
    let totalRecommendedBudget = 0;
    
    // Calculate current weighted ROI
    currentAllocation.forEach(allocation => {
      const subIdData = subIdPerformance.find(s => s.subId === allocation.subId);
      if (subIdData) {
        currentWeightedROI += subIdData.roi * allocation.currentBudget;
        totalCurrentBudget += allocation.currentBudget;
      }
    });
    
    // Calculate recommended weighted ROI
    recommendedAllocation.forEach(allocation => {
      const subIdData = subIdPerformance.find(s => s.subId === allocation.subId);
      if (subIdData) {
        recommendedWeightedROI += allocation.expectedROI * allocation.recommendedBudget;
        totalRecommendedBudget += allocation.recommendedBudget;
      }
    });
    
    const currentAvgROI = totalCurrentBudget > 0 ? currentWeightedROI / totalCurrentBudget : 0;
    const recommendedAvgROI = totalRecommendedBudget > 0 ? recommendedWeightedROI / totalRecommendedBudget : 0;
    
    return recommendedAvgROI - currentAvgROI;
  }

  /**
   * Validate budget optimization constraints
   */
  validateConstraints(
    allocation: AIBudgetAllocation[],
    constraints: BudgetConstraints
  ): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];
    
    // Check total budget constraint
    const totalAllocated = allocation.reduce((sum, a) => sum + a.recommendedBudget, 0);
    if (Math.abs(totalAllocated - constraints.totalBudget) > 0.01) {
      violations.push(`Total allocated budget (${totalAllocated.toFixed(2)}) doesn't match constraint (${constraints.totalBudget.toFixed(2)})`);
    }
    
    // Check minimum budget per Sub ID
    if (constraints.minBudgetPerSubId) {
      allocation.forEach(a => {
        if (a.recommendedBudget < constraints.minBudgetPerSubId!) {
          violations.push(`${a.subId} budget (${a.recommendedBudget.toFixed(2)}) below minimum (${constraints.minBudgetPerSubId!.toFixed(2)})`);
        }
      });
    }
    
    // Check maximum budget per Sub ID
    if (constraints.maxBudgetPerSubId) {
      allocation.forEach(a => {
        if (a.recommendedBudget > constraints.maxBudgetPerSubId!) {
          violations.push(`${a.subId} budget (${a.recommendedBudget.toFixed(2)}) exceeds maximum (${constraints.maxBudgetPerSubId!.toFixed(2)})`);
        }
      });
    }
    
    // Check maximum reallocation percentage
    if (constraints.maxReallocationPercentage) {
      allocation.forEach(a => {
        if (a.currentBudget > 0) {
          const reallocationPercentage = Math.abs(a.recommendedBudget - a.currentBudget) / a.currentBudget;
          if (reallocationPercentage > constraints.maxReallocationPercentage!) {
            violations.push(`${a.subId} reallocation (${(reallocationPercentage * 100).toFixed(1)}%) exceeds maximum (${(constraints.maxReallocationPercentage! * 100).toFixed(1)}%)`);
          }
        }
      });
    }
    
    return {
      isValid: violations.length === 0,
      violations
    };
  }

  // Private helper methods

  private buildConstraints(totalBudget: number, userConstraints?: BudgetConstraints): BudgetConstraints {
    return {
      totalBudget,
      minBudgetPerSubId: userConstraints?.minBudgetPerSubId || totalBudget * this.MIN_BUDGET_ALLOCATION,
      maxBudgetPerSubId: userConstraints?.maxBudgetPerSubId || totalBudget * 0.4,
      maxReallocationPercentage: userConstraints?.maxReallocationPercentage || this.MAX_REALLOCATION_PERCENTAGE,
      preserveTopPerformers: userConstraints?.preserveTopPerformers ?? true,
      ...userConstraints
    };
  }

  private calculateCurrentAllocation(
    data: AIAnalysisData,
    subIdPerformance: SubIdAnalysis[],
    totalBudget: number
  ): AIBudgetAllocation[] {
    const allocations: AIBudgetAllocation[] = [];
    
    // Calculate total spend across all Sub IDs
    const totalSubIdSpend = subIdPerformance.reduce((sum, s) => sum + s.adSpend, 0);
    
    subIdPerformance.forEach(subId => {
      // Calculate current budget as proportion of total spend
      const currentBudget = totalSubIdSpend > 0 
        ? (subId.adSpend / totalSubIdSpend) * totalBudget
        : totalBudget / subIdPerformance.length;
      
      allocations.push({
        subId: subId.subId,
        platform: subId.platform,
        currentBudget,
        recommendedBudget: currentBudget, // Will be updated in optimization
        expectedROI: subId.roi,
        confidence: subId.confidenceScore,
        reasoning: `Current allocation based on historical spend of $${subId.adSpend.toFixed(2)}`
      });
    });
    
    return allocations;
  }

  private generateOptimizedAllocation(
    currentAllocation: AIBudgetAllocation[],
    subIdPerformance: SubIdAnalysis[],
    platformPerformance: PlatformAnalysis[],
    constraints: BudgetConstraints
  ): AIBudgetAllocation[] {
    const optimizedAllocation = [...currentAllocation];
    
    // Sort Sub IDs by performance score for optimization
    const sortedSubIds = [...subIdPerformance].sort((a, b) => b.performanceScore - a.performanceScore);
    
    // Identify high and low performers
    const highPerformers = sortedSubIds.filter(s => 
      s.roi > this.HIGH_ROI_THRESHOLD && s.orders >= this.MIN_ORDERS_FOR_RELIABILITY
    );
    const lowPerformers = sortedSubIds.filter(s => 
      s.roi < this.MIN_ROI_THRESHOLD
    );
    
    // Calculate reallocation amounts
    let budgetToReallocate = 0;
    
    // Reduce budget from low performers
    lowPerformers.forEach(lowPerformer => {
      const allocation = optimizedAllocation.find(a => a.subId === lowPerformer.subId);
      if (allocation) {
        const reduction = Math.min(
          allocation.currentBudget * 0.5, // Reduce by up to 50%
          allocation.currentBudget - constraints.minBudgetPerSubId! // But maintain minimum
        );
        
        allocation.recommendedBudget = allocation.currentBudget - reduction;
        budgetToReallocate += reduction;
        allocation.reasoning = `Reduced budget due to low ROI (${lowPerformer.roi.toFixed(1)}%)`;
      }
    });
    
    // Allocate budget to high performers
    if (budgetToReallocate > 0 && highPerformers.length > 0) {
      const budgetPerHighPerformer = budgetToReallocate / highPerformers.length;
      
      highPerformers.forEach(highPerformer => {
        const allocation = optimizedAllocation.find(a => a.subId === highPerformer.subId);
        if (allocation) {
          const maxIncrease = Math.min(
            budgetPerHighPerformer,
            constraints.maxBudgetPerSubId! - allocation.currentBudget
          );
          
          // Apply reallocation constraint only if current budget > 0
          const increase = allocation.currentBudget > 0 
            ? Math.min(maxIncrease, allocation.currentBudget * constraints.maxReallocationPercentage!)
            : maxIncrease;
          
          allocation.recommendedBudget = allocation.currentBudget + increase;
          allocation.expectedROI = highPerformer.roi * 1.1; // Assume 10% improvement with more budget
          allocation.reasoning = `Increased budget due to high ROI (${highPerformer.roi.toFixed(1)}%) and strong performance`;
        }
      });
    }
    
    // Ensure total budget constraint is met
    this.normalizeAllocation(optimizedAllocation, constraints.totalBudget);
    
    return optimizedAllocation;
  }

  private normalizeAllocation(allocation: AIBudgetAllocation[], targetTotal: number): void {
    const currentTotal = allocation.reduce((sum, a) => sum + a.recommendedBudget, 0);
    
    if (Math.abs(currentTotal - targetTotal) > 0.01) {
      const normalizationFactor = targetTotal / currentTotal;
      
      allocation.forEach(a => {
        a.recommendedBudget *= normalizationFactor;
      });
    }
  }

  private calculateExpectedImprovement(
    currentAllocation: AIBudgetAllocation[],
    recommendedAllocation: AIBudgetAllocation[],
    subIdPerformance: SubIdAnalysis[]
  ): { roi: number; revenue: number; orders: number } {
    const currentROI = this.estimateROIImprovement(currentAllocation, currentAllocation, subIdPerformance);
    const recommendedROI = this.estimateROIImprovement(currentAllocation, recommendedAllocation, subIdPerformance);
    
    const roiImprovement = recommendedROI - currentROI;
    const totalBudget = recommendedAllocation.reduce((sum, a) => sum + a.recommendedBudget, 0);
    const revenueImprovement = (roiImprovement / 100) * totalBudget;
    
    // Estimate order improvement based on average order value
    const avgOrderValue = subIdPerformance.length > 0
      ? subIdPerformance.reduce((sum, s) => sum + (s.revenue / Math.max(s.orders, 1)), 0) / subIdPerformance.length
      : 100;
    
    const orderImprovement = avgOrderValue > 0 ? revenueImprovement / avgOrderValue : 0;
    
    return {
      roi: roiImprovement,
      revenue: revenueImprovement,
      orders: Math.round(orderImprovement)
    };
  }

  private assessOptimizationRisk(
    currentAllocation: AIBudgetAllocation[],
    recommendedAllocation: AIBudgetAllocation[],
    subIdPerformance: SubIdAnalysis[]
  ): 'low' | 'medium' | 'high' {
    let riskScore = 0;
    
    // Calculate total reallocation percentage
    const totalReallocation = recommendedAllocation.reduce((sum, rec) => {
      const current = currentAllocation.find(c => c.subId === rec.subId);
      if (current) {
        return sum + Math.abs(rec.recommendedBudget - current.currentBudget);
      }
      return sum;
    }, 0);
    
    const totalBudget = currentAllocation.reduce((sum, a) => sum + a.currentBudget, 0);
    const reallocationPercentage = totalBudget > 0 ? totalReallocation / totalBudget : 0;
    
    // High reallocation increases risk
    if (reallocationPercentage > 0.4) riskScore += 30;
    else if (reallocationPercentage > 0.2) riskScore += 15;
    
    // Low confidence Sub IDs increase risk
    const lowConfidenceSubIds = subIdPerformance.filter(s => s.confidenceScore < 60);
    riskScore += lowConfidenceSubIds.length * 10;
    
    // High variance in ROI increases risk
    const roiValues = subIdPerformance.map(s => s.roi);
    const roiVariance = this.calculateVariance(roiValues);
    if (roiVariance > 30) riskScore += 20;
    else if (roiVariance > 15) riskScore += 10;
    
    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  }

  private generateJustification(
    currentAllocation: AIBudgetAllocation[],
    recommendedAllocation: AIBudgetAllocation[],
    subIdPerformance: SubIdAnalysis[],
    expectedImprovement: { roi: number; revenue: number; orders: number }
  ): string[] {
    const justifications: string[] = [];
    
    // Overall improvement justification
    if (expectedImprovement.roi > 0) {
      justifications.push(
        `Budget reallocation is expected to improve overall ROI by ${expectedImprovement.roi.toFixed(1)}%`
      );
    }
    
    if (expectedImprovement.revenue > 0) {
      justifications.push(
        `Projected additional revenue of $${expectedImprovement.revenue.toFixed(2)} from optimization`
      );
    }
    
    // Performance-based justifications
    const highPerformers = subIdPerformance.filter(s => s.roi > this.HIGH_ROI_THRESHOLD);
    const lowPerformers = subIdPerformance.filter(s => s.roi < this.MIN_ROI_THRESHOLD);
    
    if (highPerformers.length > 0) {
      justifications.push(
        `${highPerformers.length} Sub IDs with ROI > ${this.HIGH_ROI_THRESHOLD}% deserve increased budget allocation`
      );
    }
    
    if (lowPerformers.length > 0) {
      justifications.push(
        `${lowPerformers.length} Sub IDs with ROI < ${this.MIN_ROI_THRESHOLD}% should have reduced budget allocation`
      );
    }
    
    // Data-driven justification
    const totalOrders = subIdPerformance.reduce((sum, s) => sum + s.orders, 0);
    justifications.push(
      `Optimization based on analysis of ${totalOrders} orders across ${subIdPerformance.length} Sub IDs`
    );
    
    return justifications;
  }

  private calculateReallocationAmount(
    currentAllocation: AIBudgetAllocation[],
    recommendedAllocation: AIBudgetAllocation[]
  ): number {
    return recommendedAllocation.reduce((sum, rec) => {
      const current = currentAllocation.find(c => c.subId === rec.subId);
      if (current) {
        return sum + Math.abs(rec.recommendedBudget - current.currentBudget);
      }
      return sum;
    }, 0);
  }

  private calculateOptimizationConfidence(subIdPerformance: SubIdAnalysis[], dataPoints: number): number {
    let confidence = 60; // Base confidence
    
    // More Sub IDs with reliable data increase confidence
    const reliableSubIds = subIdPerformance.filter(s => s.orders >= this.MIN_ORDERS_FOR_RELIABILITY);
    confidence += Math.min(20, reliableSubIds.length * 2);
    
    // More historical data increases confidence
    if (dataPoints >= 30) confidence += 15;
    else if (dataPoints >= 14) confidence += 10;
    else if (dataPoints >= 7) confidence += 5;
    
    // High confidence Sub IDs increase overall confidence
    const avgSubIdConfidence = subIdPerformance.length > 0
      ? subIdPerformance.reduce((sum, s) => sum + s.confidenceScore, 0) / subIdPerformance.length
      : 0;
    confidence += (avgSubIdConfidence - 60) * 0.2;
    
    return Math.min(90, Math.max(50, confidence));
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private generateId(): string {
    return `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const aiBudgetOptimizer = new AIBudgetOptimizer();