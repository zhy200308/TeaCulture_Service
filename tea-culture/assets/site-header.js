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
                    : cur === 'search.html' ? 'search'
                        : cur === 'user.html' ? 'user'
                            : cur === 'admin.html' ? 'admin'
                                : cur === 'login.html' ? 'login'
                                    : 'home';

    const user = TokenManager.getUserInfo();
    const token = TokenManager.getToken();
    const nickname = user?.nickname || user?.username || '';
    const isLoggedIn = !!token && !!user;
    const isUserCenter = activeKey === 'user';

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

        if (isUserCenter) {
            rightHtml = `
                <span class="nav-user-text">${avatarHtml}${escapeHtml(nickname || '茶友')}</span>
                ${adminBtn}
                <a class="nav-btn" href="${base}pages/login.html" id="siteLogoutBtn"><i class="fas fa-right-from-bracket"></i> 退出</a>
            `;
        } else {
            rightHtml = `
                <span class="nav-user-text">${avatarHtml} 欢迎你，${escapeHtml(nickname || '茶友')}</span>
                <a class="nav-btn" href="${userCenterHref}"><i class="fas fa-id-card"></i> 个人中心</a>
                ${adminBtn}
                <a class="nav-btn" href="${base}pages/login.html" id="siteLogoutBtn"><i class="fas fa-right-from-bracket"></i> 退出登录</a>
            `;
        }
    }

    const enableSearch = activeKey !== 'user' && activeKey !== 'search' && activeKey !== 'admin' && activeKey !== 'login';
    const searchHtml = enableSearch
        ? `
            <div class="search-bar">
                <span class="search-icon"><i class="fas fa-search"></i></span>
                <input type="text" placeholder="搜索茶识、茶器、冲泡教程..." id="search-input">
                <div class="nav-search-suggest" id="navSearchSuggest"></div>
            </div>
        `
        : '';

    const navHtml = isUserCenter
        ? ''
        : `
            <nav class="nav-menu">
                <a href="${base}index.html" class="${activeKey === 'home' ? 'active' : ''}">首页</a>
                ${links.map(l => `<a href="${l.href}" class="${activeKey === l.key ? 'active' : ''}">${l.text}</a>`).join('')}
            </nav>
        `;

    host.innerHTML = `
        <div class="nav-container">
            <div class="logo" style="cursor:pointer" id="siteLogo">
                <i class="fas fa-leaf"></i>
                <div class="logo-text">茶文化服务平台</div>
            </div>
            ${navHtml}
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

    if (enableSearch) bindNavSearch(base);
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

document.addEventListener('DOMContentLoaded', renderSiteHeader);
window.renderSiteHeader = renderSiteHeader;

function bindNavSearch(base) {
    const input = document.getElementById('search-input');
    const box = document.getElementById('navSearchSuggest');
    if (!input || !box) return;

    let timer = null;
    let lastKw = '';

    const typeMap = { knowledge: '茶识', topic: '专题', scenario: '教程', food: '茶食' };

    const hide = () => {
        box.classList.remove('show');
        box.innerHTML = '';
    };

    const show = () => box.classList.add('show');

    const jump = (type, id, keyword) => {
        const map = {
            knowledge: `${base}pages/basic.html?openId=${encodeURIComponent(id)}&keyword=${encodeURIComponent(keyword)}`,
            topic: `${base}pages/advanced.html?openId=${encodeURIComponent(id)}&keyword=${encodeURIComponent(keyword)}`,
            scenario: `${base}pages/scenario.html?openId=${encodeURIComponent(id)}&keyword=${encodeURIComponent(keyword)}`,
            food: `${base}pages/tea-food.html?openId=${encodeURIComponent(id)}&keyword=${encodeURIComponent(keyword)}`
        };
        location.href = map[type] || `${base}pages/search.html?keyword=${encodeURIComponent(keyword)}`;
    };

    const render = (kw, d) => {
        const items = [];
        (d.knowledge || []).slice(0, 3).forEach(i => items.push({ type: 'knowledge', id: i.id, title: i.title }));
        (d.topics || []).slice(0, 3).forEach(i => items.push({ type: 'topic', id: i.id, title: i.title }));
        (d.scenarios || []).slice(0, 2).forEach(i => items.push({ type: 'scenario', id: i.id, title: i.title }));
        (d.foodMatches || []).slice(0, 2).forEach(i => items.push({ type: 'food', id: i.id, title: i.title }));

        if (items.length === 0) {
            box.innerHTML = `<div class="nav-search-item"><div class="nav-search-tag">无结果</div><div class="nav-search-title">未找到与“${escapeHtml(kw)}”相关内容</div></div>`;
            show();
            return;
        }

        box.innerHTML = items.slice(0, 8).map(it => `
            <div class="nav-search-item" data-type="${it.type}" data-id="${it.id}">
                <div class="nav-search-tag">${typeMap[it.type] || it.type}</div>
                <div class="nav-search-title">${escapeHtml(it.title || '')}</div>
            </div>
        `).join('');
        show();

        box.querySelectorAll('.nav-search-item[data-id]').forEach(el => {
            el.addEventListener('click', () => {
                jump(el.getAttribute('data-type'), el.getAttribute('data-id'), kw);
            });
        });
    };

    const run = async () => {
        const kw = input.value.trim();
        lastKw = kw;
        if (!kw) {
            hide();
            return;
        }
        const res = await API.Search.search(kw);
        if (!res || res.code !== 200 || !res.data) return;
        if (kw !== lastKw) return;
        render(kw, res.data);
    };

    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(run, 220);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const kw = input.value.trim();
        if (!kw) return;
        location.href = `${base}pages/search.html?keyword=${encodeURIComponent(kw)}`;
    });

    document.addEventListener('click', (e) => {
        if (!box.classList.contains('show')) return;
        if (e.target === input || box.contains(e.target)) return;
        hide();
    });
}

function normalizeImageUrl(url) {
    const u = String(url || '').trim();
    if (!u) return '';
    if (u.startsWith('./images/')) return `../images/${u.slice('./images/'.length)}`;
    if (u.startsWith('/images/')) return `..${u}`;
    return u;
}
