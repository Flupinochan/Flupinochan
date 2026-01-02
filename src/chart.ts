import * as d3 from "d3";
import { writeFileSync } from "fs";
import { JSDOM } from "jsdom";

// Node.js環境でD3.jsを動作させるための設定
const dom = new JSDOM("<!DOCTYPE html>");
global.document = dom.window.document;

// デザイン定数
const COLORS = {
  background: "#0d1117",
  legendText: "#c9d1d9",
  title: "#58a6ff",
  percentText: "#ffffff",
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
  minLabelThreshold: 10, // 10%以下のセグメントはラベルを非表示
};

const LAYOUT = {
  legendWidthRatio: 0.4,
  chartWidthRatio: 0.6,
};

export function generateChart(
  data: Record<string, number>,
  outputPath: string,
  title: string,
) {
  const width = 400;
  const contentHeight = 200;
  const height = SPACING.titleHeight + contentHeight + SPACING.contentPadding;

  // 合計値を計算
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  // データ変換してソート
  const chartData = Object.entries(data)
    .map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(1),
      color: LANGUAGE_COLORS[name] || "#666666",
      strokeColor: LANGUAGE_STROKE_COLORS[name] || "#333333",
    }))
    .sort((a, b) => b.value - a.value);

  // SVG要素の作成
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("xmlns", "http://www.w3.org/2000/svg");

  // 背景
  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", COLORS.background)
    .attr("rx", SPACING.borderRadius)
    .attr("ry", SPACING.borderRadius);

  // タイトル(中央上部)
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

  // 凡例エリア(左側40%)
  const legendWidth = width * LAYOUT.legendWidthRatio;
  const legendX = SPACING.contentPadding;
  const legendY = SPACING.titleHeight;

  // 凡例の垂直中央揃え用のオフセット計算
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
      .attr("fill", COLORS.legendText)
      .style("font-family", FONTS.family)
      .style("font-size", FONTS.sizeLegend)
      .text(d.name);
  });

  // チャートエリア(右側60%)
  const chartWidth = width * LAYOUT.chartWidthRatio;
  const chartCenterX = legendWidth + chartWidth / 2;
  const chartCenterY = SPACING.titleHeight + contentHeight / 2;
  const radius = Math.min(chartWidth, contentHeight) / 2 - 20;

  const g = svg
    .append("g")
    .attr("transform", `translate(${chartCenterX}, ${chartCenterY})`);

  // ドーナツチャートの生成
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

  // セグメントの描画
  g.selectAll("path")
    .data(pie(chartData))
    .enter()
    .append("path")
    .attr("d", arc as any)
    .attr("fill", (d) => d.data.color)
    .attr("stroke", (d) => d.data.strokeColor)
    .attr("stroke-width", CHART.strokeWidth);

  // パーセンテージテキストの描画（10%以上のみ）
  g.selectAll("text")
    .data(pie(chartData))
    .enter()
    .filter((d) => parseFloat(d.data.percentage) >= CHART.minLabelThreshold)
    .append("text")
    .attr("transform", (d: any) => {
      const pos = arc.centroid(d);
      return `translate(${pos[0]}, ${pos[1]})`;
    })
    .attr("text-anchor", "middle")
    .attr("fill", COLORS.percentText)
    .style("font-family", FONTS.family)
    .style("font-size", FONTS.sizePercent)
    .style("font-weight", "600")
    .style("text-shadow", "0 1px 2px rgba(0,0,0,0.6)")
    .text((d) => `${d.data.percentage}%`);

  // SVGをファイルに出力
  writeFileSync(outputPath, svg.node()!.outerHTML);
}
