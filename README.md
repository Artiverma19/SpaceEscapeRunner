# Space Escape Runner

Space Escape Runner is a simple mobile game built with Expo and React Native. In this game, you control a spaceship and try to avoid falling asteroids. The goal is to stay alive as long as possible and beat your high score.

## What this app does

- Start a new game
- Move the spaceship left or right
- Avoid asteroids
- Track your current score
- Save and show your high score

## Technologies used

- React Native
- Expo
- TypeScript
- Expo Router
- AsyncStorage

## How to run the project

1. Open the project folder in your terminal.
2. Install the required packages:

   ```bash
   npm install
   ```

3. Start the app:

   ```bash
   npx expo start
   ```

4. Open it in Expo Go on your phone or use an Android/iOS emulator.

## How to play

- Tap the Start Game button.
- Use the left and right controls to move your ship.
- Avoid the asteroid.
- Try to get the highest score possible.

## Main project folders

- app/(tabs)/index.tsx - main game screen
- app/_layout.tsx - app layout and navigation setup
- app/(tabs)/explore.tsx - extra screen
- assets/ - images and icons

## Note

The high score is saved on your device, so it stays available even after you close the app.
