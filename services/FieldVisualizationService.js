// Service for handling field visualization API calls

const API_BASE_URL = 'https://qb-pre-snap-simulator-production.up.railway.app/api';

export class FieldVisualizationService {
  
  // Get player positions for a formation
  static async getFormationPositions(formationName, yardsToGo = 10) {
    try {
      // Convert formation name to API format (lowercase, hyphens)
      const apiFormationName = formationName.toLowerCase().replace(/\s+/g, '-');
      
      const response = await fetch(`${API_BASE_URL}/defensive-formation/${apiFormationName}/positions?yards_to_go=${yardsToGo}`);
      
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

  // Get coverage zones for visualization
  static async getCoverageZones(coverageName) {
    try {
      // Convert coverage name to API format
      const apiCoverageName = coverageName.toLowerCase().replace(/\s+/g, '_');
      
      const response = await fetch(`${API_BASE_URL}/coverage-zones/${apiCoverageName}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching coverage zones:', error);
      throw error;
    }
  }

  // Get enhanced defensive scenario with field data
  static async getEnhancedDefensiveScenario() {
    try {
      const response = await fetch(`${API_BASE_URL}/defensive-scenario/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching enhanced defensive scenario:', error);
      throw error;
    }
  }

  // Get formation list for dropdown/selection
  static async getAvailableFormations() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return common formations - you can expand this list
      return [
        { name: '4-3 Defense', key: '4-3' },
        { name: '3-4 Defense', key: '3-4' },
        { name: 'Nickel Defense', key: 'nickel' },
        { name: 'Dime Defense', key: 'dime' },
        { name: '46 Defense', key: '46' },
        { name: '4-4 Defense', key: '4-4' },
        { name: '5-2 Defense', key: '5-2' }
      ];
      
    } catch (error) {
      console.error('Error fetching available formations:', error);
      throw error;
    }
  }
}