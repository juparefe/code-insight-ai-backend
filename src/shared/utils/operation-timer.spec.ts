import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { OperationTimer } from './operation-timer.js';

describe('OperationTimer', () => {
  let logSpy: ReturnType<typeof jest.spyOn>;
  let nowSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    nowSpy?.mockRestore();
  });

  it('GIVEN a timer started at a known time WHEN end() is called later THEN it returns the elapsed milliseconds', () => {
    nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(1_000)
      .mockReturnValueOnce(1_250);

    const timer = new OperationTimer('Fetch');

    expect(timer.end()).toBe(250);
  });

  it('GIVEN a timer created without options WHEN end() is called THEN it logs with the default ANALYSIS namespace and the label', () => {
    const timer = new OperationTimer('Fetch');

    timer.end();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ANALYSIS] Fetch completed'),
    );
  });

  it('GIVEN a timer created with a custom namespace WHEN end() is called THEN the log uses that namespace', () => {
    const timer = new OperationTimer('Fetch', { namespace: 'WORKER' });

    timer.end();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[WORKER] Fetch completed'),
    );
  });

  it('GIVEN metadata passed to end() WHEN the timer logs THEN the metadata is appended as key=value pairs on the duration line', () => {
    const timer = new OperationTimer('Fetch');

    timer.end({ files: 12, isLarge: false });

    const logged = String(logSpy.mock.calls[0]?.[0]);

    expect(logged).toContain('durationMs=');
    expect(logged).toContain('files=12');
    expect(logged).toContain('isLarge=false');
  });
});
