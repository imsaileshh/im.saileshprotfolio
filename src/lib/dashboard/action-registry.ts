import 'server-only';
import { updateAboutSectionAction } from '@/app/dashboard/(protected)/about/actions';
import { createCaseStudyAction } from '@/app/dashboard/(protected)/case-studies/actions';
import { updateCaseStudyAction } from '@/app/dashboard/(protected)/case-studies/actions';
import { deleteCaseStudyAction } from '@/app/dashboard/(protected)/case-studies/actions';
import { toggleCaseStudyPublishedAction } from '@/app/dashboard/(protected)/case-studies/actions';
import { duplicateCaseStudyAction } from '@/app/dashboard/(protected)/case-studies/actions';
import { saveEducationAction } from '@/app/dashboard/(protected)/education/actions';
import { deleteEducationAction } from '@/app/dashboard/(protected)/education/actions';
import { reorderEducationAction } from '@/app/dashboard/(protected)/education/actions';
import { saveExperienceAction } from '@/app/dashboard/(protected)/experience/actions';
import { deleteExperienceAction } from '@/app/dashboard/(protected)/experience/actions';
import { reorderExperiencesAction } from '@/app/dashboard/(protected)/experience/actions';
import { updateHeroAction } from '@/app/dashboard/(protected)/hero/actions';
import { saveHomepageConfigAction } from '@/app/dashboard/(protected)/home/actions';
import { toggleSkillSectionVisibilityAction } from '@/app/dashboard/(protected)/home/actions';
import { toggleSkillVisibilityAction } from '@/app/dashboard/(protected)/home/actions';
import { bulkMessageAction } from '@/app/dashboard/(protected)/messages/actions';
import { updateMessageStatusAction } from '@/app/dashboard/(protected)/messages/actions';
import { updateMessagePriorityAction } from '@/app/dashboard/(protected)/messages/actions';
import { deleteMessageAction } from '@/app/dashboard/(protected)/messages/actions';
import { createPersonalProjectAction } from '@/app/dashboard/(protected)/personal-projects/actions';
import { updatePersonalProjectAction } from '@/app/dashboard/(protected)/personal-projects/actions';
import { deletePersonalProjectAction } from '@/app/dashboard/(protected)/personal-projects/actions';
import { togglePersonalProjectPublishedAction } from '@/app/dashboard/(protected)/personal-projects/actions';
import { togglePersonalProjectFeaturedAction } from '@/app/dashboard/(protected)/personal-projects/actions';
import { createProjectAction } from '@/app/dashboard/(protected)/projects/actions';
import { updateProjectAction } from '@/app/dashboard/(protected)/projects/actions';
import { duplicateProjectAction } from '@/app/dashboard/(protected)/projects/actions';
import { deleteProjectAction } from '@/app/dashboard/(protected)/projects/actions';
import { quickProjectAction } from '@/app/dashboard/(protected)/projects/actions';
import { bulkProjectAction } from '@/app/dashboard/(protected)/projects/actions';
import { createProjectTaxonomyAction } from '@/app/dashboard/(protected)/projects/actions';
import { updateProjectTaxonomyAction } from '@/app/dashboard/(protected)/projects/actions';
import { deleteProjectTaxonomyAction } from '@/app/dashboard/(protected)/projects/actions';
import { revalidateCaseStudyPaths } from '@/app/dashboard/(protected)/projects/[id]/case-study/actions';
import { createTextResumeAction } from '@/app/dashboard/(protected)/resume/actions';
import { uploadResumeAction } from '@/app/dashboard/(protected)/resume/actions';
import { saveResumeVersionAction } from '@/app/dashboard/(protected)/resume/actions';
import { restoreResumeVersionAction } from '@/app/dashboard/(protected)/resume/actions';
import { archiveResumeAction } from '@/app/dashboard/(protected)/resume/actions';
import { runAtsAnalysisAction } from '@/app/dashboard/(protected)/resume/actions';
import { getResumeAnalyticsAction } from '@/app/dashboard/(protected)/resume/actions';
import { seedDefaultContentAction } from '@/app/dashboard/(protected)/seed-actions';
import { updateSettingsAction } from '@/app/dashboard/(protected)/settings/actions';
import { updateHomeContentAction } from '@/app/dashboard/(protected)/settings/actions';
import { updateThemeSettingsAction } from '@/app/dashboard/(protected)/settings/actions';
import { getWorksCategoriesConfig } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { toggleWorksCategoryBarAction } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { addWorksCategoryAction } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { renameWorksCategoryAction } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { deleteWorksCategoryAction } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { getPersonalProjectsCategoriesConfig } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { togglePersonalProjectsCategoryBarAction } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { addPersonalProjectsCategoryAction } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { renamePersonalProjectsCategoryAction } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { deletePersonalProjectsCategoryAction } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { updateStackHeroAction } from '@/app/dashboard/(protected)/stack/actions';
import { addSectionAction } from '@/app/dashboard/(protected)/stack/actions';
import { updateSectionAction } from '@/app/dashboard/(protected)/stack/actions';
import { deleteSectionAction } from '@/app/dashboard/(protected)/stack/actions';
import { addSkillAction } from '@/app/dashboard/(protected)/stack/actions';
import { updateSkillAction } from '@/app/dashboard/(protected)/stack/actions';
import { deleteSkillAction } from '@/app/dashboard/(protected)/stack/actions';
import { getTrafficSourcesDataAction } from '@/app/dashboard/(protected)/traffic-sources-actions';
import { getVisitorsPopupDataAction } from '@/app/dashboard/(protected)/visitors-actions';

