# SVGenius

**Perfect SVG morphing starts here.**

SVGenius is an advanced SVG editing tool that enables precise start point redefinition for SVG paths, solving complex morphing animation implementation challenges.

## Core Features

**Start Point Redefinition**
- One-click start point modification
- Drag & drop point positioning
- 100% shape preservation
- Complete curve and detail retention

**Path Normalization**
- Automatic point count normalization across multiple paths
- Intelligent path optimization for smooth morphing
- Real-time point count balancing

**File Management**
- Drag & drop SVG file import
- Individual path SVG export
- Real-time preview with instant visual feedback

**Interactive Point Editing**
- Drag & drop point positioning with real-time preview
- Smart drag detection (3px threshold)
- Global mouse tracking for smooth dragging
- Visual feedback with cursor states and tooltips

**Multi-Path Support**
- Simultaneous editing of multiple paths
- Independent path management
- Real-time point count display
- Copy functionality for individual paths

**Animation Preview**
- Path morphing animation visualization
- Speed control (0.5x ~ 5.0x)
- Play/pause/stop controls with intuitive UI
- Instant result verification

**Enhanced User Experience**
- Comprehensive tooltip system for all interactive elements
- Undo/Redo functionality with keyboard shortcuts
- Responsive design with optimized layout
- Korean UI support with bilingual documentation

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
- **React 19** + **SCSS Modules**
- **Lucide Icons** + **Sonner** (Toast notifications)
- **GSAP** (Animation library)
- **Custom SVG Parser** - Proprietary SVG path analysis engine
- **Flubber** - Path interpolation for smooth morphing

---

## Project Structure

```
svgenius/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Main layout
│   │   └── page.tsx        # Main page (SVGenius component)
│   ├── components/
│   │   └── Tooltip.tsx     # Custom tooltip component
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
1. Click "SVG 파일 가져오기" button or drag & drop SVG files
2. Upload desired SVG file
3. Paths are automatically extracted and displayed

### Step 2: Path Normalization (Optional)
1. Click "Points 정규화" button to normalize point counts across all paths
2. This ensures smooth morphing between paths with different complexities
3. View normalized point counts in real-time

### Step 3: Path Selection and Preview
1. Click the "미리보기" toggle button for the path you want to edit
2. View path and anchor points in the preview panel
3. Switch between "포인트 편집" and "애니메이션" modes

### Step 4: Point Modification
1. **Select Point**: Click desired anchor point in preview (turns red)
2. **Drag Point**: Drag the selected point to desired position for real-time path editing
3. **Set Start Point**: Click "시작점 설정" button to reorder path to selected anchor
4. Changes are automatically saved with undo/redo support

### Step 5: Animation Testing
1. Switch to "애니메이션" mode
2. Use play/pause/stop controls to test morphing animations
3. Adjust animation speed (0.5x ~ 5.0x) for optimal preview

### Step 6: Export Results
1. Verify reordered and optimized paths
2. Use "내보내기" button to download individual SVG files
3. Copy paths to clipboard using the copy button

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

## Version

**Current Version: v1.2.0**

- Enhanced tooltip system for improved user experience
- Path normalization with intelligent point balancing
- Advanced copy functionality for individual paths
- Improved animation controls with better visual feedback
- Korean UI with comprehensive tooltips
- Responsive design optimizations

---

## Version History

### v1.2.0 (2025-07-27)
**Enhanced User Experience**
- Comprehensive tooltip system for all interactive elements
- Improved visual feedback and user guidance
- Enhanced copy functionality with clipboard integration
- Better responsive design and layout optimization

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
**Portfolio**: [yoonhr.com](https://yoonhr.com/)  
**GitHub**: [github.com/HyeRyeongY](https://github.com/HyeRyeongY)

---

## Documentation

**사용자 가이드 (KOR)**: [SVGenius 사용자 가이드](https://www.notion.so/SVGenius-239a784e4dc28063b248d4db639a4727)  
**기술 포트폴리오 (KOR)**: [SVGenius 기술 포트폴리오](https://www.notion.so/SVGenius-239a784e4dc2806486f8e2046b64463a)

---

## Keywords

`SVG` `path manipulation` `morphing` `animation` `design tools` `vector graphics` `bezier curves` `anchor points` `real-time preview` `UI animation` `design workflow` `frontend development` `point normalization` `interactive editing` `tooltip system`
