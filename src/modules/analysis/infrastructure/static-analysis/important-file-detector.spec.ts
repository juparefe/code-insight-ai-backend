import { describe, expect, it } from '@jest/globals';

import { ImportantFileDetector } from './important-file-detector.js';
import type { FileInfo } from '../../application/ports/static-analyzer.js';

function file(filePath: string): FileInfo {
  return {
    path: filePath,
    extension: filePath.split('.').pop() ?? '',
    sizeBytes: 0,
    category: 'OTHER',
  };
}

describe('ImportantFileDetector', () => {
  const detector = new ImportantFileDetector();

  it('GIVEN a package.json file WHEN the detector runs THEN it is classified as a HIGH priority package manifest', () => {
    const [result] = detector.detect([file('package.json')]);

    expect(result).toEqual({
      path: 'package.json',
      type: 'PACKAGE_MANIFEST',
      priority: 'HIGH',
    });
  });

  it('GIVEN a tsconfig.json file WHEN the detector runs THEN it is classified as a MEDIUM priority TypeScript config', () => {
    const [result] = detector.detect([file('tsconfig.json')]);

    expect(result?.type).toBe('TYPESCRIPT_CONFIG');
    expect(result?.priority).toBe('MEDIUM');
  });

  it('GIVEN an important file in a nested directory with mixed casing WHEN the detector runs THEN it is still detected', () => {
    const [result] = detector.detect([file('config/Application.YAML')]);

    expect(result).toEqual({
      path: 'config/Application.YAML',
      type: 'APPLICATION_CONFIG',
      priority: 'HIGH',
    });
  });

  it('GIVEN a file path with Windows backslashes WHEN the detector runs THEN the reported path is normalized to forward slashes', () => {
    const [result] = detector.detect([file('backend\\Dockerfile')]);

    expect(result).toEqual({
      path: 'backend/Dockerfile',
      type: 'DOCKER',
      priority: 'HIGH',
    });
  });

  it('GIVEN files named README and README.md WHEN the detector runs THEN both are recognized as READMEs', () => {
    const results = detector.detect([file('README'), file('docs/readme.md')]);

    expect(results.map((r) => r.type)).toEqual(['README', 'README']);
  });

  it('GIVEN a file that matches no rule WHEN the detector runs THEN it is ignored', () => {
    expect(detector.detect([file('src/index.ts')])).toEqual([]);
  });

  it('GIVEN a list containing several important files WHEN the detector runs THEN each important file is detected', () => {
    const results = detector.detect([
      file('package.json'),
      file('src/main.ts'),
      file('pom.xml'),
      file('angular.json'),
    ]);

    expect(results.map((r) => r.type).sort()).toEqual([
      'ANGULAR_CONFIG',
      'JAVA_BUILD',
      'PACKAGE_MANIFEST',
    ]);
  });
});
