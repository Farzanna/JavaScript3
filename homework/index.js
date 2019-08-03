'use strict';

{
  function fetchJSON(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'json';
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status <= 299) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Network error: ${xhr.status} - ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network request failed'));
      xhr.send();
    });
  }

  function createAndAppend(name, parent, options = {}) {
    const elem = document.createElement(name);
    parent.appendChild(elem);
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (key === 'text') {
        elem.textContent = value;
      } else {
        elem.setAttribute(key, value);
      }
    });
    return elem;
  }

  function clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  function renderError(err) {
    const root = document.getElementById('root');
    createAndAppend('div', root, { text: err.message, class: 'alert-error' });
  }

  function addRow(tbody, label, value = '') {
    const row = createAndAppend('tr', tbody);
    createAndAppend('td', row, { text: `${label} :`, class: 'label' });
    createAndAppend('td', row, { text: value });
    return row;
  }

  function createInfoList(repository, container) {
    clearContainer(container);
    const table = createAndAppend('table', container);
    const tbody = createAndAppend('tbody', table);
    const firstRow = addRow(tbody, 'Repository');
    createAndAppend('a', firstRow.lastChild, {
      href: repository.html_url,
      target: '_blank',
      text: repository.name,
    });
    addRow(tbody, 'Description:', repository.description);
    addRow(tbody, 'Forks:', repository.forks);
    addRow(tbody, 'Updated:', new Date(repository.updated_at).toLocaleString());
  }

  function createContributorsList(repository, ul) {
    clearContainer(ul);
    fetchJSON(repository.contributors_url)
      .then(contributors =>
        contributors.forEach(contributor => {
          const li = createAndAppend('li', ul);
          const a = createAndAppend('a', li, {
            href: repository.html_url,
            target: '_blank',
            id: 'link_contributions',
          });
          const div = createAndAppend('div', a);
          createAndAppend('img', div, {
            class: 'contributor_avatar',
            src: contributor.avatar_url,
            alt: contributor.login,
          });
          createAndAppend('p', div, { id: 'p1', text: contributor.login });
          createAndAppend('p', div, { id: 'p2', text: contributor.contributions });
        }),
      )
      .catch(err => renderError(err));
  }

  function startPage(repository, listContainer, ul) {
    createContributorsList(repository, listContainer);
    createInfoList(repository, ul);
  }

  function main(url) {
    const root = document.getElementById('root');
    const header = createAndAppend('header', root);
    const section = createAndAppend('section', root);
    createAndAppend('h1', header, { text: 'HYF Repositories' });
    const table = createAndAppend('div', section, { id: 'repo_information_table_container' });
    const select = createAndAppend('select', header);
    const listContainer = createAndAppend('ul', section, {
      id: 'Contributors_list',
      text: 'contributions',
    });
    fetchJSON(url)
      .then(repositories => {
        repositories
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((repository, index) => {
            createAndAppend('option', select, { text: repository.name, value: index });
          });
        startPage(repositories[0], listContainer, table);
        select.addEventListener('change', () => {
          clearContainer(table);
          clearContainer(listContainer);
          const repositoryData = repositories[select.value];
          startPage(repositoryData, listContainer, table);
        });
      })
      .catch(err => renderError(err));
  }

  const HYF_REPOS_URL = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';
  window.onload = () => main(HYF_REPOS_URL);
}