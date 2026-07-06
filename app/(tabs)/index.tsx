import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';

export default function HomeScreen() {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
    setScore(0);
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
});
