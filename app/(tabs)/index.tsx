import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const SHIP_WIDTH = 60;
const SHIP_HEIGHT = 60;
const SHIP_BOTTOM_OFFSET = 140;
const MOVE_STEP = 30;

const ASTEROID_SIZE = 40;
const FALL_STEP = 6;
const LOOP_INTERVAL = 30;

const HIGH_SCORE_KEY = 'SPACE_ESCAPE_RUNNER_HIGH_SCORE';
const SHIP_START_X = (SCREEN_WIDTH - SHIP_WIDTH) / 2;

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shipPositionX, setShipPositionX] = useState(SHIP_START_X);
  const [asteroidX, setAsteroidX] = useState(0);
  const [asteroidY, setAsteroidY] = useState(0);

  // ---- Animated values: these persist across re-renders via useRef ----
  const shipAnimX = useRef(new Animated.Value(SHIP_START_X)).current;
  const asteroidRotationAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacityAnim = useRef(new Animated.Value(0)).current;
  const flameScaleAnim = useRef(new Animated.Value(1)).current;
  const startButtonScaleAnim = useRef(new Animated.Value(1)).current;

  const getRandomAsteroidX = () => Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE);

  // ---- Load high score once on app open ----
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const savedValue = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        if (savedValue !== null) setHighScore(parseInt(savedValue, 10));
      } catch (error) {
        console.log('Failed to load high score:', error);
      }
    };
    loadHighScore();
  }, []);

  // ---- Save high score when a game ends with a new best ----
  useEffect(() => {
    if (!gameOver) return;
    if (score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString()).catch((error) => {
        console.log('Failed to save high score:', error);
      });
    }
  }, [gameOver]);

  // ---- Smoothly slide the ship to its new x position whenever it changes ----
  useEffect(() => {
    Animated.timing(shipAnimX, {
      toValue: shipPositionX,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [shipPositionX]);

  // ---- Continuous asteroid spin (purely visual, runs forever) ----
  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(asteroidRotationAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinLoop.start();
    return () => spinLoop.stop();
  }, []);

  // ---- Engine flame flicker (purely visual, runs forever) ----
  useEffect(() => {
    const flameLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flameScaleAnim, { toValue: 1.3, duration: 180, useNativeDriver: true }),
        Animated.timing(flameScaleAnim, { toValue: 0.85, duration: 180, useNativeDriver: true }),
      ])
    );
    flameLoop.start();
    return () => flameLoop.stop();
  }, []);

  // ---- Gentle pulse on the main button ----
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(startButtonScaleAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(startButtonScaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  // ---- Fade + pop in the Game Over card ----
  useEffect(() => {
    if (gameOver) {
      Animated.timing(overlayOpacityAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    } else {
      overlayOpacityAnim.setValue(0);
    }
  }, [gameOver]);

  const handleStartGame = () => {
    setScore(0);
    setShipPositionX(SHIP_START_X);
    setAsteroidY(0);
    setAsteroidX(getRandomAsteroidX());
    setGameOver(false);
    setGameStarted(true);
  };

  const moveLeft = () => {
    if (gameOver) return;
    setShipPositionX((prevX) => Math.max(prevX - MOVE_STEP, 0));
  };

  const moveRight = () => {
    if (gameOver) return;
    setShipPositionX((prevX) => Math.min(prevX + MOVE_STEP, SCREEN_WIDTH - SHIP_WIDTH));
  };

  // ---- Game loop: asteroid falls continuously ----
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const intervalId = setInterval(() => {
      setAsteroidY((prevY) => {
        const newY = prevY + FALL_STEP;
        if (newY >= SCREEN_HEIGHT - ASTEROID_SIZE) {
          setScore((prevScore) => prevScore + 1);
          setAsteroidX(getRandomAsteroidX());
          return 0;
        }
        return newY;
      });
    }, LOOP_INTERVAL);

    return () => clearInterval(intervalId);
  }, [gameStarted, gameOver]);

  // ---- Collision detection ----
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const shipTop = SCREEN_HEIGHT - SHIP_BOTTOM_OFFSET - SHIP_HEIGHT;
    const shipBottom = SCREEN_HEIGHT - SHIP_BOTTOM_OFFSET;
    const shipLeft = shipPositionX;
    const shipRight = shipPositionX + SHIP_WIDTH;

    const asteroidTop = asteroidY;
    const asteroidBottom = asteroidY + ASTEROID_SIZE;
    const asteroidLeft = asteroidX;
    const asteroidRight = asteroidX + ASTEROID_SIZE;

    const isColliding =
      asteroidRight > shipLeft &&
      asteroidLeft < shipRight &&
      asteroidBottom > shipTop &&
      asteroidTop < shipBottom;

    if (isColliding) setGameOver(true);
  }, [asteroidY, asteroidX, shipPositionX, gameStarted, gameOver]);

  const rotateInterpolate = asteroidRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const overlayScaleInterpolate = overlayOpacityAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return (
    <LinearGradient
      colors={['#0B0C2A', '#181B4D', '#2D1B69']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>Space Escape Runner</Text>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Current Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>High Score</Text>
          <Text style={styles.highScoreValue}>{highScore}</Text>
        </View>
      </View>

      <Animated.View style={{ transform: [{ scale: startButtonScaleAnim }] }}>
        <TouchableOpacity style={styles.button} onPress={handleStartGame} activeOpacity={0.8}>
          <LinearGradient
            colors={['#9B4FFF', '#6A1FD0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {gameOver ? 'Play Again' : gameStarted ? 'Restart Game' : 'Start Game'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {gameStarted && !gameOver && (
        <Text style={styles.statusText}>🚀 Game is running...</Text>
      )}

      {/* Falling asteroid */}
      {gameStarted && (
        <View style={[styles.asteroidWrapper, { top: asteroidY, left: asteroidX }]}> 
          <Animated.View style={[styles.asteroidRotator, { transform: [{ rotate: rotateInterpolate }] }]}> 
            <LinearGradient
              colors={['#B08968', '#5C4A3A']}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 1, y: 1 }}
              style={styles.asteroidBase}
            >
              <View style={[styles.crater, styles.crater1]} />
              <View style={[styles.crater, styles.crater2]} />
              <View style={[styles.crater, styles.crater3]} />
            </LinearGradient>
          </Animated.View>
        </View>
      )}

      {/* Spaceship */}
      <Animated.View style={[styles.spaceship, { transform: [{ translateX: shipAnimX }] }]}> 
        <View style={styles.shipGlow} />
        <View style={styles.shipNose} />
        <LinearGradient colors={['#FFFFFF', '#B8C4E8']} style={styles.shipBody}>
          <View style={styles.cockpit} />
        </LinearGradient>
        <View style={styles.shipWings}>
          <LinearGradient colors={['#B37BFF', '#6A1FD0']} style={styles.wingLeft} />
          <LinearGradient colors={['#B37BFF', '#6A1FD0']} style={styles.wingRight} />
        </View>
        <Animated.View style={[styles.engineFlame, { transform: [{ scaleY: flameScaleAnim }] }]} />
      </Animated.View>

      {/* Movement controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.controlButton, gameOver && styles.controlButtonDisabled]}
          onPress={moveLeft}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>◀ Move Left</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, gameOver && styles.controlButtonDisabled]}
          onPress={moveRight}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>Move Right ▶</Text>
        </TouchableOpacity>
      </View>

      {/* Game Over overlay */}
      {gameOver && (
        <Animated.View
          style={[
            styles.gameOverOverlay,
            { opacity: overlayOpacityAnim, transform: [{ scale: overlayScaleInterpolate }] },
          ]}
        >
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.finalScoreText}>Final Score: {score}</Text>
          {score >= highScore && score > 0 && (
            <Text style={styles.newHighScoreText}>🏆 New High Score!</Text>
          )}
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 26,
    letterSpacing: 1,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    marginBottom: 36,
  },
  scoreCard: {
    backgroundColor: 'rgba(26,28,74,0.85)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(123,47,247,0.35)',
  },
  scoreLabel: {
    color: '#8A8CC7',
    fontSize: 13,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#00E5FF',
    fontSize: 38,
    fontWeight: 'bold',
  },
  highScoreValue: {
    color: '#FFD700',
    fontSize: 38,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#9B4FFF',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 50,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statusText: {
    marginTop: 26,
    color: '#8A8CC7',
    fontSize: 16,
  },
  spaceship: {
    position: 'absolute',
    bottom: SHIP_BOTTOM_OFFSET,
    left: 0,
    width: SHIP_WIDTH,
    alignItems: 'center',
  },
  shipGlow: {
    position: 'absolute',
    top: -8,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,229,255,0.18)',
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
    borderRadius: 6,
    marginTop: -2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cockpit: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E3A5F',
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
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  wingRight: {
    width: 16,
    height: 16,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  engineFlame: {
    width: 12,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#FF9D3D',
    marginTop: -4,
  },
  asteroidWrapper: {
    position: 'absolute',
    width: ASTEROID_SIZE,
    height: ASTEROID_SIZE,
  },
  asteroidRotator: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  asteroidBase: {
    width: ASTEROID_SIZE,
    height: ASTEROID_SIZE,
    borderRadius: ASTEROID_SIZE / 2,
    borderWidth: 2,
    borderColor: '#4A3625',
    overflow: 'hidden',
  },
  crater: {
    position: 'absolute',
    backgroundColor: 'rgba(74,54,37,0.6)',
    borderRadius: 20,
  },
  crater1: { top: 6, left: 8, width: 10, height: 10 },
  crater2: { top: 20, left: 22, width: 7, height: 7 },
  crater3: { top: 10, left: 24, width: 6, height: 6 },
  controlsRow: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  controlButton: {
    backgroundColor: 'rgba(26,28,74,0.9)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(123,47,247,0.35)',
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: '38%',
    alignItems: 'center',
    backgroundColor: 'rgba(26,28,74,0.95)',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF4D4D',
  },
  gameOverText: {
    color: '#FF4D4D',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 2,
  },
  finalScoreText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  newHighScoreText: {
    color: '#FFD700',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
});