"use client";

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import RippleButton from './RippleButton';

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="language-toggle">
            <RippleButton
                onClick={() => setLanguage('en')}
                className={`btn small ${language === 'en' ? 'primary' : 'secondary'}`}
            >
                EN
            </RippleButton>
            <RippleButton
                onClick={() => setLanguage('ko')}
                className={`btn small ${language === 'ko' ? 'primary' : 'secondary'}`}
            >
                KO
            </RippleButton>
        </div>
    );
}