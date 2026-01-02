import { Octokit, type RestEndpointMethodTypes } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_OWNER = "Flupinochan";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TARGET_LANGUAGES = ["TypeScript", "Dart", "Python", "C#", "Rust"];
const PER_PAGE = 100;

type Repository =
  RestEndpointMethodTypes["repos"]["listForUser"]["response"]["data"][0];

export class GitHubStats {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: GITHUB_TOKEN,
    });
  }

  /**
   * リポジトリの一覧を取得
   * @returns
   */
  async getRepositories(): Promise<Repository[]> {
    const { data: repos } = await this.octokit.repos.listForUser({
      username: GITHUB_OWNER,
      per_page: PER_PAGE,
    });
    return repos;
  }

  /**
   * リポジトリごとの言語使用量をバイト数で集計
   * @param repos
   * @returns
   */
  async getLangStatesByBytes(repos: Repository[]) {
    const languageTotals: Record<string, number> = {};

    for (const repo of repos) {
      const { data: languages } = await this.octokit.repos.listLanguages({
        owner: GITHUB_OWNER,
        repo: repo.name,
      });

      for (const [language, bytes] of Object.entries(languages)) {
        if (TARGET_LANGUAGES.includes(language)) {
          languageTotals[language] = (languageTotals[language] || 0) + bytes;
        }
      }
    }

    return languageTotals;
  }

  /**
   * リポジトリごとで1番多く使われている言語をカウント
   * @param repos
   * @returns
   */
  async getLangStatesByMain(repos: Repository[]) {
    const languageCounts: Record<string, number> = {};

    for (const repo of repos) {
      const mainLanguage = repo.language;

      if (mainLanguage && TARGET_LANGUAGES.includes(mainLanguage)) {
        languageCounts[mainLanguage] = (languageCounts[mainLanguage] || 0) + 1;
      }
    }

    return languageCounts;
  }
}
