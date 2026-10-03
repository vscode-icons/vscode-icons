import { LangResourceKeys } from '../i18n/langResourceKeys';
import { Projects } from './projects';

export interface IProjectDetectionResult {
  apply: boolean;
  project?: Projects;
  conflictingProjects?: Projects[];
  langResourceKey?: LangResourceKeys;
  value?: boolean;
}
