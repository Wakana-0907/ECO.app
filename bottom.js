// HTMLの要素を取得
const badgeImg = document.getElementById('main-badge');
const recycleBtn = document.getElementById('recycle-btn');
const countDisplay = document.getElementById('count-display');
const message = document.getElementById('message');

let count = 0;

// ボタンをクリックした時の処理
recycleBtn.addEventListener('click', () => {
    count++;
    countDisplay.innerText = count;

    // バッジ切り替えロジック
    updateBadge(count);
});

function updateBadge(currentCount) {
    if (currentCount >= 10) {
        // 10回以上：次のレベルの画像（例：growth.png）
        // ※まだ画像がない場合は、別のファイル名に変更してください
        badgeImg.src = 'growth.png'; 
        badgeImg.classList.add('unlocked');
        message.innerText = "すごい！木が成長したよ！";
        
    } else if (currentCount >= 1) {
        // 1回以上：始まりのバッジ
        badgeImg.src = 'hajimari.png';
        message.innerText = "その調子！あと" + (10 - currentCount) + "回でレベルアップ！";
    }
}