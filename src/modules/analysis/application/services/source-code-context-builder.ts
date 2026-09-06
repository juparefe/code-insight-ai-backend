import path from "node:path";
import fs from "fs-extra";

import type { SourceFileContext } from "../models/source-file-context.js";

import type { StaticAnalysisResult } from "../ports/static-analyzer.js";

export interface SourceCodeContextBuilderInput {
  repositoryPath: string;
  staticAnalysis: StaticAnalysisResult;
}

export class SourceCodeContextBuilder {
  private readonly maxFileSize = 20_000;

  async build(
    input: SourceCodeContextBuilderInput,
  ): Promise<SourceFileContext[]> {
    const { repositoryPath, staticAnalysis } = input;

    const filesToAnalyze = this.selectFiles(staticAnalysis);

    const results: SourceFileContext[] = [];

    for (const file of filesToAnalyze) {
      const resolvedPath = await this.resolvePath(repositoryPath, file);

      if (!resolvedPath) {
        continue;
      }

      const content = await fs.readFile(resolvedPath, "utf-8");

      results.push({
        path: file,
        content: this.limitContent(content),
      });
    }

    return results;
  }

  private async resolvePath(
    repositoryPath: string,
    relativePath: string,
  ): Promise<string | undefined> {
    const directPath = path.join(repositoryPath, relativePath);

    if (await fs.pathExists(directPath)) {
      return directPath;
    }

    const segments = relativePath.split(/[\\/]+/).filter(Boolean);

    let currentPath = repositoryPath;

    for (const segment of segments) {
      let entries: string[];

      try {
        entries = await fs.readdir(currentPath);
      } catch {
        return undefined;
      }

      const match = entries.find(
        (entry) => entry.toLowerCase() === segment.toLowerCase(),
      );

      if (!match) {
        return undefined;
      }

      currentPath = path.join(currentPath, match);
    }

    return currentPath;
  }

  private selectFiles(staticAnalysis: StaticAnalysisResult): string[] {
    const selected = new Set<string>();

    for (const file of staticAnalysis.importantFiles) {
      selected.add(file.path);
    }

    for (const component of staticAnalysis.components) {
      selected.add(component.path);
    }

    for (const endpoint of staticAnalysis.endpoints) {
      selected.add(endpoint.file);
    }

    for (const file of staticAnalysis.files) {
      if (this.isEntryPoint(file.path)) {
        selected.add(file.path);
      }
    }

    return [...selected];
  }

  private isEntryPoint(filePath: string): boolean {
    const fileName = path.basename(filePath).toLowerCase();

    return [
      "app.js",
      "app.ts",
      "server.js",
      "server.ts",
      "main.js",
      "main.ts",
      "index.js",
      "index.ts",
    ].includes(fileName);
  }

  private limitContent(content: string): string {
    if (content.length <= this.maxFileSize) {
      return content;
    }

    return `${content.slice(0, this.maxFileSize)}\n\n[FILE CONTENT TRUNCATED]`;
  }
}
