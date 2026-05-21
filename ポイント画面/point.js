const statusData = {
  points: 0,
};

// ログイン中ユーザー取得
const currentUser = (() => {
  try {
<<<<<<< HEAD
    return (
      localStorage.getItem('currentUser') ||
      sessionStorage.getItem('currentUser')
    );
=======
    return localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
>>>>>>> dc690e6 (iketa)
  } catch (e) {
    return null;
  }
})();

// ユーザーごとの保存キー
<<<<<<< HEAD
const storageKey = (base) =>
  currentUser ? `${base}_${currentUser}` : base;
=======
const storageKey = (base) => currentUser ? `${base}_${currentUser}` : base;
>>>>>>> dc690e6 (iketa)

// ミッションデータ
const missions = [
  {
    id: 0,
    title: 'ラベル・キャップを剥がす',
    current: 0,
    max: 1,
    completed: false,
  },
  {
    id: 1,
    title: 'ゴミを持ち帰る',
    current: 0,
    max: 5,
    completed: false,
  },
  {
    id: 2,
    title: 'マイバッグを使う',
    current: 0,
    max: 1,
    completed: false,
  },
  {
    id: 3,
    title: 'マイボトル持参',
    current: 0,
    max: 3,
    completed: false,
  },
];

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
<<<<<<< HEAD

=======
>>>>>>> dc690e6 (iketa)
  d.setDate(d.getDate() - day);

  return formatDate(d);
}

function saveMissionState(idx) {
  try {
<<<<<<< HEAD
    localStorage.setItem(
      storageKey(`mission_current_${idx}`),
      String(missions[idx].current)
    );

    localStorage.setItem(
      storageKey(`mission_completed_${idx}`),
      missions[idx].completed ? '1' : '0'
    );
=======
    localStorage.setItem(`mission_current_${idx}`, String(missions[idx].current));
    localStorage.setItem(`mission_completed_${idx}`, missions[idx].completed ? '1' : '0');
>>>>>>> dc690e6 (iketa)
  } catch (e) {}
}

function loadMissionState(idx) {
  try {
<<<<<<< HEAD
    const cur = localStorage.getItem(
      storageKey(`mission_current_${idx}`)
    );

    const done = localStorage.getItem(
      storageKey(`mission_completed_${idx}`)
    );

    if (cur !== null) {
      missions[idx].current = Number(cur);
    }

    if (done !== null) {
      missions[idx].completed = done === '1';
    }
=======
    const cur = localStorage.getItem(`mission_current_${idx}`);
    const done = localStorage.getItem(`mission_completed_${idx}`);

    if (cur !== null) missions[idx].current = Number(cur);
    if (done !== null) missions[idx].completed = done === '1';
>>>>>>> dc690e6 (iketa)
  } catch (e) {}
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

<<<<<<< HEAD
  const progressPercent =
    req > 0 ? (remaining / req) * 100 : 0;

  return {
    level,
    progressPercent,
    pointsInLevel: remaining,
    req,
  };
}

function notifyBadgeStateChanged() {
  try {
    window.dispatchEvent(
      new Event('badgeStateChange')
    );

    if (
      window.parent &&
      window.parent !== window
    ) {
      window.parent.postMessage(
        { type: 'badgeStateChange' },
        '*'
      );
    }
  } catch (e) {
    console.warn(e);
  }
}

function updateMissionDisplay() {
  const missionItems =
    document.querySelectorAll('.mission-item');

  missionItems.forEach((item, idx) => {
    if (!missions[idx]) return;

    const mission = missions[idx];

    const meta =
      item.querySelector('.mission-meta');

    if (meta) {
      meta.textContent = `進捗: ${mission.current}/${mission.max}`;
    }

    // 色変更
    if (mission.current > 0) {
      item.classList.add('completed');
    } else {
      item.classList.remove('completed');
    }

    // 取り消しボタン
    let controls =
      item.querySelector('.mission-controls');

    if (mission.current > 0) {
      if (!controls) {
        controls =
          document.createElement('div');

        controls.className =
          'mission-controls';

        item.appendChild(controls);
      }

      controls.innerHTML = `
        <button
          class="mission-undo-btn"
          type="button"
        >
          取り消す
        </button>
      `;

      const undoBtn =
        controls.querySelector(
          '.mission-undo-btn'
        );

      undoBtn.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          e.stopPropagation();

          undoMission(idx);
        }
      );
    } else if (controls) {
      controls.remove();
    }
  });
}

function updateUI() {
  const progressFill =
    document.querySelector('.progress-fill');

  const progressBar =
    document.querySelector('.progress-bar');

  const pointsText =
    document.querySelector('.points');

  const levelText =
    document.querySelector(
      '.level-info span:first-child'
    );

=======
  const progressPercent = req > 0 ? (remaining / req) * 100 : 0;
  const pointsInLevel = remaining;

  return { level, progressPercent, pointsInLevel, req };
}

