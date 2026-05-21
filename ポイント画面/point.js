const statusData = {
  level: 'Lv. 1',
  count: '0/50', // 例: "20/50" の形式で表示（現在ポイント/次レベルまでの必要ポイント）
  points: 0, // 初期ポイント（ミッション完了時に20ずつ増加）
};

// ミッションデータ (id: 0 が ラベル・キャップを剥がす)
const missions = [
  { id: 0, title: 'ラベル・キャップを剥がす', current: 0, max: 1, completed: false },
  { id: 1, title: 'ゴミを持ち帰る', current: 0, max: 5, completed: false },
  { id: 2, title: 'マイバッグを使う', current: 0, max: 1, completed: false },
  { id: 3, title: 'マイボトル持参', current: 0, max: 3, completed: false },
];

// ヘルパー: 日付/週開始を扱う
function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function getWeekStart(date) {
  // 週開始を日曜日に設定 (日曜をその週の開始とする)
  const d = new Date(date);
  const day = d.getDay(); // 日曜=0
  d.setDate(d.getDate() - day);
  return formatDate(d);
}

function saveMissionState(idx) {
  try {
    localStorage.setItem(`mission_current_${idx}`, String(missions[idx].current));
    localStorage.setItem(`mission_completed_${idx}`, missions[idx].completed ? '1' : '0');
  } catch (e) {
    // ignore
  }
}

