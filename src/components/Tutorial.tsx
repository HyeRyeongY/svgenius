"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import RippleButton from './RippleButton';
import { useLanguage } from '../contexts/LanguageContext';

interface TutorialStep {
    target: string; // CSS selector
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    action?: () => void; // Optional action to trigger when entering this step
}

interface TutorialProps {
    steps: TutorialStep[];
    isVisible: boolean;
    onClose: () => void;
    onStepChange?: (stepIndex: number) => void;
}

export default function Tutorial({ steps, isVisible, onClose, onStepChange }: TutorialProps) {
    const { t } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isVisible || !steps[currentStep]) return;

        setIsTransitioning(true);

        const updateStep = async () => {
            // Execute step action if it exists
            const step = steps[currentStep];
            if (step.action) {
                step.action();
            }

            // Notify parent about step change
            if (onStepChange) {
                onStepChange(currentStep);
            }

            const updateTargetPosition = () => {
                const target = document.querySelector(steps[currentStep].target);
                if (target) {
                    const rect = target.getBoundingClientRect();
                    setTargetRect(rect);
                    
                    // 스크롤해서 타겟이 보이도록 조정
                    target.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'center'
                    });
                }
            };

            // 약간의 딜레이 후 위치 업데이트와 페이드 인
            setTimeout(() => {
                updateTargetPosition();
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 50);
            }, 100);
        };

        updateStep();
        
        const updateTargetPosition = () => {
            const target = document.querySelector(steps[currentStep].target);
            if (target) {
                const rect = target.getBoundingClientRect();
                setTargetRect(rect);
            }
        };

        window.addEventListener('resize', updateTargetPosition);
        window.addEventListener('scroll', updateTargetPosition);

        return () => {
            window.removeEventListener('resize', updateTargetPosition);
            window.removeEventListener('scroll', updateTargetPosition);
        };
    }, [isVisible, currentStep, steps, onStepChange]);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getTooltipPosition = () => {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const step = steps[currentStep];
        const position = step.position || 'bottom';
        const padding = 20;
        const tooltipWidth = 320;
        const tooltipHeight = 200; // 대략적인 높이

        switch (position) {
            case 'top':
                return {
                    top: `${Math.max(padding, targetRect.top - padding)}px`,
                    left: `${Math.min(window.innerWidth - tooltipWidth - padding, Math.max(padding, targetRect.left + targetRect.width / 2))}px`,
                    transform: 'translate(-50%, -100%)'
                };
            case 'bottom':
                return {
                    top: `${Math.min(window.innerHeight - tooltipHeight - padding, targetRect.bottom + padding)}px`,
                    left: `${Math.min(window.innerWidth - tooltipWidth - padding, Math.max(padding, targetRect.left + targetRect.width / 2))}px`,
                    transform: 'translate(-50%, 0)'
                };
            case 'left':
                return {
                    top: `${Math.min(window.innerHeight - tooltipHeight - padding, Math.max(padding, targetRect.top + targetRect.height / 2))}px`,
                    left: `${Math.max(padding, targetRect.left - padding)}px`,
                    transform: 'translate(-100%, -50%)'
                };
            case 'right':
                return {
                    top: `${Math.min(window.innerHeight - tooltipHeight - padding, Math.max(padding, targetRect.top + targetRect.height / 2))}px`,
                    left: `${Math.min(window.innerWidth - tooltipWidth - padding, targetRect.right + padding)}px`,
                    transform: 'translate(0, -50%)'
                };
            default:
                return {
                    top: `${Math.min(window.innerHeight - tooltipHeight - padding, targetRect.bottom + padding)}px`,
                    left: `${Math.min(window.innerWidth - tooltipWidth - padding, Math.max(padding, targetRect.left + targetRect.width / 2))}px`,
                    transform: 'translate(-50%, 0)'
                };
        }
    };

    const getSpotlightStyle = () => {
        if (!targetRect) return {};

        const padding = 8;
        return {
            clipPath: `polygon(
                0% 0%, 
                0% 100%, 
                ${targetRect.left - padding}px 100%, 
                ${targetRect.left - padding}px ${targetRect.top - padding}px, 
                ${targetRect.right + padding}px ${targetRect.top - padding}px, 
                ${targetRect.right + padding}px ${targetRect.bottom + padding}px, 
                ${targetRect.left - padding}px ${targetRect.bottom + padding}px, 
                ${targetRect.left - padding}px 100%, 
                100% 100%, 
                100% 0%
            )`
        };
    };

    if (!isVisible) return null;

    return (
        <div className="tutorial-overlay" ref={overlayRef}>
            {/* Dim background with spotlight */}
            <div 
                className="tutorial-backdrop" 
                style={getSpotlightStyle()}
                onClick={onClose}
            />
            
            {/* Tooltip */}
            <div 
                className={`tutorial-tooltip ${isTransitioning ? 'transitioning' : ''}`}
                style={getTooltipPosition()}
            >
                <div className="tutorial-header">
                    <h3 className="tutorial-title">{steps[currentStep]?.title}</h3>
                    <button 
                        className="tutorial-close"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>
                
                <div className="tutorial-content">
                    {steps[currentStep]?.content}
                </div>
                
                <div className="tutorial-footer">
                    <div className="tutorial-progress">
                        <span>{currentStep + 1} / {steps.length}</span>
                    </div>
                    
                    <div className="tutorial-controls">
                        {currentStep > 0 && (
                            <RippleButton 
                                onClick={prevStep}
                                className="btn secondary small"
                            >
                                <ChevronLeft size={16} />
                                {t('tutorial.previous')}
                            </RippleButton>
                        )}
                        
                        <RippleButton 
                            onClick={nextStep}
                            className="btn primary small"
                        >
                            {currentStep === steps.length - 1 ? t('tutorial.finish') : t('tutorial.next')}
                            {currentStep < steps.length - 1 && <ChevronRight size={16} />}
                        </RippleButton>
                    </div>
                </div>
            </div>
        </div>
    );
}