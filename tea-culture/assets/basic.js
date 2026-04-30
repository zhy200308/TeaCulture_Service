/**
 * basic.js - 基础茶识库
 * 对接接口：
 *   - GET /api/knowledge/categories       查询分类
 *   - GET /api/knowledge/list              查询知识列表
 *   - GET /api/knowledge/detail/{key}      查询知识详情
 *   - GET /api/knowledge/wares             查询茶器列表
 *   - GET /api/knowledge/wares/{key}       查询茶器详情
 *   - POST /api/favorite                   收藏
 */

let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadKnowledgeList();
    await loadWares();

    // 关闭弹窗
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('detailModal')) {
            closeModal();
        }
    });
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
        <div class="knowledge-card" data-key="${item.knowledgeKey}" data-id="${item.id}" onclick="showKnowledgeDetail('${item.knowledgeKey}', ${item.id})">
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
        <div class="teaware-card" onclick="showWareDetail('${w.wareKey}')">
            <img src="${w.image || ''}" alt="${w.name}">
            <div class="teaware-name">${w.name}</div>
        </div>
    `).join('');
}

// ===== 显示知识详情 =====
async function showKnowledgeDetail(key, id) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';
    modal.classList.add('active');

    const result = await API.Knowledge.getByKey(key);
    if (result.code === 200 && result.data) {
        modalContent.innerHTML = renderTextDetail(result.data.detailContent);
        // 收藏按钮
        appendFavoriteBtn(modalContent, 'knowledge', id, key);
    } else {
        modalContent.innerHTML = '<h3>内容加载失败</h3><p>请稍后重试</p>';
    }
}

// ===== 显示茶器详情 =====
async function showWareDetail(key) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';
    modal.classList.add('active');

    const result = await API.Knowledge.getWareByKey(key);
    if (result.code === 200 && result.data) {
        modalContent.innerHTML = renderTextDetail(result.data.detailContent);
    } else {
        modalContent.innerHTML = '<h3>内容加载失败</h3><p>请稍后重试</p>';
    }
}

function renderTextDetail(text) {
    const t = (text || '').trim();
    if (!t) return '<p style="text-align:center;color:#999;padding:20px;">暂无详情</p>';
    return `<div style="white-space:pre-wrap;line-height:1.8;">${escapeHtml(t)}</div>`;
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== 添加收藏按钮 =====
function appendFavoriteBtn(container, targetType, targetId, targetKey) {
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
            const r = await API.Favorite.add(targetType, targetId, targetKey);
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
