// ログアウト処理: currentUser を削除したあと、自動で signin に遷移する
window.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('to-signin');
  const signinUrl = '../ログイン機能/signin.html';

  if (window.UsernameDisplay) {
    window.UsernameDisplay.renderAll();
  }

  try{ localStorage.removeItem('currentUser'); } catch(e){}
  try{ sessionStorage.removeItem('currentUser'); } catch(e){}

  const goToSignin = ()=>{
    try{ localStorage.removeItem('currentUser'); } catch(e){}
    try{ sessionStorage.removeItem('currentUser'); } catch(e){}

    const target = encodeURI(signinUrl);
    try {
      // まず履歴を残さず移動（戻るでログアウト前に戻らないように）
      window.location.replace(target);
    } catch (e) {
      try { window.location.href = target; } catch (e2) { console.error('redirect failed', e2); }
    }
  };

  if (btn) {
    btn.addEventListener('click', goToSignin);
  }

  setTimeout(goToSignin, 1200);
});