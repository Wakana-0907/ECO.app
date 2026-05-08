const statusData = {
  level: 'Lv. 1,000,000',
  count: '5/9匹',
  progress: 55,
};

window.addEventListener('DOMContentLoaded', () => {
  const levelText = document.querySelector('.level-info span:first-child');
  const countText = document.querySelector('.count');
  const progressBar = document.querySelector('.progress-bar');
  const progressFill = document.querySelector('.progress-fill');

  if (levelText) {
    levelText.textContent = statusData.level;
  }

  if (countText) {
    countText.textContent = statusData.count;
  }

  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', String(statusData.progress));
  }

  if (progressFill) {
    progressFill.style.width = `${statusData.progress}%`;
  }
});
