const baseColors = [
  { r: 94, g: 79, b: 162 },    // #5E4FA2
  { r: 170, g: 55, b: 236 },    // #AA37EC
  { r: 132, g: 116, b: 197 },   // #8474C5
  { r: 47, g: 155, b: 200 },   // #2F9BC8
  { r: 102, g: 194, b: 165 },  // #66C2A5
  { r: 171, g: 221, b: 164 },  // #ABDDA4
  { r: 252, g: 212, b: 103 },  // #FCD467
  { r: 253, g: 174, b: 97 },   // #FDAE61
  { r: 244, g: 109, b: 67 },   // #F46D43
  { r: 158, g: 1, b: 66 },      // #9E0142
];
    
function generateGradientColors(totalSteps) {
  const colors = [];
  const segments = baseColors.length - 1;
  const stepsPerSegment = Math.floor(totalSteps / segments);

  for (let i = 0; i < segments; i++) {
    const start = baseColors[i];
    const end = baseColors[i + 1];

    // 当前分段的步数（最后一个分段补齐剩余步数）
    const steps = (i === segments - 1)
      ? totalSteps - (stepsPerSegment * (segments - 1))
      : stepsPerSegment;

    for (let j = 0; j < steps; j++) {
      const ratio = j / steps;
      const r = Math.round(start.r + (end.r - start.r) * ratio);
      const g = Math.round(start.g + (end.g - start.g) * ratio);
      const b = Math.round(start.b + (end.b - start.b) * ratio);
      colors.push(`rgb(${r},${g},${b})`);
    }
  }
  return colors;
}

export default generateGradientColors;