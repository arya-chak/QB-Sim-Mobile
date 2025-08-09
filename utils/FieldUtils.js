// Utility functions for field calculations, colors, and formatting

export class FieldUtils {
  
  // Convert your Python alignment data to mobile-friendly format
  static convertAlignmentToPlayers(alignment, blitzingPositions = []) {
    const positionTypes = {
      // Defensive Line
      'DE_weak': { pos: 'E', type: 'dline', label: 'Weak DE' },
      'DE_strong': { pos: 'E', type: 'dline', label: 'Strong DE' },
      'DT_weak': { pos: 'T', type: 'dline', label: 'Weak DT' },
      'DT_strong': { pos: 'T', type: 'dline', label: 'Strong DT' },
      'NT': { pos: 'N', type: 'dline', label: 'Nose Tackle' },
      
      // Linebackers
      'WLB': { pos: 'W', type: 'lb', label: 'Weak LB' },
      'MLB': { pos: 'M', type: 'lb', label: 'Middle LB' },
      'SLB': { pos: 'S', type: 'lb', label: 'Strong LB' },
      'OLB_weak': { pos: 'B', type: 'lb', label: 'Weak OLB' },
      'OLB_strong': { pos: 'B', type: 'lb', label: 'Strong OLB' },
      'ILB_weak': { pos: 'M', type: 'lb', label: 'Weak ILB' },
      'ILB_strong': { pos: 'M', type: 'lb', label: 'Strong ILB' },
      'MLB_weak': { pos: 'M', type: 'lb', label: 'Weak MLB' },
      'MLB_strong': { pos: 'M', type: 'lb', label: 'Strong MLB' },
      'ROVER': { pos: 'R', type: 'lb', label: 'Rover LB' },
      
      // Secondary
      'CB_weak': { pos: 'C', type: 'db', label: 'Weak CB' },
      'CB_strong': { pos: 'C', type: 'db', label: 'Strong CB' },
      'FS': { pos: 'F', type: 'db', label: 'Free Safety' },
      'SS': { pos: 'S', type: 'db', label: 'Strong Safety' },
      'NB': { pos: '△', type: 'db', label: 'Nickel Back' },
      'NB_weak': { pos: '△', type: 'db', label: 'Weak Nickel' },
      'NB_strong': { pos: '△', type: 'db', label: 'Strong Nickel' },
    };

    const players = [];
    
    // Handle both object format {position: [row, col]} and array format
    const alignmentEntries = Array.isArray(alignment) 
      ? alignment.map((player, index) => [`player_${index}`, player])
      : Object.entries(alignment);

    for (const [positionKey, coordinates] of alignmentEntries) {
      if (positionTypes[positionKey]) {
        const playerData = positionTypes[positionKey];
        
        // Handle different coordinate formats
        let x, y;
        if (Array.isArray(coordinates)) {
          y = coordinates[0]; // row
          x = coordinates[1]; // column
        } else if (typeof coordinates === 'object' && coordinates.x !== undefined) {
          x = coordinates.x;
          y = coordinates.y;
        } else {
          continue; // Skip if format is unrecognized
        }
        
        players.push({
          id: positionKey,
          pos: playerData.pos,
          x: x,
          y: y,
          type: playerData.type,
          label: playerData.label,
          isBlitzing: blitzingPositions.includes(positionKey)
        });
      }
    }
    
    return players;
  }

  // Get colors for position types
  static getPlayerColors(type, isBlitzing = false) {
    if (isBlitzing) {
      return { 
        bg: '#dc2626',    // Red background for blitzers
        border: '#fca5a5', 
        text: '#ffffff' 
      };
    }
    
    switch (type) {
      case 'dline':
        return { 
          bg: '#7f1d1d',    // Dark red for defensive line
          border: '#ef4444', 
          text: '#fca5a5' 
        };
      case 'lb':
        return { 
          bg: '#1e3a8a',    // Dark blue for linebackers
          border: '#3b82f6', 
          text: '#93c5fd' 
        };
      case 'db':
        return { 
          bg: '#581c87',    // Dark purple for defensive backs
          border: '#a855f7', 
          text: '#c4b5fd' 
        };
      default:
        return { 
          bg: '#374151',    // Gray for unknown
          border: '#6b7280', 
          text: '#d1d5db' 
        };
    }
  }

