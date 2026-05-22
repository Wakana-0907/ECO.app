function updateBadgeState() {
    // 1. ラベル剥がしバッジの更新（5番目）
    const isLabelCleared = localStorage.getItem('badge_label_clear') === 'true';
    const labelBadge = document.getElementById('badge-label');

    if (labelBadge) {
        const badgeImg = labelBadge.querySelector('.badge-img');
        if (isLabelCleared) {
            if (badgeImg) {
                badgeImg.src = 'ラベル剥がし.png';
                badgeImg.alt = 'ラベル剥がしバッジ';
            }
        } else {
            if (badgeImg) {
                badgeImg.src = 'はじまり.png';
                badgeImg.alt = '未達成バッジ';
            }
        }
    }

    // 2. マイバッグを使うバッジの更新（3番目）
    const isMybackCleared = localStorage.getItem('badge_myback_clear') === 'true';
    const mybackBadge = document.getElementById('badge-myback');

    if (mybackBadge) {
        const badgeImg = mybackBadge.querySelector('.badge-img');
        if (isMybackCleared) {
            if (badgeImg) {
                badgeImg.src = 'マイバック.png';
                badgeImg.alt = 'マイバックバッジ';
            }
        } else {
            if (badgeImg) {
                badgeImg.src = 'はじまり.png';
                badgeImg.alt = '未達成バッジ';
            }
        }
    }

    // 3. 【追加】ゴミを持ち帰るバッジの更新（2番目）
    const isGarbageCleared = localStorage.getItem('badge_garbage_clear') === 'true';
    const garbageBadge = document.getElementById('badge-garbage');

    if (garbageBadge) {
        const badgeImg = garbageBadge.querySelector('.badge-img');
        if (isGarbageCleared) {
            if (badgeImg) {
                badgeImg.src = 'ゴミ持ち帰り.png'; // 達成したらゴミ持ち帰り.pngに変更
                badgeImg.alt = 'ゴミ持ち帰りバッジ';
            }
        } else {
            if (badgeImg) {
                badgeImg.src = 'はじまり.png'; // 未達成・取り消し時はカラーの双葉
                badgeImg.alt = '未達成バッジ';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('badge-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const closeBtn = document.querySelector('.close-btn');
    const badgeItems = document.querySelectorAll('.badge-item');

    updateBadgeState();

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateBadgeState();
        }
    });

    window.addEventListener('focus', updateBadgeState);
    window.addEventListener('badgeStateChange', updateBadgeState);
    window.addEventListener('storage', (event) => {
        if (event.key === 'badge_label_clear' || event.key === 'badge_myback_clear' || event.key === 'badge_garbage_clear') {
            updateBadgeState();
        }
    });

    badgeItems.forEach(item => {
        item.addEventListener('click', () => {
            const name = item.getAttribute('data-name');
            const description = item.getAttribute('data-description');
            modalTitle.textContent = name;
            modalDesc.textContent = description;
            modal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target === modal) modal.style.display = 'none'; });
});