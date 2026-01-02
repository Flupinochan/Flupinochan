import * as d3 from "d3";
import { writeFileSync } from "fs";
import { JSDOM } from "jsdom";

// Node.js環境でD3.jsを動作させるための設定
const dom = new JSDOM("<!DOCTYPE html>");
global.document = dom.window.document;

// デザイン定数
const COLORS = {
  background: "#1a1b26",
  title: "#7aa2f7",
  bar: "#BF91F3",
  barStroke: "#8b6bb0",
  axis: "#00B4AB",
  axisDomain: "#414868",
};

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  Dart: "#00B4AB",
  Python: "#FFD43B",
  "C#": "#9B4F96",
  Rust: "#f74c00",
};

const LANGUAGE_STROKE_COLORS: Record<string, string> = {
  TypeScript: "#1e4d7a",
  Dart: "#006b66",
  Python: "#b39429",
  "C#": "#5a2e5a",
  Rust: "#8f2d00",
};

const FONTS = {
  family: "sans-serif",
  sizeLegend: "14px",
  sizeTitle: "18px",
  sizePercent: "12px",
};

const SPACING = {
  borderRadius: 10,
  titleHeight: 50,
  contentPadding: 20,
  legendItemHeight: 30,
  legendIconSize: 15,
  legendIconMargin: 10,
};

const CHART = {
  innerRadiusRatio: 0.6,
  padAngle: 0.03,
  cornerRadius: 1,
  strokeWidth: 1,
  minLabelThreshold: 10,
};

const LAYOUT = {
  legendWidthRatio: 0.4,
  chartWidthRatio: 0.6,
};

const CHART_SIZE = {
  width: 400,
  height: 280,
};

export function generateChart(
  data: Record<string, number>,
  outputPath: string,
  title: string,
) {
  const width = CHART_SIZE.width;
  const height = CHART_SIZE.height;
  const contentHeight = height - SPACING.titleHeight - SPACING.contentPadding;

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  const chartData = Object.entries(data)
    .map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(1),
      color: LANGUAGE_COLORS[name] || "#666666",
      strokeColor: LANGUAGE_STROKE_COLORS[name] || "#333333",
    }))
    .sort((a, b) => b.value - a.value);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("xmlns", "http://www.w3.org/2000/svg");

  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", COLORS.background)
    .attr("rx", SPACING.borderRadius)
    .attr("ry", SPACING.borderRadius);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("fill", COLORS.title)
    .attr("text-anchor", "middle")
    .style("font-family", FONTS.family)
    .style("font-size", FONTS.sizeTitle)
    .style("font-weight", "600")
    .text(title);

  const legendWidth = width * LAYOUT.legendWidthRatio;
  const legendX = SPACING.contentPadding;
  const legendY = SPACING.titleHeight;

  const totalLegendHeight = chartData.length * SPACING.legendItemHeight;
  const legendStartY = legendY + (contentHeight - totalLegendHeight) / 2;

  const legend = svg
    .append("g")
    .attr("transform", `translate(${legendX}, ${legendStartY})`);

  chartData.forEach((d, i) => {
    const legendRow = legend
      .append("g")
      .attr("transform", `translate(0, ${i * SPACING.legendItemHeight})`);

    legendRow
      .append("rect")
      .attr("width", SPACING.legendIconSize)
      .attr("height", SPACING.legendIconSize)
      .attr("fill", d.color)
      .attr("stroke", d.strokeColor)
      .attr("stroke-width", CHART.strokeWidth)
      .attr("rx", 1)
      .attr("ry", 1);

    legendRow
      .append("text")
      .attr("x", SPACING.legendIconSize + SPACING.legendIconMargin)
      .attr("y", SPACING.legendIconSize - 2)
      .attr("fill", COLORS.axis)
      .style("font-family", FONTS.family)
      .style("font-size", FONTS.sizeLegend)
      .text(d.name);
  });

  const chartWidth = width * LAYOUT.chartWidthRatio;
  const chartCenterX = legendWidth + chartWidth / 2;
  const chartCenterY = SPACING.titleHeight + contentHeight / 2;
  const radius = Math.min(chartWidth, contentHeight) / 2 - 20;

  const g = svg
    .append("g")
    .attr("transform", `translate(${chartCenterX}, ${chartCenterY})`);

  const pie = d3
    .pie<any>()
    .value((d) => d.value)
    .sort((a, b) => b.value - a.value)
    .padAngle(CHART.padAngle);

  const arc = d3
    .arc()
    .innerRadius(radius * CHART.innerRadiusRatio)
    .outerRadius(radius)
    .cornerRadius(CHART.cornerRadius);

  g.selectAll("path")
    .data(pie(chartData))
    .enter()
    .append("path")
    .attr("d", arc as any)
    .attr("fill", (d) => d.data.color)
    .attr("stroke", (d) => d.data.strokeColor)
    .attr("stroke-width", CHART.strokeWidth);

  writeFileSync(outputPath, svg.node()!.outerHTML);
}

export function generateBarChart(
  data: Record<number, number>,
  outputPath: string,
  title: string,
) {
  const width = CHART_SIZE.width;
  const height = CHART_SIZE.height;
  const margin = { top: 60, right: 20, bottom: 50, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("xmlns", "http://www.w3.org/2000/svg");

  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", COLORS.background)
    .attr("rx", SPACING.borderRadius)
    .attr("ry", SPACING.borderRadius);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("fill", COLORS.title)
    .attr("text-anchor", "middle")
    .style("font-family", FONTS.family)
    .style("font-size", FONTS.sizeTitle)
    .style("font-weight", "600")
    .text(title);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const chartData = Object.entries(data)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => a.hour - b.hour);

  const xScale = d3
    .scaleBand()
    .domain(chartData.map((d) => d.hour.toString()))
    .range([0, chartWidth])
    .padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(chartData, (d) => d.count) || 0])
    .range([chartHeight, 0])
    .nice();

  g.selectAll("rect")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.hour.toString()) || 0)
    .attr("y", (d) => yScale(d.count))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => chartHeight - yScale(d.count))
    .attr("fill", COLORS.bar)
    .attr("stroke", COLORS.barStroke)
    .attr("stroke-width", 1)
    .attr("rx", 1)
    .attr("ry", 1);

  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(
      chartData.filter((_, i) => i % 3 === 0).map((d) => d.hour.toString()),
    );

  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(xAxis);

  xAxisGroup.select(".domain").attr("stroke", COLORS.axis);
  xAxisGroup.selectAll(".tick line").attr("stroke", COLORS.axis);
  xAxisGroup
    .selectAll(".tick text")
    .attr("fill", COLORS.axis)
    .style("font-family", FONTS.family)
    .style("font-size", "11px");

  const yAxis = d3.axisLeft(yScale).ticks(5);

  const yAxisGroup = g.append("g").call(yAxis);

  yAxisGroup.select(".domain").attr("stroke", COLORS.axis);
  yAxisGroup.selectAll(".tick line").attr("stroke", COLORS.axis);
  yAxisGroup
    .selectAll(".tick text")
    .attr("fill", COLORS.axis)
    .style("font-family", FONTS.family)
    .style("font-size", "11px");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("fill", COLORS.axis)
    .attr("text-anchor", "middle")
    .style("font-family", FONTS.family)
    .style("font-size", "12px")
    .text("JST");

  writeFileSync(outputPath, svg.node()!.outerHTML);
}
