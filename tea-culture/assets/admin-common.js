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

    renderAdminSidebar();
}

function renderAdminSidebar() {
    const box = document.getElementById('adminSidebar');
    if (!box) return;
    const current = (location.pathname.split('/').pop() || '').toLowerCase();

    const sections = [
        {
            title: '管理菜单',
            items: [
                { href: 'admin.html', icon: 'fas fa-gauge', text: '控制台' },
                { href: 'admin-users.html', icon: 'fas fa-users', text: '用户管理' },
                { href: 'admin-knowledge.html', icon: 'fas fa-book-open', text: '茶识管理' },
                { href: 'admin-topic.html', icon: 'fas fa-layer-group', text: '专题管理' },
                { href: 'admin-scenario.html', icon: 'fas fa-mug-hot', text: '场景管理' },
                { href: 'admin-tea-food.html', icon: 'fas fa-utensils', text: '茶食搭配' },
                { href: 'admin-feedback.html', icon: 'fas fa-comment-dots', text: '反馈管理' },
                { href: 'admin-favorites.html', icon: 'fas fa-heart', text: '收藏管理' },
                { href: 'admin-device-commands.html', icon: 'fas fa-microchip', text: '设备日志' }
            ]
        },
        {
            title: '基础数据',
            items: [
                { href: 'admin-knowledge-categories.html', icon: 'fas fa-tags', text: '茶识分类' },
                { href: 'admin-topic-categories.html', icon: 'fas fa-tag', text: '专题分类' },
                { href: 'admin-wares.html', icon: 'fas fa-cup', text: '茶器管理' },
                { href: 'admin-brewing-params.html', icon: 'fas fa-sliders', text: '冲泡参数' },
                { href: 'admin-tea-type-params.html', icon: 'fas fa-gears', text: '茶类参数' }
            ]
        }
    ];

    box.innerHTML = sections.map(s => `
        <div class="menu-title">${s.title}</div>
        ${s.items.map(i => `
            <a class="menu-item ${current === i.href ? 'active' : ''}" href="./${i.href}">
                <i class="${i.icon}"></i><span>${i.text}</span>
            </a>
        `).join('')}
    `).join('');
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
    getCheckedIds,
    renderAdminSidebar
};