function loadMissionState(idx) {
  try {
    const cur = localStorage.getItem(`mission_current_${idx}`);
    const done = localStorage.getItem(`mission_completed_${idx}`);
    if (cur !== null) missions[idx].current = Number(cur);
    if (done !== null) missions[idx].completed = done === '1';
  } catch (e) {
    // ignore
  }
}

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

    // 現在レベル内でのポイント表示（形式: 現在/必要）
    pointsText.textContent = `ポイント: ${pointsInLevel}/${req}`;
  }
  updateMissionDisplay();

  // 親フレーム（ホーム）へ現在ステータスを送信して即時反映を促す
  try {
    const msg = {
      type: 'missionStatus',
      level: level,
      pointsInLevel: pointsInLevel,
      req: req,
      progressPercent: progressPercent,
    };
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(msg, '*');
    }
  } catch (e) {

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
      

      // 取り消しボタンの管理 — タイトル下に挿入

      let controls = item.querySelector('.mission-controls');
      const titleElem = item.querySelector('.mission-title');
      if (missions[idx].current > 0) {
        if (!controls) {
          controls = document.createElement('div');
          controls.className = 'mission-controls';
          controls.style.marginTop = '6px';
          controls.style.fontSize = '0.9rem';
          // タイトル要素の直後に挿入
          if (titleElem && titleElem.parentNode) {
            titleElem.insertAdjacentElement('afterend', controls);
          } else {
            item.appendChild(controls);
          }
        }
        controls.innerHTML = `<button class="mission-undo-btn" type="button">取り消す</button>`;
        const undoBtn = controls.querySelector('.mission-undo-btn');
        // イベントの多重登録を防ぐため既存 handler を取り除き再登録
        undoBtn.replaceWith(undoBtn.cloneNode(true));
        const newBtn = item.querySelector('.mission-undo-btn');
        newBtn.addEventListener('click', (e) => {
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
    // 取り消しは当日に行った操作だけ許可する（今日のキーがある場合）
    const today = formatDate(new Date());
    const dailyKey = `mission_taken_${idx}`;
    try {
      const taken = localStorage.getItem(dailyKey);
      if (taken && taken !== today) {
        alert('本日の操作ではありません。取り消せません。');
        return;
      }
    } catch (e) {
      // localStorage が使えない場合は取り消しを許可
    }

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

    // 当日の操作フラグをクリア
    try {
      localStorage.removeItem(dailyKey);
    } catch (e) {}

    // 保存
    saveMissionState(idx);

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

  

  const levelText = document.querySelector('.level-info span:first-child');
  const pointsText = document.querySelector('.points');
  const progressBar = document.querySelector('.progress-bar');
  const progressFill = document.querySelector('.progress-fill');

  // 初期 UI をポイント基準で描画devnata
  updateUI();

  // --- 週次リセットとミッション状態の読み込み ---
  try {
    const storedWeek = localStorage.getItem('missions_week_start');
    const thisWeek = getWeekStart(new Date());
    if (storedWeek !== thisWeek) {
      // 新しい週なので各ミッションのカウントをリセット
      missions.forEach((m, idx) => {
        m.current = 0;
        m.completed = false;
        saveMissionState(idx);
        try {
          localStorage.removeItem(`mission_taken_${idx}`);
        } catch (e) {}
      });
      localStorage.setItem('missions_week_start', thisWeek);
    } else {
      // 同じ週なら保存された状態を読み込む
      missions.forEach((m, idx) => loadMissionState(idx));
    }
  } catch (e) {
    console.warn('mission weekly init failed', e);
  }

  // ミッションボタンのクリック挙動
      const labelElem = btn.querySelector('.feature-label');
      const rawLabel = (labelElem?.textContent || `カード ${idx + 1}`);
      const label = rawLabel.trim();
      const key = `feature_clicked_${label.replace(/\s+/g, '_')}`;
      const today = new Date().toISOString().slice(0, 10);

      // ヘルパー: feature の取り消しコントロールを作る
      function ensureFeatureControls() {
        let controls = btn.querySelector('.feature-controls');
        if (!controls) {
          controls = document.createElement('div');
          controls.className = 'feature-controls';
          controls.style.marginTop = '6px';
          controls.style.width = '100%';
          controls.style.display = 'flex';
          controls.style.justifyContent = 'center';
          if (labelElem && labelElem.parentNode) {
            labelElem.insertAdjacentElement('afterend', controls);
          } else {
            btn.appendChild(controls);
          }
        }
        return controls;
      }

      function createUndoButton() {
        const controls = ensureFeatureControls();
        controls.innerHTML = `<button class="feature-undo-btn" type="button">取り消す</button>`;
        const undo = controls.querySelector('.feature-undo-btn');
        // remove/replace to avoid duplicate handlers
        undo.replaceWith(undo.cloneNode(true));
        const newUndo = controls.querySelector('.feature-undo-btn');
        newUndo.addEventListener('click', (e) => {
          e.stopPropagation();
          // 取り消し: 再度クリックできるようにする
          try { localStorage.removeItem(key); } catch (err) {}
          btn.classList.remove('clicked-today');
          // ポイントを差し引く（カテゴリは +10 のため -10）
          statusData.points = Math.max(0, statusData.points - 10);
          console.log(`${label} の取り消しを実行 -10ポイント (合計: ${statusData.points})`);
          // 削除してUIを整える
          const c = btn.querySelector('.feature-controls');
          if (c) c.remove();
          updateUI();
        });
      }

      // 初期化: 既に今日クリック済みなら見た目と取り消しボタンを設定
      try {
        if (localStorage.getItem(key) === getLocalDateKey()) {
          btn.classList.add('clicked-today');
          createUndoButton();
        }
      } catch (e) {
        console.warn('localStorage unavailable', e);
      }

      // カード本体のクリック (div role=button) ハンドラ
      btn.addEventListener('click', () => {
        // 既に今日クリック済みなら localStorage を直接確認して処理しない
        try {
          if (localStorage.getItem(key) === today) {
            alert('このカテゴリは今日既に受け取り済みです。');
            // ensure visual state
            btn.classList.add('clicked-today');
            return;
          }
        } catch (e) {}

        statusData.points += 10;
        updateUI();

        try {
          localStorage.setItem(key, today);
          btn.classList.add('clicked-today');
        } catch (e) {
          console.warn('localStorage set failed', e);
        }

        // 取り消しボタンを追加
        createUndoButton();

      // キーボードで操作できるように Enter/Space を有効化
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });

        // 今日としてマークして保存
        try { localStorage.setItem(key, today); } catch (e) { console.warn('localStorage set failed', e); }
        // 取り消しボタンを表示
        createFeatureUndo(btn, key, label);

        console.log(`${label} で +10ポイント (合計: ${statusData.points})`);
      });
    });

  // ミッション項目クリック時の更新処理
  const missionItems = document.querySelectorAll('.mission-item');
  missionItems.forEach((item, idx) => {
    if (missions[idx]) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', (e) => {
        if (e.target.closest('.mission-undo-btn')) return;
        const mission = missions[idx];
        const today = formatDate(new Date());
        const dailyKey = `mission_taken_${idx}`;

        // 1日1回の上限チェック
        try {
          if (localStorage.getItem(dailyKey) === today) {
            alert('このミッションは今日既に実行済みです（1日1回まで）。');
            return;
          }
        } catch (e) {
          // localStorage が無ければフォールバックして続行
        }

        if (mission.current < mission.max) {
          mission.current += 1;
          console.log(`${mission.title}: ${mission.current}/${mission.max}`);
          try { localStorage.setItem(dailyKey, today); } catch (e) {}

          // 完了時にポイント加算
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
          saveMissionState(idx);
          updateUI();
        }
      });
    }
  });