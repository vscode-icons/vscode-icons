import { Projects } from './projects';
import { LangResourceKeys } from '../i18n/langResourceKeys';

export interface IProjectDetectionResult {
  apply: boolean;
  projectName?: string | Projects;
  langResourceKey?: LangResourceKeys;
  value?: boolean;
}
