const statusData = {
  points: 0,
};

// ログイン中ユーザー取得
const currentUser = (() => {
  try {
    return (
      localStorage.getItem('currentUser') ||
      sessionStorage.getItem('currentUser')
    );
  } catch (e) {
    return null;
  }
})();

// ユーザーごとの保存キー
const storageKey = (base) =>
  currentUser ? `${base}_${currentUser}` : base;

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

  d.setDate(d.getDate() - day);

  return formatDate(d);
}

function saveMissionState(idx) {
  try {
    localStorage.setItem(
      storageKey(`mission_current_${idx}`),
      String(missions[idx].current)
    );

    localStorage.setItem(
      storageKey(`mission_completed_${idx}`),
      missions[idx].completed ? '1' : '0'
    );
  } catch (e) {}
}

function loadMissionState(idx) {
  try {
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

  const {
    level,
    progressPercent,
    pointsInLevel,
    req,
  } = computeLevelFromPoints(
    statusData.points
  );

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
    pointsText.textContent =
      `ポイント: ${pointsInLevel}/${req}`;
  }

  updateMissionDisplay();

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