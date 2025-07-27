// src/App.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
    Upload,
    Download,
    Plus,
    Pause,
    Square,
    Play,
    Undo2,
    Redo2,
    Copy,
    Circle,
    CircleDot,
    Github,
    BookAlert,
} from "lucide-react";
import Tooltip from "../components/Tooltip";
import RippleButton from "../components/RippleButton";
import { gsap } from "gsap";

import Image from "next/image";

// Function to accurately parse SVG Path by command units
function parseSVGPath(path: string): string[] {
    console.log("Parsing path:", path);

    const commands: string[] = [];
    let current = "";
    let i = 0;

    while (i < path.length) {
        const char = path[i];

        // Check if it's a command character
        if (/[MmLlHhVvCcSsQqTtZz]/.test(char)) {
            // Save previous command if exists
            if (current) {
                commands.push(current);
                console.log("Added command:", current);
            }
            current = char;
        } else {
            // Non-command characters are added to current command
            current += char;
        }
        i++;
    }

    // Add final command
    if (current) {
        commands.push(current);
        console.log("Added final command:", current);
    }

    console.log("All parsed commands:", commands);
    return commands;
}

type AnchorPoint = { x: number; y: number; index: number };

function getAnchorPoints(path: string): AnchorPoint[] {
    try {
        // 원본 Path를 사용하여 앵커 포인트 계산 (재정렬된 Path가 아닌)
        const commands = parseSVGPath(path);
        const points: AnchorPoint[] = [];
        let currentX = 0;
        let currentY = 0;
        let pointIndex = 0;

        console.log("Getting anchor points for original path commands:", commands);

        for (const cmd of commands) {
            const commandType = cmd[0];
            const params = cmd.substring(1).trim();

            // 숫자들을 추출
            const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];

            console.log(`Processing command: ${commandType} with numbers:`, numbers);

            switch (commandType.toUpperCase()) {
                case "M":
                case "L":
                    if (numbers.length >= 2) {
                        const x = parseFloat(numbers[0] || "0");
                        const y = parseFloat(numbers[1] || "0");
                        if (commandType === commandType.toUpperCase()) {
                            // 절대 좌표
                            currentX = x;
                            currentY = y;
                        } else {
                            // 상대 좌표
                            currentX += x;
                            currentY += y;
                        }
                        points.push({ x: currentX, y: currentY, index: pointIndex++ });
                        console.log(`${commandType} command: current position (${currentX}, ${currentY})`);
                    }
                    break;
                case "H":
                    if (numbers.length >= 1) {
                        const x = parseFloat(numbers[0] || "0");
                        if (commandType === "H") {
                            currentX = x;
                        } else {
                            currentX += x;
                        }
                        points.push({ x: currentX, y: currentY, index: pointIndex++ });
                        console.log(`${commandType} command: current position (${currentX}, ${currentY})`);
                    }
                    break;
                case "V":
                    if (numbers.length >= 1) {
                        const y = parseFloat(numbers[0] || "0");
                        if (commandType === "V") {
                            currentY = y;
                        } else {
                            currentY += y;
                        }
                        points.push({ x: currentX, y: currentY, index: pointIndex++ });
                        console.log(`${commandType} command: current position (${currentX}, ${currentY})`);
                    }
                    break;
                case "C":
                    if (numbers.length >= 6) {
                        const x = parseFloat(numbers[4] || "0");
                        const y = parseFloat(numbers[5] || "0");
                        if (commandType === "C") {
                            currentX = x;
                            currentY = y;
                        } else {
                            currentX += x;
                            currentY += y;
                        }
                        points.push({ x: currentX, y: currentY, index: pointIndex++ });
                        console.log(`${commandType} command: current position (${currentX}, ${currentY})`);
                    }
                    break;
                case "Q":
                    if (numbers.length >= 4) {
                        const x = parseFloat(numbers[2] || "0");
                        const y = parseFloat(numbers[3] || "0");
                        if (commandType === "Q") {
                            currentX = x;
                            currentY = y;
                        } else {
                            currentX += x;
                            currentY += y;
                        }
                        points.push({ x: currentX, y: currentY, index: pointIndex++ });
                        console.log(`${commandType} command: current position (${currentX}, ${currentY})`);
                    }
                    break;
            }
        }

        console.log("Final anchor points:", points);
        return points;
    } catch (error) {
        console.warn("Failed to get anchor points:", error);
        return [];
    }
}

/* export */
function exportPathAsSVG(path: string, index: number) {
    // 브라우저 환경에서만 실행되도록 체크
    if (typeof window === "undefined") {
        return;
    }

    const svg = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill="black"/></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `svgenius-path-${index}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`#${index + 1} Path를 내보냈습니다`);
}

function extractPathsFromSVG(svgContent: string): string[] {
    // 브라우저 환경에서만 실행되도록 체크
    if (typeof window === "undefined") {
        return [];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const extractedPaths: string[] = [];

    // path 요소에서 직접 추출
    const paths = doc.querySelectorAll("path");
    paths.forEach((path) => {
        const d = path.getAttribute("d");
        if (d && d.trim()) {
            extractedPaths.push(d.trim());
        }
    });

    // rect를 path로 변환
    const rects = doc.querySelectorAll("rect");
    rects.forEach((rect) => {
        const x = parseFloat(rect.getAttribute("x") || "0");
        const y = parseFloat(rect.getAttribute("y") || "0");
        const width = parseFloat(rect.getAttribute("width") || "0");
        const height = parseFloat(rect.getAttribute("height") || "0");
        const rx = parseFloat(rect.getAttribute("rx") || "0");
        const ry = parseFloat(rect.getAttribute("ry") || "0");

        if (width > 0 && height > 0) {
            let pathData = "";
            if (rx > 0 || ry > 0) {
                // 둥근 모서리 사각형
                const effectiveRx = Math.min(rx || ry, width / 2);
                const effectiveRy = Math.min(ry || rx, height / 2);
                pathData = `M${x + effectiveRx} ${y} L${x + width - effectiveRx} ${y} Q${x + width} ${y} ${
                    x + width
                } ${y + effectiveRy} L${x + width} ${y + height - effectiveRy} Q${x + width} ${
                    y + height
                } ${x + width - effectiveRx} ${y + height} L${x + effectiveRx} ${y + height} Q${x} ${
                    y + height
                } ${x} ${y + height - effectiveRy} L${x} ${y + effectiveRy} Q${x} ${y} ${x + effectiveRx} ${y} Z`;
            } else {
                // 일반 사각형
                pathData = `M${x} ${y} L${x + width} ${y} L${x + width} ${y + height} L${x} ${y + height} Z`;
            }
            extractedPaths.push(pathData);
        }
    });

    // circle을 path로 변환
    const circles = doc.querySelectorAll("circle");
    circles.forEach((circle) => {
        const cx = parseFloat(circle.getAttribute("cx") || "0");
        const cy = parseFloat(circle.getAttribute("cy") || "0");
        const r = parseFloat(circle.getAttribute("r") || "0");

        if (r > 0) {
            // 원을 두 개의 반원 아크로 표현
            const pathData = `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} A${r} ${r} 0 0 1 ${cx - r} ${cy} Z`;
            extractedPaths.push(pathData);
        }
    });

    // ellipse를 path로 변환
    const ellipses = doc.querySelectorAll("ellipse");
    ellipses.forEach((ellipse) => {
        const cx = parseFloat(ellipse.getAttribute("cx") || "0");
        const cy = parseFloat(ellipse.getAttribute("cy") || "0");
        const rx = parseFloat(ellipse.getAttribute("rx") || "0");
        const ry = parseFloat(ellipse.getAttribute("ry") || "0");

        if (rx > 0 && ry > 0) {
            const pathData = `M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy} A${rx} ${ry} 0 0 1 ${
                cx - rx
            } ${cy} Z`;
            extractedPaths.push(pathData);
        }
    });

    // polygon을 path로 변환
    const polygons = doc.querySelectorAll("polygon");
    polygons.forEach((polygon) => {
        const points = polygon.getAttribute("points");
        if (points && points.trim()) {
            const coords = points
                .trim()
                .split(/[\s,]+/)
                .filter((p) => p.length > 0);
            if (coords.length >= 4 && coords.length % 2 === 0) {
                let pathData = `M${coords[0]} ${coords[1]}`;
                for (let i = 2; i < coords.length; i += 2) {
                    pathData += ` L${coords[i]} ${coords[i + 1]}`;
                }
                pathData += " Z";
                extractedPaths.push(pathData);
            }
        }
    });

    // polyline을 path로 변환
    const polylines = doc.querySelectorAll("polyline");
    polylines.forEach((polyline) => {
        const points = polyline.getAttribute("points");
        if (points && points.trim()) {
            const coords = points
                .trim()
                .split(/[\s,]+/)
                .filter((p) => p.length > 0);
            if (coords.length >= 4 && coords.length % 2 === 0) {
                let pathData = `M${coords[0]} ${coords[1]}`;
                for (let i = 2; i < coords.length; i += 2) {
                    pathData += ` L${coords[i]} ${coords[i + 1]}`;
                }
                extractedPaths.push(pathData);
            }
        }
    });

    // line을 path로 변환
    const lines = doc.querySelectorAll("line");
    lines.forEach((line) => {
        const x1 = parseFloat(line.getAttribute("x1") || "0");
        const y1 = parseFloat(line.getAttribute("y1") || "0");
        const x2 = parseFloat(line.getAttribute("x2") || "0");
        const y2 = parseFloat(line.getAttribute("y2") || "0");

        const pathData = `M${x1} ${y1} L${x2} ${y2}`;
        extractedPaths.push(pathData);
    });

    return extractedPaths;
}

// path 명령어 최적화 함수 (중복 제거)
function optimizePathCommands(commands: string[]): string[] {
    if (commands.length <= 1) return commands;

    const optimized: string[] = [];
    let prevEndX = 0,
        prevEndY = 0;

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        const cmdType = cmd[0];
        const params = cmd.substring(1).trim();
        const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
        const isAbsolute = cmdType === cmdType.toUpperCase();

        // 현재 명령어의 끝점 계산
        let currentEndX = prevEndX;
        let currentEndY = prevEndY;
        let shouldAdd = true;

        switch (cmdType.toUpperCase()) {
            case "M":
            case "L":
                if (numbers.length >= 2) {
                    const x = parseFloat(numbers[0] || "0");
                    const y = parseFloat(numbers[1] || "0");
                    if (isAbsolute) {
                        currentEndX = x;
                        currentEndY = y;
                    } else {
                        currentEndX += x;
                        currentEndY += y;
                    }

                    // 같은 위치로의 이동은 제거 (단, 첫 번째 M은 유지)
                    if (i > 0 && Math.abs(currentEndX - prevEndX) < 0.001 && Math.abs(currentEndY - prevEndY) < 0.001) {
                        shouldAdd = false;
                    }
                }
                break;
            case "H":
                if (numbers.length >= 1) {
                    const x = parseFloat(numbers[0] || "0");
                    if (isAbsolute) {
                        currentEndX = x;
                    } else {
                        currentEndX += x;
                    }

                    // 같은 X 위치로의 수평 이동은 제거
                    if (Math.abs(currentEndX - prevEndX) < 0.001) {
                        shouldAdd = false;
                    }
                }
                break;
            case "V":
                if (numbers.length >= 1) {
                    const y = parseFloat(numbers[0] || "0");
                    if (isAbsolute) {
                        currentEndY = y;
                    } else {
                        currentEndY += y;
                    }

                    // 같은 Y 위치로의 수직 이동은 제거
                    if (Math.abs(currentEndY - prevEndY) < 0.001) {
                        shouldAdd = false;
                    }
                }
                break;
            case "C":
                if (numbers.length >= 6) {
                    const x = parseFloat(numbers[4] || "0");
                    const y = parseFloat(numbers[5] || "0");
                    if (isAbsolute) {
                        currentEndX = x;
                        currentEndY = y;
                    } else {
                        currentEndX += x;
                        currentEndY += y;
                    }

                    // 같은 위치로의 곡선은 제거
                    if (Math.abs(currentEndX - prevEndX) < 0.001 && Math.abs(currentEndY - prevEndY) < 0.001) {
                        shouldAdd = false;
                    }
                }
                break;
            case "Q":
                if (numbers.length >= 4) {
                    const x = parseFloat(numbers[2] || "0");
                    const y = parseFloat(numbers[3] || "0");
                    if (isAbsolute) {
                        currentEndX = x;
                        currentEndY = y;
                    } else {
                        currentEndX += x;
                        currentEndY += y;
                    }

                    // 같은 위치로의 2차 곡선은 제거
                    if (Math.abs(currentEndX - prevEndX) < 0.001 && Math.abs(currentEndY - prevEndY) < 0.001) {
                        shouldAdd = false;
                    }
                }
                break;
            case "S":
                if (numbers.length >= 4) {
                    const x = parseFloat(numbers[2] || "0");
                    const y = parseFloat(numbers[3] || "0");
                    if (isAbsolute) {
                        currentEndX = x;
                        currentEndY = y;
                    } else {
                        currentEndX += x;
                        currentEndY += y;
                    }

                    // 같은 위치로의 스무스 곡선은 제거
                    if (Math.abs(currentEndX - prevEndX) < 0.001 && Math.abs(currentEndY - prevEndY) < 0.001) {
                        shouldAdd = false;
                    }
                }
                break;
            case "T":
                if (numbers.length >= 2) {
                    const x = parseFloat(numbers[0] || "0");
                    const y = parseFloat(numbers[1] || "0");
                    if (isAbsolute) {
                        currentEndX = x;
                        currentEndY = y;
                    } else {
                        currentEndX += x;
                        currentEndY += y;
                    }

                    // 같은 위치로의 스무스 2차 곡선은 제거
                    if (Math.abs(currentEndX - prevEndX) < 0.001 && Math.abs(currentEndY - prevEndY) < 0.001) {
                        shouldAdd = false;
                    }
                }
                break;
            case "Z":
                // Z 명령어는 항상 유지
                break;
        }

        if (shouldAdd) {
            optimized.push(cmd);
            prevEndX = currentEndX;
            prevEndY = currentEndY;
        }
    }

    console.log("Optimized commands:", optimized);
    return optimized;
}

