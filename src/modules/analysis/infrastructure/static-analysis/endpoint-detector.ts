import path from "node:path";
import fs from "fs-extra";

import type { EndpointDetection } from "../../application/ports/static-analyzer.js";

interface RouterMount {
  routerName: string;
  basePath: string;
  sourcePath?: string;
}

export class EndpointDetector {
  async detect(
    repositoryPath: string,
    sourceFiles: string[],
  ): Promise<EndpointDetection[]> {
    const fileContents = await this.loadSourceFiles(
      repositoryPath,
      sourceFiles,
    );

    const mounts = this.detectRouterMounts(fileContents);

    const endpoints: EndpointDetection[] = [];

    for (const file of fileContents) {
      endpoints.push(
        ...this.detectExpressEndpoints(file.path, file.content, mounts),
      );
    }

    return endpoints;
  }

  private async loadSourceFiles(
    repositoryPath: string,
    sourceFiles: string[],
  ): Promise<
    Array<{
      path: string;
      content: string;
    }>
  > {
    return Promise.all(
      sourceFiles.map(async (file) => ({
        path: file,
        content: await fs.readFile(path.join(repositoryPath, file), "utf-8"),
      })),
    );
  }

  private detectRouterMounts(
    files: Array<{
      path: string;
      content: string;
    }>,
  ): RouterMount[] {
    const mounts: RouterMount[] = [];

    const useRegex =
      /app\.use\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([A-Za-z_$][\w$]*)\s*\)/g;

    const requireRegex =
      /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

    const imports = new Map<string, string>();

    for (const file of files) {
      let match: RegExpExecArray | null;

      while ((match = requireRegex.exec(file.content)) !== null) {
        const [, variableName, modulePath] = match;

        if (!variableName || !modulePath) {
          continue;
        }

        imports.set(variableName, modulePath);
      }
    }

    for (const file of files) {
      let match: RegExpExecArray | null;

      while ((match = useRegex.exec(file.content)) !== null) {
        const [, basePath, routerName] = match;

        if (!basePath || !routerName) {
          continue;
        }

        const sourcePath = imports.get(routerName);

        const mount: RouterMount = {
          basePath,
          routerName,
        };

        if (sourcePath !== undefined) {
          mount.sourcePath = sourcePath;
        }

        mounts.push(mount);
      }
    }

    return mounts;
  }

  private detectExpressEndpoints(
    file: string,
    content: string,
    mounts: RouterMount[],
  ): EndpointDetection[] {
    const endpoints: EndpointDetection[] = [];

    const routerRegex =
      /\b(router|app)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;

    let match: RegExpExecArray | null;

    while ((match = routerRegex.exec(content)) !== null) {
      const [, target, rawMethod, route] = match;

      if (!target || !rawMethod || !route) {
        continue;
      }

      const method = rawMethod.toUpperCase();

      const basePath = this.resolveBasePath(file, content, mounts);

      const fullPath = this.combinePaths(basePath, route);

      endpoints.push({
        method,
        path: fullPath,
        file,
        evidence: `${match[1]}.${match[2]}('${route}', ...)`,
      });
    }

    return endpoints;
  }

  private resolveBasePath(
    filePath: string,
    content: string,
    mounts: RouterMount[],
  ): string {
    const routerDeclaration =
      /const\s+([A-Za-z_$][\w$]*)\s*=\s*express\.Router\s*\(\s*\)/;

    const match = routerDeclaration.exec(content);

    if (!match) {
      return "";
    }

    const routerFileName = path.basename(filePath).replace(/\.[^.]+$/, "");

    const mount = mounts.find((item) => {
      if (!item.sourcePath) {
        return false;
      }

      const sourceFileName = path
        .basename(item.sourcePath)
        .replace(/\.[^.]+$/, "");

      return sourceFileName === routerFileName;
    });

    if (!mount) {
      return "";
    }

    return mount.basePath;
  }

  private combinePaths(basePath: string, route: string): string {
    const normalizedBase = basePath.replace(/\/+$/, "");
    const normalizedRoute = route.replace(/^\/+/, "");

    if (!normalizedBase && !normalizedRoute) {
      return "/";
    }

    if (!normalizedBase) {
      return `/${normalizedRoute}`;
    }

    if (!normalizedRoute) {
      return normalizedBase || "/";
    }

    return `${normalizedBase}/${normalizedRoute}`;
  }
}
