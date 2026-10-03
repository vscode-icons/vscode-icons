import { IProjectDetectionResult } from './projectDetectionResult';
import { Projects } from './projects';

export interface IProjectAutoDetectionManager {
  detectProjects(projectNames: Projects[]): Promise<IProjectDetectionResult[]>;
}
