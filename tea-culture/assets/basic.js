/**
 * basic.js - 基础茶识库
 * 对接接口：
 *   - GET /api/knowledge/categories       查询分类
 *   - GET /api/knowledge/list              查询知识列表
 *   - GET /api/knowledge/detail/{id}       查询知识详情
 *   - GET /api/knowledge/wares             查询茶器列表
 *   - GET /api/knowledge/wares/{id}        查询茶器详情
 *   - POST /api/favorite                   收藏
 */

let currentCategory = 'all';
let currentKeyword = '';

document.addEventListener('DOMContentLoaded', async () => {
    const sp = new URLSearchParams(location.search);
    currentKeyword = (sp.get('keyword') || '').trim();

    await loadCategories();
    await loadKnowledgeList();
    await loadWares();

    // 关闭弹窗
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('detailModal')) {
            closeModal();
        }
    });

    const openId = sp.get('openId');
    if (openId) showKnowledgeDetail(parseInt(openId, 10));
});

// ===== 加载分类 =====
async function loadCategories() {
    const sidebar = document.querySelector('.category-list');
    if (!sidebar) return;

    const result = await API.Knowledge.listCategories();
    if (result.code !== 200) {
        console.warn('分类加载失败');
        return;
    }

    let html = `
        <div class="category-item">
            <div class="category-btn active" data-category="all">全部茶识</div>
        </div>
    `;
    result.data.forEach(c => {
        html += `
            <div class="category-item">
                <div class="category-btn" data-category="${c.categoryCode}">${c.categoryName}</div>
            </div>
        `;
    });
    sidebar.innerHTML = html;

    // 绑定事件
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            await loadKnowledgeList();
        });
    });
}

// ===== 加载知识列表 =====
async function loadKnowledgeList() {
    const list = document.getElementById('knowledgeList');
    if (!list) return;

    const params = { pageNum: 1, pageSize: 100 };
    if (currentCategory && currentCategory !== 'all') {
        params.categoryCode = currentCategory;
    }
    if (currentKeyword) params.keyword = currentKeyword;

    const result = await API.Knowledge.list(params);
    if (result.code !== 200) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">加载失败，请刷新重试</p>';
        return;
    }

    const records = result.data.records || [];
    if (records.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂无该分类的茶识内容</p>';
        return;
    }

    list.innerHTML = records.map(item => `
        <div class="knowledge-card" data-id="${item.id}" onclick="showKnowledgeDetail(${item.id})">
            <span class="knowledge-tag">${item.categoryName || ''}</span>
            <h4 class="knowledge-title">${item.title}</h4>
            <p class="knowledge-desc">${item.summary || ''}</p>
        </div>
    `).join('');
}

// ===== 加载茶器列表 =====
async function loadWares() {
    const list = document.querySelector('.teaware-list');
    if (!list) return;

    const result = await API.Knowledge.listWares();
    if (result.code !== 200) return;

    list.innerHTML = (result.data || []).map(w => `
        <div class="teaware-card" onclick="showWareDetail(${w.id})">
            <img src="${normalizeImageUrl(w.image) || ''}" alt="${w.name}">
            <div class="teaware-name">${w.name}</div>
        </div>
    `).join('');
}

// ===== 显示知识详情 =====
async function showKnowledgeDetail(id) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';
    modal.classList.add('active');

    const result = await API.Knowledge.getById(id);
    if (result.code === 200 && result.data) {
        modalContent.innerHTML = renderKnowledgeDetail(result.data);
        // 收藏按钮
        appendFavoriteBtn(modalContent, 'knowledge', id);
        if (window.API && API.Learning) API.Learning.record('knowledge', id).catch(() => {});
    } else {
        modalContent.innerHTML = '<h3>内容加载失败</h3><p>请稍后重试</p>';
    }
}

// ===== 显示茶器详情 =====
async function showWareDetail(id) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';
    modal.classList.add('active');

    const result = await API.Knowledge.getWareById(id);
    if (result.code === 200 && result.data) {
        modalContent.innerHTML = renderWareDetail(result.data);
    } else {
        modalContent.innerHTML = '<h3>内容加载失败</h3><p>请稍后重试</p>';
    }
}