// 베지어 곡선을 세분화하는 함수
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function subdivideCubicBezier(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    t: number = 0.5
): { first: number[]; second: number[] } {
    // De Casteljau's algorithm
    const x01 = x0 + (x1 - x0) * t;
    const y01 = y0 + (y1 - y0) * t;
    const x12 = x1 + (x2 - x1) * t;
    const y12 = y1 + (y2 - y1) * t;
    const x23 = x2 + (x3 - x2) * t;
    const y23 = y2 + (y3 - y2) * t;

    const x012 = x01 + (x12 - x01) * t;
    const y012 = y01 + (y12 - y01) * t;
    const x123 = x12 + (x23 - x12) * t;
    const y123 = y12 + (y23 - y12) * t;

    const x0123 = x012 + (x123 - x012) * t;
    const y0123 = y012 + (y123 - y012) * t;

    return {
        first: [x0, y0, x01, y01, x012, y012, x0123, y0123],
        second: [x0123, y0123, x123, y123, x23, y23, x3, y3],
    };
}

// 2차 베지어 곡선을 세분화하는 함수
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function subdivideQuadraticBezier(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    t: number = 0.5
): { first: number[]; second: number[] } {
    const x01 = x0 + (x1 - x0) * t;
    const y01 = y0 + (y1 - y0) * t;
    const x12 = x1 + (x2 - x1) * t;
    const y12 = y1 + (y2 - y1) * t;

    const x012 = x01 + (x12 - x01) * t;
    const y012 = y01 + (y12 - y01) * t;

    return {
        first: [x0, y0, x01, y01, x012, y012],
        second: [x012, y012, x12, y12, x2, y2],
    };
}

// 직선을 세분화하는 함수 (중간점 추가)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function subdivideLine(x0: number, y0: number, x1: number, y1: number): { midX: number; midY: number } {
    return {
        midX: (x0 + x1) / 2,
        midY: (y0 + y1) / 2,
    };
}

// 베지어 곡선 상의 점을 계산하는 함수 (t는 0~1 사이 값)
function getPointOnCubicBezier(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    t: number
): { x: number; y: number } {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const x = uuu * x0 + 3 * uu * t * x1 + 3 * u * tt * x2 + ttt * x3;
    const y = uuu * y0 + 3 * uu * t * y1 + 3 * u * tt * y2 + ttt * y3;

    return { x, y };
}

// 2차 베지어 곡선 상의 점을 계산하는 함수
function getPointOnQuadraticBezier(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    t: number
): { x: number; y: number } {
    const u = 1 - t;
    const x = u * u * x0 + 2 * u * t * x1 + t * t * x2;
    const y = u * u * y0 + 2 * u * t * y1 + t * t * y2;

    return { x, y };
}

// 곡선의 실제 길이를 근사적으로 계산하는 함수
function getCurveLength(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    curveType: string,
    controlPoints: number[]
): number {
    if (curveType === "line") {
        return Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    }

    // 곡선의 경우 여러 점을 샘플링하여 길이 근사
    let length = 0;
    const samples = 20;
    let prevX = startX,
        prevY = startY;

    for (let i = 1; i <= samples; i++) {
        const t = i / samples;
        let currentX, currentY;

        if (curveType === "cubic") {
            const point = getPointOnCubicBezier(
                startX,
                startY,
                controlPoints[0],
                controlPoints[1],
                controlPoints[2],
                controlPoints[3],
                endX,
                endY,
                t
            );
            currentX = point.x;
            currentY = point.y;
        } else if (curveType === "quadratic") {
            const point = getPointOnQuadraticBezier(startX, startY, controlPoints[0], controlPoints[1], endX, endY, t);
            currentX = point.x;
            currentY = point.y;
        } else {
            currentX = startX + (endX - startX) * t;
            currentY = startY + (endY - startY) * t;
        }

        length += Math.sqrt((currentX - prevX) ** 2 + (currentY - prevY) ** 2);
        prevX = currentX;
        prevY = currentY;
    }

    return length;
}

// Path에 포인트를 추가하여 지정된 수만큼 맞추는 함수 (개선된 버전)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function normalizePathPointCount(path: string, targetPointCount: number): string {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const commands = parseSVGPath(path);
        const currentPointCount = getAnchorPoints(path).length;

        console.log(`Normalizing path: current=${currentPointCount}, target=${targetPointCount}`);

        if (currentPointCount >= targetPointCount) {
            console.log("Already has enough points, returning original");
            return path; // 이미 충분한 포인트가 있으면 그대로 반환
        }

        const pointsToAdd = targetPointCount - currentPointCount;
        console.log(`Need to add ${pointsToAdd} points`);

        // 가장 간단한 방법: 기존 선분들 사이에 중간점을 추가
        let result = path;
        let currentPoints = currentPointCount;

        for (let i = 0; i < pointsToAdd; i++) {
            result = addSinglePointToPath(result);
            const newPoints = getAnchorPoints(result).length;
            console.log(`Round ${i + 1}: ${currentPoints} -> ${newPoints} points`);
            currentPoints = newPoints;

            if (currentPoints >= targetPointCount) {
                break;
            }
        }

        console.log(`Final normalization: ${currentPointCount} -> ${getAnchorPoints(result).length} points`);
        return result;
    } catch (error) {
        console.warn("Path normalization failed:", error);
        return path;
    }
}

// Path에서 중복 포인트 제거하는 함수
function removeDuplicatePoints(path: string): string {
    try {
        const commands = parseSVGPath(path);
        const cleanCommands: string[] = [];
        let currentX = 0,
            currentY = 0;

        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            const cmdType = cmd[0];
            const params = cmd.substring(1).trim();
            const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
            const isAbsolute = cmdType === cmdType.toUpperCase();

            let shouldAdd = true;
            let targetX = currentX,
                targetY = currentY;

            switch (cmdType.toUpperCase()) {
                case "M":
                case "L":
                    if (numbers.length >= 2) {
                        const x = parseFloat(numbers[0] || "0");
                        const y = parseFloat(numbers[1] || "0");
                        targetX = isAbsolute ? x : currentX + x;
                        targetY = isAbsolute ? y : currentY + y;

                        // 현재 위치와 동일한 곳으로의 이동은 제거
                        if (Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1) {
                            shouldAdd = false;
                        }
                    }
                    break;
                case "H":
                    if (numbers.length >= 1) {
                        const x = parseFloat(numbers[0] || "0");
                        targetX = isAbsolute ? x : currentX + x;
                        if (Math.abs(targetX - currentX) < 0.1) {
                            shouldAdd = false;
                        }
                    }
                    break;
                case "V":
                    if (numbers.length >= 1) {
                        const y = parseFloat(numbers[0] || "0");
                        targetY = isAbsolute ? y : currentY + y;
                        if (Math.abs(targetY - currentY) < 0.1) {
                            shouldAdd = false;
                        }
                    }
                    break;
                default:
                    // C, Q, S, T, Z 명령어는 항상 유지
                    if (cmdType.toUpperCase() === "C" && numbers.length >= 6) {
                        const x = parseFloat(numbers[4] || "0");
                        const y = parseFloat(numbers[5] || "0");
                        targetX = isAbsolute ? x : currentX + x;
                        targetY = isAbsolute ? y : currentY + y;
                    } else if (cmdType.toUpperCase() === "Q" && numbers.length >= 4) {
                        const x = parseFloat(numbers[2] || "0");
                        const y = parseFloat(numbers[3] || "0");
                        targetX = isAbsolute ? x : currentX + x;
                        targetY = isAbsolute ? y : currentY + y;
                    }
                    break;
            }

            if (shouldAdd) {
                cleanCommands.push(cmd);
                currentX = targetX;
                currentY = targetY;
            }
        }

        return cleanCommands.join(" ");
    } catch (error) {
        console.warn("Failed to remove duplicate points:", error);
        return path;
    }
}

// Path에 하나의 포인트를 추가하는 함수 (개선된 버전)
function addSinglePointToPath(path: string): string {
    try {
        const commands = parseSVGPath(path);
        let currentX = 0,
            currentY = 0;
        const segments: Array<{
            command: string;
            startX: number;
            startY: number;
            endX: number;
            endY: number;
            distance: number;
            index: number;
            curveType: string;
            controlPoints: number[];
        }> = [];

        // 모든 선분의 길이를 계산 (M 명령어는 제외)
        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            const cmdType = cmd[0];
            const params = cmd.substring(1).trim();
            const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
            const isAbsolute = cmdType === cmdType.toUpperCase();

            const startX = currentX;
            const startY = currentY;

            switch (cmdType.toUpperCase()) {
                case "M":
                    // M 명령어는 분할하지 않음 - Path의 시작점이므로
                    if (numbers.length >= 2) {
                        const x = parseFloat(numbers[0] || "0");
                        const y = parseFloat(numbers[1] || "0");
                        currentX = isAbsolute ? x : currentX + x;
                        currentY = isAbsolute ? y : currentY + y;
                    }
                    break;
                case "L":
                    if (numbers.length >= 2) {
                        const x = parseFloat(numbers[0] || "0");
                        const y = parseFloat(numbers[1] || "0");
                        const targetX = isAbsolute ? x : currentX + x;
                        const targetY = isAbsolute ? y : currentY + y;

                        const distance = getCurveLength(startX, startY, targetX, targetY, "line", []);
                        if (distance > 5) {
                            // 최소 거리를 늘려서 너무 작은 선분은 분할하지 않음
                            segments.push({
                                command: cmd,
                                startX: startX,
                                startY: startY,
                                endX: targetX,
                                endY: targetY,
                                distance: distance,
                                index: i,
                                curveType: "line",
                                controlPoints: [],
                            });
                        }

                        currentX = targetX;
                        currentY = targetY;
                    }
                    break;

                case "C":
                    if (numbers.length >= 6) {
                        const x1 = parseFloat(numbers[0] || "0");
                        const y1 = parseFloat(numbers[1] || "0");
                        const x2 = parseFloat(numbers[2] || "0");
                        const y2 = parseFloat(numbers[3] || "0");
                        const x = parseFloat(numbers[4] || "0");
                        const y = parseFloat(numbers[5] || "0");

                        const cp1X = isAbsolute ? x1 : currentX + x1;
                        const cp1Y = isAbsolute ? y1 : currentY + y1;
                        const cp2X = isAbsolute ? x2 : currentX + x2;
                        const cp2Y = isAbsolute ? y2 : currentY + y2;
                        const targetX = isAbsolute ? x : currentX + x;
                        const targetY = isAbsolute ? y : currentY + y;

                        const distance = getCurveLength(startX, startY, targetX, targetY, "cubic", [
                            cp1X,
                            cp1Y,
                            cp2X,
                            cp2Y,
                        ]);
                        segments.push({
                            command: cmd,
                            startX: startX,
                            startY: startY,
                            endX: targetX,
                            endY: targetY,
                            distance: distance,
                            index: i,
                            curveType: "cubic",
                            controlPoints: [cp1X, cp1Y, cp2X, cp2Y],
                        });

                        currentX = targetX;
                        currentY = targetY;
                    }
                    break;

                case "Q":
                    if (numbers.length >= 4) {
                        const x1 = parseFloat(numbers[0] || "0");
                        const y1 = parseFloat(numbers[1] || "0");
                        const x = parseFloat(numbers[2] || "0");
                        const y = parseFloat(numbers[3] || "0");

                        const cpX = isAbsolute ? x1 : currentX + x1;
                        const cpY = isAbsolute ? y1 : currentY + y1;
                        const targetX = isAbsolute ? x : currentX + x;
                        const targetY = isAbsolute ? y : currentY + y;

                        const distance = getCurveLength(startX, startY, targetX, targetY, "quadratic", [cpX, cpY]);
                        segments.push({
                            command: cmd,
                            startX: startX,
                            startY: startY,
                            endX: targetX,
                            endY: targetY,
                            distance: distance,
                            index: i,
                            curveType: "quadratic",
                            controlPoints: [cpX, cpY],
                        });

                        currentX = targetX;
                        currentY = targetY;
                    }
                    break;

                case "H":
                    if (numbers.length >= 1) {
                        const x = parseFloat(numbers[0] || "0");
                        const targetX = isAbsolute ? x : currentX + x;

                        const distance = Math.abs(targetX - startX);
                        if (distance > 1) {
                            segments.push({
                                command: cmd,
                                startX: startX,
                                startY: startY,
                                endX: targetX,
                                endY: currentY,
                                distance: distance,
                                index: i,
                                curveType: "line",
                                controlPoints: [],
                            });
                        }

                        currentX = targetX;
                    }
                    break;

                case "V":
                    if (numbers.length >= 1) {
                        const y = parseFloat(numbers[0] || "0");
                        const targetY = isAbsolute ? y : currentY + y;

                        const distance = Math.abs(targetY - startY);
                        if (distance > 1) {
                            segments.push({
                                command: cmd,
                                startX: startX,
                                startY: startY,
                                endX: currentX,
                                endY: targetY,
                                distance: distance,
                                index: i,
                                curveType: "line",
                                controlPoints: [],
                            });
                        }

                        currentY = targetY;
                    }
                    break;
            }
        }

        if (segments.length === 0) {
            return path;
        }

        // 가장 긴 선분을 찾아서 분할
        segments.sort((a, b) => b.distance - a.distance);
        const longestSegment = segments[0];

        console.log(
            `Adding point to ${longestSegment.curveType} segment at index ${
                longestSegment.index
            }, distance: ${longestSegment.distance.toFixed(2)}`
        );

        // 해당 명령어를 보간된 점으로 분할
        const newCommands = [...commands];
        const originalCmd = longestSegment.command;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const cmdType = originalCmd[0];

        // 모든 경우에 대해 곡선 위의 중간점을 계산하여 직선으로 추가
        // 이 방법이 더 안전하고 형태 왜곡이 적음
        let midX, midY;

        if (longestSegment.curveType === "line") {
            // 직선의 경우 중간점
            midX = (longestSegment.startX + longestSegment.endX) / 2;
            midY = (longestSegment.startY + longestSegment.endY) / 2;
        } else if (longestSegment.curveType === "cubic") {
            // 3차 베지어 곡선 위의 t=0.5 지점
            const midPoint = getPointOnCubicBezier(
                longestSegment.startX,
                longestSegment.startY,
                longestSegment.controlPoints[0],
                longestSegment.controlPoints[1],
                longestSegment.controlPoints[2],
                longestSegment.controlPoints[3],
                longestSegment.endX,
                longestSegment.endY,
                0.5
            );
            midX = midPoint.x;
            midY = midPoint.y;
        } else if (longestSegment.curveType === "quadratic") {
            // 2차 베지어 곡선 위의 t=0.5 지점
            const midPoint = getPointOnQuadraticBezier(
                longestSegment.startX,
                longestSegment.startY,
                longestSegment.controlPoints[0],
                longestSegment.controlPoints[1],
                longestSegment.endX,
                longestSegment.endY,
                0.5
            );
            midX = midPoint.x;
            midY = midPoint.y;
        } else {
            // 기본값
            midX = (longestSegment.startX + longestSegment.endX) / 2;
            midY = (longestSegment.startY + longestSegment.endY) / 2;
        }

        // 원래 곡선은 그대로 두고, 중간점만 직선으로 추가
        // 이렇게 하면 원래 곡선이 유지되면서 포인트만 추가됨
        newCommands.splice(longestSegment.index + 1, 0, `L ${midX.toFixed(3)} ${midY.toFixed(3)}`);

        console.log(`Added midpoint at (${midX.toFixed(3)}, ${midY.toFixed(3)}) for ${longestSegment.curveType} curve`);

        // 결과에서 중복 포인트 제거
        const result = newCommands.join(" ");
        return removeDuplicatePoints(result);
    } catch (error) {
        console.warn("Failed to add point to path:", error);
        return path;
    }
}

