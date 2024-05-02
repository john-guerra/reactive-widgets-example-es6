import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as Inputs from "https://cdn.jsdelivr.net/npm/@observablehq/inputs/+esm";
import { importFromObservable } from "./importFromObservable.js";

import BrushableHistogram from "./BrushableHistogram.js";

const interval = await importFromObservable(
  "@mootari/range-slider",
  "interval"
);

const data = await d3.csv("cars.csv", d3.autoType);
const xAttr = Inputs.select(Object.keys(data[0]).slice(1), { label: "xAttr" });

function redraw() {
  const histX = BrushableHistogram(data, {
    x: (d) => d[xAttr.value],
    xLabel: xAttr.value,
    value: [12, 22],
  });

  const sliderX = interval(
    d3.extent(data, (d) => d[xAttr.value]),
    { label: "X Range", value: histX.value }
  );

  histX.addEventListener("input", () => {
    sliderX.value = histX.value;
  });
  sliderX.addEventListener("input", () => {
    histX.value = sliderX.value;
  });

  document.getElementById("histX").innerHTML = "";
  document.getElementById("sliderX").innerHTML = "";
  document.getElementById("histX").appendChild(histX);
  document.getElementById("sliderX").appendChild(sliderX);
}


document.getElementById("xAttr").appendChild(xAttr);
// Everytime the xAttr changes, redraw the histogram
xAttr.addEventListener("input", redraw);
redraw();