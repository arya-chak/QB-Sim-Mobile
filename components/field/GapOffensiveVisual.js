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
  Polygon,
  Path
} from 'react-native-svg';
import { GapScenarioService } from '../../services/GapScenarioService';

const GapOffensiveVisual = ({ 
  scenarioId = null,
  yardsToGo = 10,
  showBlockingScheme = true,
  showAssignments = true,
  onPlayerPress = null 
}) => {
  const [scenarioData, setScenarioData] = useState(null);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Field dimensions for mobile (matching existing components)
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
        <Text style={styles.loadingText}>Loading offensive formation...</Text>
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

  const { offense } = scenarioData;

  // Color mapping for different offensive positions
  const getPlayerColor = (position) => {
    if (position.includes('T') || position.includes('G') || position === 'C') {
      return {
        bg: '#059669', // Green for O-Line
        border: '#047857',
        text: '#ffffff'
      };
    }
    if (position.includes('TE')) {
      return {
        bg: '#0891b2', // Cyan for Tight Ends
        border: '#0e7490',
        text: '#ffffff'
      };
    }
    if (position.includes('FB') || position.includes('RB') || position.includes('HB')) {
      return {
        bg: '#7c3aed', // Purple for Backs
        border: '#5b21b6',
        text: '#ffffff'
      };
    }
    if (position === 'QB') {
      return {
        bg: '#f59e0b', // Orange for QB
        border: '#d97706',
        text: '#ffffff'
      };
    }
    return {
      bg: '#6b7280', // Gray for others
      border: '#374151',
      text: '#ffffff'
    };
  };

  // Get blocking scheme indicator
  const getBlockingSchemeIndicator = (player, startX, startY) => {
    if (!showBlockingScheme) return null;

    const indicatorLength = 20;
    const strokeWidth = 2;
    let color = '#059669';
    let endX = startX;
    let endY = startY;
    
    switch(player.protection_type) {
      case 'zone_blocking':
        // Lateral arrow for zone blocking
        endX += indicatorLength;
        color = '#10b981';
        break;
      case 'big_on_big':
        // Straight up for man blocking
        endY -= indicatorLength;
        color = '#dc2626';
        break;
      case 'combo_block':
      case 'combo_reach':
        // Diagonal arrow for combo blocks
        endX += indicatorLength * 0.7;
        endY -= indicatorLength * 0.7;
        color = '#f59e0b';
        break;
      case 'pull_lead':
        // Curved arrow for pulling
        return (
          <Path
            d={`M ${startX} ${startY} Q ${startX + 30} ${startY - 15} ${startX + 50} ${startY + 10}`}
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        );
      case 'back_block':
      case 'back_reach':
        // Back arrow
        endX -= indicatorLength;
        color = '#ef4444';
        break;
      case 'down_block':
        // Down arrow  
        endX += player.x < fieldWidth/2 ? indicatorLength : -indicatorLength;
        color = '#f97316';
        break;
      case 'reach_block':
        // Reach arrow
        endX += player.x < fieldWidth/2 ? -indicatorLength : indicatorLength;
        color = '#06b6d4';
        break;
      default:
        // Default protection
        endY -= indicatorLength;
        color = '#059669';
    }
    
    return (
      <G key={`blocking-${player.position}`}>
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

  // Render individual offensive player
  const OffensivePlayer = ({ player, isBack = false }) => {
    const x = (player.x / 400) * fieldWidth; // Scale from 400px design to actual width
    const y = isBack ? losY - 25 : losY + 5; // Backs behind LOS, O-line just behind LOS
    
    const colors = getPlayerColor(player.position);
    const isHovered = hoveredPlayer?.position === player.position;
    
    // Different shapes for different position groups
    const isLineman = player.position.includes('T') || player.position.includes('G') || player.position === 'C';
    const radius = isHovered ? 16 : 14;
    const width = isLineman ? 28 : 24;
    const height = isLineman ? 18 : 16;
    
    return (
      <G key={player.position}>
        {/* Player shape - rectangles for linemen, circles for others */}
        {isLineman ? (
          <Rect 
            x={x - width/2} 
            y={y - height/2} 
            width={width}
            height={height}
            rx={3}
            fill={colors.bg}
            stroke={colors.border}
            strokeWidth={isHovered ? 3 : 2}
            onPress={() => handlePlayerPress(player)}
          />
        ) : (
          <Circle 
            cx={x} 
            cy={y} 
            r={radius} 
            fill={colors.bg}
            stroke={colors.border}
            strokeWidth={isHovered ? 3 : 2}
            onPress={() => handlePlayerPress(player)}
          />
        )}
        
        {/* Player label */}
        <SvgText 
          x={x} 
          y={y + 2} 
          fontSize={isHovered ? "10" : "8"} 
          fill={colors.text}
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          onPress={() => handlePlayerPress(player)}
        >
          {player.position}
        </SvgText>
        
        {/* Blocking scheme indicator */}
        {getBlockingSchemeIndicator(player, x, y)}
        
        {/* Assignment text */}
        {showAssignments && player.assignment && (
          <SvgText 
            x={x} 
            y={y + radius + 15} 
            fontSize="7" 
            fill="#059669" 
            fontWeight="bold"
            textAnchor="middle"
          >
            {player.assignment.replace('_', ' ').substring(0, 8)}
          </SvgText>
        )}

        {/* Hover ring */}
        {isHovered && (
          <Circle
            cx={x}
            cy={y}
            r={20}
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.formationTitle}>
          🏈 {offense.formation} - {offense.play_concept}
        </Text>
        <Text style={styles.yardsText}>
          {offense.personnel}
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
              <Polygon points="0 0, 8 3, 0 6" fill="#059669" />
            </Marker>
          </Defs>

          {/* Field background */}
          <Rect width={fieldWidth} height={fieldHeight} fill="#166534" />

          {/* Hash marks */}
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

          {/* Gap labels (faded since this is offense view) */}
          <G opacity="0.4">
            <SvgText x={60} y={losY - 10} fontSize="10" fill="#6b7280" fontWeight="bold" textAnchor="middle">D</SvgText>
            <SvgText x={110} y={losY - 10} fontSize="10" fill="#6b7280" fontWeight="bold" textAnchor="middle">C</SvgText>
            <SvgText x={160} y={losY - 10} fontSize="10" fill="#6b7280" fontWeight="bold" textAnchor="middle">B</SvgText>
            <SvgText x={175} y={losY - 10} fontSize="10" fill="#6b7280" fontWeight="bold" textAnchor="middle">A</SvgText>
            <SvgText x={225} y={losY - 10} fontSize="10" fill="#6b7280" fontWeight="bold" textAnchor="middle">A</SvgText>
            <SvgText x={240} y={losY - 10} fontSize="10" fill="#6b7280" fontWeight="bold" textAnchor="middle">B</SvgText>
            <SvgText x={290} y={losY - 10} fontSize="10" fill="#6b7280" fontWeight="bold" textAnchor="middle">C</SvgText>
            <SvgText x={340} y={losY - 10} fontSize="10" fill="#6b7280" fontWeight="bold" textAnchor="middle">D</SvgText>
          </G>

          {/* Weak/Strong Side Labels */}
          <SvgText x={80} y={30} fontSize="14" fill="#fbbf24" fontWeight="bold" textAnchor="middle">WEAK</SvgText>
          <SvgText x={270} y={30} fontSize="14" fill="#fbbf24" fontWeight="bold" textAnchor="middle">STRONG</SvgText>

          {/* Blocking Scheme Label */}
          <SvgText x={fieldWidth/2} y={50} fontSize="12" fill="#10b981" fontWeight="bold" textAnchor="middle">
            {offense.blocking_scheme?.replace('_', ' ').toUpperCase() || 'BLOCKING SCHEME'}
          </SvgText>

          {/* Render Offensive Line */}
          {offense.line_positions.map((player) => (
            <OffensivePlayer key={player.position} player={player} isBack={false} />
          ))}

          {/* Render Backs */}
          {offense.backs.map((player) => (
            <OffensivePlayer key={player.position} player={player} isBack={true} />
          ))}

          {/* QB (if not in backs array) */}
          {!offense.backs.find(p => p.position === 'QB') && (
            <OffensivePlayer 
              key="QB" 
              player={{position: 'QB', x: 200, y: 140, assignment: 'hand_off'}} 
              isBack={true} 
            />
          )}

          {/* Line of Scrimmage label */}
          <SvgText x={10} y={losY + 12} fontSize="10" fill="#93c5fd" fontWeight="bold">
            Line of Scrimmage
          </SvgText>
        </Svg>
      </View>

      {/* Player tooltip */}
      {hoveredPlayer && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipTitle}>
            {hoveredPlayer.position} - {hoveredPlayer.protection_type?.replace('_', ' ') || hoveredPlayer.role}
          </Text>
          <Text style={styles.tooltipText}>
            Assignment: {hoveredPlayer.assignment?.replace('_', ' ') || 'N/A'}
          </Text>
          {hoveredPlayer.protection_type && (
            <Text style={styles.tooltipText}>
              Protection: {hoveredPlayer.protection_type.replace('_', ' ')}
            </Text>
          )}
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Position Legend</Text>
        <Text style={styles.legendText}>
          <Text style={styles.legendCategory}>O-Line:</Text> LT, LG, C, RG, RT (Green squares)
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.legendCategory}>Tight Ends:</Text> TE (Cyan circles)
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.legendCategory}>Backs:</Text> FB, RB, HB (Purple circles)
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.legendCategory}>QB:</Text> Quarterback (Orange circle)
        </Text>
        <Text style={styles.legendText}>
          <Text style={styles.legendCategory}>Arrows:</Text> Blocking scheme direction
        </Text>
      </View>
    </View>
  );
};

// Styles matching existing pattern
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

export default GapOffensiveVisual;