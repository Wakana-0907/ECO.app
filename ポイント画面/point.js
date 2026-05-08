// --- あなたが送ってくれた元のコード（変更なし） ---
const statusData = {
  level: 'Lv. 1,000,000',
  count: '5/9匹',
  progress: 55,
};

// --- 他の部分用のデータ（なぞって作成） ---
const otherData = {
    missionLabel: 'ミッション',
    pointTitle: 'マイポイント B',
    history: [
        { label: 'プラ (〇〇) 取得', date: '2026/05/08', value: '+100' },
        { label: 'デイリーログイン', date: '2026/05/07', value: '+50' },
        { label: 'ミッションクリア', date: '2026/05/06', value: '+200' }
    ]
};

window.addEventListener('DOMContentLoaded', () => {
  // --- 既存の反映ロジック ---
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

  // ---  ---
  
  // ミッションラベルの反映
  const missionHeader = document.querySelector('.mission-card h2');
  if (missionHeader) {
      missionHeader.textContent = otherData.missionLabel;
  }

  // ポイントタイトルの反映
  const pTitle = document.querySelector('.point-list-container h3');
  if (pTitle) {
      pTitle.textContent = otherData.pointTitle;
  }

  // 履歴リストの生成
  const historyList = document.getElementById('point-list');
  if (historyList) {
      historyList.innerHTML = otherData.history.map(item => `
          <div class="history-item">
              <div class="history-left">
                  <div>${item.label}</div>
                  <small>${item.date}</small>
              </div>
              <div class="history-right">${item.value} P</div>
          </div>
      `).join('');
  }
});