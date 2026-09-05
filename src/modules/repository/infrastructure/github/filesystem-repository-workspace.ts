import fs from 'fs-extra';

import type { RepositoryWorkspace } from '../../application/ports/repository-workspace.js';

export class FilesystemRepositoryWorkspace
  implements RepositoryWorkspace
{
  async cleanup(path: string): Promise<void> {
    await fs.remove(path);
  }
}