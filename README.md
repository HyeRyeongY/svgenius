# SVGenius

**Perfect SVG morphing starts here.**

SVGenius is an advanced SVG editing tool that enables precise start point redefinition for SVG paths, solving complex morphing animation implementation challenges.

## Core Features

**Start Point Redefinition**
- One-click start point modification
- Drag & drop point positioning
- 100% shape preservation
- Complete curve and detail retention

**File Management**
- Drag & drop SVG file import
- Individual path SVG export
- Real-time preview

**Interactive Point Editing**
- Drag & drop point positioning with real-time preview
- Smart drag detection (3px threshold)
- Global mouse tracking for smooth dragging
- Visual feedback with cursor states

**Multi-Path Support**
- Simultaneous editing of multiple paths
- Independent path management
- Real-time point count display

**Animation Preview**
- Path morphing animation visualization
- Speed control (0.5x ~ 5.0x)
- Instant result verification

---

## Problem Statement

SVG morphing animations require:
- Consistent start points across paths
- Equal point counts for smooth interpolation
- Perfect shape preservation during transformation

SVGenius automates the complex manual process with an intelligent path reordering system.

---

## Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **React 18** + **SCSS Modules**
- **Lucide Icons** + **Sonner** (Toast)
- **Custom SVG Parser** - Proprietary SVG path analysis engine

---

## Project Structure

```
svgenius/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Main layout
│   │   └── page.tsx        # Main page (SVGenius component)
│   └── styles/
│       └── global.scss     # Global styles
├── public/
│   ├── SVGenius.svg        # Logo
│   └── ...
└── types/
    └── svg-path-parser.d.ts # Type definitions
```

---

## Supported SVG Commands

Complete support for all standard SVG path commands:

- **M** (Move): Move command
- **L** (Line): Draw line
- **H** (Horizontal): Horizontal line
- **V** (Vertical): Vertical line
- **C** (Cubic Bézier): Cubic Bézier curve
- **Q** (Quadratic Bézier): Quadratic Bézier curve
- **S** (Smooth Cubic): Smooth cubic curve
- **T** (Smooth Quadratic): Smooth quadratic curve
- **Z** (ClosePath): Close path

---

## Usage

### Step 1: Import SVG
1. Click "Select SVG File" button
2. Upload desired SVG file
3. Paths are automatically extracted and displayed

### Step 2: Path Selection and Preview
1. Click the play button for the path you want to edit
2. View path and anchor points in the preview panel

### Step 3: Point Modification
1. **Select Point**: Click desired anchor point in preview (turns red)
2. **Drag Point**: Drag the selected point to desired position for real-time path editing
3. **Set Start Point**: Click "Set Start Point" button to reorder path to selected anchor
4. Changes are automatically saved with undo/redo support

### Step 4: Export Results
1. Verify reordered path
2. Download SVG file using export button

---

## Use Cases

**Web Animation Development**
- Compatible with CSS transitions and JavaScript libraries
- Works with GSAP, Framer Motion, Lottie, and all animation frameworks
- Enables natural morphing effects

**Design Workflow Enhancement**
- Unifies start points across icon sets
- Optimizes drawing order for complex SVG icons
- Minimizes file size for better performance

**Development Efficiency**
- Eliminates manual correction time
- Accelerates design-to-code workflow
- Provides instant feedback through real-time preview

---

## Keyboard Shortcuts

- `Ctrl + Z`: Undo
- `Ctrl + Shift + Z`: Redo
- `Ctrl + Y`: Redo (alternative)

---

## Version

**Current Version: v1.1.0**

- Interactive point drag & drop editing
- Start point redefinition functionality
- Real-time path modification
- Curve preservation algorithm
- Real-time preview
- Animation controls
- Multi-path support
- Undo/Redo system
- Korean UI support

---

## Version History

### v1.1.0 (2025-07-24)
**Interactive Point Editing**
- Added drag & drop point positioning with real-time preview
- Implemented smart drag detection (3px threshold)
- Added global mouse tracking for smooth dragging experience
- Enhanced visual feedback with cursor states (grab/grabbing)
- Improved point selection with red highlight indication
- Automatic history saving on drag completion

**Technical Improvements**
- Advanced mouse event handling system
- Precise SVG coordinate transformation
- Comprehensive point update algorithm for all SVG command types
- Performance optimizations for real-time editing
- Enhanced error handling and stability

### v1.0.0 (2025-07-22)
**Initial Release**
- Start point redefinition functionality
- Curve preservation algorithm
- Real-time preview system
- Animation controls with speed adjustment
- Multi-path support and management
- SVG file import/export capabilities
- Undo/Redo system implementation
- Korean UI localization
- Comprehensive SVG command support (M, L, H, V, C, Q, S, T, Z)
- Custom SVG path parser engine

---

## Technical Features

**Interactive Editing System**
- **Real-time Drag System**: Advanced mouse event handling with global tracking
- **SVG Coordinate Transformation**: Precise coordinate conversion between screen and SVG space
- **Smart Drag Detection**: 3-pixel threshold to distinguish clicks from drags
- **Point Update Algorithm**: Comprehensive SVG command modification for all path types

**Core Algorithms**
- **Curve Preservation**: Perfect preservation of all curve types including Bézier and quadratic curves
- **Intelligent Optimization**: Automatic removal of unnecessary commands for efficient path generation
- **Coordinate Processing**: Support for various SVG command formats (relative/absolute coordinates)

**Custom SVG Parser**
- Proprietary SVG path analysis engine supporting all SVG commands
- Real-time path analysis and optimization
- Type-safe parsing system

---

## Contact

**Developer**: HyeRyeong Yoon
**Portfolio Link** : [yoonhr portfolio](https://yoonhr.com/)

---

## Docs
**User Guide Link (KOR)**: [SVGenius 사용자 가이드](https://www.notion.so/SVGenius-239a784e4dc28063b248d4db639a4727)
**Tech Portfolio Link (KOR)**: [SVGenius 기술 포트폴리오](https://www.notion.so/SVGenius-239a784e4dc2806486f8e2046b64463a)

---

## Keywords

`SVG` `path manipulation` `morphing` `animation` `design tools` `vector graphics` `bezier curves` `anchor points` `real-time preview` `UI animation` `design workflow` `frontend development`