function updateMissionDisplay() {
  const missionItems = document.querySelectorAll('.mission-item');

  missionItems.forEach((item, idx) => {
    if (!missions[idx]) return;

    const meta = item.querySelector('.mission-meta');

    if (meta) {
      meta.textContent = `進捗: ${missions[idx].current}/${missions[idx].max}`;

      if (missions[idx].current > 0) {
        item.classList.add('completed');
      } else {
        item.classList.remove('completed');
      }
    }

    // 取り消しボタン
    let controls = item.querySelector('.mission-controls');

    if (missions[idx].current > 0) {
      if (!controls) {
        controls = document.createElement('div');
        controls.className = 'mission-controls';
        item.appendChild(controls);
      }

      controls.innerHTML = `
        <button class="mission-undo-btn" type="button">
          取り消す
        </button>
      `;

      const undoBtn = controls.querySelector('.mission-undo-btn');

      undoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        undoMission(idx);
      });

    } else if (controls) {
      controls.remove();
    }
  });
}

function updateUI() {
  const progressFill = document.querySelector('.progress-fill');
  const progressBar = document.querySelector('.progress-bar');
  const pointsText = document.querySelector('.points');
  const levelText = document.querySelector('.level-info span:first-child');

>>>>>>> dc690e6 (iketa)
  const {
    level,
    progressPercent,
    pointsInLevel,
<<<<<<< HEAD
    req,
  } = computeLevelFromPoints(
    statusData.points
  );
=======
    req
  } = computeLevelFromPoints(statusData.points);
>>>>>>> dc690e6 (iketa)

  if (levelText) {
    levelText.textContent = `Lv. ${level}`;
  }

  if (progressFill) {
    progressFill.style.width =
      `${progressPercent}%`;
  }

  if (progressBar) {
    progressBar.setAttribute(
      'aria-valuenow',
      String(Math.round(progressPercent))
    );
  }

  if (pointsText) {
<<<<<<< HEAD
    pointsText.textContent =
      `ポイント: ${pointsInLevel}/${req}`;
=======
    pointsText.textContent = `ポイント: ${pointsInLevel}/${req}`;
>>>>>>> dc690e6 (iketa)
  }

  updateMissionDisplay();

<<<<<<< HEAD
  try {
    const key = storageKey('ECO_status');

    localStorage.setItem(
      key,
      JSON.stringify({
        points: statusData.points,
        level,
        progressPercent,
        pointsInLevel,
      })
    );

    localStorage.setItem(
      storageKey('ECO_missions'),
      JSON.stringify(missions)
    );
  } catch (e) {
    console.warn(e);
  }
}

// ミッション取り消し
function undoMission(idx) {
  const mission = missions[idx];

  if (!mission) return;

  if (mission.current <= 0) return;

  const wasCompleted =
    mission.completed;

  // 進捗減少
  mission.current = Math.max(
    0,
    mission.current - 1
  );

  // 未達成化
  if (mission.current < mission.max) {
    mission.completed = false;
=======
  // 親へ通知
  try {
    const msg = {
      type: 'missionStatus',
      level,
      pointsInLevel,
      req,
      progressPercent,
    };

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(msg, '*');
    }
  } catch (e) {}

  // localStorage保存
  try {
    const key = storageKey('ECO_status');

    const payload = {
      level,
      progressPercent,
      points: statusData.points,
      pointsInLevel,
    };

    localStorage.setItem(key, JSON.stringify(payload));

    localStorage.setItem(
      key.replace('ECO_status', 'ECO_missions'),
      JSON.stringify(missions)
    );

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'ECO_status_update',
        payload
      }, '*');
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

// ミッション取り消し
function undoMission(idx) {
  if (!missions[idx] || missions[idx].current <= 0) return;
  const mission = missions[idx];
  // 取り消し前に「達成済みだったか」を保存
  const wasCompleted = mission.completed;
  // 進捗を1減らす
  mission.current = Math.max(0, mission.current - 1);
  // max未満になったら未達成に戻す
  if (mission.current < mission.max) {
    mission.completed = false;
  }
  console.log(
    `${mission.title}: 取り消し → ${mission.current}/${mission.max}`
  );
  // 今日の実行済み解除
  try {
    localStorage.removeItem(
      storageKey(`mission_taken_${idx}`)
    );
  } catch (e) {
    console.warn('mission_taken 削除失敗', e);
  }
  // 「完了状態だったもの」を崩した時だけ -20
  if (wasCompleted && !mission.completed) {
    statusData.points = Math.max(
      0,
      statusData.points - 20
    );
  }
  // ラベル剥がしバッジ解除
  if (mission.id === 0 && !mission.completed) {
    try {
      localStorage.setItem(
        'badge_label_clear',
        'false'
      );
      notifyBadgeStateChanged();
      console.log(
        'ラベル剥がしバッジを解除しました'
      );
    } catch (e) {
      console.warn('badge reset failed', e);
    }
  }
  saveMissionState(idx);
  updateUI();
}

