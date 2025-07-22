// types/svg-path-parser.d.ts
declare module "svg-path-parser" {
    export interface SVGCommand {
        code: string;
        command: string;
        x?: number;
        y?: number;
        x0?: number;
        y0?: number;
        x1?: number;
        y1?: number;
        x2?: number;
        y2?: number;
    }

    export function parseSVG(path: string): SVGCommand[];
    export function makeAbsolute(commands: SVGCommand[]): SVGCommand[];
}
