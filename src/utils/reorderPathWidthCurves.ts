// src/utils/reorderPathWithCurves.ts
import { parseSVG, makeAbsolute } from "svg-path-parser";

/**
 * 내부에서 CommonJS 모듈 안전하게 불러오기
 */
function loadSVGPathPropertiesCJS(): any {
    const mod = require("svg-path-properties");
    return mod.SVGPathProperties ?? mod.default?.SVGPathProperties;
}

/**
 * 곡선 포함 SVG Path에서 임의의 anchorIndex를 시작점으로 설정 (형태 유지)
 */
export function reorderPathPreservingShape(path: string, anchorIndex: number): string {
    const SVGPathProperties = loadSVGPathPropertiesCJS();
    if (!SVGPathProperties) {
        console.error("SVGPathProperties 불러오기 실패");
        return path;
    }

    const commands = makeAbsolute(parseSVG(path));
    const isClosed = commands.some((cmd) => cmd.code === "Z");

    // 좌표 있는 명령어만 필터링 (M, L, C, Q 등)
    const filtered = commands.filter((cmd) => "x" in cmd && "y" in cmd);
    const anchor = filtered[anchorIndex];
    if (!anchor) return path;

    const props = new SVGPathProperties(path);
    const totalLength = props.getTotalLength();

    // 선택된 anchorIndex의 비율에 해당하는 위치를 시작점으로
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