  // Scale coordinates for different screen sizes
  static scaleCoordinates(x, y, fieldWidth, fieldHeight, targetWidth, targetHeight) {
    const scaleX = targetWidth / fieldWidth;
    const scaleY = targetHeight / fieldHeight;
    
    return {
      x: x * scaleX,
      y: y * scaleY
    };
  }

  // Convert field coordinates to SVG coordinates
  static fieldToSVG(x, y, cellWidth, cellHeight) {
    return {
      x: x * cellWidth,
      y: y * cellHeight
    };
  }

  // Get formation legend based on formation name
  static getFormationLegend(formationName) {
    const legends = {
      "4-3": {
        "Defensive Line": "E = DE, T = DT",
        "Linebackers": "W = WLB, M = MLB, S = SLB",
        "Secondary": "C = CB, F = FS, S = SS"
      },
      "3-4": {
        "Defensive Line": "E = DE, N = NT",
        "Linebackers": "B = OLB, M = ILB",
        "Secondary": "C = CB, F = FS, S = SS"
      },
      "5-2": {
        "Defensive Line": "E = DE, T = DT, N = NT",
        "Linebackers": "M = MLB",
        "Secondary": "C = CB, F = FS, S = SS"
      },
      "4-4": {
        "Defensive Line": "E = DE, T = DT",
        "Linebackers": "B = OLB, M = ILB",
        "Secondary": "C = CB, F = FS"
      },
      "46": {
        "Defensive Line": "E = DE, T = DT",
        "Linebackers": "B = OLB, M = MLB, R = Rover",
        "Secondary": "C = CB, F = FS"
      },
      "nickel": {
        "Defensive Line": "E = DE, T = DT",
        "Linebackers": "M = MLB",
        "Secondary": "C = CB, △ = Nickel, F = FS, S = SS"
      },
      "dime": {
        "Defensive Line": "E = DE, T = DT",
        "Linebackers": "M = MLB",
        "Secondary": "C = CB, △ = Nickel, F = FS, S = SS"
      }
    };
    
    // Clean up formation name for lookup
    const cleanName = formationName.toLowerCase().replace(' defense', '').replace('-', '');
    return legends[cleanName] || legends["4-3"];
  }

  // Get coverage zone colors
  static getCoverageZoneColor(zoneType) {
    switch (zoneType) {
      case 'deep':
        return '#7c3aed'; // Purple for deep zones
      case 'underneath':
      case 'hook':
        return '#1d4ed8'; // Blue for underneath zones
      case 'flat':
        return '#059669'; // Green for flat zones
      case 'man':
        return '#dc2626'; // Red for man coverage
      default:
        return '#6b7280'; // Gray for unknown
    }
  }

  // Parse blitzer information from blitz package
  static parseBlitzers(blitzData) {
    const blitzers = [];
    const blitzer = blitzData?.blitzer || 'none';
    
    if (blitzer === 'none') return blitzers;
    
    // Map common blitzer types to position keys
    const blitzerMappings = {
      'MLB': ['MLB'],
      'mike': ['MLB'],
      'WLB': ['WLB'],
      'weak': ['WLB'],
      'SLB': ['SLB'],
      'strong': ['SLB'],
      'OLB_weak': ['OLB_weak'],
      'OLB_strong': ['OLB_strong'],
      'FS': ['FS'],
      'free_safety': ['FS'],
      'SS': ['SS'],
      'strong_safety': ['SS'],
      'both_linebackers': ['WLB', 'SLB'],
      'both_outside_linebackers': ['OLB_weak', 'OLB_strong'],
      'double_a_gap': ['ILB_weak', 'ILB_strong']
    };
    
    // Look for matches in the blitzer string
    for (const [key, positions] of Object.entries(blitzerMappings)) {
      if (blitzer.toLowerCase().includes(key.toLowerCase())) {
        blitzers.push(...positions);
        break;
      }
    }
    
    return blitzers;
  }

  // Format yards display
  static formatYards(yards) {
    if (yards === 1) return '1 yard';
    return `${yards} yards`;
  }

  // Get down and distance display
  static formatDownAndDistance(down, yards) {
    const ordinals = ['', '1st', '2nd', '3rd', '4th'];
    return `${ordinals[down] || `${down}th`} & ${this.formatYards(yards)}`;
  }

  // Validate field data
  static validateFieldData(fieldData) {
    if (!fieldData) return false;
    if (!fieldData.players || !Array.isArray(fieldData.players)) return false;
    if (typeof fieldData.line_of_scrimmage !== 'number') return false;
    if (typeof fieldData.first_down_marker !== 'number') return false;
    
    return true;
  }
}