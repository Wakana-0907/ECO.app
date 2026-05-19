const statusData = {
  level: 'Lv. 1,000,000',
  count: '5/9匹',
  points: 0, // 初期ポイント（ミッション完了時に20ずつ増加）
};

// ミッションデータ (id: 0 が ラベル・キャップを剥がす)
const missions = [
  { id: 0, title: 'ラベル・キャップを剥がす', current: 0, max: 1, completed: false },
  { id: 1, title: 'ゴミを持ち帰る', current: 0, max: 5, completed: false },
  { id: 2, title: 'マイバッグを使う', current: 0, max: 1, completed: false },
  { id: 3, title: 'マイボトル持参', current: 0, max: 3, completed: false },
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
  // 同期: 現在のポイント/レベルを localStorage に保存してホーム等と共有
    try {
    const key = (typeof storageKey === 'function') ? storageKey('ECO_status') : 'ECO_status';
    const payload = {
      level,
      progressPercent,
      points: statusData.points,
      pointsInLevel,
    };
    localStorage.setItem(key, JSON.stringify(payload));
    // ミッション進捗も保存
    try { localStorage.setItem(key.replace('ECO_status', 'ECO_missions'), JSON.stringify(missions)); } catch(e){}
    // 親フレームへ即時通知（iframe -> parent）
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'ECO_status_update', payload }, '*');
      }
    } catch (e) {
      console.warn('postMessage failed', e);
    }
  } catch (e) {
    console.warn('localStorage set failed', e);
  }
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
    // 取り消したらその日のクリックロックを解除して再度押せるようにする
      try {
        // 現在のログインユーザーに紐づくキーと従来キーの両方を削除
        const currentUser = (() => {
          try { return localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'); } catch (e) { return null; }
        })();
        const namespaced = currentUser ? `mission_clicked_${missions[idx].id}_${currentUser}` : null;
        const legacy = `mission_clicked_${missions[idx].id}`;
        if (namespaced) localStorage.removeItem(namespaced);
        localStorage.removeItem(legacy);
      } catch (e) {
        console.warn('localStorage remove failed', e);
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

  // ストレージキー作成 helper（ユーザー毎にデータを分離）
  const storageKey = (base) => currentUser ? `${base}_${currentUser}` : base;

  // 以前のセッションがあればミッション進捗を復元
  try {
    const saved = localStorage.getItem(storageKey('ECO_missions')) || localStorage.getItem('ECO_missions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // 上書き（既定の missions 構造を維持しつつ current/max/completed を復元）
        parsed.forEach((s) => {
          const idx = missions.findIndex(m => m.id === s.id);
          if (idx !== -1) {
            missions[idx].current = typeof s.current === 'number' ? s.current : missions[idx].current;
            missions[idx].completed = !!s.completed;
          }
        });
      }
    }
  } catch (e) {
    console.warn('restore missions failed', e);
  }

  // 以前のセッションがあればポイント等の状態を復元
  try {
    const key = storageKey ? storageKey('ECO_status') : 'ECO_status';
    const raw = localStorage.getItem(key) || localStorage.getItem('ECO_status');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.points === 'number') {
        statusData.points = parsed.points;
      }
    }
  } catch (e) {
    console.warn('restore ECO_status failed', e);
  }

  // --- 一時リセット: 今回だけカテゴリの「今日フラグ」を消して押せるようにする ---
  try {
    if (!sessionStorage.getItem('feature_reset_done')) {
      const today = new Date().toISOString().slice(0, 10);
      document.querySelectorAll('.feature-card').forEach((el) => {
        const label = el.querySelector('.feature-label')?.textContent || '';
        const base = `feature_clicked_${label.replace(/\s+/g, '_')}`;
        const namespaced = storageKey ? storageKey(base) : base;
        const legacy = base;
        try {
          if (localStorage.getItem(namespaced) === today) localStorage.removeItem(namespaced);
        } catch (e) {}
        try {
          if (localStorage.getItem(legacy) === today) localStorage.removeItem(legacy);
        } catch (e) {}
        el.classList.remove('clicked-today');
      });
      sessionStorage.setItem('feature_reset_done', '1');
    }
  } catch (e) {
    console.warn('feature reset failed', e);
  }

  

  const levelText = document.querySelector('.level-info span:first-child');
  const pointsText = document.querySelector('.points');
  const progressBar = document.querySelector('.progress-bar');
  const progressFill = document.querySelector('.progress-fill');

  // 初期 UI をポイント基準で描画devnata
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
      const key = storageKey ? storageKey(`feature_clicked_${label.replace(/\s+/g, '_')}`) : `feature_clicked_${label.replace(/\s+/g, '_')}`;

      const today = new Date().toISOString().slice(0, 10);
      try {
        if (localStorage.getItem(key) === today) {
          btn.classList.add('clicked-today');
        }
      } catch (e) {
        console.warn('localStorage unavailable', e);
      }

      // 特有の取り消しボタンを作るユーティリティ
      const createFeatureUndo = (el, storKey, labelText) => {
        // 既にコントロールがあれば返す
        if (el.querySelector('.feature-controls')) return;
        const controls = document.createElement('div');
        controls.className = 'feature-controls';
        const undoBtn = document.createElement('button');
        undoBtn.type = 'button';
        undoBtn.className = 'feature-undo-btn';
        undoBtn.textContent = '取り消す';
        undoBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          // ポイントを戻す
          statusData.points = Math.max(0, statusData.points - 10);
          // localStorage のキーを総当たりで削除
          try {
            const baseKey = storKey.replace(/_\d{4}-\d{2}-\d{2}$/, '');
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (!k) continue;
              if (k === baseKey || k.startsWith(baseKey + '_') || k.indexOf(baseKey) === 0) {
                keysToRemove.push(k);
              }
            }
            keysToRemove.forEach(k => { try { localStorage.removeItem(k); } catch(e) {} });
          } catch (e) { console.warn('localStorage remove failed', e); }
          el.classList.remove('clicked-today');
          controls.remove();
          updateUI();
          console.log(`${labelText} の取り消し -10ポイント (合計: ${statusData.points})`);
        });
        controls.appendChild(undoBtn);
        // 見た目: ラベルの直下に配置する（可能ならラベル要素の直後）
        const labelElForInsert = el.querySelector('.feature-label');
        if (labelElForInsert && labelElForInsert.parentNode) {
          labelElForInsert.insertAdjacentElement('afterend', controls);
        } else {
          controls.style.marginTop = '8px';
          el.appendChild(controls);
        }
      };

      // 初期化時に既に今日クリック済みであれば取り消しボタンを表示する
      if (btn.classList.contains('clicked-today')) {
        try { createFeatureUndo(btn, key, label); } catch (e) { console.warn('createFeatureUndo init failed', e); }
      }

      // 通常のクリック処理（既にクリック済みなら再クリックは拒否、代わりに取り消しボタンを表示）
      btn.addEventListener('click', () => {
        if (btn.disabled || btn.classList.contains('clicked-today')) {
          alert('このカテゴリは今日既に受け取り済みです。取り消す場合は「取り消す」ボタンを押してください。');
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

        // 今日としてマークして保存
        try { localStorage.setItem(key, today); } catch (e) { console.warn('localStorage set failed', e); }
        // 取り消しボタンを表示
        createFeatureUndo(btn, key, label);

        console.log(`${label} で +10ポイント (合計: ${statusData.points})`);
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
        const key = storageKey ? storageKey(`mission_clicked_${mission.id}`) : `mission_clicked_${mission.id}`;
        const today = new Date().toISOString().slice(0, 10);

        // 日次クリック制限: 同じ日なら押せない
        try {
          if (localStorage.getItem(key) === today) {
            alert('このミッションは今日既に進めました。');
            return;
          }
        } catch (e) {
          console.warn('localStorage get failed', e);
        }

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
            console.log(`ミッション完了！ ${mission.title} を達成しました。 +20ポイント (合計: ${statusData.points})`);
            try { if (typeof saveState === 'function') saveState(); } catch(e){}
          } else {
            console.log(`${mission.title}: ${mission.current}/${mission.max}`);
          }

          // 日次ロックをセット
          try { localStorage.setItem(key, today); } catch (e) { console.warn('localStorage set failed', e); }

          updateUI();
        }
      });
    }
  });
});