const statusData = {
  level: 'Lv. 1,000,000',
  progress: 55,
  points: 0,
};

const dialogMessage = '木を植えたから、森がちょっと元気になったよ！';

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

function typeDialogText(text, target, interval = 35) {
  if (!target) return;
  target.textContent = '';
  let index = 0;
  const timer = setInterval(() => {
    target.textContent += text[index] || '';
    index += 1;
    if (index > text.length) {
      clearInterval(timer);
    }
  }, interval);
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

  const dialogText = document.querySelector('.dialog-text');
  if (dialogText) {
    typeDialogText(dialogMessage, dialogText, 32);
  }

  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const pageName = button.getAttribute('data-page');
      switchPage(pageName);
    });
  });
});
