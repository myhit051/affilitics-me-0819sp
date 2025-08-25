// AI Configuration Service
// Manages AI analysis settings and user preferences

import { AIConfig } from '@/types/ai';

class AIConfigService {
  private readonly STORAGE_KEY = 'ai_config';
  private defaultConfig: AIConfig = {
    analysisSettings: {
      minDataPoints: 10,
      confidenceThreshold: 70,
      predictionTimeframes: [7, 14, 30],
      alertThresholds: {
        roi: { warning: 30, critical: 10 },
        spend: { warning: 1000, critical: 2000 },
        orders: { warning: -20, critical: -50 } // Percentage change
      }
    },
    modelSettings: {
      enablePredictions: true,
      enableRecommendations: true,
      enableAlerts: true,
      enableBudgetOptimization: true,
      updateFrequency: 24 // Hours
    },
    userPreferences: {
      preferredMetrics: ['roi', 'revenue', 'orders'],
      riskTolerance: 'moderate',
      autoApplyRecommendations: false,
      notificationSettings: {
        email: false,
        inApp: true,
        frequency: 'daily'
      }
    }
  };

  getConfig(): AIConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return this.mergeWithDefaults(parsedConfig);
      }
    } catch (error) {
      console.warn('Failed to load AI config from localStorage:', error);
    }
    
    return { ...this.defaultConfig };
  }

  updateConfig(updates: Partial<AIConfig>): void {
    try {
      const currentConfig = this.getConfig();
      const newConfig = this.deepMerge(currentConfig, updates);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newConfig));
      console.log('AI config updated:', newConfig);
    } catch (error) {
      console.error('Failed to update AI config:', error);
    }
  }

  resetToDefaults(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultConfig));
      console.log('AI config reset to defaults');
    } catch (error) {
      console.error('Failed to reset AI config:', error);
    }
  }

  // Analysis settings helpers
  getMinDataPoints(): number {
    return this.getConfig().analysisSettings.minDataPoints;
  }

  getConfidenceThreshold(): number {
    return this.getConfig().analysisSettings.confidenceThreshold;
  }

  getPredictionTimeframes(): number[] {
    return this.getConfig().analysisSettings.predictionTimeframes;
  }

  getAlertThresholds() {
    return this.getConfig().analysisSettings.alertThresholds;
  }

  // Model settings helpers
  isPredictionsEnabled(): boolean {
    return this.getConfig().modelSettings.enablePredictions;
  }

  isRecommendationsEnabled(): boolean {
    return this.getConfig().modelSettings.enableRecommendations;
  }

  isAlertsEnabled(): boolean {
    return this.getConfig().modelSettings.enableAlerts;
  }

  isBudgetOptimizationEnabled(): boolean {
    return this.getConfig().modelSettings.enableBudgetOptimization;
  }

  getUpdateFrequency(): number {
    return this.getConfig().modelSettings.updateFrequency;
  }

  // User preferences helpers
  getPreferredMetrics(): string[] {
    return this.getConfig().userPreferences.preferredMetrics;
  }

  getRiskTolerance(): 'conservative' | 'moderate' | 'aggressive' {
    return this.getConfig().userPreferences.riskTolerance;
  }

  isAutoApplyEnabled(): boolean {
    return this.getConfig().userPreferences.autoApplyRecommendations;
  }

  getNotificationSettings() {
    return this.getConfig().userPreferences.notificationSettings;
  }

  // Validation helpers
  validateConfig(config: Partial<AIConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.analysisSettings) {
      const { analysisSettings } = config;
      
      if (analysisSettings.minDataPoints !== undefined && analysisSettings.minDataPoints < 1) {
        errors.push('Minimum data points must be at least 1');
      }
      
      if (analysisSettings.confidenceThreshold !== undefined && 
          (analysisSettings.confidenceThreshold < 0 || analysisSettings.confidenceThreshold > 100)) {
        errors.push('Confidence threshold must be between 0 and 100');
      }
      
      if (analysisSettings.predictionTimeframes !== undefined) {
        const invalidTimeframes = analysisSettings.predictionTimeframes.filter(tf => tf < 1 || tf > 365);
        if (invalidTimeframes.length > 0) {
          errors.push('Prediction timeframes must be between 1 and 365 days');
        }
      }
    }

    if (config.modelSettings) {
      const { modelSettings } = config;
      
      if (modelSettings.updateFrequency !== undefined && modelSettings.updateFrequency < 1) {
        errors.push('Update frequency must be at least 1 hour');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Configuration presets
  getConservativePreset(): Partial<AIConfig> {
    return {
      analysisSettings: {
        minDataPoints: 50,
        confidenceThreshold: 80,
        predictionTimeframes: [7, 14],
        alertThresholds: {
          roi: { warning: 40, critical: 20 },
          spend: { warning: 500, critical: 1000 },
          orders: { warning: -10, critical: -25 }
        }
      },
      userPreferences: {
        riskTolerance: 'conservative',
        autoApplyRecommendations: false,
        preferredMetrics: ['roi', 'profit'],
        notificationSettings: {
          email: true,
          inApp: true,
          frequency: 'immediate'
        }
      }
    };
  }

  getAggressivePreset(): Partial<AIConfig> {
    return {
      analysisSettings: {
        minDataPoints: 10,
        confidenceThreshold: 60,
        predictionTimeframes: [7, 14, 30, 60],
        alertThresholds: {
          roi: { warning: 20, critical: 0 },
          spend: { warning: 2000, critical: 5000 },
          orders: { warning: -30, critical: -60 }
        }
      },
      userPreferences: {
        riskTolerance: 'aggressive',
        autoApplyRecommendations: true,
        preferredMetrics: ['revenue', 'orders', 'roi'],
        notificationSettings: {
          email: false,
          inApp: true,
          frequency: 'weekly'
        }
      }
    };
  }

  applyPreset(preset: 'conservative' | 'moderate' | 'aggressive'): void {
    let presetConfig: Partial<AIConfig>;
    
    switch (preset) {
      case 'conservative':
        presetConfig = this.getConservativePreset();
        break;
      case 'aggressive':
        presetConfig = this.getAggressivePreset();
        break;
      case 'moderate':
      default:
        presetConfig = {}; // Use defaults
        break;
    }
    
    this.updateConfig(presetConfig);
  }

  // Private helper methods
  private mergeWithDefaults(config: any): AIConfig {
    return this.deepMerge(this.defaultConfig, config);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // Export/Import configuration
  exportConfig(): string {
    const config = this.getConfig();
    return JSON.stringify(config, null, 2);
  }

  importConfig(configJson: string): { success: boolean; error?: string } {
    try {
      const config = JSON.parse(configJson);
      const validation = this.validateConfig(config);
      
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid configuration: ${validation.errors.join(', ')}`
        };
      }
      
      this.updateConfig(config);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const aiConfigService = new AIConfigService();