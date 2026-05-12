// シンプルなサインアップ処理（クライアント側PBKDF2でのハッシュ保存、デモ用）

function arrayBufferToBase64(buffer){
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for(let i=0;i<len;i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function deriveKey(password, salt, iterations = 150000){
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), {name: 'PBKDF2'}, false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({name: 'PBKDF2', salt, iterations, hash: 'SHA-256'}, keyMaterial, 256);
  return new Uint8Array(derived);
}

function loadUsers(){
  try{ return JSON.parse(localStorage.getItem('users') || '[]'); }
  catch(e){ return []; }
}

window.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('signup-form');
  const msg = document.getElementById('signup-msg');

  // Web Crypto API が使えない場合は早期に警告してフォームを無効化
  const isCryptoAvailable = (window.crypto && crypto.subtle);
  if(!isCryptoAvailable){
    if(msg) msg.textContent = 'この環境では暗号機能が利用できません。ローカルサーバーで開いてください（例: `python3 -m http.server`）。';
    if(form) form.querySelectorAll('input,button').forEach(el => el.disabled = true);
    return;
  }

  if(!form) return;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    msg.textContent = '';

    const fd = new FormData(form);
    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim().toLowerCase();
    const password = (fd.get('password') || '').toString();

    if(!name){ msg.textContent = 'ユーザー名を入力してください'; return; }
    if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ msg.textContent = '有効なメールアドレスを入力してください'; return; }
    if(!password || password.length < 6){ msg.textContent = 'パスワードは6文字以上にしてください'; return; }

    const users = loadUsers();
    if(users.find(u => u.email === email)){ msg.textContent = 'そのメールアドレスは既に登録されています'; return; }

    try{
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const derived = await deriveKey(password, salt.buffer);
      const saltB64 = arrayBufferToBase64(salt.buffer);
      const hashB64 = arrayBufferToBase64(derived.buffer);

      users.push({ username: name, email, salt: saltB64, hash: hashB64 });
      localStorage.setItem('users', JSON.stringify(users));

      msg.textContent = 'アカウントを作成しました。サインイン画面に移動します…';
      setTimeout(()=> location.href = 'signin.html', 900);
    } catch(err){
      console.error(err);
      msg.textContent = '登録中にエラーが発生しました';
    }
  });
});
