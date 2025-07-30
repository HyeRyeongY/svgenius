import React, { useEffect, useCallback, useMemo } from "react";
import RippleButton from "./RippleButton";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "warning" | "danger" | "info";
    targetElement?: HTMLElement | null;
    position?: "top" | "bottom" | "left" | "right";
    alignment?: "left" | "center" | "right";
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "info",
    targetElement = null,
    position = "bottom",
    alignment = "center",
}) => {


    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDownEvent = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                event.preventDefault();
                onConfirm();
                onClose();
            } else if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDownEvent);

        return () => {
            document.removeEventListener("keydown", handleKeyDownEvent);
        };
    }, [isOpen, onConfirm, onClose]);

    // 아이콘 메모화
    const icon = useMemo(() => {
        switch (type) {
            case "warning":
                return <AlertTriangle size={24} color="#f59e0b" />;
            case "danger":
                return <AlertCircle size={24} color="#ef4444" />;
            case "info":
            default:
                return <Info size={24} color="#3b82f6" />;
        }
    }, [type]);

    // 아이콘 컨테이너 스타일 메모화
    const iconContainerStyle = useMemo(() => {
        switch (type) {
            case "warning":
                return { background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.3)" };
            case "danger":
                return { background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" };
            case "info":
            default:
                return { background: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.3)" };
        }
    }, [type]);

    // 확인 버튼 핸들러 최적화
    const handleConfirm = useCallback(() => {
        onConfirm();
        onClose();
    }, [onConfirm, onClose]);

    // 다이얼로그 위치 계산
    const dialogStyle = useMemo(() => {
        if (!targetElement) {
            return {}; // 기본 중앙 정렬
        }

        const rect = targetElement.getBoundingClientRect();
        const dialogWidth = 360; // 다이얼로그 예상 너비
        const dialogHeight = 200; // 다이얼로그 예상 높이
        const offset = 12; // 간격

        let top: number;
        let left: number;

        // 기본 위치 계산
        switch (position) {
            case "top":
                top = rect.top - dialogHeight - offset;
                break;
            case "bottom":
                top = rect.bottom + offset;
                break;
            case "left":
                top = rect.top + (rect.height - dialogHeight) / 2;
                left = rect.left - dialogWidth - offset;
                break;
            case "right":
                top = rect.top + (rect.height - dialogHeight) / 2;
                left = rect.right + offset;
                break;
            default:
                top = rect.bottom + offset;
        }

        // left/right position이 아닌 경우에만 alignment 적용
        if (position === "top" || position === "bottom" || !position) {
            switch (alignment) {
                case "left":
                    left = rect.left;
                    break;
                case "right":
                    // 버튼 너비의 절반만큼 왼쪽으로 조정
                    left = rect.right - dialogWidth + (rect.width / 2);
                    break;
                case "center":
                default:
                    left = rect.left + (rect.width - dialogWidth) / 2;
                    break;
            }
        }

        // 화면 경계 검사 및 조정
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (left < 10) left = 10;
        if (left + dialogWidth > windowWidth - 10) left = windowWidth - dialogWidth - 10;
        if (top < 10) top = 10;
        if (top + dialogHeight > windowHeight - 10) top = windowHeight - dialogHeight - 10;

        return {
            position: "fixed" as const,
            top: `${top}px`,
            left: `${left}px`,
            transform: "none",
            margin: 0,
        };
    }, [targetElement, position, alignment]);

    return (
        <div className={`confirmation-overlay ${targetElement ? "positioned" : ""}`}>
            <div className="confirmation-dialog tutorial-style" style={dialogStyle}>
                <div className="confirmation-header">
                    <button className="confirmation-close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="confirmation-content">
                    <div className="confirmation-icon" style={iconContainerStyle}>
                        {icon}
                    </div>
                    <h2 className="confirmation-title">{title}</h2>
                    <p className="confirmation-message">{message}</p>
                </div>
                <div className="confirmation-footer">
                    <div className="confirmation-actions">
                        <RippleButton onClick={onClose} className="btn text">
                            {cancelText} (ESC)
                        </RippleButton>
                        <RippleButton
                            onClick={handleConfirm}
                            className={`btn ${type === "danger" ? "danger" : "primary"}`}
                        >
                            {confirmText} (ENTER)
                        </RippleButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