// 원본 곡선을 보존하면서 포인트를 추가하는 하이브리드 방식
function normalizePathPreservingCurves(path: string, targetPointCount: number): string {
    try {
        const cleanPath = removeDuplicatePoints(path);
        const currentPoints = getAnchorPoints(cleanPath);

        if (currentPoints.length >= targetPointCount) {
            console.log(`Already has ${currentPoints.length} points, target is ${targetPointCount}`);
            return cleanPath;
        }

        console.log(`Curve-preserving normalization: ${currentPoints.length} -> ${targetPointCount} points`);

        const pointsToAdd = targetPointCount - currentPoints.length;
        console.log(`Need to add ${pointsToAdd} points while preserving curves`);

        // 원본 명령어들을 분석하여 곡선과 직선을 구분
        const commands = parseSVGPath(cleanPath);
        const segments = analyzePathSegments(cleanPath);

        // 각 세그먼트의 복잡도(곡선 여부)와 길이를 고려하여 추가할 포인트 수 결정
        const segmentWeights = segments.map((seg) => ({
            ...seg,
            priority: seg.isCurve ? seg.length * 1.5 : seg.length, // 곡선에 더 높은 우선순위
            pointsToAdd: 0,
        }));

        // 전체 가중치 계산
        const totalWeight = segmentWeights.reduce((sum, seg) => sum + seg.priority, 0);

        // 각 세그먼트에 추가할 포인트 수 배분
        let remainingPoints = pointsToAdd;
        segmentWeights.forEach((seg) => {
            if (remainingPoints > 0) {
                const allocation = Math.round((seg.priority / totalWeight) * pointsToAdd);
                seg.pointsToAdd = Math.min(allocation, remainingPoints);
                remainingPoints -= seg.pointsToAdd;
            }
        });

        // 남은 포인트는 가장 긴 세그먼트에 추가
        if (remainingPoints > 0) {
            segmentWeights.sort((a, b) => b.priority - a.priority);
            for (let i = 0; i < segmentWeights.length && remainingPoints > 0; i++) {
                segmentWeights[i].pointsToAdd++;
                remainingPoints--;
            }
        }

        console.log(
            "Point allocation:",
            segmentWeights.map((s) => `${s.type}:${s.pointsToAdd}`)
        );

        // 새로운 Path 구성
        const newCommands: string[] = [];
        let currentX = 0,
            currentY = 0;
        let segmentIndex = 0;

        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            const cmdType = cmd[0];

            if (cmdType.toUpperCase() === "M") {
                // M 명령어는 그대로 유지
                newCommands.push(cmd);
                const params = cmd.substring(1).trim();
                const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
                if (numbers.length >= 2) {
                    currentX = parseFloat(numbers[0] || "0");
                    currentY = parseFloat(numbers[1] || "0");
                }
            } else if (cmdType.toUpperCase() === "Z") {
                // Z 명령어는 마지막에 추가
                newCommands.push(cmd);
            } else {
                // 다른 명령어들에 대해 포인트 추가 처리
                if (segmentIndex < segmentWeights.length) {
                    const segment = segmentWeights[segmentIndex];

                    if (segment.pointsToAdd > 0 && segment.isCurve) {
                        // 곡선인 경우: 곡선을 세분화
                        const subdividedCommands = subdivideCommand(cmd, currentX, currentY, segment.pointsToAdd);
                        newCommands.push(...subdividedCommands);
                    } else if (segment.pointsToAdd > 0 && !segment.isCurve) {
                        // 직선인 경우: 중간점들을 추가
                        const intermediatePoints = createIntermediatePoints(
                            cmd,
                            currentX,
                            currentY,
                            segment.pointsToAdd
                        );
                        newCommands.push(...intermediatePoints);
                    } else {
                        // 포인트를 추가하지 않는 경우 원본 명령어 유지
                        newCommands.push(cmd);
                    }

                    // 현재 위치 업데이트
                    const endPoint = getCommandEndPoint(cmd, currentX, currentY);
                    currentX = endPoint.x;
                    currentY = endPoint.y;

                    segmentIndex++;
                } else {
                    newCommands.push(cmd);
                }
            }
        }

        const result = newCommands.join(" ");
        const finalPoints = getAnchorPoints(result).length;
        console.log(`Final curve-preserving normalization: ${currentPoints.length} -> ${finalPoints} points`);

        return result;
    } catch (error) {
        console.warn("Curve-preserving normalization failed:", error);
        return path;
    }
}

// Path 세그먼트들을 분석하는 함수
function analyzePathSegments(path: string): Array<{ type: string; isCurve: boolean; length: number; command: string }> {
    const commands = parseSVGPath(path);
    const segments: Array<{ type: string; isCurve: boolean; length: number; command: string }> = [];
    let currentX = 0,
        currentY = 0;

    for (const cmd of commands) {
        const cmdType = cmd[0];
        const params = cmd.substring(1).trim();
        const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
        const isAbsolute = cmdType === cmdType.toUpperCase();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const startX = currentX;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const startY = currentY;
        let length = 0;
        let isCurve = false;
        let targetX = currentX,
            targetY = currentY;

        switch (cmdType.toUpperCase()) {
            case "M":
                // M 명령어는 세그먼트로 취급하지 않음
                if (numbers.length >= 2) {
                    currentX = isAbsolute ? parseFloat(numbers[0] || "0") : currentX + parseFloat(numbers[0] || "0");
                    currentY = isAbsolute ? parseFloat(numbers[1] || "0") : currentY + parseFloat(numbers[1] || "0");
                }
                continue;

            case "L":
                if (numbers.length >= 2) {
                    targetX = isAbsolute ? parseFloat(numbers[0] || "0") : currentX + parseFloat(numbers[0] || "0");
                    targetY = isAbsolute ? parseFloat(numbers[1] || "0") : currentY + parseFloat(numbers[1] || "0");
                    length = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);
                }
                break;

            case "H":
                if (numbers.length >= 1) {
                    targetX = isAbsolute ? parseFloat(numbers[0] || "0") : currentX + parseFloat(numbers[0] || "0");
                    length = Math.abs(targetX - currentX);
                }
                break;

            case "V":
                if (numbers.length >= 1) {
                    targetY = isAbsolute ? parseFloat(numbers[0] || "0") : currentY + parseFloat(numbers[0] || "0");
                    length = Math.abs(targetY - currentY);
                }
                break;

            case "C":
                isCurve = true;
                if (numbers.length >= 6) {
                    targetX = isAbsolute ? parseFloat(numbers[4] || "0") : currentX + parseFloat(numbers[4] || "0");
                    targetY = isAbsolute ? parseFloat(numbers[5] || "0") : currentY + parseFloat(numbers[5] || "0");
                    const cp1X = isAbsolute ? parseFloat(numbers[0] || "0") : currentX + parseFloat(numbers[0] || "0");
                    const cp1Y = isAbsolute ? parseFloat(numbers[1] || "0") : currentY + parseFloat(numbers[1] || "0");
                    const cp2X = isAbsolute ? parseFloat(numbers[2] || "0") : currentX + parseFloat(numbers[2] || "0");
                    const cp2Y = isAbsolute ? parseFloat(numbers[3] || "0") : currentY + parseFloat(numbers[3] || "0");
                    length = getCurveLength(currentX, currentY, targetX, targetY, "cubic", [cp1X, cp1Y, cp2X, cp2Y]);
                }
                break;

            case "Q":
                isCurve = true;
                if (numbers.length >= 4) {
                    targetX = isAbsolute ? parseFloat(numbers[2] || "0") : currentX + parseFloat(numbers[2] || "0");
                    targetY = isAbsolute ? parseFloat(numbers[3] || "0") : currentY + parseFloat(numbers[3] || "0");
                    const cpX = isAbsolute ? parseFloat(numbers[0] || "0") : currentX + parseFloat(numbers[0] || "0");
                    const cpY = isAbsolute ? parseFloat(numbers[1] || "0") : currentY + parseFloat(numbers[1] || "0");
                    length = getCurveLength(currentX, currentY, targetX, targetY, "quadratic", [cpX, cpY]);
                }
                break;

            case "Z":
                // Z 명령어는 세그먼트로 취급하지 않음
                continue;
        }

        if (length > 0) {
            segments.push({
                type: cmdType.toUpperCase(),
                isCurve: isCurve,
                length: length,
                command: cmd,
            });
        }

        currentX = targetX;
        currentY = targetY;
    }

    return segments;
}

// 명령어의 끝점을 구하는 함수
function getCommandEndPoint(cmd: string, currentX: number, currentY: number): { x: number; y: number } {
    const cmdType = cmd[0];
    const params = cmd.substring(1).trim();
    const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
    const isAbsolute = cmdType === cmdType.toUpperCase();

    switch (cmdType.toUpperCase()) {
        case "L":
        case "M":
            if (numbers.length >= 2) {
                return {
                    x: isAbsolute ? parseFloat(numbers[0] || "0") : currentX + parseFloat(numbers[0] || "0"),
                    y: isAbsolute ? parseFloat(numbers[1] || "0") : currentY + parseFloat(numbers[1] || "0"),
                };
            }
            break;
        case "H":
            if (numbers.length >= 1) {
                return {
                    x: isAbsolute ? parseFloat(numbers[0] || "0") : currentX + parseFloat(numbers[0] || "0"),
                    y: currentY,
                };
            }
            break;
        case "V":
            if (numbers.length >= 1) {
                return {
                    x: currentX,
                    y: isAbsolute ? parseFloat(numbers[0] || "0") : currentY + parseFloat(numbers[0] || "0"),
                };
            }
            break;
        case "C":
            if (numbers.length >= 6) {
                return {
                    x: isAbsolute ? parseFloat(numbers[4] || "0") : currentX + parseFloat(numbers[4] || "0"),
                    y: isAbsolute ? parseFloat(numbers[5] || "0") : currentY + parseFloat(numbers[5] || "0"),
                };
            }
            break;
        case "Q":
            if (numbers.length >= 4) {
                return {
                    x: isAbsolute ? parseFloat(numbers[2] || "0") : currentX + parseFloat(numbers[2] || "0"),
                    y: isAbsolute ? parseFloat(numbers[3] || "0") : currentY + parseFloat(numbers[3] || "0"),
                };
            }
            break;
    }

    return { x: currentX, y: currentY };
}

