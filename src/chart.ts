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
};

const FONTS = {
  family: "sans-serif",
  sizeLegend: "14px",
  sizeTitle: "18px",
};

const SPACING = {
  margin: 40,
  padding: 20,
  legendRowHeight: 25,
  borderRadius: 10,
};

const CHART = {
  innerRadiusRatio: 0.6,
  positionXRatio: 0.6,
};

export function generateChart(
  data: Array<{ name: string; value: number; color: string }>,
  outputPath: string,
) {
  const width = 400;
  const height = 300;
  const radius = Math.min(width, height) / 2 - SPACING.margin;

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

  // チャート描画用のグループ(右寄せ配置)
  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${width * CHART.positionXRatio},${height / 2})`,
    );

  // ドーナツチャートの生成
  const pie = d3
    .pie<any>()
    .value((d) => d.value)
    .sort(null);

  const arc = d3
    .arc()
    .innerRadius(radius * CHART.innerRadiusRatio)
    .outerRadius(radius);

  g.selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc as any)
    .attr("fill", (d) => d.data.color);

  // 凡例の作成
  const legend = svg
    .append("g")
    .attr("transform", `translate(${SPACING.padding}, 60)`);

  data.forEach((d, i) => {
    const legendRow = legend
      .append("g")
      .attr("transform", `translate(0, ${i * SPACING.legendRowHeight})`);

    legendRow
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d.color);

    legendRow
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("fill", COLORS.legendText)
      .style("font-family", FONTS.family)
      .style("font-size", FONTS.sizeLegend)
      .text(d.name);
  });

  // タイトル
  svg
    .append("text")
    .attr("x", SPACING.padding)
    .attr("y", 30)
    .attr("fill", COLORS.title)
    .style("font-family", FONTS.family)
    .style("font-size", FONTS.sizeTitle)
    .text("Top Languages by Repo");

  // SVGをファイルに出力
  writeFileSync(outputPath, svg.node()!.outerHTML);
}
