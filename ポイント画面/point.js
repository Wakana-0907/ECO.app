// 表示させたいデータのサンプル
const pointData = [
  { id: 1, title: "ぷら(〇〇)取得", date: "2026/05/08", point: "+100" },
  { id: 2, title: "ミッションクリア", date: "2026/05/07", point: "+50" },
  { id: 3, title: "ログインボーナス", date: "2026/05/06", point: "+10" }
];

function renderPointList() {
  const listElement = document.getElementById('point-list');
  
  // 配列をループしてHTMLを作成
  listElement.innerHTML = pointData.map(item => `
    <div class="point-item" style="border-bottom: 1px solid #ddd; padding: 10px 0;">
      <div style="display: flex; justify-content: space-between;">
        <strong>${item.title}</strong>
        <span>${item.point} P</span>
      </div>
      <small style="color: #888;">${item.date}</small>
    </div>
  `).join('');
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', renderPointList);

// ボタンクリック時の動き（例：みっしょん）
document.getElementById('mission-btn').addEventListener('click', () => {
  alert('ミッション画面へ移動します！');
});