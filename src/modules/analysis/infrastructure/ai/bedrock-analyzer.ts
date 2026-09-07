import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

import type { AiAnalysisContext } from "../../application/models/ai-analysis-context.js";

import type { AiAnalyzer } from "../../application/ports/ai-analyzer.js";
import type { RepositoryAnalysis } from "../../application/models/repository-analysis.js";
import { repositoryAnalysisSchema } from "../../application/models/repository-analysis.schema.js";
import { ZodError } from "zod/v3";
import { AppError } from "../../../../shared/errors/app-error.js";

export class BedrockAnalyzer implements AiAnalyzer {
  private readonly client: BedrockRuntimeClient;
  constructor(
    private readonly modelId: string,
    region: string,
  ) {
    this.client = new BedrockRuntimeClient({
      region,
    });
  }

  async analyze(context: AiAnalysisContext): Promise<RepositoryAnalysis> {
    const prompt = this.buildPrompt(context);

    const command = new ConverseCommand({
      modelId: this.modelId,

      messages: [
        {
          role: "user",
          content: [
            {
              text: prompt,
            },
          ],
        },
      ],

      inferenceConfig: {
        maxTokens: 4000,
        temperature: 0.2,
      },
    });

    let response;
    try {
      response = await this.client.send(command);
    } catch (error) {
      throw this.mapAwsError(error);
    }

    const responseText =
      response.output?.message?.content
        ?.map((content) => content.text ?? "")
        .join("")
        .trim() ?? "";

    if (!responseText) {
      throw new Error("Bedrock returned an empty AI response");
    }
    const json = this.cleanJsonResponse(responseText);

    try {
      const parsedResponse: unknown = JSON.parse(json);
      return repositoryAnalysisSchema.parse(parsedResponse);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("AI analysis returned invalid JSON", { cause: error });
      }
      if (error instanceof ZodError) {
        throw new Error(
          `AI analysis response does not match the expected contract: ${error.message}`,
          { cause: error },
        );
      }
      throw new Error(
        `Unexpected error while processing AI analysis: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { cause: error },
      );
    }
  }

  private mapAwsError(error: unknown): Error {
    if (!(error instanceof Error)) {
      return new Error("Unknown error while calling AWS Bedrock");
    }

    const authErrorNames = [
      "CredentialsProviderError",
      "ExpiredTokenException",
      "ExpiredToken",
      "InvalidSignatureException",
      "UnrecognizedClientException",
      "InvalidIdentityTokenException",
    ];

    if (authErrorNames.includes(error.name)) {
      return new AppError(
        503,
        "AWS credentials are missing or expired. Re-authenticate (e.g. run 'aws sso login') and restart the server.",
        "AWS_AUTHENTICATION_REQUIRED",
      );
    }

    if (error.name === "AccessDeniedException") {
      return new AppError(
        502,
        "AWS credentials are valid but not authorized to invoke the configured Bedrock model.",
        "AWS_ACCESS_DENIED",
      );
    }

    return new AppError(
      502,
      `AWS Bedrock request failed: ${error.message}`,
      "AI_PROVIDER_ERROR",
    );
  }

  private buildPrompt(context: AiAnalysisContext): string {
    return `
      You are a senior software architect specialized in reverse engineering software repositories.
      Your task is to analyze a software repository using ONLY the evidence provided below.

      IMPORTANT RULES:
      1. Do not invent files, technologies, components, endpoints, authentication mechanisms, databases, or architectural patterns.
      2. Prioritize source code evidence over file names or dependency names.
      3. Distinguish internally between:
        - FACT: directly supported by the provided evidence.
        - INFERENCE: a reasonable conclusion based on the evidence.
      4. If there is not enough evidence to determine something, explicitly say so.
      5. Dependencies alone do not prove that a library is actually used in the source code.
      6. The existence of a security-related dependency does not prove that the corresponding security mechanism is correctly implemented.
      7. Do not recommend adding a technology or dependency if the evidence already shows that it exists.
      8. When identifying architecture, provide the pattern and the evidence supporting it.
      9. Do not assume that a project follows a pattern simply because its framework commonly uses that pattern.
      10. Keep the analysis concise and technically precise.
      11. Recommendations must be based on evidence found in the repository.
      12. Do not include markdown.
      13. Do not include explanations outside the JSON object.
      14. Return ONLY valid JSON.

      OUTPUT LANGUAGE:
      15. Write every piece of natural-language text that you generate in Spanish. This applies to:
        "functionalDescription", "architecture.evidence[]", "technologies[].role",
        "technologies[].evidence[]", "components[].responsibility", "components[].evidence[]",
        "findings[].title", "findings[].description", "findings[].evidence[]",
        "recommendations[].title", "recommendations[].description", "recommendations[].reason".
      16. Do NOT translate, rename, or otherwise alter verbatim identifiers taken from the repository:
        file names and paths (including "components[].path"), directory names, class / function /
        variable names, package and dependency names, technology names ("technologies[].name"),
        environment variable names, and code snippets. Keep them exactly as they appear in the evidence,
        even when they are quoted inside a Spanish sentence.
      17. Keep all JSON keys and all enum values (pattern, severity, category, priority) exactly as
        specified below, in English and uppercase.

      The following architecture patterns are allowed:
      - MONOLITH
      - MVC
      - CLEAN_ARCHITECTURE
      - HEXAGONAL
      - MICROSERVICES
      - N_LAYER

      Repository analysis context:
      ${JSON.stringify(context, null, 2)}

      Return exactly this JSON structure:
      {
        "functionalDescription": "string",

        "architecture": {
          "pattern": "MONOLITH | MVC | CLEAN_ARCHITECTURE | HEXAGONAL | MICROSERVICES | N_LAYER",
          "confidence": 0.0,
          "evidence": [
            "string"
          ]
        },

        "technologies": [
          {
            "name": "string",
            "role": "string",
            "evidence": [
              "string"
            ]
          }
        ],

        "components": [
          {
            "type": "string",
            "name": "string",
            "path": "string",
            "responsibility": "string",
            "evidence": [
              "string"
            ]
          }
        ],

        "findings": [
          {
            "severity": "HIGH | MEDIUM | LOW",
            "category": "SECURITY | RELIABILITY | PERFORMANCE | MAINTAINABILITY | TESTING | ARCHITECTURE | DEPENDENCIES",
            "title": "string",
            "description": "string",
            "evidence": [
              "string"
            ]
          }
        ],

        "recommendations": [
          {
            "priority": "HIGH | MEDIUM | LOW",
            "title": "string",
            "description": "string",
            "reason": "string"
          }
        ]
      }
    `;
  }

  private cleanJsonResponse(response: string): string {
    const trimmed = response.trim();

    if (trimmed.startsWith("```json")) {
      return trimmed
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
    }

    if (trimmed.startsWith("```")) {
      return trimmed
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
    }

    return trimmed;
  }
}