window.addEventListener('DOMContentLoaded', () => {

  if (!currentUser) {
    location.href = '../全体/ログイン機能/signin.html';
    return;
>>>>>>> dc690e6 (iketa)
  }

  // 達成崩れた時だけ減点
  if (
    wasCompleted &&
    !mission.completed
  ) {
    statusData.points = Math.max(
      0,
      statusData.points - 20
    );
  }

<<<<<<< HEAD
  // バッジ解除
  if (
    mission.id === 0 &&
    !mission.completed
  ) {
    localStorage.removeItem(
      storageKey('badge_label_clear')
    );

    notifyBadgeStateChanged();
  }

  try {
    localStorage.removeItem(
      storageKey(`mission_taken_${idx}`)
    );
  } catch (e) {}

  saveMissionState(idx);

  updateUI();

  console.log(
    `${mission.title} を取り消し`
  );
}

window.addEventListener(
  'DOMContentLoaded',
  () => {
    if (!currentUser) {
      location.href =
        '../全体/ログイン機能/signin.html';

      return;
    }

    // ミッション復元
    try {
      const saved =
        localStorage.getItem(
          storageKey('ECO_missions')
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {
          parsed.forEach((s) => {
            const idx =
              missions.findIndex(
                (m) => m.id === s.id
              );

            if (idx !== -1) {
              missions[idx].current =
                typeof s.current ===
                'number'
                  ? s.current
                  : 0;

              missions[idx].completed =
                !!s.completed;
            }
          });
        }
      }
    } catch (e) {
      console.warn(e);
    }

    // ポイント復元
    try {
      const raw =
        localStorage.getItem(
          storageKey('ECO_status')
        );

      if (raw) {
        const parsed =
          JSON.parse(raw);

        if (
          parsed &&
          typeof parsed.points ===
            'number'
        ) {
          statusData.points =
            parsed.points;
        }
      }
    } catch (e) {
      console.warn(e);
    }

    // 週次リセット
    try {
      const storedWeek =
        localStorage.getItem(
          storageKey(
            'missions_week_start'
          )
        );

      const thisWeek =
        getWeekStart(new Date());

      if (storedWeek !== thisWeek) {
        missions.forEach(
          (m, idx) => {
            m.current = 0;
            m.completed = false;

            saveMissionState(idx);

            localStorage.removeItem(
              storageKey(
                `mission_taken_${idx}`
              )
            );
          }
        );

        localStorage.setItem(
          storageKey(
            'missions_week_start'
          ),
          thisWeek
        );
      } else {
        missions.forEach((m, idx) =>
          loadMissionState(idx)
        );
      }
    } catch (e) {
      console.warn(e);
    }

    updateUI();

    // ミッション処理
    const missionItems =
      document.querySelectorAll(
        '.mission-item'
      );

    missionItems.forEach(
      (item, idx) => {
        if (!missions[idx]) return;

        item.style.cursor =
          'pointer';

        item.addEventListener(
          'click',
          (e) => {
            if (
              e.target.closest(
                '.mission-undo-btn'
              )
            ) {
              return;
            }

            const mission =
              missions[idx];

            const today =
              formatDate(new Date());

            const dailyKey =
              storageKey(
                `mission_taken_${idx}`
              );

            try {
              if (
                localStorage.getItem(
                  dailyKey
                ) === today
              ) {
                alert(
                  '今日は実行済み！'
                );

                return;
              }
            } catch (e) {}

            if (
              mission.current <
              mission.max
            ) {
              mission.current += 1;

              localStorage.setItem(
                dailyKey,
                today
              );

              // 初回達成
              if (
                mission.current >=
                  mission.max &&
                !mission.completed
              ) {
                mission.completed =
                  true;

                statusData.points += 20;

                // バッジ
                if (
                  mission.id === 0
                ) {
                  localStorage.setItem(
                    storageKey(
                      'badge_label_clear'
                    ),
                    'true'
                  );

                  notifyBadgeStateChanged();
                }

                console.log(
                  `${mission.title} 達成`
                );
              }

              saveMissionState(idx);

              updateUI();
            }
          }
        );
      }
    );
  }
);
=======
  // ミッション復元
  try {
    const saved =
      localStorage.getItem(storageKey('ECO_missions')) ||
      localStorage.getItem('ECO_missions');

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        parsed.forEach((s) => {
          const idx = missions.findIndex(m => m.id === s.id);

          if (idx !== -1) {
            missions[idx].current =
              typeof s.current === 'number'
                ? s.current
                : missions[idx].current;

            missions[idx].completed = !!s.completed;
          }
        });
      }
    }

  } catch (e) {
    console.warn('restore missions failed', e);
  }

  // ポイント復元
  try {
    const key = storageKey('ECO_status');

    const raw =
      localStorage.getItem(key) ||
      localStorage.getItem('ECO_status');

    if (raw) {
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed.points === 'number') {
        statusData.points = parsed.points;
      }
    }

  } catch (e) {
    console.warn('restore ECO_status failed', e);
  }

  // --- 週次リセット ---
  try {
    const storedWeek = localStorage.getItem('missions_week_start');
    const thisWeek = getWeekStart(new Date());

    if (storedWeek !== thisWeek) {

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
      missions.forEach((m, idx) => loadMissionState(idx));
    }

  } catch (e) {
    console.warn('mission weekly init failed', e);
  }

  // 初期UI
  updateUI();

