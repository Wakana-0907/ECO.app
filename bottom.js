// モーダル要素を取得
const modal = document.getElementById('badge-modal');
const closeBtn = document.querySelector('.close-btn');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');

// すべてのバッジアイテムを取得
const badgeItems = document.querySelectorAll('.badge-item');

// 各バッジにクリックイベントリスナーを追加
badgeItems.forEach(badge => {
    badge.addEventListener('click', () => {
        const name = badge.getAttribute('data-name');
        const description = badge.getAttribute('data-description');
        
        // モーダルの内容を設定
        modalTitle.innerText = name;
        modalDescription.innerText = description;
        
        // モーダルを表示
        modal.style.display = 'block';
    });
});

// 閉じるボタンをクリック時にモーダルを閉じる
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// モーダルの外をクリック時にモーダルを閉じる
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});