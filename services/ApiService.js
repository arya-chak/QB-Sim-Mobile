// ApiService.js - Handles all API calls to your Python backend

// const API_BASE_URL = 'https://qb-pre-snap-simulator-production.up.railway.app/api';
const API_BASE_URL = 'http://192.168.1.181:8000/api';

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

  static async getStrategicPlays(defensiveScenario, minimumYards) {
    try {
      const response = await fetch(`${API_BASE_URL}/strategic-plays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: defensiveScenario,
          minimum_yards: minimumYards
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching strategic plays:', error);
      throw error;
    }
  }

  /**
   * Get list of all offensive formations for library browser
   */
  static async getLibraryOffensiveFormations() {
    try {
      const response = await fetch(`${API_BASE_URL}/library/offensive-formations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching library offensive formations:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific offensive formation
   * @param {string} formationKey - The formation key (e.g., "i-form", "shotgun")
   */
  static async getOffensiveFormationDetails(formationKey) {
    try {
      const response = await fetch(`${API_BASE_URL}/library/offensive-formations/${formationKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching offensive formation details:', error);
      throw error;
    }
  }

  /**
   * Get list of all defensive formations for library browser
   */
  static async getLibraryDefensiveFormations() {
    try {
      const response = await fetch(`${API_BASE_URL}/library/defensive-formations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching library defensive formations:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific defensive formation
   * @param {string} formationKey - The formation key (e.g., "4-3", "nickel")
   */
  static async getDefensiveFormationDetails(formationKey) {
    try {
      const response = await fetch(`${API_BASE_URL}/library/defensive-formations/${formationKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching defensive formation details:', error);
      throw error;
    }
  }

  /**
   * Search across all formations, plays, and coverage packages
   * @param {string} query - Search query
   * @param {string} formationType - Optional: "offensive" or "defensive" to filter results
   * @param {string} category - Optional: "formation", "play", "coverage" to filter results
   */
  static async searchLibrary(query, formationType = null, category = null) {
    try {
      let url = `${API_BASE_URL}/library/search?query=${encodeURIComponent(query)}`;
      
      if (formationType) {
        url += `&formation_type=${formationType}`;
      }
      
      if (category) {
        url += `&category=${category}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching library:', error);
      throw error;
    }
  }

  /**
   * Get formation field visualization data
   * @param {string} formationName - Formation name for SVG visualization
   * @param {number} yardsToGo - Yards to go for field setup
   */
  static async getFormationPositions(formationName, yardsToGo = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/defensive-formation/${formationName}/positions?yards_to_go=${yardsToGo}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching formation positions:', error);
      throw error;
    }
  }

}

export default ApiService;