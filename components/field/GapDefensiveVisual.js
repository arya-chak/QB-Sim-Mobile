import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { 
  Rect, 
  Line, 
  Circle, 
  Text as SvgText, 
  G, 
  Defs,
  Marker,
  Polygon
} from 'react-native-svg';
import { GapScenarioService } from '../../services/GapScenarioService';

const GapDefensiveVisual = ({ 
  scenarioId = null,
  yardsToGo = 10,
  showPressureArrows = true,
  showGapLabels = true,
  onPlayerPress = null 
}) => {
  const [scenarioData, setScenarioData] = useState(null);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Field dimensions for mobile (matching SVGFieldVisualizer)
  const fieldWidth = 350;
  const fieldHeight = 200;
  const losY = fieldHeight * 0.75; // Line of scrimmage at 75% down

  useEffect(() => {
    loadScenarioData();
  }, [scenarioId, yardsToGo]);

  const loadScenarioData = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (scenarioId) {
        // Load specific scenario
        data = await GapScenarioService.getGapScenarioWithPositions(scenarioId, yardsToGo);
      } else {
        // Load random scenario
        data = await GapScenarioService.getRandomGapScenario();
      }
      
      setScenarioData(data);

    } catch (err) {
      console.error('Error loading gap scenario data:', err);
      setError('Failed to load scenario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerPress = (player) => {
    setHoveredPlayer(player);
    if (onPlayerPress) {
      onPlayerPress(player);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading gap scenario...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadScenarioData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!scenarioData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No scenario data available</Text>
      </View>
    );
  }

  const { defense } = scenarioData;

  // Color mapping for different defensive positions (matching existing pattern)
  const getPlayerColor = (position) => {
    if (position.includes('E') || position.includes('DT') || position.includes('NT')) {
      return {
        bg: '#dc2626', // Red for D-Line
        border: '#7f1d1d',
        text: '#ffffff'
      };
    }
    if (position.includes('LB') || position.includes('OLB') || position.includes('ILB')) {
      return {
        bg: '#1d4ed8', // Blue for Linebackers
        border: '#1e3a8a',
        text: '#ffffff'
      };
    }
    return {
      bg: '#6b7280', // Gray for others
      border: '#374151',
      text: '#ffffff'
    };
  };

  // Get pressure arrow direction
  const getPressureArrow = (player, startX, startY) => {
    if (!showPressureArrows) return null;

    const arrowLength = player.strength === 'high' ? 25 : 18;
    const strokeWidth = player.strength === 'high' ? 3 : 2;
    const color = player.strength === 'high' ? '#dc2626' : '#f59e0b';
    
    let endX = startX;
    let endY = startY;
    
    switch(player.pressure_direction) {
      case 'up_field':
      case 'upfield':
      case 'penetration':
        endY -= arrowLength;
        break;
      case 'inside':
        endX += startX < fieldWidth/2 ? arrowLength : -arrowLength;
        endY -= arrowLength/2;
        break;
      case 'upfield_rush':
        endY -= arrowLength;
        endX += startX < fieldWidth/2 ? arrowLength/2 : -arrowLength/2;
        break;
      case 'contain':
        endX += startX < fieldWidth/2 ? -arrowLength : arrowLength;
        break;
      default:
        endY -= arrowLength;
    }
    
    return (
      <G key={`arrow-${player.position}`}>
        <Line 
          x1={startX} y1={startY} 
          x2={endX} y2={endY}
          stroke={color}
          strokeWidth={strokeWidth}
          markerEnd="url(#arrowhead)"
        />
      </G>
    );
  };

  // Render individual defensive player (following SVGFieldVisualizer pattern)
  const DefensivePlayer = ({ player, isLinebackracker = false }) => {
    const x = (player.x / 400) * fieldWidth; // Scale from 400px design to actual width
    const y = isLinebackracker ? losY + 20 : losY - 5; // LBs behind LOS, DL on LOS
    
    const colors = getPlayerColor(player.position);
    const isHovered = hoveredPlayer?.position === player.position;
    const radius = isHovered ? 16 : (isLinebackracker ? 12 : 15);
    
    return (
      <G key={player.position}>
        {/* Player circle */}
        <Circle 
          cx={x} 
          cy={y} 
          r={radius} 
          fill={colors.bg}
          stroke={colors.border}
          strokeWidth={isHovered ? 3 : 2}
          onPress={() => handlePlayerPress(player)}
        />
        
        {/* Player label */}
        <SvgText 
          x={x} 
          y={y + 1} 
          fontSize={isHovered ? "11" : "9"} 
          fill={colors.text}
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          onPress={() => handlePlayerPress(player)}
        >
          {player.position}
        </SvgText>
        
        {/* Pressure arrow */}
        {getPressureArrow(player, x, y)}
        
        {/* Gap responsibility indicator */}
        {player.gap_responsibility && (
          <SvgText 
            x={x} 
            y={y + radius + 15} 
            fontSize="7" 
            fill="#059669" 
            fontWeight="bold"
            textAnchor="middle"
          >
            {player.gap_responsibility.replace('_', ' ')}
          </SvgText>
        )}

        {/* Hover ring */}
        {isHovered && (
          <Circle
            cx={x}
            cy={y}
            r={18}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
            opacity={0.5}
          />
        )}
      </G>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header (matching SVGFieldVisualizer pattern) */}
      <View style={styles.header}>
        <Text style={styles.formationTitle}>
          🛡️ {defense.formation} - Front 7
        </Text>
        <Text style={styles.yardsText}>
          {defense.personnel}
        </Text>
      </View>

      {/* Field Visual */}
      <View style={styles.fieldContainer}>
        <Svg width={fieldWidth} height={fieldHeight} viewBox={`0 0 ${fieldWidth} ${fieldHeight}`}>
          {/* Arrow marker definition */}
          <Defs>
            <Marker 
              id="arrowhead" 
              markerWidth="8" 
              markerHeight="6" 
              refX="7" 
              refY="3" 
              orient="auto"
            >
              <Polygon points="0 0, 8 3, 0 6" fill="#dc2626" />
            </Marker>
          </Defs>

          {/* Field background */}
          <Rect width={fieldWidth} height={fieldHeight} fill="#166534" />

          {/* Hash marks (matching existing pattern) */}
          <G opacity="0.6">
            <Circle cx={fieldWidth * 0.3} cy={losY - 40} r="2" fill="#4ade80" />
            <Circle cx={fieldWidth * 0.7} cy={losY - 40} r="2" fill="#4ade80" />
            <Circle cx={fieldWidth * 0.3} cy={losY + 40} r="2" fill="#4ade80" />
            <Circle cx={fieldWidth * 0.7} cy={losY + 40} r="2" fill="#4ade80" />
          </G>

          {/* Line of Scrimmage */}
          <Line
            x1={0}
            y1={losY}
            x2={fieldWidth}
            y2={losY}
            stroke="#3b82f6"
            strokeWidth={3}
            strokeDasharray="5,5"
          />

          {/* Gap labels */}
          {showGapLabels && (
            <G>
              <SvgText x={60} y={losY + 15} fontSize="12" fill="#059669" fontWeight="bold" textAnchor="middle">D</SvgText>
              <SvgText x={110} y={losY + 15} fontSize="12" fill="#059669" fontWeight="bold" textAnchor="middle">C</SvgText>
              <SvgText x={160} y={losY + 15} fontSize="12" fill="#059669" fontWeight="bold" textAnchor="middle">B</SvgText>
              <SvgText x={175} y={losY + 15} fontSize="12" fill="#059669" fontWeight="bold" textAnchor="middle">A</SvgText>
              <SvgText x={225} y={losY + 15} fontSize="12" fill="#059669" fontWeight="bold" textAnchor="middle">A</SvgText>
              <SvgText x={240} y={losY + 15} fontSize="12" fill="#059669" fontWeight="bold" textAnchor="middle">B</SvgText>
              <SvgText x={290} y={losY + 15} fontSize="12" fill="#059669" fontWeight="bold" textAnchor="middle">C</SvgText>
              <SvgText x={340} y={losY + 15} fontSize="12" fill="#059669" fontWeight="bold" textAnchor="middle">D</SvgText>
            </G>
          )}

          {/* Weak/Strong Side Labels */}
          <SvgText x={80} y={30} fontSize="14" fill="#fbbf24" fontWeight="bold" textAnchor="middle">WEAK</SvgText>
          <SvgText x={270} y={30} fontSize="14" fill="#fbbf24" fontWeight="bold" textAnchor="middle">STRONG</SvgText>

          {/* Render D-Line */}
          {defense.front_7.d_line.map((player) => (
            <DefensivePlayer key={player.position} player={player} isLinebackracker={false} />
          ))}

          {/* Render Linebackers */}
          {defense.front_7.linebackers.map((player) => (
            <DefensivePlayer key={player.position} player={player} isLinebackracker={true} />
          ))}

          {/* Line of Scrimmage label */}
          <SvgText x={10} y={losY - 8} fontSize="10" fill="#93c5fd" fontWeight="bold">
            Line of Scrimmage
          </SvgText>
        </Svg>
      </View>

      {/* Player tooltip (matching existing pattern) */}
      {hoveredPlayer && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipTitle}>
            {hoveredPlayer.position} - {hoveredPlayer.technique || 'Base'}
          </Text>
          <Text style={styles.tooltipText}>
            Gap: {hoveredPlayer.gap_responsibility?.replace('_', ' ') || 'Multiple'}
          </Text>
          <Text style={styles.tooltipText}>
            Pressure: {hoveredPlayer.pressure_direction?.replace('_', ' ') || 'Standard'} 
            ({hoveredPlayer.strength})
          </Text>
        </View>
      )}

      {/* Legend (matching existing pattern) */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Position Legend</Text>
        <Text style={styles.legendText}>
          <Text style={styles.legendCategory}>D-Line:</Text> DE, DT, NT (Red)
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.legendCategory}>Linebackers:</Text> OLB, ILB, MLB (Blue)
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.legendCategory}>Arrows:</Text> Pressure direction & strength
        </Text>
      </View>
    </View>
  );
};

// Styles matching SVGFieldVisualizer
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#065f46',
    padding: 12,
    borderRadius: 12,
    margin: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  formationTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  yardsText: {
    color: '#a7f3d0',
    fontSize: 12,
  },
  fieldContainer: {
    backgroundColor: '#047857',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#059669',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: '#047857',
    borderColor: '#059669',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  tooltipTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tooltipText: {
    color: '#a7f3d0',
    fontSize: 12,
  },
  legend: {
    marginTop: 8,
    backgroundColor: '#047857',
    borderColor: '#059669',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  legendTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  legendText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
  legendCategory: {
    color: '#a7f3d0',
    fontWeight: 'bold',
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  errorText: {
    color: '#fca5a5',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GapDefensiveVisual;