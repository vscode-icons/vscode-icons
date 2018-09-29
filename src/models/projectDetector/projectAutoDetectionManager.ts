import { Projects } from './projects';
import { IProjectDetectionResult } from './projectDetectionResult';

export interface IProjectAutoDetectionManager {
  detectProjects(projectNames: Projects[]): Thenable<IProjectDetectionResult>;
}