// 곡선 명령어를 세분화하는 함수
function subdivideCommand(cmd: string, currentX: number, currentY: number, subdivisions: number): string[] {
    const cmdType = cmd[0];
    const params = cmd.substring(1).trim();
    const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
    const isAbsolute = cmdType === cmdType.toUpperCase();

    if (cmdType.toUpperCase() === "C" && numbers.length >= 6) {
        // 3차 베지어 곡선 세분화
        const cp1X = isAbsolute ? parseFloat(numbers[0] || "0") : currentX + parseFloat(numbers[0] || "0");
        const cp1Y = isAbsolute ? parseFloat(numbers[1] || "0") : currentY + parseFloat(numbers[1] || "0");
        const cp2X = isAbsolute ? parseFloat(numbers[2] || "0") : currentX + parseFloat(numbers[2] || "0");
        const cp2Y = isAbsolute ? parseFloat(numbers[3] || "0") : currentY + parseFloat(numbers[3] || "0");
        const endX = isAbsolute ? parseFloat(numbers[4] || "0") : currentX + parseFloat(numbers[4] || "0");
        const endY = isAbsolute ? parseFloat(numbers[5] || "0") : currentY + parseFloat(numbers[5] || "0");

        const parts: string[] = [];
        const segments = subdivisions + 1;

        for (let i = 0; i < segments; i++) {
            const t1 = i / segments;
            const t2 = (i + 1) / segments;

            const subdivided = subdivideCubicBezierRange(
                currentX,
                currentY,
                cp1X,
                cp1Y,
                cp2X,
                cp2Y,
                endX,
                endY,
                t1,
                t2
            );
            parts.push(
                `C ${subdivided[2]} ${subdivided[3]} ${subdivided[4]} ${subdivided[5]} ${subdivided[6]} ${subdivided[7]}`
            );
        }

        return parts;
    } else if (cmdType.toUpperCase() === "Q" && numbers.length >= 4) {
        // 2차 베지어 곡선 세분화
        const cpX = isAbsolute ? parseFloat(numbers[0] || "0") : currentX + parseFloat(numbers[0] || "0");
        const cpY = isAbsolute ? parseFloat(numbers[1] || "0") : currentY + parseFloat(numbers[1] || "0");
        const endX = isAbsolute ? parseFloat(numbers[2] || "0") : currentX + parseFloat(numbers[2] || "0");
        const endY = isAbsolute ? parseFloat(numbers[3] || "0") : currentY + parseFloat(numbers[3] || "0");

        const parts: string[] = [];
        const segments = subdivisions + 1;

        for (let i = 0; i < segments; i++) {
            const t1 = i / segments;
            const t2 = (i + 1) / segments;

            const subdivided = subdivideQuadraticBezierRange(currentX, currentY, cpX, cpY, endX, endY, t1, t2);
            parts.push(`Q ${subdivided[2]} ${subdivided[3]} ${subdivided[4]} ${subdivided[5]}`);
        }

        return parts;
    }

    // 곡선이 아닌 경우 원본 반환
    return [cmd];
}

// 직선에 중간점들을 추가하는 함수
function createIntermediatePoints(cmd: string, currentX: number, currentY: number, pointCount: number): string[] {
    const endPoint = getCommandEndPoint(cmd, currentX, currentY);
    const parts: string[] = [];

    for (let i = 1; i <= pointCount + 1; i++) {
        const ratio = i / (pointCount + 1);
        const x = currentX + (endPoint.x - currentX) * ratio;
        const y = currentY + (endPoint.y - currentY) * ratio;

        if (i === pointCount + 1) {
            // 마지막은 원본 명령어 사용
            parts.push(cmd);
        } else {
            // 중간점들은 L 명령어로
            parts.push(`L ${x.toFixed(3)} ${y.toFixed(3)}`);
        }
    }

    return parts;
}

// 베지어 곡선의 특정 구간을 추출하는 함수
function subdivideCubicBezierRange(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    t1: number,
    t2: number
): number[] {
    // t1에서 t2까지의 구간을 추출
    const point1 = getPointOnCubicBezier(x0, y0, x1, y1, x2, y2, x3, y3, t1);
    const point2 = getPointOnCubicBezier(x0, y0, x1, y1, x2, y2, x3, y3, t2);

    // 간단한 근사: 직선으로 연결하되 곡선의 특성을 반영한 제어점 계산
    const cp1X = point1.x + (point2.x - point1.x) * 0.25;
    const cp1Y = point1.y + (point2.y - point1.y) * 0.25;
    const cp2X = point1.x + (point2.x - point1.x) * 0.75;
    const cp2Y = point1.y + (point2.y - point1.y) * 0.75;

    return [point1.x, point1.y, cp1X, cp1Y, cp2X, cp2Y, point2.x, point2.y];
}

// 2차 베지어 곡선의 특정 구간을 추출하는 함수
function subdivideQuadraticBezierRange(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    t1: number,
    t2: number
): number[] {
    const point1 = getPointOnQuadraticBezier(x0, y0, x1, y1, x2, y2, t1);
    const point2 = getPointOnQuadraticBezier(x0, y0, x1, y1, x2, y2, t2);

    // 중간 제어점 계산
    const cpX = (point1.x + point2.x) / 2;
    const cpY = (point1.y + point2.y) / 2;

    return [point1.x, point1.y, cpX, cpY, point2.x, point2.y];
}

// Path의 전체 길이를 계산하는 함수
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateTotalPathLength(path: string): number {
    try {
        const commands = parseSVGPath(path);
        let totalLength = 0;
        let currentX = 0,
            currentY = 0;

        for (const cmd of commands) {
            const cmdType = cmd[0];
            const params = cmd.substring(1).trim();
            const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
            const isAbsolute = cmdType === cmdType.toUpperCase();

            switch (cmdType.toUpperCase()) {
                case "M":
                case "L":
                    if (numbers.length >= 2) {
                        const x = parseFloat(numbers[0] || "0");
                        const y = parseFloat(numbers[1] || "0");
                        const targetX = isAbsolute ? x : currentX + x;
                        const targetY = isAbsolute ? y : currentY + y;

                        if (cmdType.toUpperCase() === "L") {
                            // M은 길이에 포함하지 않음
                            totalLength += Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);
                        }

                        currentX = targetX;
                        currentY = targetY;
                    }
                    break;

                case "H":
                    if (numbers.length >= 1) {
                        const x = parseFloat(numbers[0] || "0");
                        const targetX = isAbsolute ? x : currentX + x;
                        totalLength += Math.abs(targetX - currentX);
                        currentX = targetX;
                    }
                    break;

                case "V":
                    if (numbers.length >= 1) {
                        const y = parseFloat(numbers[0] || "0");
                        const targetY = isAbsolute ? y : currentY + y;
                        totalLength += Math.abs(targetY - currentY);
                        currentY = targetY;
                    }
                    break;

                case "C":
                    if (numbers.length >= 6) {
                        const x1 = parseFloat(numbers[0] || "0");
                        const y1 = parseFloat(numbers[1] || "0");
                        const x2 = parseFloat(numbers[2] || "0");
                        const y2 = parseFloat(numbers[3] || "0");
                        const x = parseFloat(numbers[4] || "0");
                        const y = parseFloat(numbers[5] || "0");

                        const cp1X = isAbsolute ? x1 : currentX + x1;
                        const cp1Y = isAbsolute ? y1 : currentY + y1;
                        const cp2X = isAbsolute ? x2 : currentX + x2;
                        const cp2Y = isAbsolute ? y2 : currentY + y2;
                        const targetX = isAbsolute ? x : currentX + x;
                        const targetY = isAbsolute ? y : currentY + y;

                        totalLength += getCurveLength(currentX, currentY, targetX, targetY, "cubic", [
                            cp1X,
                            cp1Y,
                            cp2X,
                            cp2Y,
                        ]);

                        currentX = targetX;
                        currentY = targetY;
                    }
                    break;

                case "Q":
                    if (numbers.length >= 4) {
                        const x1 = parseFloat(numbers[0] || "0");
                        const y1 = parseFloat(numbers[1] || "0");
                        const x = parseFloat(numbers[2] || "0");
                        const y = parseFloat(numbers[3] || "0");

                        const cpX = isAbsolute ? x1 : currentX + x1;
                        const cpY = isAbsolute ? y1 : currentY + y1;
                        const targetX = isAbsolute ? x : currentX + x;
                        const targetY = isAbsolute ? y : currentY + y;

                        totalLength += getCurveLength(currentX, currentY, targetX, targetY, "quadratic", [cpX, cpY]);

                        currentX = targetX;
                        currentY = targetY;
                    }
                    break;
            }
        }

        return totalLength;
    } catch (error) {
        console.warn("Failed to calculate path length:", error);
        return 0;
    }
}

// Path 상에서 특정 거리에 있는 점을 찾는 함수
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPointAtDistance(path: string, targetDistance: number): { x: number; y: number } | null {
    try {
        const commands = parseSVGPath(path);
        let currentDistance = 0;
        let currentX = 0,
            currentY = 0;

        if (targetDistance <= 0) {
            // 시작점 반환
            const firstCmd = commands[0];
            if (firstCmd && firstCmd[0].toUpperCase() === "M") {
                const params = firstCmd.substring(1).trim();
                const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
                if (numbers.length >= 2) {
                    return { x: parseFloat(numbers[0] || "0"), y: parseFloat(numbers[1] || "0") };
                }
            }
            return { x: 0, y: 0 };
        }

        for (const cmd of commands) {
            const cmdType = cmd[0];
            const params = cmd.substring(1).trim();
            const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
            const isAbsolute = cmdType === cmdType.toUpperCase();

            switch (cmdType.toUpperCase()) {
                case "M":
                    if (numbers.length >= 2) {
                        const x = parseFloat(numbers[0] || "0");
                        const y = parseFloat(numbers[1] || "0");
                        currentX = isAbsolute ? x : currentX + x;
                        currentY = isAbsolute ? y : currentY + y;
                    }
                    break;

                case "L":
                    if (numbers.length >= 2) {
                        const x = parseFloat(numbers[0] || "0");
                        const y = parseFloat(numbers[1] || "0");
                        const targetX = isAbsolute ? x : currentX + x;
                        const targetY = isAbsolute ? y : currentY + y;

                        const segmentLength = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);

                        if (currentDistance + segmentLength >= targetDistance) {
                            // 이 세그먼트 안에 목표 거리가 있음
                            const ratio = (targetDistance - currentDistance) / segmentLength;
                            return {
                                x: currentX + (targetX - currentX) * ratio,
                                y: currentY + (targetY - currentY) * ratio,
                            };
                        }

                        currentDistance += segmentLength;
                        currentX = targetX;
                        currentY = targetY;
                    }
                    break;

                case "H":
                    if (numbers.length >= 1) {
                        const x = parseFloat(numbers[0] || "0");
                        const targetX = isAbsolute ? x : currentX + x;
                        const segmentLength = Math.abs(targetX - currentX);

                        if (currentDistance + segmentLength >= targetDistance) {
                            const ratio = (targetDistance - currentDistance) / segmentLength;
                            return {
                                x: currentX + (targetX - currentX) * ratio,
                                y: currentY,
                            };
                        }

                        currentDistance += segmentLength;
                        currentX = targetX;
                    }
                    break;

                case "V":
                    if (numbers.length >= 1) {
                        const y = parseFloat(numbers[0] || "0");
                        const targetY = isAbsolute ? y : currentY + y;
                        const segmentLength = Math.abs(targetY - currentY);

                        if (currentDistance + segmentLength >= targetDistance) {
                            const ratio = (targetDistance - currentDistance) / segmentLength;
                            return {
                                x: currentX,
                                y: currentY + (targetY - currentY) * ratio,
                            };
                        }

                        currentDistance += segmentLength;
                        currentY = targetY;
                    }
                    break;

                // C, Q 곡선의 경우 단순화하여 직선으로 근사
                case "C":
                    if (numbers.length >= 6) {
                        const x = parseFloat(numbers[4] || "0");
                        const y = parseFloat(numbers[5] || "0");
                        const targetX = isAbsolute ? x : currentX + x;
                        const targetY = isAbsolute ? y : currentY + y;

                        // 곡선 길이 근사
                        const segmentLength = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2) * 1.2; // 곡선이므로 1.2배

                        if (currentDistance + segmentLength >= targetDistance) {
                            const ratio = (targetDistance - currentDistance) / segmentLength;
                            return {
                                x: currentX + (targetX - currentX) * ratio,
                                y: currentY + (targetY - currentY) * ratio,
                            };
                        }

                        currentDistance += segmentLength;
                        currentX = targetX;
                        currentY = targetY;
                    }
                    break;

                case "Q":
                    if (numbers.length >= 4) {
                        const x = parseFloat(numbers[2] || "0");
                        const y = parseFloat(numbers[3] || "0");
                        const targetX = isAbsolute ? x : currentX + x;
                        const targetY = isAbsolute ? y : currentY + y;

                        const segmentLength = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2) * 1.1; // 곡선이므로 1.1배

                        if (currentDistance + segmentLength >= targetDistance) {
                            const ratio = (targetDistance - currentDistance) / segmentLength;
                            return {
                                x: currentX + (targetX - currentX) * ratio,
                                y: currentY + (targetY - currentY) * ratio,
                            };
                        }

                        currentDistance += segmentLength;
                        currentX = targetX;
                        currentY = targetY;
                    }
                    break;
            }
        }

        // 목표 거리가 Path 끝을 넘어선 경우 마지막 점 반환
        return { x: currentX, y: currentY };
    } catch (error) {
        console.warn("Failed to get point at distance:", error);
        return null;
    }
}