function renderKnowledgeDetail(data) {
    const title = escapeHtml(data?.title || '');
    const imgUrl = normalizeImageUrl(data?.coverImage) || getKnowledgeFallbackImage(title);
    const img = imgUrl ? `<img src="${imgUrl}" alt="${title}" onerror="this.style.display='none'">` : '';
    return `
        <h3>${title}</h3>
        ${img}
        ${renderTextDetail(data?.detailContent)}
    `;
}

function renderWareDetail(data) {
    const title = escapeHtml(data?.name || '');
    const imgUrl = normalizeImageUrl(data?.image) || getWareFallbackImage(title);
    const img = imgUrl ? `<img src="${imgUrl}" alt="${title}" onerror="this.style.display='none'">` : '';
    return `
        <h3>${title}</h3>
        ${img}
        ${renderTextDetail(data?.detailContent)}
    `;
}

function renderTextDetail(text) {
    const t = (text || '').trim();
    if (!t) return '<p style="text-align:center;color:#999;padding:20px;">暂无详情</p>';
    const lines = t.split('\n').map(s => s.trim()).filter(Boolean);
    return lines.map(line => `<p>${escapeHtml(line)}</p>`).join('');
}

function normalizeImageUrl(url) {
    const u = String(url || '').trim();
    if (!u) return '';
    if (u.startsWith('./images/')) return `../images/${u.slice('./images/'.length)}`;
    if (u.startsWith('/images/')) return `..${u}`;
    return u;
}

function getKnowledgeFallbackImage(title) {
    const t = String(title || '');
    if (t.includes('六大茶类')) return '../images/2.4.jpg';
    if (t.includes('绿茶') && (t.includes('水温') || t.includes('冲泡'))) return '../images/2.5.jpg';
    if (t.includes('盖碗')) return '../images/2.6.jpg';
    if (t.includes('养生')) return '../images/2.7.jpg';
    if (t.includes('简史')) return '../images/2.8.png';
    if (t.includes('叩指礼')) return '../images/2.9.png';
    if (t.includes('六君子')) return '../images/2.10.png';
    return '';
}

function getWareFallbackImage(title) {
    const t = String(title || '');
    if (t.includes('紫砂壶')) return '../images/2.1.jpg';
    if (t.includes('白瓷盖碗')) return '../images/2.jpg';
    if (t.includes('玻璃杯')) return '../images/2.3.png';
    return '';
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== 添加收藏按钮 =====
function appendFavoriteBtn(container, targetType, targetId) {
    const btn = document.createElement('button');
    btn.style.cssText = 'margin-top:15px;padding:8px 18px;border:1px solid #ddd;border-radius:6px;cursor:pointer;background:#fff;color:#8b5a2b;';
    let isFavorite = false;

    function render() {
        const icon = isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        btn.innerHTML = `<i class="${icon}"></i> ${isFavorite ? '已收藏' : '收藏'}`;
        if (isFavorite) {
            btn.style.background = '#ff5252';
            btn.style.borderColor = '#ff5252';
            btn.style.color = '#fff';
        } else {
            btn.style.background = '#fff';
            btn.style.borderColor = '#ddd';
            btn.style.color = '#8b5a2b';
        }
    }

    async function init() {
        if (TokenManager.getToken()) {
            const r = await API.Favorite.check(targetType, targetId);
            if (r.code === 200) isFavorite = !!r.data?.isFavorite;
        }
        render();
    }

    btn.onclick = async () => {
        if (!TokenManager.getToken()) {
            alert('请先登录');
            window.location.href = './login.html';
            return;
        }
        if (isFavorite) {
            const r = await API.Favorite.remove(targetType, targetId);
            if (r.code === 200) {
                isFavorite = false;
                render();
            } else {
                alert(r.message || '取消收藏失败');
            }
        } else {
            const r = await API.Favorite.add(targetType, targetId);
            if (r.code === 200) {
                isFavorite = true;
                render();
            } else {
                alert(r.message || '收藏失败');
            }
        }
    };
    container.appendChild(btn);
    init();
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

window.showKnowledgeDetail = showKnowledgeDetail;
window.showWareDetail = showWareDetail;
window.closeModal = closeModal;
