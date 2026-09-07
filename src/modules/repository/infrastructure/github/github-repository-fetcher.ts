import path from "node:path";
import crypto from "node:crypto";
import fs from "fs-extra";
import { extract } from 'tar';

import type { RepositorySource } from "../../domain/repository-source.js";
import type { RepositoryFetcher } from "../../application/ports/repository-fetcher.js";
import { AppError } from "../../../../shared/errors/app-error.js";
import { env } from "../../../../config/env.js";

export class GitHubRepositoryFetcher implements RepositoryFetcher {
  async fetch(source: RepositorySource): Promise<string> {
    const repositoryInfo = this.validateUrl(source.url);

    const repositoryId = crypto.randomUUID();
    const repositoryPath = path.resolve(env.TEMP_DIRECTORY, repositoryId);

    const archivePath = path.join(env.TEMP_DIRECTORY, `${repositoryId}.tar.gz`);

    try {
      await fs.ensureDir(repositoryPath);

      const tarballUrl = `https://api.github.com/repos/${repositoryInfo.owner}/${repositoryInfo.repository}/tarball`;

      const response = await fetch(tarballUrl, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "code-insight-ai",
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub returned HTTP ${response.status}`);
      }

      const archive = Buffer.from(await response.arrayBuffer());

      await fs.writeFile(archivePath, archive);

      await extract({
        file: archivePath,
        cwd: repositoryPath,
        strip: 1,
      });

      return repositoryPath;
    } catch (error) {
      await fs.remove(repositoryPath);
      console.error("Error fetching GitHub repository:", error);
      throw new AppError(
        422,
        "Unable to retrieve the GitHub repository",
        "REPOSITORY_FETCH_FAILED",
      );
    }
  }

  private validateUrl(url: string): {
    owner: string;
    repository: string;
  } {
    try {
      const parsedUrl = new URL(url);

      const isGitHub =
        parsedUrl.protocol === "https:" && parsedUrl.hostname === "github.com";

      if (!isGitHub) {
        throw new Error("Invalid GitHub URL");
      }

      const segments = parsedUrl.pathname.split("/").filter(Boolean);

      if (segments.length !== 2) {
        throw new Error("Invalid GitHub repository URL");
      }

      const owner = segments[0];
      const repositoryWithGit = segments[1];

      if (!owner || !repositoryWithGit) {
        throw new Error("Invalid GitHub repository URL");
      }

      const repository = repositoryWithGit.endsWith(".git")
        ? repositoryWithGit.slice(0, -4)
        : repositoryWithGit;

      if (!owner || !repository) {
        throw new Error("Invalid GitHub repository URL");
      }

      return {
        owner,
        repository,
      };
    } catch {
      throw new AppError(
        400,
        "A valid public GitHub URL is required",
        "INVALID_REPOSITORY_URL",
      );
    }
  }
}
