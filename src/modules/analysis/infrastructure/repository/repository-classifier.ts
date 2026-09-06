import fs from "fs-extra";
import path from "node:path";
import type {
  RepositoryClassification,
  RepositoryClassifier,
} from "../../application/ports/repository-classifier.js";
import { env } from "../../../../config/env.js";

export class FilesystemRepositoryClassifier implements RepositoryClassifier {
  async classify(repositoryPath: string): Promise<RepositoryClassification> {
    const files = await this.getFiles(repositoryPath);
    let sizeBytes = 0;
    for (const file of files) {
      const stats = await fs.stat(file);
      sizeBytes += stats.size;
    }
    const sizeMb = sizeBytes / (1024 * 1024);
    const isLarge =
      files.length > env.MAX_REPOSITORY_FILES ||
      sizeMb > env.MAX_REPOSITORY_SIZE_MB;

    return {
      fileCount: files.length,
      sizeBytes,
      sizeMb,
      isLarge,
    };
  }

  private async getFiles(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.getFiles(entryPath)));
        continue;
      }
      if (entry.isFile()) {
        files.push(entryPath);
      }
    }
    return files;
  }
}
