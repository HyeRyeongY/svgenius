// src/App.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Download, Plus, Zap, Play, Pause, RotateCcw, FileText } from "lucide-react";

function interpolatePaths(path1: string, path2: string, t: number): string {
    if (!path1 || !path2) return path1 || path2 || "";
    return t < 0.5 ? path1 : path2;
}

function extractPathsFromSVG(svgContent: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const paths = doc.querySelectorAll("path");
    return Array.from(paths).map((path) => path.getAttribute("d") || "");
}

function normalizePath(path: string): string {
    return path
        .trim()
        .replace(/\s+/g, " ")
        .replace(/([a-zA-Z])/g, " $1 ")
        .replace(/\s+/g, " ")
        .trim();
}

export default function App() {
    const [paths, setPaths] = useState<string[]>(["M 100 100 L 200 100 L 150 150 Z"]);
    const [t, setT] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(2);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const animationRef = useRef<number>();

    const currentPath = paths.length > 1 ? interpolatePaths(paths[0], paths[paths.length - 1], t) : paths[0] || "";

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

    const handleNormalize = () => {
        const normalizedPaths = paths.map(normalizePath);
        setPaths(normalizedPaths);
        toast.success("Paths normalized");
    };

    const handleExport = () => {
        const svg = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><path d="${currentPath}" fill="black"/></svg>`;
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `svgenius-export-${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("SVG exported successfully");
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
                        <div className="button-row">
                            <button onClick={handleNormalize} className="btn secondary">
                                <FileText className="icon" /> Normalize
                            </button>
                            <button onClick={handleExport} className="btn primary">
                                <Download className="icon" /> Export
                            </button>
                        </div>
                    </div>

                    <div className="section">
                        <div className="path-title">
                            <h2 className="section-title">Path Editor</h2>
                            <span>{paths.length} paths</span>
                        </div>
                        {paths.map((path, index) => (
                            <div key={index} className="path-group">
                                <label className="label">Path {index + 1}</label>
                                <textarea value={path} onChange={(e) => updatePath(index, e.target.value)} className="textarea" placeholder={`Enter SVG path ${index + 1}`} />
                                {paths.length > 1 && (
                                    <button onClick={() => removePath(index)} className="btn danger small">
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={addNewPath} className="btn full">
                            <Plus className="icon" /> Add Another Path
                        </button>
                    </div>

                    <div className="section">
                        <h2 className="section-title">Animation Controls</h2>
                        <div className="control-group">
                            <label className="label">Morphing Progress ({Math.round(t * 100)}%)</label>
                            <input type="range" min={0} max={1} step={0.01} value={t} onChange={(e) => setT(parseFloat(e.target.value))} />
                        </div>
                        <div className="control-group">
                            <label className="label">Animation Speed ({animationSpeed.toFixed(1)}x)</label>
                            <input type="range" min={0.5} max={5} step={0.1} value={animationSpeed} onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))} />
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
                            <svg viewBox="0 0 400 400">
                                {currentPath ? (
                                    <path d={currentPath} fill="black" stroke="black" strokeWidth="2" />
                                ) : (
                                    <text x="200" y="200" textAnchor="middle" fill="#999">
                                        Add a path to see preview
                                    </text>
                                )}
                            </svg>
                        </div>
                    </div>

                    <div className="section">
                        <h2 className="section-title">Current Path Info</h2>
                        <p>
                            Length: <strong>{currentPath.length}</strong> characters
                        </p>
                        {currentPath && <pre className="code-block">{currentPath}</pre>}
                    </div>
                </section>
            </main>
        </div>
    );
}
