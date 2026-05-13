function loadUsers(){
	try { return JSON.parse(localStorage.getItem('users') || '[]'); }
	catch(e){ return []; }
}

function getCurrentUserEmail(){
	try {
		return localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
	} catch(e){
		return null;
	}
}

function getDisplayName(){
	const currentUser = getCurrentUserEmail();
	if (!currentUser) return '';

	const user = loadUsers().find(entry => entry.email === currentUser);
	return (user && user.username) ? user.username : currentUser;
}

function renderUsername(target){
	const element = typeof target === 'string' ? document.querySelector(target) : target;
	if (!element) return '';

	const displayName = getDisplayName();
	element.textContent = displayName;
	return displayName;
}

function renderAllUsernames(){
	document.querySelectorAll('[data-username-display]').forEach((element) => {
		renderUsername(element);
	});
}

window.UsernameDisplay = {
	loadUsers,
	getCurrentUserEmail,
	getDisplayName,
	render: renderUsername,
	renderAll: renderAllUsernames,
};

window.addEventListener('DOMContentLoaded', () => {
	renderAllUsernames();
});