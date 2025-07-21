// src/App.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Download, Plus, Zap, Play, Pause, RotateCcw, FileText } from "lucide-react";

// import { reorderPathPreservingCurves } from "@/utils/reorderPath";
// import { reorderPathPreservingShape } from "@/utils/reorderPathWithCurves";

import { parseSVG, makeAbsolute } from "svg-path-parser";
const loadSVGPathProperties = async () => {
    const mod = await import("svg-path-properties");
    return mod.SVGPathProperties;
};
function reorderPathPreservingShape(path: string, anchorIndex: number): string {
    const mod = require("svg-path-properties");

    // 구조 안전하게 해체 (둘 다 fallback 처리)
    const SVGPathProperties = typeof mod === "function" ? mod : mod.SVGPathProperties ?? mod.default?.SVGPathProperties ?? mod.default;

    if (typeof SVGPathProperties !== "function") {
        console.error("❌ SVGPathProperties 불러오기 실패:", mod);
        return path;
    }

    const commands = makeAbsolute(parseSVG(path));
    const isClosed = commands.some((cmd) => cmd.code === "Z");

    const filtered = commands.filter((cmd) => "x" in cmd && "y" in cmd);
    const anchor = filtered[anchorIndex];
    if (!anchor) return path;

    const props = new SVGPathProperties(path); // ✅ 여기서 오류 더 이상 안 나야 함
    const totalLength = props.getTotalLength();

    const targetLength = (anchorIndex / (filtered.length - 1)) * totalLength;
    const isPathClosed = path.trim().endsWith("Z") || path.trim().endsWith("z");
    const segments = 100;

    const resampled = Array.from({ length: segments }).map((_, i) => {
        const len = (i / (segments - 1)) * totalLength;
        const pos = props.getPointAtLength((len + targetLength) % totalLength);
        return `${i === 0 ? "M" : "L"} ${pos.x} ${pos.y}`;
    });

    return isPathClosed ? `${resampled.join(" ")} Z` : resampled.join(" ");
}

export function reorderPathPreservingClosureStrict(path: string, startIndex: number): string {
    let commands = makeAbsolute(parseSVG(path));
    const isClosed = commands.some((cmd) => cmd.code === "Z");

    commands = commands.filter((cmd) => cmd.code !== "Z");

    if (startIndex <= 0 || startIndex >= commands.length) {
        return formatCommands(commands, isClosed);
    }

    const rotated = [...commands.slice(startIndex), ...commands.slice(0, startIndex)];

    // 시작점은 반드시 M, 중간 M은 L로
    rotated[0].code = "M";
    for (let i = 1; i < rotated.length; i++) {
        if (rotated[i].code === "M") rotated[i].code = "L";
    }

    return formatCommands(rotated, isClosed);
}

function formatCommands(commands: any[], isClosed: boolean): string {
    const body = commands.map(formatCommand).join(" ");
    return isClosed ? `${body} Z` : body;
}

function formatCommand(cmd: any): string {
    const { code, x, y, x1, y1, x2, y2 } = cmd;
    switch (code) {
        case "M":
        case "L":
            return `${code} ${x} ${y}`;
        case "C":
            return `${code} ${x1} ${y1} ${x2} ${y2} ${x} ${y}`;
        case "Q":
            return `${code} ${x1} ${y1} ${x} ${y}`;
        case "Z":
            return "Z";
        default:
            return "";
    }
}
type AnchorPoint = { x: number; y: number; index: number };

function getAnchorPoints(path: string): AnchorPoint[] {
    try {
        const commands = parseSVG(path);
        return commands
            .filter((cmd) => "x" in cmd && "y" in cmd)
            .map((cmd, index) => ({
                x: cmd.x!,
                y: cmd.y!,
                index,
            }));
    } catch (e) {
        return [];
    }
}

/* export */
function exportPathAsSVG(path: string, index: number) {
    const svg = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill="black"/></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `svgenius-path-${index}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported path #${index + 1}`);
}

function extractPathsFromSVG(svgContent: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const paths = doc.querySelectorAll("path");
    return Array.from(paths).map((path) => path.getAttribute("d") || "");
}