// 모든 Path의 포인트 수를 최대값으로 맞추는 함수 (곡선 보존 방식)
function normalizeAllPaths(paths: string[]): string[] {
    const pointCounts = paths.map((path) => getAnchorPoints(path).length);
    const maxPoints = Math.max(...pointCounts);

    console.log("Point counts:", pointCounts, "Max:", maxPoints);

    return paths.map((path, index) => {
        const currentPoints = pointCounts[index];
        if (currentPoints < maxPoints) {
            console.log(`Curve-preserving normalizing path ${index}: ${currentPoints} -> ${maxPoints} points`);
            return normalizePathPreservingCurves(path, maxPoints);
        }
        return path;
    });
}

// Path를 시작점부터 재구성하는 함수 (곡선 보존 + 포인트 수 유지)
function reorderPathSafely(path: string, startIndex: number): string {
    try {
        const commands = parseSVGPath(path);
        console.log("Original path:", path);
        console.log("Commands:", commands);
        console.log("Start index:", startIndex);

        if (startIndex <= 0 || startIndex >= commands.length) {
            console.log("Start index out of of range, returning original path");
            return path;
        }

        // 명령어와 해당하는 끝점들의 매핑 생성 (원본 명령어 보존)
        const commandEndPoints: Array<{ x: number; y: number; commandIndex: number; command: string }> = [];
        let currentX = 0,
            currentY = 0;

        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            const cmdType = cmd[0];
            const params = cmd.substring(1).trim();
            const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
            const isAbsolute = cmdType === cmdType.toUpperCase();

            switch (cmdType.toUpperCase()) {
                case "M":
                case "L":
                    if (numbers.length >= 2) {
                        const x = parseFloat(numbers[0] || "0");
                        const y = parseFloat(numbers[1] || "0");
                        if (isAbsolute) {
                            currentX = x;
                            currentY = y;
                        } else {
                            currentX += x;
                            currentY += y;
                        }
                        commandEndPoints.push({ x: currentX, y: currentY, commandIndex: i, command: cmd });
                    }
                    break;
                case "H":
                    if (numbers.length >= 1) {
                        const x = parseFloat(numbers[0] || "0");
                        if (isAbsolute) {
                            currentX = x;
                        } else {
                            currentX += x;
                        }
                        commandEndPoints.push({ x: currentX, y: currentY, commandIndex: i, command: cmd });
                    }
                    break;
                case "V":
                    if (numbers.length >= 1) {
                        const y = parseFloat(numbers[0] || "0");
                        if (isAbsolute) {
                            currentY = y;
                        } else {
                            currentY += y;
                        }
                        commandEndPoints.push({ x: currentX, y: currentY, commandIndex: i, command: cmd });
                    }
                    break;
                case "C":
                    if (numbers.length >= 6) {
                        const x = parseFloat(numbers[4] || "0");
                        const y = parseFloat(numbers[5] || "0");
                        if (isAbsolute) {
                            currentX = x;
                            currentY = y;
                        } else {
                            currentX += x;
                            currentY += y;
                        }
                        commandEndPoints.push({ x: currentX, y: currentY, commandIndex: i, command: cmd });
                    }
                    break;
                case "Q":
                    if (numbers.length >= 4) {
                        const x = parseFloat(numbers[2] || "0");
                        const y = parseFloat(numbers[3] || "0");
                        if (isAbsolute) {
                            currentX = x;
                            currentY = y;
                        } else {
                            currentX += x;
                            currentY += y;
                        }
                        commandEndPoints.push({ x: currentX, y: currentY, commandIndex: i, command: cmd });
                    }
                    break;
                case "S":
                    if (numbers.length >= 4) {
                        const x = parseFloat(numbers[2] || "0");
                        const y = parseFloat(numbers[3] || "0");
                        if (isAbsolute) {
                            currentX = x;
                            currentY = y;
                        } else {
                            currentX += x;
                            currentY += y;
                        }
                        commandEndPoints.push({ x: currentX, y: currentY, commandIndex: i, command: cmd });
                    }
                    break;
                case "T":
                    if (numbers.length >= 2) {
                        const x = parseFloat(numbers[0] || "0");
                        const y = parseFloat(numbers[1] || "0");
                        if (isAbsolute) {
                            currentX = x;
                            currentY = y;
                        } else {
                            currentX += x;
                            currentY += y;
                        }
                        commandEndPoints.push({ x: currentX, y: currentY, commandIndex: i, command: cmd });
                    }
                    break;
            }
        }

        console.log("Command end points:", commandEndPoints);

        if (startIndex >= commandEndPoints.length) {
            return path;
        }

        const hasZ = commands.some((cmd) => cmd[0].toUpperCase() === "Z");

        // 재정렬된 명령어 생성 (곡선 완전 보존 + 시작점 곡선도 보존)
        const reorderedCommands = [];

        // 새로운 시작점 설정 (항상 M 명령어로)
        const newStartPoint = commandEndPoints[startIndex];
        const startCommand = commandEndPoints[startIndex].command;
        const startCommandType = startCommand[0];

        reorderedCommands.push(`M ${newStartPoint.x} ${newStartPoint.y}`);

        // 시작점 이후 명령어들을 원본 그대로 추가 (단, M->L 변환)
        for (let i = startIndex + 1; i < commandEndPoints.length; i++) {
            const cmdInfo = commandEndPoints[i];
            const originalCmd = cmdInfo.command;
            const cmdType = originalCmd[0];

            if (cmdType.toUpperCase() === "M") {
                // M 명령어는 L로 변경
                const params = originalCmd.substring(1).trim();
                const isAbsolute = cmdType === "M";
                reorderedCommands.push(isAbsolute ? `L${params}` : `l${params}`);
            } else {
                // 다른 명령어들은 그대로 유지 (곡선 완전 보존)
                reorderedCommands.push(originalCmd);
            }
        }

        // 시작점 이전 명령어들을 원본 그대로 추가 (단, M->L 변환)
        // 시작점이 곡선이 아닌 경우에만 startIndex 포함, 곡선인 경우는 완전히 건너뛰고 마지막에 추가
        const isStartCurve =
            startCommandType.toUpperCase() !== "M" &&
            startCommandType.toUpperCase() !== "L" &&
            startCommandType.toUpperCase() !== "H" &&
            startCommandType.toUpperCase() !== "V";

        for (let i = 0; i < startIndex; i++) {
            const cmdInfo = commandEndPoints[i];
            const originalCmd = cmdInfo.command;
            const cmdType = originalCmd[0];

            if (cmdType.toUpperCase() === "M") {
                // M 명령어는 L로 변경
                const params = originalCmd.substring(1).trim();
                const isAbsolute = cmdType === "M";
                reorderedCommands.push(isAbsolute ? `L${params}` : `l${params}`);
            } else {
                // 다른 명령어들은 그대로 유지 (곡선 완전 보존)
                reorderedCommands.push(originalCmd);
            }
        }

        // 시작점이 곡선이 아닌 경우(M, L, H, V)에는 마지막에 해당 명령어 추가 (L로 변환)
        if (!isStartCurve) {
            if (startCommandType.toUpperCase() === "M") {
                const params = startCommand.substring(1).trim();
                const isAbsolute = startCommandType === "M";
                reorderedCommands.push(isAbsolute ? `L${params}` : `l${params}`);
            } else {
                reorderedCommands.push(startCommand);
            }
        }

        // 시작점이 곡선 명령어였다면, 그 곡선을 마지막에 추가하여 완전한 형태 유지
        // 위에서 이미 isStartCurve 조건으로 중복 처리되었으므로 이 부분은 제거하거나 간소화
        if (isStartCurve) {
            // 곡선 명령어(C, Q, S, T)를 마지막에 추가 - 기존 위치에서는 이미 제거됨
            reorderedCommands.push(startCommand);
        }

        // Z 명령어가 있었다면 추가
        if (hasZ) {
            reorderedCommands.push("Z");
        }

        // 최적화: 중복되는 연속된 점들과 불필요한 명령어 제거
        const optimizedCommands = optimizePathCommands(reorderedCommands);

        const result = optimizedCommands.join(" ");
        console.log("Final reordered path:", result);
        return result;
    } catch (error) {
        console.warn("Path reordering failed:", error);
        return path;
    }
}

// SVG path 명령어 파싱 (곡선 정보 포함)
function parsePathCommands(path: string) {
    const commands = [];
    const commandRegex = /([MmLlHhVvCcSsQqTtAaZz])((?:\s*[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)\s*,?\s*)*)/g;
    let match;

    while ((match = commandRegex.exec(path)) !== null) {
        const [, command, params] = match;
        const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
        commands.push({
            command: command,
            params: numbers.map(Number),
        });
    }

    return commands;
}

// GSAP 기반 SVG path 보간 함수 (곡선 지원)
function interpolatePaths(path1: string, path2: string, t: number): string {
    try {
        const commands1 = parsePathCommands(path1);
        const commands2 = parsePathCommands(path2);

        // 명령어 수가 다르면 보간할 수 없음
        if (commands1.length !== commands2.length) {
            return t < 0.5 ? path1 : path2;
        }

        // GSAP의 부드러운 보간을 사용
        const easedT = gsap.parseEase("power2.inOut")(t);

        let result = "";
        let currentX = 0,
            currentY = 0;

        for (let i = 0; i < commands1.length; i++) {
            const cmd1 = commands1[i];
            const cmd2 = commands2[i];

            // 명령어 타입이 다르면 보간할 수 없음
            if (cmd1.command !== cmd2.command) {
                return t < 0.5 ? path1 : path2;
            }

            // 파라미터 수가 다르면 보간할 수 없음
            if (cmd1.params.length !== cmd2.params.length) {
                return t < 0.5 ? path1 : path2;
            }

            // 명령어 추가
            result += cmd1.command;

            // 각 파라미터를 보간
            const interpolatedParams = cmd1.params.map((param1, j) => {
                const param2 = cmd2.params[j];
                return gsap.utils.interpolate(param1, param2, easedT);
            });

            // 파라미터 추가
            if (interpolatedParams.length > 0) {
                result += " " + interpolatedParams.map((p) => p.toFixed(3)).join(" ");
            }

            // 현재 위치 업데이트 (절대 좌표 기준)
            const command = cmd1.command.toUpperCase();
            const isRelative = cmd1.command !== cmd1.command.toUpperCase();

            switch (command) {
                case "M":
                case "L":
                    if (interpolatedParams.length >= 2) {
                        if (isRelative) {
                            currentX += interpolatedParams[0];
                            currentY += interpolatedParams[1];
                        } else {
                            currentX = interpolatedParams[0];
                            currentY = interpolatedParams[1];
                        }
                    }
                    break;
                case "C":
                    if (interpolatedParams.length >= 6) {
                        if (isRelative) {
                            currentX += interpolatedParams[4];
                            currentY += interpolatedParams[5];
                        } else {
                            currentX = interpolatedParams[4];
                            currentY = interpolatedParams[5];
                        }
                    }
                    break;
                case "Q":
                    if (interpolatedParams.length >= 4) {
                        if (isRelative) {
                            currentX += interpolatedParams[2];
                            currentY += interpolatedParams[3];
                        } else {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            currentX = interpolatedParams[2];
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            currentY = interpolatedParams[3];
                        }
                    }
                    break;
            }

            result += " ";
        }

        return result.trim();
    } catch (error) {
        console.warn("Path interpolation failed:", error);
        return t < 0.5 ? path1 : path2;
    }
}

