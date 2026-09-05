import path from 'node:path';

import type {
    FileInfo,
    ImportantFile,
} from '../../application/ports/static-analyzer.js';

export class ImportantFileDetector {
  detect(files: FileInfo[]): ImportantFile[] {
    return files.flatMap((file) => {
      const normalizedPath = file.path
        .replaceAll('\\', '/')
        .toLowerCase();

      const fileName = path
        .basename(normalizedPath);

      const result = this.detectFile(
        fileName,
        normalizedPath,
      );

      return result ? [result] : [];
    });
  }

  private detectFile(
    fileName: string,
    filePath: string,
  ): ImportantFile | undefined {
    if (
      fileName === 'package.json'
    ) {
      return {
        path: filePath,
        type: 'PACKAGE_MANIFEST',
        priority: 'HIGH',
      };
    }

    if (
      fileName === 'readme.md' ||
      fileName === 'readme'
    ) {
      return {
        path: filePath,
        type: 'README',
        priority: 'HIGH',
      };
    }

    if (
      fileName === 'dockerfile'
    ) {
      return {
        path: filePath,
        type: 'DOCKER',
        priority: 'HIGH',
      };
    }

    if (
      fileName === 'docker-compose.yml' ||
      fileName === 'docker-compose.yaml'
    ) {
      return {
        path: filePath,
        type: 'COMPOSE',
        priority: 'HIGH',
      };
    }

    if (
      fileName === 'tsconfig.json'
    ) {
      return {
        path: filePath,
        type: 'TYPESCRIPT_CONFIG',
        priority: 'MEDIUM',
      };
    }

    if (
      fileName === 'angular.json'
    ) {
      return {
        path: filePath,
        type: 'ANGULAR_CONFIG',
        priority: 'HIGH',
      };
    }

    if (
      fileName === 'pom.xml' ||
      fileName === 'build.gradle' ||
      fileName === 'build.gradle.kts'
    ) {
      return {
        path: filePath,
        type: 'JAVA_BUILD',
        priority: 'HIGH',
      };
    }

    if (
      fileName === 'application.yml' ||
      fileName === 'application.yaml' ||
      fileName === 'application.properties'
    ) {
      return {
        path: filePath,
        type: 'APPLICATION_CONFIG',
        priority: 'HIGH',
      };
    }

    return undefined;
  }
}