function normalizePath(path: string): string {
    try {
        const commands = makeAbsolute(parseSVG(path));
        const body = commands
            .filter((cmd) => cmd.code !== "Z")
            .map((cmd, i) => {
                if (cmd.code === "M" || cmd.code === "L") {
                    return `${i === 0 ? "M" : "L"} ${cmd.x} ${cmd.y}`;
                }
                if (cmd.code === "C") {
                    return `C ${cmd.x1} ${cmd.y1} ${cmd.x2} ${cmd.y2} ${cmd.x} ${cmd.y}`;
                }
                return "";
            })
            .join(" ");
        return path.endsWith("Z") ? `${body} Z` : body;
    } catch {
        return path;
    }
}

export default function App() {
    const [paths, setPaths] = useState<string[]>(["M 100 100 L 200 100 L 150 150 Z"]);
    const [t, setT] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(2);
    const [previewIndex, setPreviewIndex] = useState<number | null>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const animationRef = useRef<number>();

    const currentPath = previewIndex != null ? paths[previewIndex] : "";

    const updatePath = (index: number, value: string) => {
        const newPaths = [...paths];
        newPaths[index] = value;
        setPaths(newPaths);
    };

    const addNewPath = () => {
        setPaths([...paths, ""]);
        toast.success("New path added");
    };

    const removePath = (index: number) => {
        if (paths.length > 1) {
            const newPaths = paths.filter((_, i) => i !== index);
            setPaths(newPaths);
            toast.success("Path removed");
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
                    toast.success(`Imported ${extractedPaths.length} path(s) from SVG`);
                } else {
                    toast.error("No paths found in SVG file");
                }
            };
            reader.readAsText(file);
        } else {
            toast.error("Please select a valid SVG file");
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
    const handleSetStartPoint = () => {
        if (selectedIndex != null && previewIndex != null && paths[previewIndex]) {
            const newPath = reorderPathPreservingShape(paths[previewIndex], selectedIndex);
            updatePath(previewIndex, newPath);
            setCurrentStartIndex(selectedIndex);
            setSelectedIndex(null);
            toast.success(`Start point set to anchor #${selectedIndex}`);
        }
    };

    // svg viewbox 반응형
    function getPathBBox(pathD: string): { minX: number; minY: number; maxX: number; maxY: number } {
        const commands = makeAbsolute(parseSVG(pathD)).filter((cmd) => "x" in cmd && "y" in cmd);
        const xs = commands.map((c) => c.x!);
        const ys = commands.map((c) => c.y!);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        return { minX, minY, maxX, maxY };
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

    /* point 갯수 맞추기 */
    function samplePath(path: string, pointCount: number): string {
        const props = new SVGPathProperties(path);
        const totalLength = props.getTotalLength();
        const isClosed = path.trim().endsWith("Z") || path.trim().endsWith("z");

        const points = Array.from({ length: pointCount }).map((_, i) => {
            const pos = props.getPointAtLength((i / (pointCount - 1)) * totalLength);
            return `${i === 0 ? "M" : "L"} ${pos.x} ${pos.y}`;
        });

        return isClosed ? `${points.join(" ")} Z` : points.join(" ");
    }

    const handleEqualizePaths = async () => {
        try {
            const SVGPathProperties = await loadSVGPathProperties();

            function samplePath(path: string, pointCount: number): string {
                const props = new SVGPathProperties(path);
                const totalLength = props.getTotalLength();
                const isClosed = path.trim().endsWith("Z") || path.trim().endsWith("z");

                const points = Array.from({ length: pointCount }).map((_, i) => {
                    const pos = props.getPointAtLength((i / (pointCount - 1)) * totalLength);
                    return `${i === 0 ? "M" : "L"} ${pos.x} ${pos.y}`;
                });

                return isClosed ? `${points.join(" ")} Z` : points.join(" ");
            }

            function equalizeAllPaths(paths: string[]): string[] {
                const properties = paths.map((d) => new SVGPathProperties(d));
                const pointCounts = properties.map((p) => Math.max(2, Math.round(p.getTotalLength() / 5)));
                const maxCount = Math.max(...pointCounts);

                return paths.map((d) => samplePath(d, maxCount));
            }

            const newPaths = equalizeAllPaths(paths);
            setPaths(newPaths);
            toast.success("All paths equalized to same point count.");
        } catch (e) {
            toast.error("Equalization failed. Check path validity.");
        }
    };

    return (
        <div className="app-wrapper">
            <header className="header">
                <div className="logo-area">
                    <img src="/SVGenius.svg" alt="" />
                    <h1 className="title">SVGenius</h1>
                </div>
                <p className="subtitle">Smart morphing. Genius level SVG path manipulation.</p>
            </header>

            <main className="main">
                <section className="panel left">
                    <div className="section">
                        <h2 className="section-title">
                            <Upload className="icon" /> Import SVG
                        </h2>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".svg" hidden />
                        <button onClick={() => fileInputRef.current?.click()} className="btn full">
                            <Upload className="icon" /> Choose SVG File
                        </button>
                    </div>

                    <div className="section">
                        <div className="path-title">
                            <h2 className="section-title">Path Editor</h2>
                            <span>{paths.length} paths</span>
                        </div>
                        <div className="button-row">
                            <button onClick={handleEqualizePaths} className="btn secondary">
                                <FileText className="icon" /> Equalize Points
                            </button>
                        </div>
                        {paths.map((path, index) => (
                            <div key={index} className="path-group">
                                <div className="path-header">
                                    <label className="label">Path {index + 1}</label>
                                    <div className="btn-wrap">
                                        <button
                                            onClick={() => {
                                                setPreviewIndex((prev) => (prev === index ? null : index));
                                            }}
                                            className={`btn small ${previewIndex === index ? "active" : "text"}`}
                                        >
                                            {previewIndex === index ? "Preview On" : "Preview Off"}
                                        </button>
                                        {paths.length > 1 && (
                                            <button onClick={() => removePath(index)} className="btn danger small">
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="path-wrap">
                                    <textarea value={path} onChange={(e) => updatePath(index, e.target.value)} className="textarea" placeholder={`Enter SVG path ${index + 1}`} />
                                    <button onClick={() => exportPathAsSVG(paths[index], index)} className="btn primary">
                                        <Download className="icon" />
                                        Export
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button onClick={addNewPath} className="btn full">
                            <Plus className="icon" /> Add Another Path
                        </button>
                    </div>

                    <div className="section">
                        <h2 className="section-title">Animation Controls</h2>
                        <div className="control-group">
                            <label className="label">
                                Morphing Progress <span>{Math.round(t * 100)}%</span>
                            </label>
                            <input type="range" min={0} max={1} step={0.01} value={t} onChange={(e) => setT(parseFloat(e.target.value))} />
                        </div>
                        <div className="control-group">
                            <label className="label">Animation Speed</label>
                            <input type="range" min={0.5} max={5} step={0.1} value={animationSpeed} onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))} />
                            <span>{animationSpeed.toFixed(1)}x</span>
                        </div>
                        <div className="button-row">
                            <button onClick={toggleAnimation} className={`btn ${isAnimating ? "secondary" : "primary"}`}>
                                {isAnimating ? (
                                    <>
                                        <Pause className="icon" /> Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="icon" /> Play
                                    </>
                                )}
                            </button>
                            <button onClick={resetAnimation} className="btn outline">
                                <RotateCcw className="icon" />
                            </button>
                        </div>
                    </div>
                </section>

                <section className="panel right">
                    <div className="section">
                        <h2 className="section-title">Live Preview</h2>
                        <div className="preview">
                            {/* <svg viewBox="0 0 400 400">
                                {currentPath ? (
                                    <path d={currentPath} fill="black" stroke="black" strokeWidth="2" />
                                ) : (
                                    <text x="200" y="200" textAnchor="middle" fill="#999">
                                        Add a path to see preview
                                    </text>
                                )}
                            </svg> */}
                            {/* 앵커 */}
                            <svg viewBox={viewBox} width="100%" height="100%">
                                {currentPath ? (
                                    <>
                                        <path d={currentPath} fill="black" stroke="black" strokeWidth={2} />
                                        {anchorPoints.map((pt, i) => (
                                            <circle key={i} cx={pt.x} cy={pt.y} r={4} fill={i === selectedIndex ? "#FF4D47" : i === currentStartIndex ? "#FFBB00" : "#666"} stroke="#fff" strokeWidth={1} style={{ cursor: "pointer" }} onClick={() => setSelectedIndex(i)} />
                                        ))}
                                    </>
                                ) : (
                                    <text x="200" y="200" textAnchor="middle" fill="#999">
                                        Add a path to see preview
                                    </text>
                                )}
                            </svg>
                        </div>
                        <button className="btn primary" onClick={handleSetStartPoint} disabled={selectedIndex === null}>
                            Set Start Point
                        </button>
                    </div>

                    <div className="section code">
                        <h2 className="section-title">Current Path Info</h2>
                        <label className="label">
                            Length: <span>{currentPath.length} characters</span>
                        </label>
                        {currentPath && <pre className="code-block">{currentPath}</pre>}
                    </div>
                </section>
            </main>
        </div>
    );
}
