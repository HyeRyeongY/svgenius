// src/App.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Download, Plus, Play, Pause, Square, RotateCcw, Undo2, Redo2, Minus, Target } from "lucide-react";

import Image from "next/image";

// SVG 경로를 명령어 단위로 정확히 파싱하는 함수
function parseSVGPath(path: string): string[] {
    console.log("Parsing path:", path);

    const commands: string[] = [];
    let current = "";
    let i = 0;

    while (i < path.length) {
        const char = path[i];

        // 명령어 문자인지 확인
        if (/[MmLlHhVvCcSsQqTtZz]/.test(char)) {
            // 이전 명령어가 있으면 저장
            if (current) {
                commands.push(current);
                console.log("Added command:", current);
            }
            current = char;
        } else {
            // 명령어가 아닌 문자는 현재 명령어에 추가
            current += char;
        }
        i++;
    }

    // 마지막 명령어 추가
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
        // 원본 경로를 사용하여 앵커 포인트 계산 (재정렬된 경로가 아닌)
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
    const paths = doc.querySelectorAll("path");
    return Array.from(paths).map((path) => path.getAttribute("d") || "");
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

// 경로를 시작점부터 재구성하는 함수 (곡선 보존 + 포인트 수 유지)
function reorderPathSafely(path: string, startIndex: number): string {
    try {
        const commands = parseSVGPath(path);
        console.log("Original path:", path);
        console.log("Commands:", commands);
        console.log("Start index:", startIndex);

        if (startIndex <= 0 || startIndex >= commands.length) {
            console.log("Start index out of range, returning original path");
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
        const isStartCurve = startCommandType.toUpperCase() !== "M" && startCommandType.toUpperCase() !== "L" && startCommandType.toUpperCase() !== "H" && startCommandType.toUpperCase() !== "V";

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

export default function Home() {
    const [paths, setPaths] = useState<string[]>(["M184 0C185.202 0 186.373 0.133369 187.5 0.384766C191.634 0.129837 195.802 0 200 0C310.457 0 400 89.5431 400 200C400 310.457 310.457 400 200 400C195.802 400 191.634 399.869 187.5 399.614C186.373 399.866 185.202 400 184 400H16C7.16344 400 0 392.837 0 384V16C4.63895e-06 7.16345 7.16345 0 16 0H184Z"]);
    const [pathHistory, setPathHistory] = useState<string[][]>([["M184 0C185.202 0 186.373 0.133369 187.5 0.384766C191.634 0.129837 195.802 0 200 0C310.457 0 400 89.5431 400 200C400 310.457 310.457 400 200 400C195.802 400 191.634 399.869 187.5 399.614C186.373 399.866 185.202 400 184 400H16C7.16344 400 0 392.837 0 384V16C4.63895e-06 7.16345 7.16345 0 16 0H184Z"]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [t, setT] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(2);
    const [previewIndex, setPreviewIndex] = useState<number | null>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const animationRef = useRef<number | undefined>(undefined);

    const currentPath = previewIndex != null ? paths[previewIndex] : "";

    // 히스토리에 현재 상태 저장
    const saveToHistory = (newPaths: string[]) => {
        const newHistory = pathHistory.slice(0, historyIndex + 1);
        newHistory.push([...newPaths]);
        setPathHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // 되돌리기
    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setPaths([...pathHistory[newIndex]]);
        }
    };

    // 다시 실행
    const redo = () => {
        if (historyIndex < pathHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setPaths([...pathHistory[newIndex]]);
        }
    };

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
    }, [historyIndex, pathHistory]);

    const updatePath = (index: number, value: string) => {
        const newPaths = [...paths];
        newPaths[index] = value;
        setPaths(newPaths);
        saveToHistory(newPaths);
    };

    const addNewPath = () => {
        const newPaths = [...paths, ""];
        setPaths(newPaths);
        saveToHistory(newPaths);
        toast.success("새 경로가 추가되었습니다");
    };

    const removePath = (index: number) => {
        if (paths.length > 1) {
            const newPaths = paths.filter((_, i) => i !== index);
            setPaths(newPaths);
            saveToHistory(newPaths);
            toast.success(`#${index} 경로가 삭제되었습니다`);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === "image/svg+xml") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const extractedPaths = extractPathsFromSVG(content);
                if (extractedPaths.length > 0) {
                    setPaths(extractedPaths);
                    saveToHistory(extractedPaths);
                    toast.success(`SVG 파일에서 ${extractedPaths.length}개의 경로를 가져왔습니다`);
                } else {
                    toast.error("SVG 파일에 경로가 없습니다");
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
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        } else {
            setIsAnimating(true);
        }
    };

    const resetAnimation = () => {
        setT(0);
        setIsAnimating(false);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    useEffect(() => {
        if (isAnimating) {
            const animate = () => {
                setT((prev) => {
                    const next = prev + animationSpeed / 1000;
                    return next > 1 ? 0 : next;
                });
                animationRef.current = requestAnimationFrame(animate);
            };
            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAnimating, animationSpeed]);

    // 앵커 수정
    const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [currentStartIndex, setCurrentStartIndex] = useState<number>(0);
    useEffect(() => {
        if (currentPath) {
            const points = getAnchorPoints(currentPath);
            setAnchorPoints(points);
            setCurrentStartIndex(0); // 기본값은 0 (M 명령어 기준)
        }
    }, [currentPath]);

    // svg viewbox 반응형
    function getPathBBox(pathD: string): { minX: number; minY: number; maxX: number; maxY: number } {
        try {
            // 문자열 기반으로 경로의 경계 상자 계산
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

    const handleSetStartPoint = () => {
        if (selectedIndex !== null && currentPath && previewIndex !== null) {
            // 실제 경로 재정렬 수행
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

    return (
        <div className="app-wrapper">
            <header className="header">
                <div className="logo-area">
                    <Image src="/SVGenius.svg" alt="SVGenius Logo" width={32} height={32} />
                    <h1 className="title">SVGenius</h1>
                </div>
                <p className="subtitle">Smart morphing. Genius level SVG path manipulation.</p>
            </header>

            <main className="main">
                <section className="panel left">
                    <div className="section import-section">
                        <h2 className="section-title">
                            <Upload className="icon" size={16} /> SVG 가져오기
                        </h2>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".svg" hidden />
                        <button onClick={() => fileInputRef.current?.click()} className="btn full">
                            <Upload className="icon" size={16} /> SVG 파일 선택
                        </button>
                    </div>

                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">Path 편집기</h2>
                            <span className="chip">{paths.length} paths</span>
                        </div>

                        {paths.map((path, index) => (
                            <div key={index} className="path-group">
                                <div className="path-header">
                                    <label className="label">
                                        Path {index + 1} <span className="chip">{getAnchorPoints(path).length} Points</span>
                                    </label>
                                    <div className="button-wrap">
                                        {paths.length > 1 && (
                                            <button onClick={() => removePath(index)} className="btn danger" title="경로 삭제">
                                                <Minus className="icon" size={16} />
                                                <span>삭제</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setPreviewIndex((prev) => (prev === index ? null : index));
                                            }}
                                            className={`btn preview-btn ${previewIndex === index ? "active" : "text"}`}
                                            title={previewIndex === index ? "미리보기 끄기" : "미리보기 켜기"}
                                        >
                                            {previewIndex === index ? <Play className="icon" size={16} /> : <Square className="icon" size={16} />}
                                            <span>미리보기</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="path-wrap">
                                    <textarea value={path} onChange={(e) => updatePath(index, e.target.value)} className="textarea" placeholder={`Enter SVG path ${index + 1}`} />
                                    <button onClick={() => exportPathAsSVG(paths[index], index)} className="btn secondary">
                                        <Download className="icon" size={16} />
                                        내보내기
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button onClick={addNewPath} className="btn text full">
                            <Plus className="icon" size={16} /> 새 경로 추가
                        </button>
                    </div>

                    <div className="section animation-section">
                        <h2 className="section-title">애니메이션 컨트롤</h2>
                        <div className="control-group">
                            <label className="label">
                                모핑 진행률 <span>{Math.round(t * 100)}%</span>
                            </label>
                            <input type="range" min={0} max={1} step={0.01} value={t} onChange={(e) => setT(parseFloat(e.target.value))} />
                        </div>
                        <div className="control-group">
                            <label className="label">애니메이션 속도</label>
                            <input type="range" min={0.5} max={5} step={0.1} value={animationSpeed} onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))} />
                            <span>{animationSpeed.toFixed(1)}x</span>
                        </div>
                        <div className="button-row">
                            <button onClick={toggleAnimation} className={`btn ${isAnimating ? "secondary" : "primary"}`}>
                                {isAnimating ? (
                                    <>
                                        <Pause className="icon" size={16} /> 일시정지
                                    </>
                                ) : (
                                    <>
                                        <Play className="icon" size={16} /> 재생
                                    </>
                                )}
                            </button>
                            <button onClick={resetAnimation} className="btn small">
                                <RotateCcw className="icon" size={16} />
                            </button>
                        </div>
                    </div>
                </section>

                <section className="panel right">
                    <div className="section preview-section">
                        <div className="section-header">
                            <h2 className="section-title">미리보기</h2>
                            <div className="chip-wrap">
                                <span className="chip">{anchorPoints.length} Points</span>
                                <span className="chip">{currentPath.length} Characters</span>
                            </div>
                        </div>
                        <div className="preview">
                            {/* 앵커 */}
                            <svg viewBox={viewBox} width="100%" height="100%">
                                {currentPath ? (
                                    <>
                                        <path d={currentPath} fill="black" stroke="black" strokeWidth={2} />
                                        {anchorPoints.map((pt, i) => (
                                            <g key={i} style={{ cursor: "pointer" }} onClick={() => setSelectedIndex(i)}>
                                                <circle cx={pt.x} cy={pt.y} r={4} fill={i === selectedIndex ? "#FF4D47" : i === currentStartIndex ? "#FFBB00" : "#666"} stroke="#fff" strokeWidth={1} />
                                                <text x={pt.x} y={pt.y - 8} textAnchor="middle" fontSize="10" fill={i === selectedIndex ? "#FF4D47" : i === currentStartIndex ? "#FFBB00" : "#ddd"} fontWeight="bold" style={{ pointerEvents: "none" }}>
                                                    {i}
                                                </text>
                                            </g>
                                        ))}
                                    </>
                                ) : (
                                    <text x="200" y="200" textAnchor="middle" fill="#999" fontSize="12">
                                        경로를 추가하여 미리보기
                                    </text>
                                )}
                            </svg>
                        </div>
                        <button className="btn primary" onClick={handleSetStartPoint} disabled={selectedIndex === null}>
                            <Target className="icon" size={16} />
                            시작점 설정
                        </button>
                        <div className="button-row">
                            <button onClick={undo} disabled={historyIndex <= 0} className={`btn secondary ${historyIndex <= 0 ? "disabled" : ""}`} title="되돌리기 (Ctrl+Z)">
                                <Undo2 className="icon" size={16} /> 되돌리기
                            </button>
                            <button onClick={redo} disabled={historyIndex >= pathHistory.length - 1} className={`btn secondary ${historyIndex >= pathHistory.length - 1 ? "disabled" : ""}`} title="다시실행 (Ctrl+Shift+Z)">
                                <Redo2 className="icon" size={16} /> 다시실행
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
