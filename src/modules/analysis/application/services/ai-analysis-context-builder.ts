import type { AiAnalysisContext } from "../models/ai-analysis-context.js";
import type { SourceFileContext } from "../models/source-file-context.js";

import type { StaticAnalysisResult } from "../ports/static-analyzer.js";

export interface AiAnalysisContextInput {
  repositoryName: string;
  sourceType: "GITHUB" | "ZIP";
  staticAnalysis: StaticAnalysisResult;
  sourceFiles: SourceFileContext[];
}

export class AiAnalysisContextBuilder {
  build(input: AiAnalysisContextInput): AiAnalysisContext {
    const { repositoryName, sourceType, staticAnalysis } = input;

    return {
      repository: {
        name: repositoryName,
        sourceType,
      },
      summary: {
        totalFiles: staticAnalysis.statistics.totalFiles,
        sourceFiles: staticAnalysis.statistics.sourceFiles,
        testFiles: staticAnalysis.statistics.testFiles,
        configurationFiles: staticAnalysis.statistics.configurationFiles,
        documentationFiles: staticAnalysis.statistics.documentationFiles,
      },
      technologies: {
        languages: staticAnalysis.languages,
        frameworks: staticAnalysis.frameworks,
        dependencies: staticAnalysis.dependencies,
      },
      components: staticAnalysis.components,
      endpoints: staticAnalysis.endpoints,
      importantFiles: staticAnalysis.importantFiles,
      sourceFiles: input.sourceFiles,
    };
  }
}
