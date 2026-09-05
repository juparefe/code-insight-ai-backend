import path from "node:path";
import fs from "fs-extra";

import type {
  StaticAnalyzer,
  StaticAnalysisResult,
  FileInfo,
  FileCategory,
  DependencyInfo,
  RepositoryStatistics,
  LanguageDetection,
  FrameworkDetection,
} from "../../application/ports/static-analyzer.js";
import type { ComponentDetector } from "./component-detector.js";
import type { EndpointDetector } from "./endpoint-detector.js";
import type { ImportantFileDetector } from "./important-file-detector.js";

export class RepositoryStaticAnalyzer implements StaticAnalyzer {
  constructor(
    private readonly componentDetector: ComponentDetector,
    private readonly endpointDetector: EndpointDetector,
    private readonly importantFileDetector: ImportantFileDetector,
  ) {}

  async analyze(repositoryPath: string): Promise<StaticAnalysisResult> {
    const files: FileInfo[] = [];
    const directories = new Set<string>();

    await this.walkDirectory(
      repositoryPath,
      repositoryPath,
      files,
      directories,
    );

    const sourceFiles = files
      .filter((file) => file.category === "SOURCE")
      .map((file) => file.path);

    const dependencies = await this.extractDependencies(repositoryPath);

    const statistics = this.buildStatistics(files);
    const languages = this.detectLanguages(files);
    const frameworks = this.detectFrameworks(dependencies);
    const components = this.componentDetector.detect(files);
    const endpoints = await this.endpointDetector.detect(
      repositoryPath,
      sourceFiles,
    );
    const importantFiles = this.importantFileDetector.detect(files);

    return {
      files,
      directories: [...directories],
      dependencies,
      statistics,
      languages,
      frameworks,
      components,
      endpoints,
      importantFiles,
    };
  }

  private async walkDirectory(
    rootPath: string,
    currentPath: string,
    files: FileInfo[],
    directories: Set<string>,
  ): Promise<void> {
    const entries = await fs.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      const relativePath = path.relative(rootPath, fullPath);

      if (entry.isDirectory()) {
        if (this.shouldIgnoreDirectory(entry.name)) {
          continue;
        }

        directories.add(relativePath);

        await this.walkDirectory(rootPath, fullPath, files, directories);

        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const stats = await fs.stat(fullPath);

      files.push({
        path: relativePath,
        extension: path.extname(entry.name),
        sizeBytes: stats.size,
        category: this.detectFileCategory(relativePath, entry.name),
      });
    }
  }

  private shouldIgnoreDirectory(directoryName: string): boolean {
    return [
      ".git",
      "node_modules",
      "dist",
      "build",
      "coverage",
      ".angular",
    ].includes(directoryName);
  }

  private detectFileCategory(filePath: string, fileName: string): FileCategory {
    const normalizedPath = filePath.toLowerCase();
    const normalizedName = fileName.toLowerCase();

    if (
      normalizedName.includes(".test.") ||
      normalizedName.includes(".spec.") ||
      normalizedPath.includes("/test/") ||
      normalizedPath.includes("/tests/")
    ) {
      return "TEST";
    }

    if (
      [".json", ".yaml", ".yml", ".xml", ".toml", ".env"].some((extension) =>
        normalizedName.endsWith(extension),
      )
    ) {
      return "CONFIGURATION";
    }

    if (
      [".md", ".txt"].some((extension) => normalizedName.endsWith(extension))
    ) {
      return "DOCUMENTATION";
    }

    if (
      [
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".java",
        ".py",
        ".go",
        ".cs",
        ".cpp",
        ".c",
        ".kt",
        ".rs",
      ].some((extension) => normalizedName.endsWith(extension))
    ) {
      return "SOURCE";
    }

    return "OTHER";
  }

  private detectFrameworks(
    dependencies: DependencyInfo[],
  ): FrameworkDetection[] {
    const frameworkMap: Record<string, { name: string; confidence: number }> = {
      express: {
        name: "Express",
        confidence: 0.95,
      },
      "@nestjs/core": {
        name: "NestJS",
        confidence: 0.95,
      },
      "@angular/core": {
        name: "Angular",
        confidence: 0.98,
      },
      react: {
        name: "React",
        confidence: 0.95,
      },
      next: {
        name: "Next.js",
        confidence: 0.95,
      },
      "spring-boot": {
        name: "Spring Boot",
        confidence: 0.95,
      },
    };

    return dependencies.flatMap((dependency) => {
      const framework = frameworkMap[dependency.name];

      if (!framework) {
        return [];
      }

      return [
        {
          name: framework.name,
          confidence: framework.confidence,
          evidence: [`Dependency detected: ${dependency.name}`],
        },
      ];
    });
  }

  private detectLanguages(files: FileInfo[]): LanguageDetection[] {
    const languageExtensions: Record<string, string> = {
      ".ts": "TypeScript",
      ".tsx": "TypeScript",
      ".js": "JavaScript",
      ".jsx": "JavaScript",
      ".java": "Java",
      ".py": "Python",
      ".go": "Go",
      ".cs": "C#",
      ".cpp": "C++",
      ".c": "C",
      ".kt": "Kotlin",
      ".rs": "Rust",
    };

    const counts = new Map<string, number>();

    for (const file of files) {
      const language = languageExtensions[file.extension];

      if (!language) {
        continue;
      }

      counts.set(language, (counts.get(language) ?? 0) + 1);
    }

    const total = [...counts.values()].reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      return [];
    }

    return [...counts.entries()]
      .map(([name, fileCount]) => ({
        name,
        fileCount,
        percentage: Number(((fileCount / total) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.fileCount - a.fileCount);
  }

  private async extractDependencies(
    repositoryPath: string,
  ): Promise<DependencyInfo[]> {
    const packageJsonPath = path.join(repositoryPath, "package.json");

    if (!(await fs.pathExists(packageJsonPath))) {
      return [];
    }

    const packageJson = await fs.readJson(packageJsonPath);

    const dependencies: DependencyInfo[] = [];

    for (const [name, version] of Object.entries(
      packageJson.dependencies ?? {},
    )) {
      dependencies.push({
        name,
        version: String(version),
        type: "RUNTIME",
      });
    }

    for (const [name, version] of Object.entries(
      packageJson.devDependencies ?? {},
    )) {
      dependencies.push({
        name,
        version: String(version),
        type: "DEV",
      });
    }

    return dependencies;
  }

  private buildStatistics(files: FileInfo[]): RepositoryStatistics {
    return {
      totalFiles: files.length,

      sourceFiles: files.filter((file) => file.category === "SOURCE").length,

      testFiles: files.filter((file) => file.category === "TEST").length,

      configurationFiles: files.filter(
        (file) => file.category === "CONFIGURATION",
      ).length,

      documentationFiles: files.filter(
        (file) => file.category === "DOCUMENTATION",
      ).length,
    };
  }
}
