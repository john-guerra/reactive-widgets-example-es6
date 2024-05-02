import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import ReactiveWidget from "./ReactiveWidget.js";


function BrushableHistogram(
  data,
  {
    value = [],
    x = (d) => d[0],
    xLabel = "",
    width = 600,
    height = 300,
    marginBottom = 30,
  } = {}
) {
  // ✅ Add here the code that creates your widget
  let element = Histogram(data, { x, xLabel, width, height, marginBottom });

  // 🧰 Enhance your html element with reactive value and event handling
  let widget = ReactiveWidget(element, { value, showValue });

  // Enhance the Histogram with a brush
  function brushended(event) {
    const selection = event.selection;
    if (!event.sourceEvent || !selection) return;
    const [x0, x1] = selection.map((d) => element._xS.invert(d));
    widget.setValue([x0, x1]);
  }
  const brush = d3
    .brushX()
    .extent([
      [element._margin.left, element._margin.top],
      [
        element._width - element._margin.right,
        element._height - element._margin.bottom,
      ],
    ])
    .on("brush end", brushended);
  const gBrush = d3.select(element).append("g").call(brush);

  // 🧰 ShowValue will display the current internalValue brush position
  function showValue() {
    // ✅ Add here the code that updates the current interaction
    const [x0, x1] = widget.value;
    // Update the brush position
    gBrush.call(brush.move, x1 > x0 ? [x0, x1].map(element._xS) : null);
  }

  showValue();

  // 🧰 Finally return the html element
  return widget;
}

function Histogram(
  data,
  {
    x = (d) => d[0],
    xLabel = "",
    width = 600,
    height = 300,
    marginTop = 20,
    marginRight = 20,
    marginBottom = 20,
    marginLeft = 40,
  } = {}
) {
  // Code from https://observablehq.com/@d3/histogram/

  // Bin the data.
  const bins = d3.bin().thresholds(40).value(x)(data);

  // Declare the x (horizontal position) scale.
  const xS = d3
    .scaleLinear()
    .domain([bins[0].x0, bins[bins.length - 1].x1])
    .range([marginLeft, width - marginRight]);

  // Declare the y (vertical position) scale.
  const yS = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (d) => d.length)])
    .range([height - marginBottom, marginTop]);

  // Create the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // Add a rect for each bin.
  svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll()
    .data(bins)
    .join("rect")
    .attr("x", (d) => xS(d.x0) + 1)
    .attr("width", (d) => xS(d.x1) - xS(d.x0) - 1)
    .attr("y", (d) => yS(d.length))
    .attr("height", (d) => yS(0) - yS(d.length));

  // Add the x-axis and label.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(
      d3
        .axisBottom(xS)
        .ticks(width / 80)
        .tickSizeOuter(0)
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", width)
        .attr("y", marginBottom - 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(`${xLabel}→`)
    );

  // Add the y-axis and label, and remove the domain line.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(yS).ticks(height / 40))
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Frequency")
    );

  // Exposing intervals
  svg.node()._margin = {
    left: marginLeft,
    right: marginRight,
    bottom: marginBottom,
    top: marginTop,
  };
  svg.node()._height = height;
  svg.node()._width = width;
  svg.node()._xS = xS;
  svg.node()._bins = bins;

  return svg.node();
}

export default BrushableHistogram;