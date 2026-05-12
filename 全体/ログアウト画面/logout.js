// ログアウト処理: currentUser を削除したあと、自動で signin に遷移する
window.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('to-signin');
  const signinUrl = '../ログイン機能/signin.html';

  // まず現在のログインユーザーを読み取り、表示する（削除はその後で行う）
  const currentUser = (()=>{
    try { return localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'); }
    catch(e){ return null; }
  })();

  if (currentUser) {
    try{
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === currentUser);
      const display = (user && user.username) ? user.username : currentUser;
      const el = document.querySelector('.user-name');
      if (el) el.textContent = display;
    } catch(e){ /* ignore */ }
  }

  try{ localStorage.removeItem('currentUser'); } catch(e){}
  try{ sessionStorage.removeItem('currentUser'); } catch(e){}

  const goToSignin = ()=>{
    location.href = signinUrl;
  };

  if (btn) {
    btn.addEventListener('click', goToSignin);
  }

  setTimeout(goToSignin, 1200);
});