// Explicit allowlist: never resolve a client-supplied module or database operation.
export const dashboardActions = {
  updateAboutSectionAction,
  createCaseStudyAction,
  updateCaseStudyAction,
  deleteCaseStudyAction,
  toggleCaseStudyPublishedAction,
  duplicateCaseStudyAction,
  saveEducationAction,
  deleteEducationAction,
  reorderEducationAction,
  saveExperienceAction,
  deleteExperienceAction,
  reorderExperiencesAction,
  updateHeroAction,
  saveHomepageConfigAction,
  toggleSkillSectionVisibilityAction,
  toggleSkillVisibilityAction,
  bulkMessageAction,
  updateMessageStatusAction,
  updateMessagePriorityAction,
  deleteMessageAction,
  createPersonalProjectAction,
  updatePersonalProjectAction,
  deletePersonalProjectAction,
  togglePersonalProjectPublishedAction,
  togglePersonalProjectFeaturedAction,
  createProjectAction,
  updateProjectAction,
  duplicateProjectAction,
  deleteProjectAction,
  quickProjectAction,
  bulkProjectAction,
  createProjectTaxonomyAction,
  updateProjectTaxonomyAction,
  deleteProjectTaxonomyAction,
  revalidateCaseStudyPaths,
  createTextResumeAction,
  uploadResumeAction,
  saveResumeVersionAction,
  restoreResumeVersionAction,
  archiveResumeAction,
  runAtsAnalysisAction,
  getResumeAnalyticsAction,
  seedDefaultContentAction,
  updateSettingsAction,
  updateHomeContentAction,
  updateThemeSettingsAction,
  getWorksCategoriesConfig,
  toggleWorksCategoryBarAction,
  addWorksCategoryAction,
  renameWorksCategoryAction,
  deleteWorksCategoryAction,
  getPersonalProjectsCategoriesConfig,
  togglePersonalProjectsCategoryBarAction,
  addPersonalProjectsCategoryAction,
  renamePersonalProjectsCategoryAction,
  deletePersonalProjectsCategoryAction,
  updateStackHeroAction,
  addSectionAction,
  updateSectionAction,
  deleteSectionAction,
  addSkillAction,
  updateSkillAction,
  deleteSkillAction,
  getTrafficSourcesDataAction,
  getVisitorsPopupDataAction,
};
