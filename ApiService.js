// ApiService.js - Handles all API calls to your Python backend

const API_BASE_URL = 'http://192.168.0.33:8000/api';

class ApiService {
  
  // Get a random defensive scenario
  static async getDefensiveScenario() {
    try {
      const response = await fetch(`${API_BASE_URL}/defensive-scenario`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching defensive scenario:', error);
      throw error;
    }
  }

  // Get all available offensive formations
  static async getOffensiveFormations() {
    try {
      const response = await fetch(`${API_BASE_URL}/offensive-formations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.formations;
    } catch (error) {
      console.error('Error fetching offensive formations:', error);
      throw error;
    }
  }

  // Get plays for a specific formation
  static async getFormationPlays(formationName) {
    try {
      const response = await fetch(`${API_BASE_URL}/offensive-formations/${formationName}/plays`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.plays;
    } catch (error) {
      console.error('Error fetching formation plays:', error);
      throw error;
    }
  }

  // Simulate a play
  static async simulatePlay(offensivePlay, defensiveScenario, minimumYards) {
    try {
      const response = await fetch(`${API_BASE_URL}/simulate-play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offensive_play: offensivePlay,
          defensive_scenario: defensiveScenario,
          minimum_yards: minimumYards
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error simulating play:', error);
      throw error;
    }
  }

  // Get API statistics
  static async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
}

export default ApiService;