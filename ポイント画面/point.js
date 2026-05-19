const statusData = {
  level: 'Lv. 1,000,000',
  count: '5/9匹',
  points: 0, // 初期ポイント（ミッション完了時に20ずつ増加）
};

// ミッションデータ (id: 0 が ラベル・キャップを剥がす)
const missions = [
  { id: 0, title: 'ラベル・キャップを剥がす', current: 0, max: 1, completed: false },
  { id: 1, title: 'ゴミを持ち帰る', current: 2, max: 5, completed: false },
  { id: 2, title: 'マイバッグを使う', current: 0, max: 1, completed: false },
  { id: 3, title: 'マイボトル持参', current: 1, max: 3, completed: false },
];

// UI更新関数
function updateUI() {
  const progressFill = document.querySelector('.progress-fill');
  const progressBar = document.querySelector('.progress-bar');
  const pointsText = document.querySelector('.points');
  const levelText = document.querySelector('.level-info span:first-child');

  const { level, progressPercent, pointsInLevel, req } = computeLevelFromPoints(statusData.points);

  if (levelText) {
    levelText.textContent = `Lv. ${level}`;
  }

  if (progressFill) {
    progressFill.style.width = `${progressPercent}%`;
  }
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', String(Math.round(progressPercent)));
  }
  if (pointsText) {
    pointsText.textContent = `ポイント: ${pointsInLevel}`;
  }
  updateMissionDisplay();
}

function notifyBadgeStateChanged() {
  if (window.parent && window.parent !== window) {
    try {
      window.parent.dispatchEvent(new Event('badgeStateChange'));
    } catch (e) {
      console.warn('badgeStateChange イベントの送信に失敗しました', e);
      try {
        window.parent.postMessage({ type: 'badgeStateChange' }, '*');
      } catch (err) {
        console.warn('postMessageによる通知にも失敗しました', err);
      }
    }
  }
}

function computeLevelFromPoints(points) {
  let level = 1;
  let req = 50; 
  let remaining = points;

  while (remaining >= req) {
    remaining -= req;
    level += 1;
    req += 50; 
  }

  const progressPercent = req > 0 ? (remaining / req) * 100 : 0;
  const pointsInLevel = remaining;
  return { level, progressPercent, pointsInLevel, req };
}

function updateMissionDisplay() {
  const missionItems = document.querySelectorAll('.mission-item');
  missionItems.forEach((item, idx) => {
    if (missions[idx]) {
      const meta = item.querySelector('.mission-meta');
      if (meta) {
        meta.textContent = `進捗: ${missions[idx].current}/${missions[idx].max}`;
        if (missions[idx].current >= missions[idx].max) {
          item.classList.add('completed');
        } else {
          item.classList.remove('completed');
        }
      }
      
      let controls = item.querySelector('.mission-controls');
      if (missions[idx].current > 0) {
        if (!controls) {
          controls = document.createElement('div');
          controls.className = 'mission-controls';
          item.appendChild(controls);
        }
        controls.innerHTML = `<button class="mission-undo-btn" type="button"> 取り消す</button>`;
        const undoBtn = controls.querySelector('.mission-undo-btn');
        undoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          undoMission(idx);
        });
      } else if (controls) {
        controls.remove();
      }
    }
  });
}

function undoMission(idx) {
  if (missions[idx] && missions[idx].current > 0) {
    missions[idx].current -= 1;
    
    if (missions[idx].completed) {
      missions[idx].completed = false;
      statusData.points -= 20;

      // 【確実な判定】IDが0番（ラベル剥がし）ならバッジ記憶を消す
      if (missions[idx].id === 0) {
        localStorage.removeItem('badge_label_clear');
        notifyBadgeStateChanged();
        console.log('ラベル剥がしバッジを未達成に戻しました');
      }
    }
    updateUI();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const currentUser = (() => {
    try {
      return localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    } catch (e) {
      return null;
    }
  })();

  if (!currentUser) {
    location.href = '../全体/ログイン機能/signin.html';
    return;
  }

  if (window.UsernameDisplay) {
    window.UsernameDisplay.renderAll();
  }

  updateUI();

  const missionBtn = document.querySelector('.mission-button');
  if (missionBtn) {
    const missionContent = document.querySelector('.mission-content');
    const missionCaret = missionBtn.querySelector('.mission-caret');
    missionBtn.addEventListener('click', () => {
      const expanded = missionBtn.getAttribute('aria-expanded') === 'true';
      missionBtn.setAttribute('aria-expanded', String(!expanded));
      if (missionContent) {
        if (expanded) {
          missionContent.classList.remove('open');
          setTimeout(() => missionContent.setAttribute('hidden', ''), 300);
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

  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards && featureCards.length) {
    featureCards.forEach((btn, idx) => {
      const label = btn.querySelector('.feature-label')?.textContent || `カード ${idx + 1}`;
      const key = `feature_clicked_${label.replace(/\s+/g, '_')}`;

      const today = new Date().toISOString().slice(0, 10);
      try {
        if (localStorage.getItem(key) === today) {
          btn.classList.add('clicked-today');
          btn.disabled = true;
        }
      } catch (e) {
        console.warn('localStorage unavailable', e);
      }

      btn.addEventListener('click', () => {
        if (btn.disabled || btn.classList.contains('clicked-today')) {
          alert('このカテゴリは今日既に受け取り済みです。');
          return;
        }

        statusData.points += 10;
        updateUI();

        try {
          localStorage.setItem(key, today);
        } catch (e) {
          console.warn('localStorage set failed', e);
        }
        btn.classList.add('clicked-today');
        btn.disabled = true;
      });
    });
  }

  // ミッション項目クリック時の更新処理
  const missionItems = document.querySelectorAll('.mission-item');
  missionItems.forEach((item, idx) => {
    if (missions[idx]) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', (e) => {
        if (e.target.closest('.mission-undo-btn')) return;
        
        const mission = missions[idx];
        if (mission.current < mission.max) {
          mission.current += 1;
          
          if (mission.current >= mission.max && !mission.completed) {
            mission.completed = true;
            statusData.points += 20;

            // 【確実な判定】IDが0番（ラベル剥がし）ならバッジ記憶を保存！
            if (mission.id === 0) {
              try {
                localStorage.setItem('badge_label_clear', 'true');
                notifyBadgeStateChanged();
                console.log('localStorageに badge_label_clear: true を保存しました！');
              } catch (e) {
                console.warn('localStorage set failed', e);
              }
            }
          }
          updateUI();
        }
      });
    }
  });
});