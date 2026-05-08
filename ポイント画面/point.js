const statusData = {
  level: 'Lv. 1,000,000',
  count: '5/9匹',
  progress: 55,
  points: 0, // 初期ポイント（ミッション完了時に20ずつ増加）
};

// ミッションデータ
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
  if (progressFill) {
    progressFill.style.width = `${statusData.progress}%`;
  }
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', String(statusData.progress));
  }
  if (pointsText) {
    pointsText.textContent = `ポイント: ${statusData.points}`;
  }
  updateMissionDisplay();
}

// ミッション表示を更新
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
      
      // 取り消しボタンの管理
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

// ミッション進捗を元に戻す
function undoMission(idx) {
  if (missions[idx] && missions[idx].current > 0) {
    missions[idx].current -= 1;
    console.log(`${missions[idx].title}: 取り消し → ${missions[idx].current}/${missions[idx].max}`);
    
    // 完了状態を解除
    if (missions[idx].completed) {
      missions[idx].completed = false;
      statusData.points -= 20;
      statusData.progress = Math.max(statusData.progress - 5, 0);
      console.log(`ミッション取り消し -20ポイント (合計: ${statusData.points})`);
    }
    updateUI();
  }
}

window.addEventListener('DOMContentLoaded', () => {
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

  // ミッションボタンのクリック挙動
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
          // keep hidden attribute to support initial state
          setTimeout(() => missionContent.setAttribute('hidden', ''), 300);
        } else {
          missionContent.removeAttribute('hidden');
          // allow next tick for transition
          requestAnimationFrame(() => missionContent.classList.add('open'));
        }
      }
      if (missionCaret) {
        missionCaret.style.transform = expanded ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  }

  // 3x3 の feature-card にイベントを付与
  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards && featureCards.length) {
    featureCards.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const label = btn.querySelector('.feature-label')?.textContent || `カード ${idx + 1}`;
        console.log(`${label} がクリックされました`);
        alert(`${label} を開きます`);
      });
    });
  }

  // ミッション項目クリック時に進捗を更新
  const missionItems = document.querySelectorAll('.mission-item');
  missionItems.forEach((item, idx) => {
    if (missions[idx]) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', (e) => {
        // 取り消しボタンのクリックは除外
        if (e.target.closest('.mission-undo-btn')) return;
        
        const mission = missions[idx];
        if (mission.current < mission.max) {
          mission.current += 1;
          console.log(`${mission.title}: ${mission.current}/${mission.max}`);
          
          // 完了時にポイント加算
          if (mission.current >= mission.max && !mission.completed) {
            mission.completed = true;
            statusData.points += 20;
            statusData.progress = Math.min(statusData.progress + 5, 100);
            console.log(`ミッション完了！ +20ポイント (合計: ${statusData.points})`);
          }
          updateUI();
        }
      });
    }
  });
}); 