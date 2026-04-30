function requireAdmin() {
    const token = TokenManager.getToken();
    const user = TokenManager.getUserInfo();
    if (!token || !user || user.role !== 'admin') {
        alert('无管理员权限');
        window.location.href = './login.html';
        return false;
    }
    return true;
}

function bindAdminHeader() {
    const user = TokenManager.getUserInfo() || {};
    const el = document.getElementById('adminUserText');
    if (el) el.innerText = user.nickname || user.username || '管理员';

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await API.Auth.logout();
            TokenManager.clear();
            window.location.href = './login.html';
        });
    }
}

function getQueryInt(name, defVal) {
    const v = new URLSearchParams(location.search).get(name);
    if (v == null) return defVal;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : defVal;
}

function setQuery(params) {
    const sp = new URLSearchParams(location.search);
    Object.keys(params).forEach(k => {
        const v = params[k];
        if (v === undefined || v === null || v === '') sp.delete(k);
        else sp.set(k, String(v));
    });
    const qs = sp.toString();
    const url = location.pathname + (qs ? '?' + qs : '');
    history.replaceState({}, '', url);
}

function openModal(title, bodyHtml, onSave) {
    const html = `
        <div class="modal-mask" onclick="closeModal(event)">
            <div class="modal" onclick="event.stopPropagation()">
                <h3>${title}</h3>
                ${bodyHtml}
                <div class="modal-btns">
                    <button class="btn light" onclick="closeModal()">取消</button>
                    <button class="btn primary" id="modalSaveBtn">保存</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    const btn = document.getElementById('modalSaveBtn');
    if (btn) btn.addEventListener('click', onSave);
}

window.closeModal = function (e) {
    const mask = document.querySelector('.modal-mask');
    if (mask) mask.remove();
};

function getCheckedIds(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(i => i.value)
        .filter(v => v !== 'on');
}

window.AdminCommon = {
    requireAdmin,
    bindAdminHeader,
    getQueryInt,
    setQuery,
    openModal,
    getCheckedIds
};
