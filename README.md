# Migration of the Monty Hall Game - From Scratch to TypeScript/Three.js

## About the Project

This project is part of a tutorship within the **DS4H (Digital Systems for Humans)** program at **Université Côte d'Azur**, in partnership with **Terra Numerica**.

The main objective was to migrate an existing educational game about the **Monty Hall problem**, originally built in **Scratch**, into a modern web application. The new version utilizes **TypeScript** for robust logic and **Three.js** to provide an immersive 3D experience, making the mathematical concept of probability more engaging and understandable.

## The Monty Hall Problem

The game simulates the famous probability puzzle:
1. You are presented with **3 doors**.
2. Behind one door is a **prize**; behind the others, **goats**.
3. You pick a door.
4. The host opens one of the other doors to reveal a goat.
5. You are given the choice: **Stay** with your original pick, or **Switch**?

*Spoiler: Statistics show that switching doubles your chances of winning! This application includes a real-time tracker to prove it.*

## Features

- **3D Visualization**: Interactive 3D scene using Three.js with animated doors and models.
- **Game Logic Engine**: Robust state management written in strict TypeScript.
- **Statistics Tracker**: Real-time recording of "Switch" vs "Stay" win rates to empirically demonstrate the probability theory.
- **Terra Numerica Design**: Integrated with the Terra Numerica web framework (navbars, styling).
- **Responsive Design**: Playable on desktop and mobile devices.

## Technologies Used

- **Language**: TypeScript (compiled to JavaScript ES6)
- **3D Engine**: Three.js
- **Styling**: CSS3 / Terra Numerica Framework
- **Runtime**: Node.js (for dependency management)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- A modern web browser.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ikram-code-ai/montyhall.git
   cd montyhall
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript**
   If you make changes to the `.ts` files, you need to recompile:
   ```bash
   npx tsc
   ```

### Running the App

Since the project uses ES Modules and 3D assets, you likely need a local web server to avoid CORS policy errors when opening the file directly.

**Option 1: using VS Code Live Server extension**
- Open `index.html` in VS Code.
- Click "Go Live" (if extension is installed).

**Option 2: using Python**
```bash
python -m http.server
# Then open http://localhost:8000
```

**Option 3: using Node**
```bash
npx serve .
```

## Project Structure

```bash
projet-montyhall/
├── index.html          # Main entry point
├── main.ts             # TypeScript source logic
├── main.js             # Compiled JavaScript
├── style.css           # Custom styles
├── framework/          # Terra Numerica shared assets (CSS/JS)
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

## Authors & Acknowledgments

- **Student**: Ikram Benchalal
- **Supervisor**: Luc Hogie 

---
*Academic Year 2025-2026*
