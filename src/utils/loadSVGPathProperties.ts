// src/utils/loadSVGPathProperties.ts
export function loadSVGPathPropertiesCJS() {
    // require 사용 (Turbo는 CJS를 static으로 분석 가능)

    const { SVGPathProperties } = require("svg-path-properties");
    return SVGPathProperties;
}
