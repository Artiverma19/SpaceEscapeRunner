import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SHIP_WIDTH = 60;
const MOVE_STEP = 30;

export default function HomeScreen() {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [shipPositionX, setShipPositionX] = useState((SCREEN_WIDTH - SHIP_WIDTH) / 2);

  const handleStartGame = () => {
    setGameStarted(true);
    setScore(0);
    setShipPositionX((SCREEN_WIDTH - SHIP_WIDTH) / 2);
  };

  const moveLeft = () => {
    setShipPositionX((prevX) => {
      const newX = prevX - MOVE_STEP;
      return Math.max(newX, 0);
    });
  };

  const moveRight = () => {
    setShipPositionX((prevX) => {
      const newX = prevX + MOVE_STEP;
      return Math.min(newX, SCREEN_WIDTH - SHIP_WIDTH);
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>Space Escape Runner</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Current Score</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStartGame}>
        <Text style={styles.buttonText}>{gameStarted ? 'Restart Game' : 'Start Game'}</Text>
      </TouchableOpacity>

      {gameStarted && <Text style={styles.statusText}>🚀 Game is running...</Text>}

      <View style={[styles.spaceship, { left: shipPositionX }]}>
        <View style={styles.shipNose} />
        <View style={styles.shipBody} />
        <View style={styles.shipWings}>
          <View style={styles.wingLeft} />
          <View style={styles.wingRight} />
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={moveLeft}>
          <Text style={styles.controlButtonText}>◀ Move Left</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={moveRight}>
          <Text style={styles.controlButtonText}>Move Right ▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C2A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    letterSpacing: 1,
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: '#1A1C4A',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 50,
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#8A8CC7',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#00E5FF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#7B2FF7',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#7B2FF7',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statusText: {
    marginTop: 30,
    color: '#8A8CC7',
    fontSize: 16,
  },
  spaceship: {
    position: 'absolute',
    bottom: 140,
    width: SHIP_WIDTH,
    alignItems: 'center',
  },
  shipNose: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#00E5FF',
  },
  shipBody: {
    width: 30,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginTop: -2,
  },
  shipWings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SHIP_WIDTH,
    marginTop: -12,
  },
  wingLeft: {
    width: 16,
    height: 16,
    backgroundColor: '#7B2FF7',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  wingRight: {
    width: 16,
    height: 16,
    backgroundColor: '#7B2FF7',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  controlsRow: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  controlButton: {
    backgroundColor: '#1A1C4A',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
