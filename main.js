// Load portfolio data and render
fetch('portfolio.json')
  .then(res => res.json())
  .then(data => {
    renderBio(data.bio);
    renderProjects(data.projects);
    renderContact(data.contact);
  });

function renderBio(bio) {
  const header = document.querySelector('.header');
  header.innerHTML = `
    <img src="${bio.avatar}" alt="Avatar">
    <h1>${bio.name}</h1>
    <p>${bio.title}</p>
    <p>${bio.description}</p>
  `;
}

function renderProjects(projects) {
  const section = document.querySelector('.projects');
  section.innerHTML = projects.map(project => `
    <div class="project">
      <img src="${project.image}" alt="${project.title}">
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <a href="${project.link}" target="_blank">View Project</a>
    </div>
  `).join('');
}

function renderContact(contact) {
  const section = document.querySelector('.contact');
  section.innerHTML = `
    <a href="mailto:${contact.email}">${contact.email}</a>
    <a href="${contact.linkedin}" target="_blank">LinkedIn</a>
    <a href="${contact.github}" target="_blank" class="github">GitHub</a>
  `;
}
