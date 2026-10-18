import type { IProjectDetectionResult } from './projectDetectionResult';
import type { Projects } from './projects';

export interface IProjectAutoDetectionManager {
  detectProjects(projectNames: Projects[]): Promise<IProjectDetectionResult[]>;
}
