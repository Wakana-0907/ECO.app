function updateBadgeState() {
    // --------------------------------------------------
    // 1. ゴミを持ち帰るバッジ（2番目 / id="badge-garbage"）
    // --------------------------------------------------
    const isGarbageCleared = localStorage.getItem('badge_garbage_clear') === 'true';
    const garbageBadge = document.getElementById('badge-garbage');

    if (garbageBadge) {
        const badgeImg = garbageBadge.querySelector('.badge-img');
        if (badgeImg) {
            if (isGarbageCleared) {
                // ミッション5/5達成でカラー画像に切り替え！
                badgeImg.src = 'ゴミ持ち帰り.png';
                badgeImg.alt = 'ゴミ持ち帰りバッジ';
            } else {
                // 未達成の時は指定通り「未達成.png」にする
                badgeImg.src = '未達成.png';
                badgeImg.alt = '未達成バッジ';
            }
        }
    }

    // --------------------------------------------------
    // 2. マイバッグを使うバッジ（3番目 / id="badge-myback"）
    // --------------------------------------------------
    const isMybackCleared = localStorage.getItem('badge_myback_clear') === 'true';
    const mybackBadge = document.getElementById('badge-myback');

    if (mybackBadge) {
        const badgeImg = mybackBadge.querySelector('.badge-img');
        if (badgeImg) {
            if (isMybackCleared) {
                // 達成でカラー画像に切り替え！
                badgeImg.src = 'マイバック.png';
                badgeImg.alt = 'マイバックバッジ';
            } else {
                // 未達成の時は指定通り「未達成.png」にする
                badgeImg.src = '未達成.png';
                badgeImg.alt = '未達成バッジ';
            }
        }
    }

    // --------------------------------------------------
    // 3. ラベル・キャップを剥がすバッジ（5番目 / id="badge-label"）
    // --------------------------------------------------
    const isLabelCleared = localStorage.getItem('badge_label_clear') === 'true';
    const labelBadge = document.getElementById('badge-label');

    if (labelBadge) {
        const badgeImg = labelBadge.querySelector('.badge-img');
        if (badgeImg) {
            if (isLabelCleared) {
                // 達成でカラー画像に切り替え！
                badgeImg.src = 'ラベル剥がし.png';
                badgeImg.alt = 'ラベル剥がしバッジ';
            } else {
                // 未達成の時は指定通り「未達成.png」にする
                badgeImg.src = '未達成.png';
                badgeImg.alt = '未達成バッジ';
            }
        }
    }
}

// 画面が表示された時やデータが変わった時に自動で上の判定を動かす設定
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('badge-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const closeBtn = document.querySelector('.close-btn');
    const badgeItems = document.querySelectorAll('.badge-item');

    // 最初にバッジの状態をチェックして切り替える
    updateBadgeState();

    // リアルタイムにミッション画面と連動させるためのイベントたち
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) updateBadgeState();
    });

    window.addEventListener('focus', updateBadgeState);
    window.addEventListener('badgeStateChange', updateBadgeState);
    window.addEventListener('storage', (event) => {
        if (['badge_label_clear', 'badge_garbage_clear', 'badge_myback_clear'].includes(event.key)) {
            updateBadgeState();
        }
    });

    // モーダル表示処理
    badgeItems.forEach(item => {
        item.addEventListener('click', () => {
            const name = item.getAttribute('data-name');
            const description = item.getAttribute('data-description');
            if (modalTitle && modalDesc && modal) {
                modalTitle.textContent = name;
                modalDesc.textContent = description;
                modal.style.display = 'block';
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (modal && event.target === modal) modal.style.display = 'none'; });
});