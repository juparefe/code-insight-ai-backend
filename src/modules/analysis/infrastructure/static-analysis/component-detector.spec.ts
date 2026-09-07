import { describe, expect, it } from '@jest/globals';

import { ComponentDetector } from './component-detector.js';
import type { FileInfo } from '../../application/ports/static-analyzer.js';

function file(filePath: string): FileInfo {
  return {
    path: filePath,
    extension: filePath.split('.').pop() ?? '',
    sizeBytes: 0,
    category: 'SOURCE',
  };
}

describe('ComponentDetector', () => {
  const detector = new ComponentDetector();

  it('GIVEN a file under a controllers directory WHEN the detector runs THEN it is detected as a CONTROLLER', () => {
    const [result] = detector.detect([file('src/controllers/user.js')]);

    expect(result).toMatchObject({
      type: 'CONTROLLER',
      name: 'user',
      path: 'src/controllers/user.js',
    });
  });

  it('GIVEN a file with a .service. suffix WHEN the detector runs THEN it is detected as a SERVICE', () => {
    const [result] = detector.detect([file('src/user/user.service.ts')]);

    expect(result?.type).toBe('SERVICE');
    expect(result?.name).toBe('user');
  });

  it.each([
    ['src/repository/user-repo.ts', 'REPOSITORY'],
    ['src/models/order.ts', 'MODEL'],
    ['app/components/button.tsx', 'COMPONENT'],
    ['src/routes/health.ts', 'ROUTE'],
    ['src/middleware/auth.ts', 'MIDDLEWARE'],
  ])(
    'GIVEN the file %s WHEN the detector runs THEN it is classified as %s',
    (path, expected) => {
      const [result] = detector.detect([file(path)]);

      expect(result?.type).toBe(expected);
    },
  );

  it('GIVEN a path with mixed casing and Windows separators WHEN the detector runs THEN the component type is still detected', () => {
    const [result] = detector.detect([file('Src\\Controllers\\User.ts')]);

    expect(result?.type).toBe('CONTROLLER');
  });

  it('GIVEN a matching component file WHEN the detector runs THEN the file path is included as evidence', () => {
    const [result] = detector.detect([file('src/services/mail.service.ts')]);

    expect(result?.evidence).toEqual([
      'Path pattern detected: src/services/mail.service.ts',
    ]);
  });

  it('GIVEN a file that matches no component pattern WHEN the detector runs THEN it is skipped', () => {
    expect(detector.detect([file('src/index.ts')])).toEqual([]);
  });

  it('GIVEN a component file with multiple dots in its name WHEN the detector runs THEN the name is extracted up to the first dot', () => {
    const [result] = detector.detect([file('src/services/report.v2.service.ts')]);

    expect(result?.name).toBe('report');
  });
});
