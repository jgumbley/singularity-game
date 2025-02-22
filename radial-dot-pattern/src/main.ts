import * as d3 from 'd3';

// Dimensions
const width = 600;
const height = 600;
const margin = 20;
const maxRadius = Math.min(width, height) / 2 - margin;

// 1. Create the SVG (just once)
const svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background-color', '#0C4C5F'); // teal/blue

// 2. Grab references to our sliders & value spans
const linesSlider     = document.getElementById('linesSlider') as HTMLInputElement;
const stepsSlider     = document.getElementById('stepsSlider') as HTMLInputElement;
const dotSizeSlider   = document.getElementById('dotSizeSlider') as HTMLInputElement;
const rMinSlider      = document.getElementById('rMinSlider') as HTMLInputElement;
const evenMaxSlider   = document.getElementById('evenMaxSlider') as HTMLInputElement;

const linesValue      = document.getElementById('linesValue') as HTMLSpanElement;
const stepsValue      = document.getElementById('stepsValue') as HTMLSpanElement;
const dotSizeValue    = document.getElementById('dotSizeValue') as HTMLSpanElement;
const rMinValue       = document.getElementById('rMinValue') as HTMLSpanElement;
const evenMaxValue    = document.getElementById('evenMaxValue') as HTMLSpanElement;

// 3. A function to draw the starburst using current slider values
function drawPattern() {
  // Read slider values
  const lines        = +linesSlider.value;       // total radial lines
  const stepsPerLine = +stepsSlider.value;       // circles per line
  const dotRadius    = +dotSizeSlider.value;     // each dot's radius
  const rMin         = +rMinSlider.value;        // inner radius
  const evenMaxPct   = +evenMaxSlider.value / 100; // fraction (0..1)

  // Update display text
  linesValue.textContent    = lines.toString();
  stepsValue.textContent    = stepsPerLine.toString();
  dotSizeValue.textContent  = dotRadius.toString();
  rMinValue.textContent     = rMin.toString();
  evenMaxValue.textContent  = (evenMaxPct * 100).toFixed(0) + '%';

  // Remove existing dots before re-drawing
  svg.selectAll('circle.dot').remove();

  // Prepare data
  const data: Array<{ angle: number; radius: number; fraction: number }> = [];
  
  /**
   * Returns a dot size based on how far along the line we are (fraction).
   *  - fraction=0  => near the center, big dot
   *  - fraction=1  => outer edge, small dot
   *  - We keep size ~3 for most of the line, then quickly drop to ~1 in the last ~20%.
   */
  function dynamicDotSize(fraction: number): number {
    if (fraction < 0.8) {
      // For the first 80% of the line, keep dots at radius 3
      return 3;
    } else {
      // For the final 20%, taper from 3 down to 1
      const localFrac = (fraction - 0.8) / 0.2; // maps [0.8..1] => [0..1]
      return 3 - 2 * localFrac; // from 3..1
    }
  }
  
  for (let i = 0; i < lines; i++) {
    // Base angle for line i
    let angle = (2 * Math.PI * i) / lines;
  
    // Slight offset for odd lines
    if (i % 2 === 1) {
      angle += Math.PI / lines;
    }
  
    // Even lines go only up to some fraction
    const evenMax = maxRadius * evenMaxPct;
    // Odd lines go to full radius
    const oddMax  = maxRadius;
  
    // Decide how far this line extends
    const lineMax = (i % 2 === 0) ? evenMax : oddMax;
  
    for (let j = 0; j < stepsPerLine; j++) {
      const fraction = j / (stepsPerLine - 1);
      const radius   = rMin + fraction * (lineMax - rMin);
      data.push({ angle, radius, fraction });
    }
  }

  // Draw dots
  svg.selectAll('circle.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => width / 2 + d.radius * Math.cos(d.angle))
    .attr('cy', d => height / 2 + d.radius * Math.sin(d.angle))
    .attr('r', d => dynamicDotSize(d.fraction)) // <--- non-linear taper
    .attr('fill', '#FFFFFF');
}

// 4. Attach "input" listeners to sliders
[ linesSlider, stepsSlider, dotSizeSlider, rMinSlider, evenMaxSlider ]
  .forEach(slider => {
    slider.addEventListener('input', drawPattern);
  });

// 5. Initial draw
drawPattern();

// 6. (Optional) Add or keep your green center circle + text if you want
// e.g. ...
// svg.append('circle')...
// svg.append('text')...