// ミッション開閉

const missionBtn = document.querySelector('.mission-button');
if (missionBtn) {
  const missionContent = document.querySelector('.mission-content');
  const missionCaret = missionBtn.querySelector('.mission-caret');
  missionBtn.addEventListener('click', () => {
    const expanded =
      missionBtn.getAttribute('aria-expanded') === 'true';
    missionBtn.setAttribute(
      'aria-expanded',
      String(!expanded)
    );
    if (missionContent) {
      if (expanded) {
        missionContent.classList.remove('open');
        setTimeout(() => {
          missionContent.setAttribute('hidden', '');
        }, 300);
      } else {
        missionContent.removeAttribute('hidden');
        requestAnimationFrame(() => {
          missionContent.classList.add('open');
        });
      }
    }

    if (missionCaret) {
      missionCaret.style.transform =
        expanded
          ? 'rotate(0deg)'
          : 'rotate(180deg)';
    }
  });
}

  // feature cards
  const featureCards = document.querySelectorAll('.feature-card');

  featureCards.forEach((btn, idx) => {

    const labelElem = btn.querySelector('.feature-label');
    const rawLabel = labelElem?.textContent || `カード ${idx + 1}`;
    const label = rawLabel.trim();

    const key = `feature_clicked_${label.replace(/\s+/g, '_')}`;
    const today = formatDate(new Date());

    function ensureFeatureControls() {
      let controls = btn.querySelector('.feature-controls');

      if (!controls) {
        controls = document.createElement('div');
        controls.className = 'feature-controls';

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

      controls.innerHTML = `
        <button class="feature-undo-btn" type="button">
          取り消す
        </button>
      `;

      const undoBtn = controls.querySelector('.feature-undo-btn');

      undoBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        localStorage.removeItem(key);

        btn.classList.remove('clicked-today');

        statusData.points = Math.max(0, statusData.points - 10);

        controls.remove();

        updateUI();
      });
    }

    if (localStorage.getItem(key) === today) {
      btn.classList.add('clicked-today');
      createUndoButton();
    }

    btn.addEventListener('click', () => {

      if (localStorage.getItem(key) === today) {
        alert('今日はもう受け取り済み！');
        return;
      }

      statusData.points += 10;

      localStorage.setItem(key, today);

      btn.classList.add('clicked-today');

      createUndoButton();

      updateUI();

      console.log(`${label} で +10ポイント`);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // ミッション処理
  const missionItems = document.querySelectorAll('.mission-item');

  missionItems.forEach((item, idx) => {

    if (!missions[idx]) return;

    item.style.cursor = 'pointer';

    item.addEventListener('click', (e) => {

      if (
        e.target.closest('.mission-undo-btn') ||
        e.target.closest('.mission-controls')
      ) {
        return;
      }

      const mission = missions[idx];
      const today = formatDate(new Date());
      const dailyKey = storageKey(`mission_taken_${idx}`);

      try {
        if (localStorage.getItem(dailyKey) === today) {
          alert('このミッションは今日既に実行済みです（1日1回まで）。');
          return;
        }
      } catch (e) {}

if (mission.current < mission.max) {

  mission.current += 1;

  try {
    localStorage.setItem(dailyKey, today);
  } catch (e) {}

  // 初回達成時のみポイント加算
  if (
    mission.current >= mission.max &&
    !mission.completed
  ) {

    mission.completed = true;

    statusData.points += 20;

    if (mission.id === 0) {
      try {
        localStorage.setItem(
          'badge_label_clear',
          'true'
        );

        notifyBadgeStateChanged();

        console.log(
          'localStorageに badge_label_clear: true を保存しました！'
        );

      } catch (e) {
        console.warn('localStorage set failed', e);
      }
    }

    console.log(
      `ミッション完了！ ${mission.title} を達成しました。 +20ポイント (合計: ${statusData.points})`
    );
  }

  saveMissionState(idx);

  updateUI();
}
    });
  });
});
>>>>>>> dc690e6 (iketa)
