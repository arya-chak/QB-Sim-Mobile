import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Svg, { 
  Rect, 
  Line, 
  Circle, 
  Text as SvgText, 
  G, 
  Path,
  Defs,
  Marker,
  Polygon 
} from 'react-native-svg';
import { FieldVisualizationService } from '../../services/FieldVisualizationService';
import { FieldUtils } from '../../utils/FieldUtils';

const SVGFieldVisualizer = ({ 
  formationName = '4-3', 
  yardsToGo = 10, 
  coverageName = 'cover_2_zone',
  showCoverage = false,
  showBlitz = false,
  onPlayerPress = null 
}) => {
  const [fieldData, setFieldData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [coverageZones, setCoverageZones] = useState([]);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Field dimensions for mobile
  const fieldWidth = 350;
  const fieldHeight = 220;

  useEffect(() => {
    loadFieldData();
  }, [formationName, yardsToGo]);

  useEffect(() => {
    if (showCoverage) {
      loadCoverageZones();
    }
  }, [coverageName, showCoverage]);

  const loadFieldData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get formation positions from API
      const data = await FieldVisualizationService.getFormationPositions(formationName, yardsToGo);
      
      setFieldData(data);

      // The API already returns players in the correct format!
      // Add blitzing info to existing players
      const playersWithBlitz = data.players.map(player => ({
        ...player,
        isBlitzing: player.id === 'MLB' // Example: Mark MLB as blitzing
      }));
      
      setPlayers(playersWithBlitz);

    } catch (err) {
      console.error('Error loading field data:', err);
      setError('Failed to load field data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCoverageZones = async () => {
    try {
      const zones = await FieldVisualizationService.getCoverageZones(coverageName);
      setCoverageZones(zones.zones || []);
    } catch (err) {
      console.error('Error loading coverage zones:', err);
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
        <Text style={styles.loadingText}>Loading field...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorText}>Formation: {formationName}</Text>
        <Text style={styles.errorText}>Yards: {yardsToGo}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFieldData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!fieldData || !players.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No field data available</Text>
      </View>
    );
  }

  // Calculate field positioning - LOS always at bottom
  const cellWidth = fieldWidth / (fieldData.field_dimensions?.width || 35);
  const cellHeight = fieldHeight / (fieldData.field_dimensions?.height || 15);
  
  // Position line of scrimmage near the bottom (90% down)
  const losY = fieldHeight * 0.9;
  
  // Calculate first down marker position relative to LOS
  const yardsDistance = fieldData.line_of_scrimmage - fieldData.first_down_marker;
  const firstDownY = losY - (yardsDistance * (fieldHeight * 0.8) / 15); // Scale to use 80% of field height

  // Transform player positions to new coordinate system
  const transformedPlayers = players.map(player => {
    // Convert API coordinates to field position relative to LOS
    const yardsBehindLOS = fieldData.line_of_scrimmage - player.y;
    const newY = losY - (yardsBehindLOS * (fieldHeight * 0.8) / 15);
    const newX = (player.x / 35) * fieldWidth; // Scale X to field width
    
    return {
      ...player,
      transformedX: newX,
      transformedY: newY
    };
  });

  const PlayerIcon = ({ player }) => {
    const colors = FieldUtils.getPlayerColors(player.type, player.isBlitzing);
    const isHovered = hoveredPlayer?.id === player.id;
    const radius = isHovered ? 14 : 12;

    return (
      <G key={player.id}>
        {/* Player circle */}
        <Circle
          cx={player.transformedX}
          cy={player.transformedY}
          r={radius}
          fill={colors.bg}
          stroke={colors.border}
          strokeWidth={isHovered ? 3 : 2}
          onPress={() => handlePlayerPress(player)}
        />

        {/* Blitz arrow */}
        {showBlitz && player.isBlitzing && (
          <Line
            x1={player.transformedX}
            y1={player.transformedY - 20}
            x2={player.transformedX}
            y2={player.transformedY + 20}
            stroke="#dc2626"
            strokeWidth={3}
            markerEnd="url(#arrowhead)"
          />
        )}

        {/* Position letter */}
        <SvgText
          x={player.transformedX}
          y={player.transformedY + 1}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={isHovered ? "14" : "12"}
          fontWeight="bold"
          fill={colors.text}
          onPress={() => handlePlayerPress(player)}
        >
          {player.pos}
        </SvgText>

        {/* Hover ring */}
        {isHovered && (
          <Circle
            cx={player.transformedX}
            cy={player.transformedY}
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.formationTitle}>{fieldData.formation_name}</Text>
          <Text style={styles.yardsText}>
            3rd & {fieldData.yards_to_go} to go
          </Text>
        </View>
      </View>

      {/* SVG Field */}
      <View style={styles.fieldContainer}>
        <Svg width={fieldWidth} height={fieldHeight} viewBox={`0 0 ${fieldWidth} ${fieldHeight}`}>
          {/* Arrow marker definition */}
          <Defs>
            <Marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <Polygon
                points="0 0, 10 3.5, 0 7"
                fill="#dc2626"
              />
            </Marker>
          </Defs>

          {/* Field background */}
          <Rect width={fieldWidth} height={fieldHeight} fill="#166534" />

          {/* Coverage zones */}
          {showCoverage && coverageZones.map((zone) => (
            <Path
              key={zone.id}
              d={zone.path}
              fill={zone.color}
              opacity={zone.opacity}
              stroke={zone.color}
              strokeWidth={1}
              strokeDasharray="4,2"
            />
          ))}

          {/* Hash marks - positioned relative to field */}
          {Array.from({ length: 8 }, (_, index) => {
            const y = (index / 7) * fieldHeight * 0.8;
            if (Math.abs(y - (losY - fieldHeight * 0.9)) < 10) return null; // Skip hash marks near LOS
            return (
              <G key={`hash-${index}`}>
                <Circle cx={fieldWidth * 0.3} cy={y} r={2} fill="#4ade80" opacity={0.6} />
                <Circle cx={fieldWidth * 0.7} cy={y} r={2} fill="#4ade80" opacity={0.6} />
              </G>
            );
          })}

          {/* Line of Scrimmage (Blue) - Always at bottom */}
          <Line
            x1={0}
            y1={losY}
            x2={fieldWidth}
            y2={losY}
            stroke="#3b82f6"
            strokeWidth={3}
          />

          {/* First Down Line (Yellow) */}
          {firstDownY >= 0 && firstDownY < fieldHeight && (
            <Line
              x1={0}
              y1={firstDownY}
              x2={fieldWidth}
              y2={firstDownY}
              stroke="#eab308"
              strokeWidth={3}
            />
          )}

          {/* Players */}
          {transformedPlayers.map((player) => (
            <PlayerIcon key={player.id} player={player} />
          ))}

          {/* Field labels */}
          <SvgText x={10} y={losY - 15} fontSize="12" fill="#93c5fd" fontWeight="bold">
            Line of Scrimmage
          </SvgText>
          {firstDownY >= 0 && firstDownY < fieldHeight && (
            <SvgText x={10} y={firstDownY - 15} fontSize="12" fill="#fde047" fontWeight="bold">
              First Down ({fieldData.yards_to_go} yards)
            </SvgText>
          )}
        </Svg>
      </View>

      {/* Player tooltip */}
      {hoveredPlayer && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipTitle}>{hoveredPlayer.label}</Text>
          <Text style={styles.tooltipText}>
            {hoveredPlayer.isBlitzing && '🔥 BLITZING • '}
            Type: {hoveredPlayer.type === 'dline' ? 'Defensive Line' : 
                   hoveredPlayer.type === 'lb' ? 'Linebacker' : 'Defensive Back'}
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Position Legend</Text>
        {Object.entries(FieldUtils.getFormationLegend(formationName)).map(([category, symbols]) => (
          <Text key={category} style={styles.legendText}>
            <Text style={styles.legendCategory}>{category}:</Text> {symbols}
          </Text>
        ))}
      </View>
    </View>
  );
};

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
    fontSize: 14,
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

export default SVGFieldVisualizer;