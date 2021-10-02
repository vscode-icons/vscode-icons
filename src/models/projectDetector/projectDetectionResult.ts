import { Projects } from './projects';
import { LangResourceKeys } from '../i18n/langResourceKeys';

export interface IProjectDetectionResult {
  apply: boolean;
  project?: Projects;
  conflictingProjects?: Projects[];
  langResourceKey?: LangResourceKeys;
  value?: boolean;
}
