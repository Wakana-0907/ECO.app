// 簡易サインイン処理
// localStorage の `users` を参照して認証を行う。実運用ではサーバーAPIを使用してください。

function loadUsers(){
	try { return JSON.parse(localStorage.getItem('users') || '[]'); }
	catch(e){ return []; }
}

function setCurrentUser(email, remember){
	try {
		if(remember) localStorage.setItem('currentUser', email);
		else sessionStorage.setItem('currentUser', email);
	} catch(e) { console.warn('setCurrentUser failed', e); }
}

// signin with PBKDF2 verification against stored salt+hash
function arrayBufferToBase64(buffer){
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for(let i=0;i<len;i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}

function base64ToArrayBuffer(base64){
	const binary = atob(base64);
	const len = binary.length;
	const bytes = new Uint8Array(len);
	for(let i=0;i<len;i++) bytes[i] = binary.charCodeAt(i);
	return bytes.buffer;
}

async function deriveKey(password, salt, iterations = 150000){
	const enc = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), {name: 'PBKDF2'}, false, ['deriveBits']);
	const derived = await crypto.subtle.deriveBits({name: 'PBKDF2', salt, iterations, hash: 'SHA-256'}, keyMaterial, 256);
	return new Uint8Array(derived);
}

window.addEventListener('DOMContentLoaded', ()=>{

  // Web Crypto API（crypto.subtle）が利用できないと PBKDF2 処理で例外になる。
  const isCryptoAvailable = (window.crypto && crypto.subtle);

	const form = document.getElementById('signin-form');
	const msg = document.getElementById('signin-msg');

	if(!isCryptoAvailable){
		if(msg) msg.textContent = 'このブラウザ環境では暗号機能が利用できません。ローカルで確認する場合はローカルサーバー（例: `python3 -m http.server`）で開いてください。';
		if(form) form.querySelectorAll('input,button').forEach(el => el.disabled = true);
		return;
	}

	// 既に remember でログイン済みなら自動遷移
	try{
		const remembered = localStorage.getItem('currentUser');
		if(remembered){
			// 保存されている email からユーザー名を探して表示
			try{
				const users = loadUsers();
				const u = users.find(x => x.email === remembered);
				const name = (u && u.username) ? u.username : remembered;
				msg.textContent = `ようこそ ${name} さん。自動ログイン中...`;
			} catch(e){
				msg.textContent = `ようこそ ${remembered} さん。自動ログイン中...`;
			}
			setTimeout(()=> location.href = '../ポイント画面/point.html', 900);
			return;
		}
	} catch(e){ /* ignore */ }

	form.addEventListener('submit', async (e)=>{
		e.preventDefault();
		msg.textContent = '';

		const fd = new FormData(form);
		const email = (fd.get('email') || '').toString().trim().toLowerCase();
		const password = (fd.get('password') || '').toString();
		const remember = !!fd.get('remember');

		if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
			msg.textContent = '有効なメールアドレスを入力してください';
			return;
		}
		if(!password){ msg.textContent = 'パスワードを入力してください'; return; }

		const users = loadUsers();
		const user = users.find(u => u.email === email);
		if(!user){ msg.textContent = 'メールアドレスまたはパスワードが違います'; return; }

		try{
			const saltBuf = base64ToArrayBuffer(user.salt);
			const derived = await deriveKey(password, saltBuf);
			const hashB64 = arrayBufferToBase64(derived.buffer);
			if(hashB64 !== user.hash){ msg.textContent = 'メールアドレスまたはパスワードが違います'; return; }

			setCurrentUser(email, remember);
			// ユーザー名があればそれを表示
			const displayName = user.username || email;
			msg.textContent = `ようこそ ${displayName} さん。ログインしました。画面を移動します…`;
			setTimeout(()=> location.href = '../ポイント画面/point.html', 700);
		} catch(err){
			console.error(err);
			msg.textContent = 'ログイン中にエラーが発生しました';
		}
	});
});
