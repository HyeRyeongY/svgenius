"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Layers, Play, Download, Github } from "lucide-react";
import RippleButton from "../components/RippleButton";
import { LanguageProvider, useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

function LandingContent() {
    const { t } = useLanguage();

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="landing-header">
                <div className="landing-header-content">
                    <div className="landing-logo-area">
                        <div className="landing-logo-icon">
                            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h1 className="landing-logo-title">SVG Genius</h1>
                    </div>
                    <div className="landing-header-actions">
                        <LanguageToggle />
                        <a href="https://github.com/your-repo/svg-genius" target="_blank" rel="noopener noreferrer" className="landing-github-link">
                            <RippleButton className="btn secondary">
                                <Github size={16} />
                                <span className="landing-github-text">GitHub</span>
                            </RippleButton>
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <h1 className="landing-hero-title">
                        Create Stunning
                        <span className="landing-hero-highlight"> SVG Animations</span>
                    </h1>
                    
                    <p className="landing-hero-description">
                        Transform your SVG paths into smooth, professional animations with our intuitive editor. 
                        Perfect for designers, developers, and creative professionals.
                    </p>

                    <div className="landing-hero-actions">
                        <Link href="/service">
                            <RippleButton className="btn primary landing-btn-large">
                                <span>Get Started</span>
                                <ArrowRight size={20} />
                            </RippleButton>
                        </Link>
                        
                        <RippleButton className="btn secondary landing-btn-large">
                            <Play size={20} />
                            <span>Watch Demo</span>
                        </RippleButton>
                    </div>
                </div>

                {/* Preview Animation */}
                <div className="landing-preview">
                    <div className="landing-preview-container">
                        <div className="landing-preview-content">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="landing-preview-svg">
                                <path
                                    d="M50 100 Q 100 50 150 100 Q 100 150 50 100"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="landing-preview-path"
                                />
                                <circle cx="50" cy="100" r="4" fill="currentColor" className="landing-preview-point" />
                                <circle cx="150" cy="100" r="4" fill="currentColor" className="landing-preview-point landing-preview-point-delayed" />
                            </svg>
                        </div>
                        <p className="landing-preview-label">Interactive SVG Path Editor Preview</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features">
                <div className="landing-features-header">
                    <h2 className="landing-section-title">Powerful Features</h2>
                    <p className="landing-section-description">Everything you need to create professional SVG animations</p>
                </div>

                <div className="landing-features-grid">
                    <div className="landing-feature-card">
                        <div className="landing-feature-icon landing-feature-icon-purple">
                            <Zap size={32} />
                        </div>
                        <h3 className="landing-feature-title">Real-time Preview</h3>
                        <p className="landing-feature-description">See your animations come to life as you edit. Real-time preview with smooth interpolation between keyframes.</p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-icon landing-feature-icon-blue">
                            <Layers size={32} />
                        </div>
                        <h3 className="landing-feature-title">Advanced Path Editor</h3>
                        <p className="landing-feature-description">Intuitive point-by-point editing with visual feedback. Supports all SVG path commands and curves.</p>
                    </div>

                    <div className="landing-feature-card">
                        <div className="landing-feature-icon landing-feature-icon-green">
                            <Download size={32} />
                        </div>
                        <h3 className="landing-feature-title">Export & Share</h3>
                        <p className="landing-feature-description">Export your animations as SVG files or generate CSS animations. Share your creations easily.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-cta">
                <div className="landing-cta-container">
                    <h2 className="landing-cta-title">Ready to Start Creating?</h2>
                    <p className="landing-cta-description">Join thousands of designers and developers using SVG Genius</p>
                    
                    <Link href="/service">
                        <RippleButton className="btn landing-cta-btn">
                            <span>Launch Editor</span>
                            <ArrowRight size={20} />
                        </RippleButton>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-footer-content">
                    <div className="landing-footer-logo">
                        <div className="landing-logo-icon">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="landing-footer-brand">SVG Genius</span>
                    </div>
                    
                    <div className="landing-footer-copyright">
                        <p>&copy; 2024 SVG Genius. Made with ❤️ for the creative community.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="landing-wrapper">
            <LanguageProvider>
                <LandingContent />
            </LanguageProvider>
        </div>
    );
}