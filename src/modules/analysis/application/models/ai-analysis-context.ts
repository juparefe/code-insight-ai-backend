import type { StaticAnalysisResult } from "../ports/static-analyzer.js";
import type { SourceFileContext } from "./source-file-context.js";

export interface AiAnalysisContext {
  repository: {
    name: string;
    sourceType: "GITHUB" | "ZIP";
  };

  summary: {
    totalFiles: number;
    sourceFiles: number;
    testFiles: number;
    configurationFiles: number;
    documentationFiles: number;
  };

  technologies: {
    languages: StaticAnalysisResult["languages"];
    frameworks: StaticAnalysisResult["frameworks"];
    dependencies: StaticAnalysisResult["dependencies"];
  };

  components: StaticAnalysisResult["components"];

  endpoints: StaticAnalysisResult["endpoints"];

  importantFiles: StaticAnalysisResult["importantFiles"];

  sourceFiles: SourceFileContext[];
}
