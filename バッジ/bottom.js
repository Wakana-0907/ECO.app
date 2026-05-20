function updateBadgeState() {
    const isLabelCleared = localStorage.getItem('badge_label_clear') === 'true';
    const labelBadge = document.getElementById('badge-label');

    if (!labelBadge) return;
    const badgeImg = labelBadge.querySelector('.badge-img');

    if (isLabelCleared) {
        labelBadge.classList.remove('locked');
        labelBadge.classList.add('active');
        if (badgeImg) {
            badgeImg.src = 'ラベル剥がし.png';
            badgeImg.alt = 'ラベル剥がしバッジ';
        }
        console.log('状態：達成済み。ラベル剥がしバッジを表示します。');
    } else {
        labelBadge.classList.remove('active');
        labelBadge.classList.remove('locked');
        if (badgeImg) {
            badgeImg.src = 'はじまり.png';
            badgeImg.alt = '未達成バッジ';
        }
        console.log('状態：未達成。初期バッジを表示します。');
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
        if (event.key === 'badge_label_clear') {
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