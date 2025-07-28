"use client";

import { ReactNode, useState } from "react";

interface TooltipProps {
    content: string | (() => string | ReactNode) | ReactNode;
    children: ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    delay?: number;
}

export default function Tooltip({ content, children, position = "top", delay = 300 }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsVisible(false);
    };

    const getPositionStyles = () => {
        switch (position) {
            case "top":
                return {
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginBottom: "8px",
                };
            case "bottom":
                return {
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginTop: "8px",
                };
            case "left":
                return {
                    right: "100%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginRight: "8px",
                };
            case "right":
                return {
                    left: "100%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginLeft: "8px",
                };
        }
    };

    return (
        <div
            className="tooltip-container"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ position: "relative", display: "inline-block" }}
        >
            {children}
            {isVisible && (
                <div
                    className="tooltip"
                    style={{
                        position: "absolute",
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        color: "white",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        zIndex: 1000,
                        pointerEvents: "none",
                        ...getPositionStyles(),
                    }}
                >
                    {typeof content === 'function' ? content() : content}
                </div>
            )}
        </div>
    );
}
