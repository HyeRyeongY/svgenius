// src/utils/reorderPath.ts
import { parseSVG, makeAbsolute } from "svg-path-parser";

const isCurve = (cmd: any) => ["C", "S", "Q", "T"].includes(cmd.code);

/**
 * 곡선 구간을 깨뜨리지 않도록 안전하게 시작점을 재정렬
 */
export function reorderPathPreservingCurves(path: string, startIndex: number): string {
    let commands = makeAbsolute(parseSVG(path));
    const isClosed = commands.some((cmd) => cmd.code === "Z");

    // Z는 나중에 처리
    commands = commands.filter((cmd) => cmd.code !== "Z");

    // 유효성 검사
    if (startIndex <= 0 || startIndex >= commands.length) {
        return formatCommands(commands, isClosed);
    }

    // 곡선 앞/뒤에 걸쳐 자르려 하면 금지
    const prev = commands[startIndex - 1];
    const next = commands[startIndex];

    if (isCurve(prev) || isCurve(next)) {
        console.warn("Cannot safely reorder between curve segments.");
        return path; // 그대로 반환
    }

    // 안전하게 자르고 회전
    const rotated = [...commands.slice(startIndex), ...commands.slice(0, startIndex)];

    // 시작점은 M, 중간 M은 L로
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
