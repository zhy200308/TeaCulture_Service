function renderSiteHeader() {
    const host = document.getElementById('siteHeader');
    if (!host) return;

    const isInPages = window.location.pathname.includes('/pages/');
    const base = isInPages ? '../' : './';

    const links = [
        { key: 'basic', href: `${base}pages/basic.html`, text: '基础茶识' },
        { key: 'advanced', href: `${base}pages/advanced.html`, text: '进阶专题' },
        { key: 'scenario', href: `${base}pages/scenario.html`, text: '场景教程' },
        { key: 'tea-food', href: `${base}pages/tea-food.html`, text: '茶食搭配' }
    ];

    const cur = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const activeKey = cur === 'basic.html' ? 'basic'
        : cur === 'advanced.html' ? 'advanced'
            : cur === 'scenario.html' ? 'scenario'
                : cur === 'tea-food.html' ? 'tea-food'
                    : 'home';

    const user = TokenManager.getUserInfo();
    const token = TokenManager.getToken();
    const nickname = user?.nickname || user?.username || '';
    const isLoggedIn = !!token && !!user;

    let rightHtml = `<a class="nav-btn" href="${base}pages/login.html"><i class="fas fa-user"></i> 登录 / 注册</a>`;
    if (isLoggedIn) {
        const avatarUrl = normalizeImageUrl(user?.avatar);
        const avatarHtml = avatarUrl
            ? `<span class="nav-avatar"><img src="${avatarUrl}" alt="" onerror="this.style.display='none'"></span>`
            : `<span class="nav-avatar"><i class="fas fa-user-circle"></i></span>`;

        const userCenterHref = `${base}pages/user.html`;
        const adminHref = `${base}pages/admin.html`;

        const adminBtn = user?.role === 'admin'
            ? `<a class="nav-btn" href="${adminHref}"><i class="fas fa-shield-halved"></i> 管理后台</a>`
            : '';

        rightHtml = `
            <span class="nav-user-text">${avatarHtml} 欢迎你，${escapeHtml(nickname || '茶友')}</span>
            <a class="nav-btn" href="${userCenterHref}"><i class="fas fa-id-card"></i> 个人中心</a>
            ${adminBtn}
            <a class="nav-btn" href="${base}pages/login.html" id="siteLogoutBtn"><i class="fas fa-right-from-bracket"></i> 退出登录</a>
        `;
    }

    const searchHtml = activeKey === 'home'
        ? `
            <div class="search-bar">
                <span class="search-icon"><i class="fas fa-search"></i></span>
                <input type="text" placeholder="搜索茶识、茶器、冲泡教程..." id="search-input">
            </div>
        `
        : '';

    host.innerHTML = `
        <div class="nav-container">
            <div class="logo" style="cursor:pointer" id="siteLogo">
                <i class="fas fa-leaf"></i>
                <div class="logo-text">茶文化服务平台</div>
            </div>
            <nav class="nav-menu">
                <a href="${base}index.html" class="${activeKey === 'home' ? 'active' : ''}">首页</a>
                ${links.map(l => `<a href="${l.href}" class="${activeKey === l.key ? 'active' : ''}">${l.text}</a>`).join('')}
            </nav>
            ${searchHtml}
            <div class="nav-right">
                ${rightHtml}
            </div>
        </div>
    `;

    const logo = document.getElementById('siteLogo');
    if (logo) logo.addEventListener('click', () => (window.location.href = `${base}index.html`));

    const logoutBtn = document.getElementById('siteLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await API.Auth.logout();
            TokenManager.clear();
            window.location.href = `${base}pages/login.html`;
        });
    }
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

document.addEventListener('DOMContentLoaded', renderSiteHeader);

function normalizeImageUrl(url) {
    const u = String(url || '').trim();
    if (!u) return '';
    if (u.startsWith('./images/')) return `../images/${u.slice('./images/'.length)}`;
    if (u.startsWith('/images/')) return `..${u}`;
    return u;
}
