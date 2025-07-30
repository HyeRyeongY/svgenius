# SVGenius

**Perfect SVG morphing starts here.**

SVGenius is an advanced SVG editing tool that enables precise start point redefinition for SVG paths, solving complex morphing animation implementation challenges.

## Core Features

### Start Point Redefinition

- One-click SVG path start point modification
- Drag & drop point positioning
- 100% shape preservation and curve detail retention

### Path Normalization

- Automatic point count normalization across multiple paths
- Intelligent path optimization for smooth morphing
- Real-time point count balancing

### Animation Preview

- Path morphing animation visualization
- Speed control (0.5x ~ 5.0x)
- Intuitive play/pause/stop controls
- Instant result verification

### File Management

- Individual path SVG export
- Normalized path export (start/end/both)
- Real-time preview
- Clipboard copy functionality

---

## Problem Statement

SVG morphing animations require:
- Consistent start points across paths
- Equal point counts for smooth interpolation
- Perfect shape preservation during transformation

SVGenius automates the complex manual process with an intelligent path reordering system and provides intuitive visual tools for precise control.

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

---

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **SCSS**
- **Lucide Icons**
- **Sonner** (Toast notifications)
- **GSAP** (Animation library)
- **svg-path-parser** (SVG path parsing)
- **svg-path-properties** (SVG path property calculation)

---

## Project Structure

```
svgenius/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Main layout
│   │   └── page.tsx        # Main page (SVGenius component)
│   ├── components/
│   │   ├── Tooltip.tsx     # Custom tooltip component
│   │   ├── Tutorial.tsx    # Interactive tutorial system
│   │   ├── RippleButton.tsx # Enhanced button with ripple effects
│   │   └── LanguageToggle.tsx # Language switcher component
│   ├── contexts/
│   │   └── LanguageContext.tsx # Internationalization context
│   └── styles/
│       └── global.scss     # Global styles with animations
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

### Step 0: Tutorial (For New Users)
1. Click "Show Tutorial" button in the header to start the interactive guide
2. Follow the 5-step tutorial to learn the complete workflow
3. Tutorial provides demo paths for safe practice without affecting your data
4. Switch languages using the EN/KO toggle in the top-right corner

### Step 1: Add SVG Paths
1. **Import SVG File**: Click "Import SVG File" button or drag & drop SVG files
2. **Direct Input**: Paste SVG path data directly into the path text area
3. **Add New Path**: Use "+" button to create additional path slots
4. Paths are automatically extracted and displayed

### Step 2: Path Selection and Preview
1. Click the "Preview" toggle button for the path you want to edit
2. View path and anchor points in the preview panel
3. Switch between "Point Editing" and "Animation" modes

### Step 3: Point Editing (Point Editing Mode)
1. **Select Point**: Click desired anchor point in preview (turns red)
2. **Drag Point**: Drag the selected point to desired position for real-time path editing
3. **Set Start Point**: Click "Set Start Point" button to reorder path to selected anchor
4. **Undo/Redo**: Use Ctrl+Z / Ctrl+Shift+Z or button clicks
5. Changes are automatically saved

### Step 4: Animation Testing (Animation Mode)
1. Switch to "Animation" mode
2. **Select Paths**: Choose start path → end path from dropdowns
3. **Test Animation**: Click "Test Animation" button
4. **Playback Controls**: Use play/pause/stop buttons
5. **Speed Control**: Adjust animation speed with slider (0.5x ~ 5.0x)

### Step 5: Export Results
1. **Individual Path Export**: Use download button for each path to save SVG files
2. **Normalized Path Export**:
   - "Start Path" button: Export normalized start path only
   - "End Path" button: Export normalized end path only
   - "Both" button: Export both start and end paths
3. **Clipboard Copy**: Use copy button to copy path data to clipboard

---

## Use Cases

**Web Animation Development**
- Compatible with CSS transitions and JavaScript libraries
- Works with GSAP, Framer Motion, Lottie, and all animation frameworks
- Enables natural morphing effects with optimized paths

**Design Workflow Enhancement**
- Unifies start points across icon sets
- Optimizes drawing order for complex SVG icons
- Minimizes file size for better performance
- Streamlines design-to-development handoff

**Development Efficiency**
- Eliminates manual path correction time
- Accelerates design-to-code workflow
- Provides instant feedback through real-time preview
- Reduces debugging time for animation implementations

---

## Keyboard Shortcuts

- `Ctrl + Z`: Undo
- `Ctrl + Shift + Z`: Redo
- `Ctrl + Y`: Redo (alternative)

---

## Version Information

**Current Version: v1.4.0**

- Interactive tutorial system with multilingual support (Korean/English)
- Enhanced UI with ripple effects

---

### Version History

**v1.4.0 (2025-07-28)**

- 5-step guided tutorial system
- Tutorial mode with demo data
- Multilingual support (Korean/English)
- Ripple button effects

**v1.3.0 (2025-07-27)**

- UI localization (Korean → English)
- Enhanced button states and visual consistency

**v1.2.0 (2025-07-27)**

- Tooltip system and visual feedback improvements
- Tooltip system support
- Clipboard copy functionality and responsive design optimization

**v1.1.0 (2025-07-24)**

- Drag & drop point editing with smart detection
- Visual feedback (cursor states, highlights) and history storage
- Improved mouse event handling and SVG coordinate transformation

**v1.0.0 (2025-07-22)**

- Start point redefinition with curve preservation
- Animation controls and preview system
- Multi-path support, SVG import/export, undo/redo functionality
- Korean UI and SVG command support (M, L, H, V, C, Q, S, T, Z)

---

## Technical Features

**Interactive Editing System**
- **Real-time Drag System**: Advanced mouse event handling with global tracking
- **SVG Coordinate Transformation**: Precise coordinate conversion between screen and SVG space
- **Smart Drag Detection**: 3-pixel threshold to distinguish clicks from drags
- **Point Update Algorithm**: Comprehensive SVG command modification for all path types

**User Interface Enhancements**
- **Tooltip System**: Context-aware tooltips for all interactive elements
- **Visual Feedback**: Hover effects, state indicators, and smooth transitions
- **Responsive Design**: Optimized for various screen sizes and devices
- **Accessibility**: Keyboard navigation and screen reader support

**Core Algorithms**
- **Curve Preservation**: Perfect preservation of all curve types including Bézier and quadratic curves
- **Intelligent Optimization**: Automatic removal of unnecessary commands for efficient path generation
- **Coordinate Processing**: Support for various SVG command formats (relative/absolute coordinates)
- **Path Normalization**: Advanced algorithm for balancing point counts across multiple paths

**Custom SVG Parser**
- Proprietary SVG path analysis engine supporting all SVG commands
- Real-time path analysis and optimization
- Type-safe parsing system with comprehensive error handling

---

## Contact

**Developer**: HyeRyeong Yoon  
**GitHub**: [github.com/HyeRyeongY](https://github.com/HyeRyeongY)

---

## Documentation

**사용자 가이드 (KOR)**: [SVGenius 사용자 가이드](https://www.notion.so/SVGenius-239a784e4dc28063b248d4db639a4727)  
**기술 포트폴리오 (KOR)**: [SVGenius 기술 포트폴리오](https://www.notion.so/SVGenius-239a784e4dc2806486f8e2046b64463a)

---

## Keywords

`SVG` `path manipulation` `morphing` `animation` `design tools` `vector graphics` `bezier curves` `anchor points` `real-time preview` `UI animation` `design workflow` `frontend development` `point normalization` `interactive editing`
