const statusData = {
  level: 'Lv. 1',
  progress: 0,
  // レベル内の現在ポイント / 必要ポイント
  pointsInLevel: 0,
  pointsReq: 50,
};

const dialogMessage = '木を◯本植えたのと同じ量のCO₂を削減したよ！';

function updateStatusCard() {
  const levelText = document.querySelector('.level-info span:first-child');
  const pointsText = document.querySelector('.points');
  const progressBar = document.querySelector('.progress-bar');
  const progressFill = document.querySelector('.progress-fill');

  if (levelText) {
    levelText.textContent = statusData.level;
  }

  if (pointsText) {
    pointsText.textContent = `ポイント: ${statusData.pointsInLevel}/${statusData.pointsReq}`;
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

function getPageElement(pageIdentifier) {
  const byClass = document.querySelector(`.page-${pageIdentifier}`);
  if (byClass) {
    return byClass;
  }

  const byFile = document.querySelector(`.page-content[data-file="${pageIdentifier}"]`);
  if (byFile) {
    return byFile;
  }

  const pages = document.querySelectorAll('.page-content');
  return Array.from(pages).find(page => {
    const placeholder = page.querySelector('.placeholder');
    return placeholder && placeholder.textContent.trim() === pageIdentifier;
  }) || null;
}

function switchPage(pageName) {
  const pages = document.querySelectorAll('.page-content');
  const tabs = document.querySelectorAll('.tab-button');

  pages.forEach(page => {
    page.classList.remove('active');
  });

  tabs.forEach(tab => {
    const tabPage = tab.getAttribute('data-page');
    const isActive = tabPage === pageName || tabPage === pageName.replace('.html', '');
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  const targetPage = getPageElement(pageName);
  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
  if (!currentUser) {
    location.href = '../全体/ログイン機能/signin.html';
    return;
  }

  updateStatusCard();

  // ミッション iframe からのステータス更新を受け取りホーム側に即時反映
  window.addEventListener('message', (ev) => {
    const data = ev.data || {};
    if (data && data.type === 'missionStatus') {
      try {
        statusData.level = `Lv. ${data.level}`;
        statusData.pointsInLevel = Number(data.pointsInLevel) || 0;
        statusData.pointsReq = Number(data.req) || statusData.pointsReq;
        statusData.progress = Number(data.progressPercent) || statusData.progress;
        updateStatusCard();
      } catch (e) {
        console.warn('invalid missionStatus message', e);
      }
    }
  });

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

  const missionButton = document.querySelector('.mission-button');
  if (missionButton) {
    const missionContent = document.querySelector('.mission-content');
    const missionCaret = missionButton.querySelector('.mission-caret');

    missionButton.addEventListener('click', () => {
      const expanded = missionButton.getAttribute('aria-expanded') === 'true';
      missionButton.setAttribute('aria-expanded', String(!expanded));

      if (missionContent) {
        if (expanded) {
          missionContent.classList.remove('open');
          setTimeout(() => missionContent.setAttribute('hidden', ''), 200);
        } else {
          missionContent.removeAttribute('hidden');
          requestAnimationFrame(() => missionContent.classList.add('open'));
        }
      }

      if (missionCaret) {
        missionCaret.style.transform = expanded ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  }
});
