import path from 'node:path';

import type {
    ComponentDetection,
    FileInfo,
} from '../../application/ports/static-analyzer.js';

export class ComponentDetector {
  detect(files: FileInfo[]): ComponentDetection[] {
    return files.flatMap((file) => {
      const componentType = this.detectType(file.path);

      if (!componentType) {
        return [];
      }

      return [
        {
          type: componentType,
          name: this.extractName(file.path),
          path: file.path,
          evidence: [
            `Path pattern detected: ${file.path}`,
          ],
        },
      ];
    });
  }

  private detectType(
    filePath: string,
  ): ComponentDetection['type'] | undefined {
    const normalizedPath = filePath
      .replaceAll('\\', '/')
      .toLowerCase();

    if (
      normalizedPath.includes('/controller/') ||
      normalizedPath.includes('/controllers/') ||
      normalizedPath.includes('.controller.')
    ) {
      return 'CONTROLLER';
    }

    if (
      normalizedPath.includes('/service/') ||
      normalizedPath.includes('/services/') ||
      normalizedPath.includes('.service.')
    ) {
      return 'SERVICE';
    }

    if (
      normalizedPath.includes('/repository/') ||
      normalizedPath.includes('/repositories/') ||
      normalizedPath.includes('.repository.')
    ) {
      return 'REPOSITORY';
    }

    if (
      normalizedPath.includes('/model/') ||
      normalizedPath.includes('/models/') ||
      normalizedPath.includes('.model.')
    ) {
      return 'MODEL';
    }

    if (
      normalizedPath.includes('/component/') ||
      normalizedPath.includes('/components/') ||
      normalizedPath.includes('.component.')
    ) {
      return 'COMPONENT';
    }

    if (
      normalizedPath.includes('/route/') ||
      normalizedPath.includes('/routes/') ||
      normalizedPath.includes('.route.')
    ) {
      return 'ROUTE';
    }

    if (
      normalizedPath.includes('/middleware/') ||
      normalizedPath.includes('/middlewares/') ||
      normalizedPath.includes('.middleware.')
    ) {
      return 'MIDDLEWARE';
    }

    return undefined;
  }

  private extractName(filePath: string): string {
    const fileName = path.basename(filePath);

    const extensionIndex = fileName.indexOf('.');

    if (extensionIndex === -1) {
      return fileName;
    }

    return fileName.substring(0, extensionIndex);
  }
}