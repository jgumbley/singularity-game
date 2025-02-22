import * as d3 from 'd3';

// --- 1. Set up SVG dimensions and background ---
const width = 600;
const height = 600;
const margin = 20;

const maxRadius = Math.min(width, height) / 2 - margin;

// Create the SVG container. We'll append it to the <body>.
const svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background-color', '#0C4C5F'); // teal/blue background

// --- 2. Define the radial parameters ---
const radialLines = 100;  // number of "spokes"
const dotsPerLine = 60;   // dots on each spoke

// We can shift the inner radius if we don't want to start at the center
const radiusScale = d3
  .scaleLinear()
  .domain([0, dotsPerLine - 1])
  .range([0, maxRadius]);

// --- 3. Prepare data ---
interface DotData {
  angle: number;
  radius: number;
}

const data: DotData[] = [];

for (let i = 0; i < radialLines; i++) {
  const angle = (2 * Math.PI * i) / radialLines; // spread angles 0..2π
  for (let j = 0; j < dotsPerLine; j++) {
    data.push({
      angle,
      radius: radiusScale(j),
    });
  }
}

// --- 4. Draw circles ---
svg
  .selectAll('circle')
  .data(data)
  .enter()
  .append('circle')
  .attr('cx', (d: DotData) => width / 2 + d.radius * Math.cos(d.angle))
  .attr('cy', (d: DotData) => height / 2 + d.radius * Math.sin(d.angle))
  .attr('r', 2)
  .attr('fill', '#FFFFFF'); // white dots