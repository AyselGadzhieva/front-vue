import api from './api';
class UserService {
    getProjectsPublic() {
        return api.get('projects');
    }
    getProjectPublic(project_id) {
        return api.get('projects/' + project_id);
    }
    getProjectForEdit(project_id) {
        return api.get('projects/edit/' + project_id);
    }
    getUserProfileInfo() {
        return api.get('user_profile');
    }
    getUserProjects() {
        return api.get('user_profile/my-projects');
    }
    getUserProfileProjects() {
        return api.get('user_profile/projects');
    }
    getInfoForProjectForm() {
        return api.get('project-form-info');
    }
    createProject(project) {
        return api.post('project/', project).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    sendProjectForModeration(project_id) {
        return api.post('project/moderation/' + project_id).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    createProjectDraft(project) {
        return api.post('project/draft/', project).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    deleteProjectDraft(project_id) {
        return api.delete('project/draft/' + project_id).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    editProject(id, project) {
        return api.post(`project/${id}/edit`, project).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    getModerationRequests() {
        return api.get('moderation');
    }
    acceptForModeration(id) {
        return api.post(`moderation/request/${id}/accept`).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    rejectModeratedRequest(id) {
        return api.post(`moderation/my-request/${id}/reject`).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    getModerationMyRequests() {
        return api.get('moderation/my-requests');
    }
    sendToExperts(id, experts_id) {
        return api.post(`moderation/my-request/${id}/send-to-experts`, experts_id).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    sendToCurators(id) {
        return api.post(`moderation/my-request/${id}/send-to-curators`).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    startSelectMembersProject(id) {
        return api.post(`moderation/my-request/${id}/start-project-recruitment`).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    startProject(id) {
        return api.post(`moderation/my-request/${id}/start-project`).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    getCurationProjects() {
        return api.get('curation/');
    }
    getCurationMyProjects() {
        return api.get('curation/my-projects');
    }
    getExpertiseRequests() {
        return api.get('expertise/requests');
    }
    sendExpertise(id, expertise) {
        return api.post(`expertise/request/${id}/send-expertise`, expertise).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    saveTeam(id, team) {
        return api.post(`curation/project/${id}/save-team-roles`, team).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    saveMembersTeam(id, selected_students) {
        return api.post(`curation/project/${id}/save-team-members`, selected_students).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    subscribeTo(id, role_id) {
        return api.post(`curation/project/${id}/subscribe`, {role_id}).then(
            response => {
                return Promise.resolve(response.data);
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
    getExpertiseInfo(id) {
        return api.get(`projects/${id}/expertise-info`);
    }
    getExperts() {
        return api.get(`/experts`);
    }
    getTeamInfo(id) {
        return api.get(`projects/${id}/team-info`);
    }
    getTeamAvailableRoles(id) {
        return api.get(`projects/${id}/team-available-roles`);
    }
    getSubjectAreaExperts(id) {
        return api.get('subject-area-experts/', id);
    }
}
export default new UserService();