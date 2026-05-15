document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
  if (!currentUser) {
    location.href = '../全体/ログイン機能/signin.html';
    return;
  }

  const page = document.querySelector('.page-url');
  if (!page) return;

  const placeholder = page.querySelector('.placeholder');
  if (placeholder && placeholder.textContent.trim() === '') {
    placeholder.textContent = '外部リンクはここに表示されます';
  }

  const title = page.querySelector('.page-title');
  if (title) {
    title.textContent = 'URL';
  }
});
