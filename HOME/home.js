const statusData = {
  level: 'Lv. 1,000,000',
  progress: 55,
  points: 0,
};

function updateStatusCard() {
  const levelText = document.querySelector('.level-info span:first-child');
  const pointsText = document.querySelector('.points');
  const progressBar = document.querySelector('.progress-bar');
  const progressFill = document.querySelector('.progress-fill');

  if (levelText) {
    levelText.textContent = statusData.level;
  }

  if (pointsText) {
    pointsText.textContent = `ポイント: ${statusData.points}`;
  }

  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', String(statusData.progress));
  }

  if (progressFill) {
    progressFill.style.width = `${statusData.progress}%`;
  }
}

function switchPage(pageName) {
  const pages = document.querySelectorAll('.page-content');
  const tabs = document.querySelectorAll('.tab-button');

  pages.forEach(page => {
    page.classList.remove('active');
  });

  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-page') === pageName) {
      tab.classList.add('active');
    }
  });

  const targetPage = document.querySelector(`.page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  updateStatusCard();

  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const pageName = button.getAttribute('data-page');
      switchPage(pageName);
    });
  });
});
