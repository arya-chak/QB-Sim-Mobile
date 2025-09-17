// services/GapScenarioService.js
// Service for handling gap recognition scenario API calls
// Following the same pattern as FieldVisualizationService

// const API_BASE_URL = 'https://qb-pre-snap-simulator-production.up.railway.app/api';
const API_BASE_URL = 'http://192.168.1.181:8000/api';

export class GapScenarioService {
  
  // Get a random gap scenario
  static async getRandomGapScenario() {
    try {
      const response = await fetch(`${API_BASE_URL}/gap-scenario/random`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching random gap scenario:', error);
      throw error;
    }
  }

  // Get a specific gap scenario by ID
  static async getGapScenario(scenarioId) {
    try {
      const response = await fetch(`${API_BASE_URL}/gap-scenario/${scenarioId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching gap scenario:', error);
      throw error;
    }
  }

  // Get all available gap scenarios
  static async getAllGapScenarios() {
    try {
      const response = await fetch(`${API_BASE_URL}/gap-scenarios`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching gap scenarios:', error);
      throw error;
    }
  }

  // Analyze gap choice and get result
  static async analyzeGapChoice(scenarioId, selectedGap) {
    try {
      const response = await fetch(`${API_BASE_URL}/gap-scenario/${scenarioId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_gap: selectedGap
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error analyzing gap choice:', error);
      throw error;
    }
  }

  // Get gap scenario with formation positions (for visualization)
  static async getGapScenarioWithPositions(scenarioId, yardsToGo = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/gap-scenario/${scenarioId}/positions?yards_to_go=${yardsToGo}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching gap scenario with positions:', error);
      throw error;
    }
  }

  // Get enhanced gap training session (multiple scenarios)
  static async getGapTrainingSession(difficulty = 'medium', numScenarios = 5) {
    try {
      const response = await fetch(`${API_BASE_URL}/gap-training-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty: difficulty,
          num_scenarios: numScenarios
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching gap training session:', error);
      throw error;
    }
  }
}