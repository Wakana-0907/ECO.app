document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('badge-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const closeBtn = document.querySelector('.close-btn');
    const badgeItems = document.querySelectorAll('.badge-item');

    // バッジをクリックした時の処理
    badgeItems.forEach(item => {
        item.addEventListener('click', () => {
            const name = item.getAttribute('data-name');
            const description = item.getAttribute('data-description');

            modalTitle.textContent = name;
            modalDesc.textContent = description;

            modal.style.display = 'block'; // モーダルを表示
        });
    });

    // 閉じるボタンをクリックした時
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // モーダルの外側をクリックした時も閉じる
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});