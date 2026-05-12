const statusData = {
  level: 'Lv. 1,000,000',
  count: '5/9匹',
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
  const levelText = document.querySelector('.level-info span:first-child');

  // 計算：ポイントからレベルと次レベルへの進捗を算出
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
    // 現在レベル内でのポイント表示（レベルアップで 0 になる）
    pointsText.textContent = `ポイント: ${pointsInLevel}`;
  }
  updateMissionDisplay();
}

// ポイントから現在レベルと次レベルへの進捗(%)を計算する
function computeLevelFromPoints(points) {
  let level = 1;
  let req = 50; // レベル1から次に上がるための必要ポイント
  let remaining = points;

  while (remaining >= req) {
    remaining -= req;
    level += 1;
    req += 50; // 次のレベルは前の必要ポイントに+50
  }

  const progressPercent = req > 0 ? (remaining / req) * 100 : 0;
  // remaining は「現在のレベルで獲得しているポイント」になる
  const pointsInLevel = remaining;
  return { level, progressPercent, pointsInLevel, req };
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
      console.log(`ミッション取り消し -20ポイント (合計: ${statusData.points})`);
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
    location.href = '../サインイン・サインアップ画面/signin.html';
    return;
  }

  // 現在ログインしているユーザー名を表示（localStorage.users から取得）
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userObj = users.find(u => u.email === currentUser);
    const displayName = (userObj && userObj.username) ? userObj.username : currentUser;
    const userNameEl = document.querySelector('.user-name');
    if (userNameEl) userNameEl.textContent = displayName;
  } catch (e) {
    // ignore
  }

  const levelText = document.querySelector('.level-info span:first-child');
  const pointsText = document.querySelector('.points');
  const progressBar = document.querySelector('.progress-bar');
  const progressFill = document.querySelector('.progress-fill');

  // 初期 UI をポイント基準で描画
  updateUI();

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
      const label = btn.querySelector('.feature-label')?.textContent || `カード ${idx + 1}`;
      const key = `feature_clicked_${label.replace(/\s+/g, '_')}`;

      // 初期化: 既に今日クリック済みなら見た目と disabled を設定
      const today = new Date().toISOString().slice(0, 10);
      try {
        if (localStorage.getItem(key) === today) {
          btn.classList.add('clicked-today');
          btn.disabled = true;
        }
      } catch (e) {
        // localStorage が使えない環境ではフォールバックして何もしない
        console.warn('localStorage unavailable', e);
      }

      btn.addEventListener('click', () => {
        // 押下済み/disabledなら処理しない
        if (btn.disabled || btn.classList.contains('clicked-today')) {
          alert('このカテゴリは今日既に受け取り済みです。');
          return;
        }

        // 10ポイント加算
        statusData.points += 10;
        updateUI();

        // 今日としてマークして保存
        try {
          localStorage.setItem(key, today);
        } catch (e) {
          console.warn('localStorage set failed', e);
        }
        btn.classList.add('clicked-today');
        btn.disabled = true;

        // ユーザーフィードバック
        console.log(`${label} で +10ポイント (合計: ${statusData.points})`);
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
            console.log(`ミッション完了！ +20ポイント (合計: ${statusData.points})`);
          }
          updateUI();
        }
      });
    }
  });
}); 