export default function Home() {
    const [paths, setPaths] = useState<string[]>([
        "M184 0C185.202 0 186.373 0.133369 187.5 0.384766C191.634 0.129837 195.802 0 200 0C310.457 0 400 89.5431 400 200C400 310.457 310.457 400 200 400C195.802 400 191.634 399.869 187.5 399.614C186.373 399.866 185.202 400 184 400H16C7.16344 400 0 392.837 0 384V16C4.63895e-06 7.16345 7.16345 0 16 0H184Z",
    ]);
    const [pathHistory, setPathHistory] = useState<string[][]>([
        [
            "M184 0C185.202 0 186.373 0.133369 187.5 0.384766C191.634 0.129837 195.802 0 200 0C310.457 0 400 89.5431 400 200C400 310.457 310.457 400 200 400C195.802 400 191.634 399.869 187.5 399.614C186.373 399.866 185.202 400 184 400H16C7.16344 400 0 392.837 0 384V16C4.63895e-06 7.16345 7.16345 0 16 0H184Z",
        ],
    ]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isNormalized, setIsNormalized] = useState(false); // 정규화 상태 추적
    const [t, setT] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(2);
    const [previewIndex, setPreviewIndex] = useState<number | null>(0);
    const [morphingFromIndex, setMorphingFromIndex] = useState<number>(0);
    const [morphingToIndex, setMorphingToIndex] = useState<number>(1);
    const [isAnimationMode, setIsAnimationMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    const currentPath = previewIndex != null ? paths[previewIndex] : "";

    // Morphing을 위한 계산된 Path
    const morphingPath = useMemo(() => {
        if (paths.length >= 2 && morphingFromIndex < paths.length && morphingToIndex < paths.length) {
            return interpolatePaths(paths[morphingFromIndex], paths[morphingToIndex], t);
        }
        return "";
    }, [paths, morphingFromIndex, morphingToIndex, t]);

    // 히스토리에 현재 상태 저장
    const saveToHistory = useCallback(
        (newPaths: string[]) => {
            if (!Array.isArray(newPaths)) {
                console.warn("saveToHistory: newPaths is not an array", newPaths);
                return;
            }

            const newHistory = pathHistory.slice(0, historyIndex + 1);
            newHistory.push([...newPaths]);
            setPathHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        },
        [pathHistory, historyIndex]
    );

    // 되돌리기
    const undo = useCallback(() => {
        if (historyIndex > 0 && pathHistory.length > 0) {
            const newIndex = historyIndex - 1;
            const targetHistory = pathHistory[newIndex];
            if (targetHistory && Array.isArray(targetHistory)) {
                setHistoryIndex(newIndex);
                setPaths([...targetHistory]);
                setIsNormalized(false); // undo시 정규화 상태 해제
            }
        }
    }, [historyIndex, pathHistory]);

    // 다시 실행
    const redo = useCallback(() => {
        if (historyIndex < pathHistory.length - 1 && pathHistory.length > 0) {
            const newIndex = historyIndex + 1;
            const targetHistory = pathHistory[newIndex];
            if (targetHistory && Array.isArray(targetHistory)) {
                setHistoryIndex(newIndex);
                setPaths([...targetHistory]);
                setIsNormalized(false); // redo시 정규화 상태 해제
            }
        }
    }, [historyIndex, pathHistory]);

    // Ctrl+Z 단축키 처리
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "z") {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [historyIndex, pathHistory, redo, undo]);

    const updatePath = (index: number, value: string) => {
        const newPaths = [...paths];
        newPaths[index] = value;
        setPaths(newPaths);
        saveToHistory(newPaths);
        setIsNormalized(false); // Path 수정시 정규화 상태 해제
    };

    const addNewPath = () => {
        const newPaths = [...paths, ""];
        setPaths(newPaths);
        saveToHistory(newPaths);
        setIsNormalized(false); // 새 Path 추가시 정규화 상태 해제
        toast.success("새 Path가 추가되었습니다");
    };

    const removePath = (index: number) => {
        if (paths.length > 1) {
            const newPaths = paths.filter((_, i) => i !== index);
            setPaths(newPaths);
            saveToHistory(newPaths);
            setIsNormalized(false); // Path 삭제시 정규화 상태 해제
            toast.success(`#${index} Path가 삭제되었습니다`);
        }
    };

    const createMorphingTimeline = useCallback(() => {
        if (timelineRef.current) {
            timelineRef.current.kill();
        }

        timelineRef.current = gsap.timeline({
            repeat: -1,
            ease: "power2.inOut",
            onUpdate: () => {
                const progress = timelineRef.current?.progress() || 0;
                setT(progress);
            },
        });

        timelineRef.current.to(
            { value: 1 },
            {
                duration: 2 / animationSpeed,
                ease: "power2.inOut",
            }
        );
    }, [animationSpeed]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === "image/svg+xml") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const extractedPaths = extractPathsFromSVG(content);
                if (extractedPaths.length > 0) {
                    // 기존 Path들에 새로운 Path들을 추가
                    const newPaths = [...paths, ...extractedPaths];
                    setPaths(newPaths);
                    saveToHistory(newPaths);
                    setIsNormalized(false); // 파일 업로드시 정규화 상태 해제
                    toast.success(`SVG 파일에서 ${extractedPaths.length}개의 Path를 추가했습니다`);
                } else {
                    toast.error("SVG 파일에 Path가 없습니다");
                }
            };
            reader.readAsText(file);
        } else {
            toast.error("유효한 SVG 파일을 선택해주세요.");
        }
    };

    const toggleAnimation = () => {
        if (isAnimating) {
            setIsAnimating(false);
            if (timelineRef.current) {
                timelineRef.current.pause();
            }
        } else {
            setIsAnimating(true);
            // GSAP timeline 생성 및 시작
            if (timelineRef.current) {
                timelineRef.current.resume();
            } else {
                createMorphingTimeline();
            }
        }
    };

    const resetAnimation = () => {
        setT(0);
        setIsAnimating(false);
        if (timelineRef.current) {
            timelineRef.current.pause();
            timelineRef.current.progress(0);
        }
    };

    // GSAP timeline 업데이트 및 클린업
    useEffect(() => {
        if (isAnimating && !timelineRef.current) {
            createMorphingTimeline();
        } else if (timelineRef.current) {
            // 애니메이션 속도 변경 시 timeline duration 업데이트
            timelineRef.current.duration(2 / animationSpeed);
        }

        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
                timelineRef.current = null;
            }
        };
    }, [isAnimating, animationSpeed, createMorphingTimeline]);

    // 앵커 수정
    const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [currentStartIndex, setCurrentStartIndex] = useState<number>(0);

    // 드래그 기능
    const [isDragging, setIsDragging] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (currentPath && currentPath.trim()) {
            const points = getAnchorPoints(currentPath);
            setAnchorPoints(points);
            setCurrentStartIndex(0); // 기본값은 0 (M 명령어 기준)
        } else {
            setAnchorPoints([]);
        }
    }, [currentPath]);

    // 전역 마우스 이벤트 처리
    useEffect(() => {
        if (!isMouseDown && !isDragging) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!svgRef.current || dragIndex === null || previewIndex === null) return;

            const mousePos = getMousePositionFromEvent(e);

            // 마우스가 눌린 상태에서 일정 거리 이상 이동하면 드래그 시작
            if (isMouseDown && !isDragging && mouseDownPos) {
                const distance = Math.sqrt(
                    Math.pow(mousePos.x - mouseDownPos.x, 2) + Math.pow(mousePos.y - mouseDownPos.y, 2)
                );

                // 3픽셀 이상 이동하면 드래그 시작
                if (distance > 3) {
                    setIsDragging(true);
                    setIsMouseDown(false);
                }
            }

            // 드래그 중일 때 포인트 위치 업데이트
            if (isDragging) {
                const newX = mousePos.x - dragOffset.x;
                const newY = mousePos.y - dragOffset.y;

                const updatedPath = updatePointPosition(currentPath, dragIndex, newX, newY);
                const newPaths = [...paths];
                newPaths[previewIndex] = updatedPath;
                setPaths(newPaths);
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDragging && previewIndex !== null) {
                // 드래그가 끝났을 때만 히스토리에 저장
                saveToHistory(paths);
            }

            // 모든 상태 초기화
            setIsDragging(false);
            setIsMouseDown(false);
            setDragIndex(null);
            setMouseDownPos(null);
            setDragOffset({ x: 0, y: 0 });
        };

        document.addEventListener("mousemove", handleGlobalMouseMove);
        document.addEventListener("mouseup", handleGlobalMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleGlobalMouseMove);
            document.removeEventListener("mouseup", handleGlobalMouseUp);
        };
    }, [isMouseDown, isDragging, dragIndex, dragOffset, mouseDownPos, currentPath, previewIndex, paths, saveToHistory]);

    // svg viewbox 반응형
    function getPathBBox(pathD: string): { minX: number; minY: number; maxX: number; maxY: number } {
        try {
            // 문자열 기반으로 Path의 경계 상자 계산
            const commands = parseSVGPath(pathD);
            const points: Array<{ x: number; y: number }> = [];

            let currentX = 0;
            let currentY = 0;

            for (const cmd of commands) {
                const commandType = cmd[0];
                const params = cmd.substring(1).trim();

                // 숫자들을 추출
                const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];

                switch (commandType.toUpperCase()) {
                    case "M":
                    case "L":
                        if (numbers.length >= 2) {
                            const x = parseFloat(numbers[0] || "0");
                            const y = parseFloat(numbers[1] || "0");
                            if (commandType === commandType.toUpperCase()) {
                                // 절대 좌표
                                currentX = x;
                                currentY = y;
                            } else {
                                // 상대 좌표
                                currentX += x;
                                currentY += y;
                            }
                            points.push({ x: currentX, y: currentY });
                        }
                        break;
                    case "H":
                        if (numbers.length >= 1) {
                            const x = parseFloat(numbers[0] || "0");
                            if (commandType === "H") {
                                currentX = x;
                            } else {
                                currentX += x;
                            }
                            points.push({ x: currentX, y: currentY });
                        }
                        break;
                    case "V":
                        if (numbers.length >= 1) {
                            const y = parseFloat(numbers[0] || "0");
                            if (commandType === "V") {
                                currentY = y;
                            } else {
                                currentY += y;
                            }
                            points.push({ x: currentX, y: currentY });
                        }
                        break;
                    case "C":
                        if (numbers.length >= 6) {
                            // 제어점들도 경계 상자에 포함
                            const x1 = parseFloat(numbers[0] || "0");
                            const y1 = parseFloat(numbers[1] || "0");
                            const x2 = parseFloat(numbers[2] || "0");
                            const y2 = parseFloat(numbers[3] || "0");
                            const x = parseFloat(numbers[4] || "0");
                            const y = parseFloat(numbers[5] || "0");

                            if (commandType === "C") {
                                // 절대 좌표
                                points.push({ x: x1, y: y1 });
                                points.push({ x: x2, y: y2 });
                                currentX = x;
                                currentY = y;
                            } else {
                                // 상대 좌표
                                points.push({ x: currentX + x1, y: currentY + y1 });
                                points.push({ x: currentX + x2, y: currentY + y2 });
                                currentX += x;
                                currentY += y;
                            }
                            points.push({ x: currentX, y: currentY });
                        }
                        break;
                    case "Q":
                        if (numbers.length >= 4) {
                            const x1 = parseFloat(numbers[0] || "0");
                            const y1 = parseFloat(numbers[1] || "0");
                            const x = parseFloat(numbers[2] || "0");
                            const y = parseFloat(numbers[3] || "0");

                            if (commandType === "Q") {
                                points.push({ x: x1, y: y1 });
                                currentX = x;
                                currentY = y;
                            } else {
                                points.push({ x: currentX + x1, y: currentY + y1 });
                                currentX += x;
                                currentY += y;
                            }
                            points.push({ x: currentX, y: currentY });
                        }
                        break;
                }
            }

            if (points.length === 0) {
                return { minX: 0, minY: 0, maxX: 400, maxY: 400 };
            }

            const xs = points.map((p) => p.x);
            const ys = points.map((p) => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            return { minX, minY, maxX, maxY };
        } catch (error) {
            console.warn("Failed to calculate path bounding box:", error);
            return { minX: 0, minY: 0, maxX: 400, maxY: 400 };
        }
    }
    const [viewBox, setViewBox] = useState("0 0 400 400");
    useEffect(() => {
        if (currentPath) {
            const { minX, minY, maxX, maxY } = getPathBBox(currentPath);
            const padding = 20; // 여유 공간
            const x = minX - padding;
            const y = minY - padding;
            const w = maxX - minX + padding * 2;
            const h = maxY - minY + padding * 2;
            setViewBox(`${x} ${y} ${w} ${h}`);

            const points = getAnchorPoints(currentPath);
            setAnchorPoints(points);
            setCurrentStartIndex(0);
        }
    }, [currentPath]);

    // 포인트 위치를 업데이트하는 함수
    const updatePointPosition = (path: string, pointIndex: number, newX: number, newY: number): string => {
        try {
            const commands = parseSVGPath(path);
            const newCommands = [...commands];
            let pointCounter = 0;
            let currentX = 0;
            let currentY = 0;

            for (let i = 0; i < commands.length; i++) {
                const cmd = commands[i];
                const cmdType = cmd[0];
                const params = cmd.substring(1).trim();
                const numbers = params.match(/[-+]?(?:\d*\.?\d+(?:[eE][-+]?\d+)?)/g) || [];
                const isAbsolute = cmdType === cmdType.toUpperCase();

                switch (cmdType.toUpperCase()) {
                    case "M":
                        if (pointCounter === pointIndex) {
                            if (isAbsolute) {
                                newCommands[i] = `M ${newX.toFixed(3)} ${newY.toFixed(3)}`;
                            } else {
                                const dx = newX - currentX;
                                const dy = newY - currentY;
                                newCommands[i] = `m ${dx.toFixed(3)} ${dy.toFixed(3)}`;
                            }
                            return newCommands.join(" ");
                        }
                        if (numbers.length >= 2) {
                            const x = parseFloat(numbers[0] || "0");
                            const y = parseFloat(numbers[1] || "0");
                            currentX = isAbsolute ? x : currentX + x;
                            currentY = isAbsolute ? y : currentY + y;
                        }
                        pointCounter++;
                        break;

                    case "L":
                        if (pointCounter === pointIndex) {
                            if (isAbsolute) {
                                newCommands[i] = `L ${newX.toFixed(3)} ${newY.toFixed(3)}`;
                            } else {
                                const dx = newX - currentX;
                                const dy = newY - currentY;
                                newCommands[i] = `l ${dx.toFixed(3)} ${dy.toFixed(3)}`;
                            }
                            return newCommands.join(" ");
                        }
                        if (numbers.length >= 2) {
                            const x = parseFloat(numbers[0] || "0");
                            const y = parseFloat(numbers[1] || "0");
                            currentX = isAbsolute ? x : currentX + x;
                            currentY = isAbsolute ? y : currentY + y;
                        }
                        pointCounter++;
                        break;

                    case "H":
                        if (pointCounter === pointIndex) {
                            if (isAbsolute) {
                                newCommands[i] = `L ${newX.toFixed(3)} ${newY.toFixed(3)}`;
                            } else {
                                const dx = newX - currentX;
                                const dy = newY - currentY;
                                newCommands[i] = `l ${dx.toFixed(3)} ${dy.toFixed(3)}`;
                            }
                            return newCommands.join(" ");
                        }
                        if (numbers.length >= 1) {
                            const x = parseFloat(numbers[0] || "0");
                            currentX = isAbsolute ? x : currentX + x;
                        }
                        pointCounter++;
                        break;

                    case "V":
                        if (pointCounter === pointIndex) {
                            if (isAbsolute) {
                                newCommands[i] = `L ${newX.toFixed(3)} ${newY.toFixed(3)}`;
                            } else {
                                const dx = newX - currentX;
                                const dy = newY - currentY;
                                newCommands[i] = `l ${dx.toFixed(3)} ${dy.toFixed(3)}`;
                            }
                            return newCommands.join(" ");
                        }
                        if (numbers.length >= 1) {
                            const y = parseFloat(numbers[0] || "0");
                            currentY = isAbsolute ? y : currentY + y;
                        }
                        pointCounter++;
                        break;

                    case "C":
                        if (pointCounter === pointIndex) {
                            if (isAbsolute) {
                                if (numbers.length >= 6) {
                                    const x1 = numbers[0];
                                    const y1 = numbers[1];
                                    const x2 = numbers[2];
                                    const y2 = numbers[3];
                                    newCommands[i] = `C ${x1} ${y1} ${x2} ${y2} ${newX.toFixed(3)} ${newY.toFixed(3)}`;
                                }
                            } else {
                                if (numbers.length >= 6) {
                                    const dx1 = parseFloat(numbers[0] || "0");
                                    const dy1 = parseFloat(numbers[1] || "0");
                                    const dx2 = parseFloat(numbers[2] || "0");
                                    const dy2 = parseFloat(numbers[3] || "0");
                                    const dx = newX - currentX;
                                    const dy = newY - currentY;
                                    newCommands[i] = `c ${dx1} ${dy1} ${dx2} ${dy2} ${dx.toFixed(3)} ${dy.toFixed(3)}`;
                                }
                            }
                            return newCommands.join(" ");
                        }
                        if (numbers.length >= 6) {
                            const x = parseFloat(numbers[4] || "0");
                            const y = parseFloat(numbers[5] || "0");
                            currentX = isAbsolute ? x : currentX + x;
                            currentY = isAbsolute ? y : currentY + y;
                        }
                        pointCounter++;
                        break;

                    case "Q":
                        if (pointCounter === pointIndex) {
                            if (isAbsolute) {
                                if (numbers.length >= 4) {
                                    const x1 = numbers[0];
                                    const y1 = numbers[1];
                                    newCommands[i] = `Q ${x1} ${y1} ${newX.toFixed(3)} ${newY.toFixed(3)}`;
                                }
                            } else {
                                if (numbers.length >= 4) {
                                    const dx1 = parseFloat(numbers[0] || "0");
                                    const dy1 = parseFloat(numbers[1] || "0");
                                    const dx = newX - currentX;
                                    const dy = newY - currentY;
                                    newCommands[i] = `q ${dx1} ${dy1} ${dx.toFixed(3)} ${dy.toFixed(3)}`;
                                }
                            }
                            return newCommands.join(" ");
                        }
                        if (numbers.length >= 4) {
                            const x = parseFloat(numbers[2] || "0");
                            const y = parseFloat(numbers[3] || "0");
                            currentX = isAbsolute ? x : currentX + x;
                            currentY = isAbsolute ? y : currentY + y;
                        }
                        pointCounter++;
                        break;

                    case "S":
                        if (pointCounter === pointIndex) {
                            if (isAbsolute) {
                                if (numbers.length >= 4) {
                                    const x2 = numbers[0];
                                    const y2 = numbers[1];
                                    newCommands[i] = `S ${x2} ${y2} ${newX.toFixed(3)} ${newY.toFixed(3)}`;
                                }
                            } else {
                                if (numbers.length >= 4) {
                                    const dx2 = parseFloat(numbers[0] || "0");
                                    const dy2 = parseFloat(numbers[1] || "0");
                                    const dx = newX - currentX;
                                    const dy = newY - currentY;
                                    newCommands[i] = `s ${dx2} ${dy2} ${dx.toFixed(3)} ${dy.toFixed(3)}`;
                                }
                            }
                            return newCommands.join(" ");
                        }
                        if (numbers.length >= 4) {
                            const x = parseFloat(numbers[2] || "0");
                            const y = parseFloat(numbers[3] || "0");
                            currentX = isAbsolute ? x : currentX + x;
                            currentY = isAbsolute ? y : currentY + y;
                        }
                        pointCounter++;
                        break;

                    case "T":
                        if (pointCounter === pointIndex) {
                            if (isAbsolute) {
                                newCommands[i] = `T ${newX.toFixed(3)} ${newY.toFixed(3)}`;
                            } else {
                                const dx = newX - currentX;
                                const dy = newY - currentY;
                                newCommands[i] = `t ${dx.toFixed(3)} ${dy.toFixed(3)}`;
                            }
                            return newCommands.join(" ");
                        }
                        if (numbers.length >= 2) {
                            const x = parseFloat(numbers[0] || "0");
                            const y = parseFloat(numbers[1] || "0");
                            currentX = isAbsolute ? x : currentX + x;
                            currentY = isAbsolute ? y : currentY + y;
                        }
                        pointCounter++;
                        break;

                    case "A":
                        if (pointCounter === pointIndex) {
                            if (isAbsolute) {
                                if (numbers.length >= 7) {
                                    const rx = numbers[0];
                                    const ry = numbers[1];
                                    const rotation = numbers[2];
                                    const largeArc = numbers[3];
                                    const sweep = numbers[4];
                                    newCommands[i] =
                                        `A ${rx} ${ry} ${rotation} ${largeArc} ${sweep} ${newX.toFixed(3)} ${newY.toFixed(3)}`;
                                }
                            } else {
                                if (numbers.length >= 7) {
                                    const rx = numbers[0];
                                    const ry = numbers[1];
                                    const rotation = numbers[2];
                                    const largeArc = numbers[3];
                                    const sweep = numbers[4];
                                    const dx = newX - currentX;
                                    const dy = newY - currentY;
                                    newCommands[i] =
                                        `a ${rx} ${ry} ${rotation} ${largeArc} ${sweep} ${dx.toFixed(3)} ${dy.toFixed(3)}`;
                                }
                            }
                            return newCommands.join(" ");
                        }
                        if (numbers.length >= 7) {
                            const x = parseFloat(numbers[5] || "0");
                            const y = parseFloat(numbers[6] || "0");
                            currentX = isAbsolute ? x : currentX + x;
                            currentY = isAbsolute ? y : currentY + y;
                        }
                        pointCounter++;
                        break;

                    default:
                        // 지원하지 않는 명령어나 Z 명령어
                        if (cmdType.toUpperCase() !== "Z") {
                            if (numbers.length >= 2) {
                                const x = parseFloat(numbers[numbers.length - 2] || "0");
                                const y = parseFloat(numbers[numbers.length - 1] || "0");
                                currentX = isAbsolute ? x : currentX + x;
                                currentY = isAbsolute ? y : currentY + y;
                            }
                        }
                        break;
                }
            }

            return path; // 포인트를 찾지 못한 경우 원본 반환
        } catch (error) {
            console.warn("Failed to update point position:", error);
            return path;
        }
    };

    const handleSetStartPoint = () => {
        if (selectedIndex !== null && currentPath && previewIndex !== null) {
            // 실제 Path 재정렬 수행
            const reorderedPath = reorderPathSafely(currentPath, selectedIndex);
            const newPaths = [...paths];
            newPaths[previewIndex] = reorderedPath;
            setPaths(newPaths);
            saveToHistory(newPaths);
            setCurrentStartIndex(0); // 재정렬 후 시작점을 0으로 리셋
            setSelectedIndex(null);
            toast.success(`시작점을 #${selectedIndex}번 앵커로 재정의했습니다`);
        }
    };

    // 드래그 이벤트 핸들러들
    const getMousePositionFromEvent = (e: { clientX: number; clientY: number }) => {
        if (!svgRef.current) return { x: 0, y: 0 };

        const rect = svgRef.current.getBoundingClientRect();
        const svgElement = svgRef.current;
        const viewBox = svgElement.viewBox.baseVal;

        const scaleX = viewBox.width / rect.width;
        const scaleY = viewBox.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX + viewBox.x,
            y: (e.clientY - rect.top) * scaleY + viewBox.y,
        };
    };

    const handleMouseDown = (e: React.MouseEvent<SVGGElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation();

        const mousePos = getMousePositionFromEvent(e);
        const point = anchorPoints[index];

        // 포인트 선택
        setSelectedIndex(index);

        // 드래그 준비 상태로 설정 (아직 드래그 시작 안함)
        setIsMouseDown(true);
        setDragIndex(index);
        setMouseDownPos(mousePos);
        setDragOffset({
            x: mousePos.x - point.x,
            y: mousePos.y - point.y,
        });
    };

    return (
        <div className="app-wrapper">
            <header className="header">
                <div className="logo-area">
                    <Image src="/SVGenius.svg" alt="SVGenius Logo" width={32} height={32} />
                    <div>
                        <h1 className="title">SVGenius</h1>
                        <p className="subtitle">Perfect SVG morphing starts here.</p>
                    </div>
                </div>
                <div>
                    <div className="sns">
                        <Tooltip content="도움말" position="bottom">
                            <a
                                href="https://www.notion.so/SVGenius-239a784e4dc28063b248d4db639a4727"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: "#a0a0a0",
                                    transition: "color 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "32px",
                                    height: "32px",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#a0a0a0")}
                            >
                                <BookAlert size={20} />
                            </a>
                        </Tooltip>
                        <Tooltip content="GitHub" position="bottom">
                            <a
                                href="https://github.com/HyeRyeongY/svgenius/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: "#a0a0a0",
                                    transition: "color 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "32px",
                                    height: "32px",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#a0a0a0")}
                            >
                                <Github size={20} />
                            </a>
                        </Tooltip>
                        {/* <Tooltip content="Notion" position="bottom">
                            <a
                                href="https://www.notion.so/SVGenius-239a784e4dc28063b248d4db639a4727"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: "#a0a0a0",
                                    transition: "color 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "32px",
                                    height: "32px",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#a0a0a0")}
                            >
                                <svg
                                    role="img"
                                    width={20}
                                    height={20}
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <title>Notion</title>
                                    <path
                                        fill="currentColor"
                                        d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"
                                    />
                                </svg>
                            </a>
                        </Tooltip> */}
                    </div>
                    <p style={{ fontSize: "1.2rem", color: "#666", marginTop: "0.5rem" }}>
                        © 2025 Yoonhr. All rights reserved.
                    </p>
                </div>
            </header>

            <main className="main">
                <section className="panel left">
                    <div className="section path-editor">
                        <div className="section-header">
                            <div className="section-title-wrap">
                                <h2 className="section-title">Path Editor</h2>
                                <span className="chip">{paths.length} Paths</span>
                            </div>
                            <Tooltip
                                content={(() => {
                                    const validPaths = paths.filter((path) => path.trim().length > 0);
                                    if (validPaths.length < 2) {
                                        return "At least 2 paths with content are required";
                                    }
                                    return "Normalize all paths to maximum point count";
                                })()}
                                position="bottom"
                            >
                                <RippleButton
                                    onClick={() => {
                                        const normalized = normalizeAllPaths(paths);
                                        setPaths(normalized);
                                        saveToHistory(normalized);
                                        setIsNormalized(true); // 정규화 완료 상태로 설정
                                        toast.success("All paths normalized to equal point counts");
                                    }}
                                    className="btn small primary"
                                    disabled={(() => {
                                        // Filter valid paths (non-empty strings)
                                        const validPaths = paths.filter((path) => path.trim().length > 0);
                                        return validPaths.length < 2;
                                    })()}
                                >
                                    Normalize Points
                                </RippleButton>
                            </Tooltip>
                        </div>

                        {paths.map((path, index) => (
                            <div key={index} className="path-group">
                                <div className="path-header">
                                    <label className="label">
                                        Path {index + 1}
                                        {(() => {
                                            // 정규화 상태를 확인하는 조건들
                                            const hasValidPath = path.trim().length > 0;
                                            const allPointCounts = paths
                                                .filter((p) => p.trim().length > 0)
                                                .map((p) => getAnchorPoints(p).length);
                                            const maxPoints = Math.max(...allPointCounts);
                                            const currentPoints = getAnchorPoints(path).length;
                                            const validPaths = paths.filter((p) => p.trim().length > 0);

                                            // 정규화됨 표시 조건:
                                            // 1. 실제로 정규화 버튼을 눌렀어야 함 (isNormalized === true)
                                            // 2. 유효한 Path가 2개 이상 있어야 함
                                            // 3. 현재 Path가 유효해야 함
                                            // 4. 현재 Path의 포인트 수가 최대값과 같아야 함
                                            const shouldShowNormalized =
                                                isNormalized &&
                                                validPaths.length > 1 &&
                                                hasValidPath &&
                                                currentPoints === maxPoints &&
                                                currentPoints > 0;

                                            return (
                                                <span className={`chip ${shouldShowNormalized ? "normalized" : ""}`}>
                                                    {currentPoints} Points{shouldShowNormalized ? " - 정규화됨" : ""}
                                                </span>
                                            );
                                        })()}
                                    </label>
                                    <div className="button-wrap" style={{ justifyContent: "flex-end" }}>
                                        {paths.length > 1 && (
                                            <Tooltip content="Delete Path" position="bottom">
                                                <RippleButton
                                                    onClick={() => removePath(index)}
                                                    className="btn danger small"
                                                >
                                                    <span>Delete</span>
                                                </RippleButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip
                                            content={previewIndex === index ? "Hide Preview" : "Show Preview"}
                                            position="bottom"
                                        >
                                            <RippleButton
                                                onClick={() => {
                                                    setPreviewIndex((prev) => (prev === index ? null : index));
                                                }}
                                                className={`btn preview-btn ${previewIndex === index ? "active" : "text"}`}
                                                style={{ padding: "4px 0" }}
                                            >
                                                <span>Preview</span>
                                                {previewIndex === index ? (
                                                    <CircleDot className="icon" size={14} />
                                                ) : (
                                                    <Circle className="icon" size={14} />
                                                )}
                                            </RippleButton>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div className="path-wrap">
                                    <div className="textarea-container">
                                        <textarea
                                            value={path}
                                            onChange={(e) => updatePath(index, e.target.value)}
                                            className="textarea"
                                            placeholder={`Enter SVG path ${index + 1}`}
                                            spellCheck={false}
                                        />
                                        <div className="copy-btn">
                                            <Tooltip content="Copy Path" position="bottom">
                                                <RippleButton
                                                    onClick={() => {
                                                        navigator.clipboard
                                                            .writeText(path)
                                                            .then(() => {
                                                                toast.success("Path copied to clipboard");
                                                            })
                                                            .catch(() => {
                                                                toast.error("Failed to copy");
                                                            });
                                                    }}
                                                    className="btn icon"
                                                    disabled={!path.trim()}
                                                    style={{
                                                        width: "2.8rem",
                                                        height: "2.8rem",
                                                        padding: "0",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Copy className="icon" size={14} />
                                                </RippleButton>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <Tooltip content="Export as SVG file" position="bottom">
                                        <RippleButton
                                            onClick={() => exportPathAsSVG(paths[index], index)}
                                            className="btn secondary export-btn"
                                            disabled={!path.trim()}
                                        >
                                            <Download className="icon" size={14} />
                                            Export
                                        </RippleButton>
                                    </Tooltip>
                                </div>
                            </div>
                        ))}
                        <RippleButton onClick={addNewPath} className="btn text">
                            <Plus className="icon" size={14} /> Add New Path
                        </RippleButton>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".svg" hidden />
                        <RippleButton onClick={() => fileInputRef.current?.click()} className="btn text">
                            <Upload className="icon" size={14} /> Import SVG File
                        </RippleButton>
                    </div>
                </section>

                <section className="panel right">
                    <div className="section preview-section">
                        <div className="section-header">
                            {/* <h2 className="section-title">미리보기</h2> */}
                            <div className="toggle-btn">
                                <Tooltip content="Switch to Point Editing Mode" position="bottom">
                                    <RippleButton
                                        className={`btn toggle ${!isAnimationMode ? "primary" : "text"}`}
                                        onClick={() => setIsAnimationMode(!isAnimationMode)}
                                    >
                                        Point Editing
                                    </RippleButton>
                                </Tooltip>
                                <Tooltip content="Switch to Animation Mode" position="bottom">
                                    <RippleButton
                                        className={`btn toggle ${!isAnimationMode ? "text" : "primary"}`}
                                        onClick={() => setIsAnimationMode(!isAnimationMode)}
                                    >
                                        Animation Test
                                    </RippleButton>
                                </Tooltip>
                            </div>
                        </div>

                        {!isAnimationMode ? (
                            <>
                                {/* Point Editing Mode */}
                                <div className="section-header">
                                    {previewIndex !== null ? (
                                        <>
                                            <div className="path-info">
                                                <div className="path-info-title">Path {previewIndex + 1}</div>
                                                <span className="chip">{anchorPoints.length} Points</span>
                                                <span className="chip">{currentPath.length} Characters</span>
                                            </div>
                                            <div className="button-wrap">
                                                <Tooltip content="Undo (Ctrl+Z)" position="bottom">
                                                    <RippleButton
                                                        onClick={undo}
                                                        disabled={historyIndex <= 0}
                                                        className={`btn secondary icon ${historyIndex <= 0 ? "disabled" : ""}`}
                                                    >
                                                        <Undo2 className="icon" size={14} />
                                                    </RippleButton>
                                                </Tooltip>
                                                <Tooltip content="Redo (Ctrl+Shift+Z)" position="bottom">
                                                    <RippleButton
                                                        onClick={redo}
                                                        disabled={historyIndex >= pathHistory.length - 1}
                                                        className={`btn secondary icon ${historyIndex >= pathHistory.length - 1 ? "disabled" : ""}`}
                                                    >
                                                        <Redo2 className="icon" size={14} />
                                                    </RippleButton>
                                                </Tooltip>
                                                <Tooltip content="Set selected point as start point" position="bottom">
                                                    <RippleButton
                                                        className="btn primary"
                                                        onClick={handleSetStartPoint}
                                                        disabled={selectedIndex === null}
                                                    >
                                                        Set Start Point
                                                    </RippleButton>
                                                </Tooltip>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="no-data">Please turn on preview</div>
                                    )}
                                </div>
                                {previewIndex !== null ? (
                                    <div className="preview-container">
                                        {currentPath.trim() ? (
                                            <>
                                                {/* Point List */}
                                                <div className="point-list">
                                                    <h3 className="point-list-title">Points</h3>
                                                    <div className="point-items">
                                                        {anchorPoints.map((pt, i) => (
                                                            <RippleButton
                                                                key={i}
                                                                className={`point-item ${i === selectedIndex ? "selected" : ""} ${
                                                                    i === currentStartIndex ? "start" : ""
                                                                }`}
                                                                onClick={() => setSelectedIndex(i)}
                                                                title={`Point ${i} (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`}
                                                            >
                                                                <span className="point-number">{i}</span>
                                                                <span className="point-coords">
                                                                    x: {pt.x.toFixed(1)}, y: {pt.y.toFixed(1)}
                                                                </span>
                                                            </RippleButton>
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* SVG 미리보기 */}
                                                {/* Point Editing Mode */}
                                                <div className="preview">
                                                    <svg
                                                        ref={svgRef}
                                                        viewBox={viewBox}
                                                        width="100%"
                                                        height="100%"
                                                        style={{ userSelect: "none" }}
                                                    >
                                                        <>
                                                            <path
                                                                d={currentPath}
                                                                fill="black"
                                                                stroke="black"
                                                                strokeWidth={2}
                                                            />
                                                            {anchorPoints.map((pt, i) => (
                                                                <g
                                                                    key={i}
                                                                    style={{
                                                                        cursor:
                                                                            isDragging && dragIndex === i
                                                                                ? "grabbing"
                                                                                : "grab",
                                                                    }}
                                                                    onMouseDown={(e) => handleMouseDown(e, i)}
                                                                >
                                                                    <circle
                                                                        cx={pt.x}
                                                                        cy={pt.y}
                                                                        r={4}
                                                                        fill={
                                                                            i === currentStartIndex ? "#FFBB00" : "#666"
                                                                        }
                                                                        stroke={
                                                                            i === selectedIndex ? "#FF4D47" : "#fff"
                                                                        }
                                                                        strokeWidth={i === selectedIndex ? 2 : 1}
                                                                    />
                                                                    <text
                                                                        x={pt.x}
                                                                        y={pt.y - 8}
                                                                        textAnchor="middle"
                                                                        fontSize="9"
                                                                        fill={
                                                                            i === selectedIndex
                                                                                ? "#FF4D47"
                                                                                : i === currentStartIndex
                                                                                  ? "#FFBB00"
                                                                                  : "#ddd"
                                                                        }
                                                                        fontWeight="bold"
                                                                        style={{ pointerEvents: "none" }}
                                                                    >
                                                                        {i}
                                                                    </text>
                                                                </g>
                                                            ))}
                                                        </>
                                                    </svg>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="preview">
                                                <svg
                                                    ref={svgRef}
                                                    viewBox={viewBox}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ userSelect: "none" }}
                                                >
                                                    <text x="200" y="200" textAnchor="middle" fill="#999" fontSize="9">
                                                        Please add a path
                                                    </text>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <>
                                {/* Animation Mode */}
                                {paths.length >= 2 && (
                                    <div className="animation-controls">
                                        <div className="wrap">
                                            <label className="label">Start Path</label>
                                            <select
                                                value={morphingFromIndex}
                                                onChange={(e) => setMorphingFromIndex(parseInt(e.target.value))}
                                                className="select"
                                            >
                                                {paths.map((_, index) => (
                                                    <option key={index} value={index}>
                                                        Path {index + 1}
                                                    </option>
                                                ))}
                                            </select>
                                            <label className="label">End Path</label>
                                            <select
                                                value={morphingToIndex}
                                                onChange={(e) => setMorphingToIndex(parseInt(e.target.value))}
                                                className="select"
                                            >
                                                {paths.map((_, index) => (
                                                    <option key={index} value={index}>
                                                        Path {index + 1}
                                                    </option>
                                                ))}
                                            </select>

                                            <div className="button-wrap">
                                                <Tooltip content={isAnimating ? "Pause" : "Play"} position="bottom">
                                                    <RippleButton
                                                        onClick={toggleAnimation}
                                                        className={"btn icon primary"}
                                                        disabled={paths.filter((p) => p.trim()).length < 2}
                                                    >
                                                        {isAnimating ? (
                                                            <>
                                                                <Pause size={16} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Play size={16} />
                                                            </>
                                                        )}
                                                    </RippleButton>
                                                </Tooltip>
                                                <Tooltip content="Stop" position="bottom">
                                                    <RippleButton
                                                        onClick={resetAnimation}
                                                        className="btn icon secondary"
                                                        disabled={paths.filter((p) => p.trim()).length < 2}
                                                    >
                                                        <Square size={16} />
                                                    </RippleButton>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <div className="wrap" style={{ margin: "1rem 0" }}>
                                            <label className="label">Animation Progress</label>
                                            <input
                                                type="range"
                                                min={0}
                                                max={1}
                                                step={0.01}
                                                value={t}
                                                onChange={(e) => setT(parseFloat(e.target.value))}
                                            />
                                            <span className="chip" style={{ width: "50px", justifyContent: "center" }}>
                                                {Math.round(t * 100)}%
                                            </span>
                                        </div>
                                        <div className="wrap" style={{ margin: "1rem 0 2rem" }}>
                                            <label className="label">Animation Speed</label>
                                            <input
                                                type="range"
                                                min={0.5}
                                                max={5}
                                                step={0.1}
                                                value={animationSpeed}
                                                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                                            />
                                            <span className="chip" style={{ width: "50px", justifyContent: "center" }}>
                                                {animationSpeed.toFixed(1)}x
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {paths.length >= 2 && morphingPath ? (
                                    <div className="preview-container">
                                        {/* SVG 미리보기 */}
                                        <div className="preview">
                                            <svg
                                                ref={svgRef}
                                                viewBox={viewBox}
                                                width="100%"
                                                height="100%"
                                                style={{ userSelect: "none" }}
                                            >
                                                <path
                                                    d={morphingPath}
                                                    fill="rgba(0,0,0,0.8)"
                                                    stroke="#ffbb00"
                                                    strokeWidth="1"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-data">At least 2 paths are required</div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
