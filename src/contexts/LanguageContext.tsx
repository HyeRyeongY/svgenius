"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ko';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
    en: {
        // Header
        'header.subtitle': 'SVG Path Morphing Tool',
        'header.tutorial': 'Show Tutorial',
        
        // Path Editor
        'pathEditor.title': 'Path Editor',
        'pathEditor.paths': 'Paths',
        'pathEditor.path': 'Path',
        'pathEditor.addPath': 'Add Path',
        'pathEditor.import': 'Import',
        'pathEditor.export': 'Export',
        'pathEditor.preview': 'Preview',
        'pathEditor.hidePreview': 'Hide Preview',
        'pathEditor.copy': 'Copy',
        'pathEditor.points': 'points',
        'pathEditor.characters': 'Characters',
        'pathEditor.normalized': 'Normalized',
        'pathEditor.placeholder': 'Enter SVG path',
        
        // Animation
        'animation.title': 'Animation Test',
        'animation.from': 'From Path',
        'animation.to': 'To Path',
        'animation.startPath': 'Start Path',
        'animation.endPath': 'End Path',
        'animation.selectPath': 'Select Path',
        'animation.speed': 'Animation Speed',
        'animation.testAnimation': 'Test Animation',
        'animation.pause': 'Pause',
        'animation.stop': 'Stop',
        'animation.reverse': 'Reverse',
        'animation.play': 'Play',
        'animation.progress': 'Animation Progress',
        'animation.info': '💡 Tip: Animation automatically normalizes path points and sizes for smooth morphing. Export the optimized paths.',
        
        // Export
        'export.single': 'Export Single',
        'export.all': 'Export All',
        'export.fromPath': 'From Path',
        'export.toPath': 'To Path',
        'export.normalizedPaths': 'Export Normalized Paths',
        
        // Preview
        'preview.title': 'Preview',
        'preview.noData': 'No preview data available',
        'preview.pointList': 'Point List',
        'preview.points': 'Points',
        'preview.point': 'Point',
        'preview.setStartPoint': 'Set Start Point',
        'preview.pleaseAddPath': 'Please add a path',
        'preview.pleaseTurnOnPreview': 'Please turn on preview',
        
        // Mode Toggle
        'mode.pointEditing': 'Point Editing',
        'mode.animationTest': 'Animation Test',
        
        // Tutorial
        'tutorial.addPaths.title': 'Welcome to SVG Morphing!',
        'tutorial.addPaths.content': 'I\'ve added two demo paths for you to explore morphing animations.\nIn normal use, you would add your own SVG paths here by pasting path data or importing SVG files.',
        'tutorial.pointEditing.title': 'Point Editing Mode',
        'tutorial.pointEditing.content': 'In Point Editing mode, you can fine-tune your paths.\nSet start points and drag points to adjust positions.\nClick Preview to see your path and edit individual points.',
        'tutorial.switchMode.title': 'Switch to Animation Mode',
        'tutorial.switchMode.content': "I'll automatically switch to \"Animation Test\" mode for you.\nThis is where you can preview your morphing animations.",
        'tutorial.testAnimation.title': 'Test Your Animation',
        'tutorial.testAnimation.content': 'Select two paths from the dropdown menus and click "Test Animation" to see how they morph together.\nAdjust speed for perfect results.',
        'tutorial.exportPaths.title': 'Export Normalized Paths',
        'tutorial.exportPaths.content': 'After testing your animation, export normalized paths here.\nThese are size and point-optimized for smooth morphing in your projects.',
        'tutorial.previous': 'Previous',
        'tutorial.next': 'Next',
        'tutorial.finish': 'Finish',
        
        // Toast Messages
        'toast.pathCopied': 'Path copied to clipboard',
        'toast.allPathsNormalized': 'All paths normalized to equal point counts',
        'toast.fileImported': 'SVG file imported successfully',
        'toast.exportSuccess': 'Paths exported successfully',
        'toast.pathDeleted': 'Path deleted',
        'toast.pathExported': 'Path exported',
        'toast.noNormalizedPath': 'No normalized path available',
        'toast.noNormalizedPaths': 'No normalized paths available',
        'toast.allNormalizedExported': 'All normalized paths exported successfully',
        'toast.newPathAdded': 'New path added',
        'toast.noPathsInSvg': 'No paths found in SVG file',
        'toast.copyFailed': 'Failed to copy',
        'toast.selectValidSvg': 'Please select a valid SVG file.',
        'toast.normalizedPathExported': 'Normalized path exported successfully',
        
        // Tooltips
        'tooltip.normalizeRequired': 'At least 2 paths with content are required',
        'tooltip.normalizeAll': 'Normalize all paths to maximum point count',
        'tooltip.importSvg': 'Import SVG file',
        'tooltip.exportPath': 'Export this path',
        'tooltip.previewPath': 'Preview this path',
        'tooltip.copyPath': 'Copy path to clipboard',
        'tooltip.addNewPath': 'Add new path',
        'tooltip.exportAsSvg': 'Export as SVG file',
        'tooltip.exportNormalizedStart': 'Export normalized start path',
        'tooltip.exportNormalizedEnd': 'Export normalized end path',
        'tooltip.exportBothNormalized': 'Export both normalized paths',
        'tooltip.deletePath': 'Delete Path',
        'tooltip.switchToPointEditing': 'Switch to Point Editing Mode',
        'tooltip.switchToAnimation': 'Switch to Animation Mode',
        'tooltip.setStartPoint': 'Set selected point as start point',
        'tooltip.undo': 'Undo (Ctrl+Z)',
        'tooltip.redo': 'Redo (Ctrl+Shift+Z)',
        
        // Languages
        'language.english': 'English',
        'language.korean': '한국어',
        
        // Common
        'common.delete': 'Delete',
    },
    ko: {
        // Header
        'header.subtitle': 'SVG 패스 모핑 도구',
        'header.tutorial': '튜토리얼 보기',
        
        // Path Editor
        'pathEditor.title': '패스 에디터',
        'pathEditor.paths': '패스',
        'pathEditor.path': '패스',
        'pathEditor.addPath': '패스 추가',
        'pathEditor.import': '가져오기',
        'pathEditor.export': '내보내기',
        'pathEditor.preview': '미리보기',
        'pathEditor.hidePreview': '미리보기 숨기기',
        'pathEditor.copy': '복사',
        'pathEditor.points': '포인트',
        'pathEditor.characters': '문자',
        'pathEditor.normalized': '정규화됨',
        'pathEditor.placeholder': 'SVG 패스를 입력하세요',
        
        // Animation
        'animation.title': '애니메이션 테스트',
        'animation.from': '시작 패스',
        'animation.to': '끝 패스',
        'animation.startPath': '시작 패스',
        'animation.endPath': '끝 패스',
        'animation.selectPath': '패스 선택',
        'animation.speed': '애니메이션 속도',
        'animation.testAnimation': '애니메이션 테스트',
        'animation.pause': '일시정지',
        'animation.stop': '정지',
        'animation.reverse': '역방향',
        'animation.play': '재생',
        'animation.progress': '애니메이션 진행도',
        'animation.info': '💡 팁: 애니메이션은 부드러운 모핑을 위해 패스 포인트와 크기를 자동으로 정규화합니다. 최적화된 패스를 내보내세요.',
        
        // Export
        'export.single': '개별 내보내기',
        'export.all': '전체 내보내기',
        'export.fromPath': '시작 패스',
        'export.toPath': '끝 패스',
        'export.normalizedPaths': '정규화된 패스 내보내기',
        
        // Preview
        'preview.title': '미리보기',
        'preview.noData': '미리보기 데이터가 없습니다',
        'preview.pointList': '포인트 목록',
        'preview.points': '포인트',
        'preview.point': '포인트',
        'preview.setStartPoint': '시작점 설정',
        'preview.pleaseAddPath': '패스를 추가해주세요',
        'preview.pleaseTurnOnPreview': '미리보기를 켜주세요',
        
        // Mode Toggle
        'mode.pointEditing': '포인트 편집',
        'mode.animationTest': '애니메이션 테스트',
        
        // Tutorial
        'tutorial.addPaths.title': 'SVG 모핑에 오신 것을 환영합니다!',
        'tutorial.addPaths.content': '모핑 애니메이션을 체험할 수 있도록 두 개의 데모 패스를 준비했습니다.\n일반적으로는 여기에 패스 데이터를 붙여넣거나 SVG 파일을 가져와서 자신만의 SVG 패스를 추가하게 됩니다.',
        'tutorial.pointEditing.title': '포인트 편집 모드',
        'tutorial.pointEditing.content': '포인트 편집 모드에서는 패스를 세밀하게 조정할 수 있습니다.\n시작점을 설정하고 포인트를 드래그하여 위치를 수정하세요.\n미리보기를 클릭하여 패스를 확인하고 개별 포인트를 편집하세요.',
        'tutorial.switchMode.title': '애니메이션 모드로 전환',
        'tutorial.switchMode.content': '자동으로 "애니메이션 테스트" 모드로 전환해드리겠습니다.\n여기서 모핑 애니메이션을 미리볼 수 있습니다.',
        'tutorial.testAnimation.title': '애니메이션 테스트',
        'tutorial.testAnimation.content': '드롭다운 메뉴에서 두 개의 패스를 선택하고 "애니메이션 테스트"를 클릭하여 모핑 과정을 확인하세요.\n속도를 조정하여 완벽한 결과를 얻으세요.',
        'tutorial.exportPaths.title': '정규화된 패스 내보내기',
        'tutorial.exportPaths.content': '애니메이션 테스트 후, 여기서 정규화된 패스를 내보내세요.\n이 패스들은 프로젝트에서 부드러운 모핑을 위해 크기와 포인트가 최적화되어 있습니다.',
        'tutorial.previous': '이전',
        'tutorial.next': '다음',
        'tutorial.finish': '완료',
        
        // Toast Messages
        'toast.pathCopied': '패스가 클립보드에 복사되었습니다',
        'toast.allPathsNormalized': '모든 패스가 동일한 포인트 수로 정규화되었습니다',
        'toast.fileImported': 'SVG 파일을 성공적으로 가져왔습니다',
        'toast.exportSuccess': '패스를 성공적으로 내보냅니다',
        'toast.pathDeleted': '패스가 삭제되었습니다',
        'toast.pathExported': '패스를 내보냈습니다',
        'toast.noNormalizedPath': '정규화된 패스가 없습니다',
        'toast.noNormalizedPaths': '정규화된 패스가 없습니다',
        'toast.allNormalizedExported': '모든 정규화된 패스를 성공적으로 내보냈습니다',
        'toast.newPathAdded': '새 패스가 추가되었습니다',
        'toast.noPathsInSvg': 'SVG 파일에서 패스를 찾을 수 없습니다',
        'toast.copyFailed': '복사에 실패했습니다',
        'toast.selectValidSvg': '올바른 SVG 파일을 선택해주세요.',
        'toast.normalizedPathExported': '정규화된 패스를 성공적으로 내보냈습니다',
        
        // Tooltips
        'tooltip.normalizeRequired': '내용이 있는 패스가 최소 2개 필요합니다',
        'tooltip.normalizeAll': '모든 패스를 최대 포인트 수로 정규화',
        'tooltip.importSvg': 'SVG 파일 가져오기',
        'tooltip.exportPath': '이 패스 내보내기',
        'tooltip.previewPath': '이 패스 미리보기',
        'tooltip.copyPath': '패스를 클립보드에 복사',
        'tooltip.addNewPath': '새 패스 추가',
        'tooltip.exportAsSvg': 'SVG 파일로 내보내기',
        'tooltip.exportNormalizedStart': '정규화된 시작 패스 내보내기',
        'tooltip.exportNormalizedEnd': '정규화된 끝 패스 내보내기',
        'tooltip.exportBothNormalized': '정규화된 패스 모두 내보내기',
        'tooltip.deletePath': '패스 삭제',
        'tooltip.switchToPointEditing': '포인트 편집 모드로 전환',
        'tooltip.switchToAnimation': '애니메이션 모드로 전환',
        'tooltip.setStartPoint': '선택한 포인트를 시작점으로 설정',
        'tooltip.undo': '실행취소 (Ctrl+Z)',
        'tooltip.redo': '다시실행 (Ctrl+Shift+Z)',
        
        // Languages
        'language.english': 'English',
        'language.korean': '한국어',
        
        // Common
        'common.delete': '삭제',
    }
};

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Load language from localStorage
        const savedLanguage = localStorage.getItem('svgenius-language') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ko')) {
            setLanguageState(savedLanguage);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('svgenius-language', lang);
    };

    const t = (key: string): string => {
        return (translations[language] as any)[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}