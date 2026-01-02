import { generateChart } from "./chart.js";
import { GitHubStats } from "./github.js";

async function main() {
  try {
    // GitHubからデータ取得
    const githubStats = new GitHubStats();
    const repos = await githubStats.getRepositories();
    const languageTotals = await githubStats.getLangStatesByBytes(repos);
    const languageCounts = await githubStats.getLangStatesByMain(repos);

    // グラフ用データの準備
    const chartData = [
      { name: "TypeScript", value: 45, color: "#3178c6" },
      { name: "Python", value: 25, color: "#3776ab" },
      { name: "Rust", value: 20, color: "#ce422b" },
      { name: "C#", value: 7, color: "#239120" },
      { name: "Dockerfile", value: 3, color: "#384d54" },
    ];

    // グラフ生成
    generateChart(chartData, "output.svg");
    console.log("Chart generated: output.svg");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
