import { generateChart } from "./chart.js";
import { GitHubStats } from "./github.js";

async function main() {
  try {
    // GitHubからデータ取得
    const githubStats = new GitHubStats();
    const repos = await githubStats.getRepositories();
    const languageTotals = await githubStats.getLangStatesByBytes(repos);
    const languageCounts = await githubStats.getLangStatesByMain(repos);
    const hourCounts = await githubStats.getCommitsByHour(repos);

    // バイト数のグラフ生成
    generateChart(languageTotals, "output-bytes.svg", "By Total Bytes");
    console.log("Chart generated: output-bytes.svg");

    // リポジトリ数のグラフ生成
    generateChart(languageCounts, "output-count.svg", "By Repository Count");
    console.log("Chart generated: output-count.svg");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
