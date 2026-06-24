document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('projectForm');
    const projectFeed = document.getElementById('projectFeed');
    const submitBtn = projectForm.querySelector('.btn');
    
    let editingProjectId = null;

    fetchProjects();

    async function fetchProjects() {
        try {
            const response = await fetch('/api/projects');
            const projects = await response.json();
            projectFeed.innerHTML = '';
            projects.forEach(project => {
                renderProjectCard(project);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            skills: document.getElementById('skills').value,
            contact: document.getElementById('contact').value,
            members_needed: document.getElementById('members').value
        };

        if (editingProjectId) {
            try {
                const response = await fetch(`/api/projects/${editingProjectId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(projectData)
                });
                if (response.ok) {
                    editingProjectId = null;
                    submitBtn.textContent = "Share Project";
                    submitBtn.style.backgroundColor = "#2563eb";
                    fetchProjects();
                    projectForm.reset();
                }
            } catch (error) {
                console.error('Error updating project:', error);
            }
        } else {
            try {
                const response = await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(projectData)
                });
                if (response.ok) {
                    fetchProjects();
                    projectForm.reset();
                }
            } catch (error) {
                console.error('Error creating project:', error);
            }
        }
    });

    function renderProjectCard(project) {
        const card = document.createElement('div');
        card.classList.add('project-card');

        const skillsArray = project.skills.split(',').map(s => s.trim());
        let tagsHTML = '';
        skillsArray.forEach(skill => {
            if(skill) tagsHTML += `<span class="tag">${skill}</span>`;
        });

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h3>${project.title}</h3>
                <span class="tag" style="background-color: #dbeafe; color: #1e40af; font-weight: bold;">
                     ${project.members_needed} needed
                </span>
            </div>
            <p style="margin-top: 0.5rem;">${project.description}</p>
            <div class="tags">${tagsHTML}</div>
            <div style="margin-top: 1rem; font-size: 0.9rem; color: #475569; display: flex; justify-content: space-between; align-items: center;">
                <div> <strong>Contact:</strong> <a href="mailto:${project.contact}" class="contact-link">${project.contact}</a></div>
                <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                    <button class="edit-btn" style="background: none; border: none; color: #2563eb; cursor: pointer; font-weight: bold;">Edit</button>
                    <button class="delete-btn" style="background: none; border: none; color: #ef4444; cursor: pointer; font-weight: bold;"> Delete</button>
                </div>
            </div>
        `;

        card.querySelector('.delete-btn').addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete this project?")) {
                const response = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
                if (response.ok) fetchProjects();
            }
        });

        card.querySelector('.edit-btn').addEventListener('click', () => {
            document.getElementById('title').value = project.title;
            document.getElementById('description').value = project.description;
            document.getElementById('skills').value = project.skills;
            document.getElementById('contact').value = project.contact;
            document.getElementById('members').value = project.members_needed;

            editingProjectId = project.id;
            submitBtn.textContent = "Update Project Details";
            submitBtn.style.backgroundColor = "#10b981";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        projectFeed.appendChild(card);
    }
});