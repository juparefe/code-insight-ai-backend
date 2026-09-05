import { z } from "zod";

export const architectureAnalysisSchema = z.object({
  pattern: z.enum([
    "MONOLITH",
    "MVC",
    "CLEAN_ARCHITECTURE",
    "HEXAGONAL",
    "MICROSERVICES",
    "N_LAYER",
  ]),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
});

export const aiTechnologySchema = z.object({
  name: z.string(),
  role: z.string(),
  evidence: z.array(z.string()),
});

export const aiComponentSchema = z.object({
  type: z.string(),
  name: z.string(),
  path: z.string(),
  responsibility: z.string(),
  evidence: z.array(z.string()),
});

export const findingSchema = z.object({
  severity: z.enum(["HIGH", "MEDIUM", "LOW"]),
  category: z.enum([
    "SECURITY",
    "RELIABILITY",
    "PERFORMANCE",
    "MAINTAINABILITY",
    "TESTING",
    "ARCHITECTURE",
    "DEPENDENCIES",
  ]),
  title: z.string(),
  description: z.string(),
  evidence: z.array(z.string()),
});

export const recommendationSchema = z.object({
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  title: z.string(),
  description: z.string(),
  reason: z.string(),
});

export const repositoryAnalysisSchema = z.object({
  functionalDescription: z.string(),
  architecture: architectureAnalysisSchema,
  technologies: z.array(aiTechnologySchema),
  components: z.array(aiComponentSchema),
  findings: z.array(findingSchema),
  recommendations: z.array(recommendationSchema),
});