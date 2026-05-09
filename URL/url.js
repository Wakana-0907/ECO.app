document.addEventListener('DOMContentLoaded', () => {
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
