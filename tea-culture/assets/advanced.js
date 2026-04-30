/**
 * advanced.js - 进阶专题馆
 * 对接接口：
 *   - GET /api/topic/categories            查询专题分类
 *   - GET /api/topic/list                  查询专题列表
 *   - GET /api/topic/detail/{key}          查询专题详情
 *   - POST /api/favorite                   收藏
 */

let currentTopicCode = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    await loadTopicCategories();
    await loadTopicList();

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('detailModal')) {
            closeModal();
        }
    });
});

// ===== 加载专题分类 =====
async function loadTopicCategories() {
    const tabs = document.querySelector('.topic-tabs');
    if (!tabs) return;

    const result = await API.Topic.listCategories();
    if (result.code !== 200) return;

    let html = `<div class="topic-btn active" data-topic="all">全部专题</div>`;
    result.data.forEach(c => {
        html += `<div class="topic-btn" data-topic="${c.topicCode}">${c.topicName}</div>`;
    });
    tabs.innerHTML = html;

    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTopicCode = btn.getAttribute('data-topic');
            await loadTopicList();
        });
    });
}

// ===== 加载专题列表 =====
async function loadTopicList() {
    const list = document.getElementById('topicList');
    if (!list) return;

    const params = { pageNum: 1, pageSize: 100 };
    if (currentTopicCode && currentTopicCode !== 'all') {
        params.topicCode = currentTopicCode;
    }

    const result = await API.Topic.list(params);
    if (result.code !== 200) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">加载失败</p>';
        return;
    }

    const records = result.data.records || [];
    if (records.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂无该分类的专题内容</p>';
        return;
    }

    list.innerHTML = records.map(item => `
        <div class="topic-card" data-topic="${item.topicCode}">
            <div class="topic-card-img">
                <img src="${item.coverImage || ''}" alt="${item.title}">
            </div>
            <div class="topic-card-content">
                <span class="topic-tag">${item.topicName || ''}</span>
                <h3>${item.title}</h3>
                <p class="topic-desc">${item.summary || ''}</p>
                <div class="detail-btn" onclick="openTopicModal('${item.topicKey}', ${item.id})">查看详情</div>
            </div>
        </div>
    `).join('');
}

// ===== 显示专题详情 =====
async function openTopicModal(topicKey, id) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';
    modal.classList.add('active');

    const result = await API.Topic.getByKey(topicKey);
    if (result.code === 200 && result.data) {
        modalContent.innerHTML = result.data.detailContent || '<p>暂无详情</p>';
        // 添加收藏按钮
        appendFavoriteBtn(modalContent, 'topic', id, topicKey);
    } else {
        modalContent.innerHTML = '<h3>内容加载失败</h3><p>请稍后重试</p>';
    }
}

function appendFavoriteBtn(container, targetType, targetId, targetKey) {
    if (!TokenManager.getToken()) return;
    const btn = document.createElement('button');
    btn.style.cssText = 'margin-top:15px;padding:8px 18px;background:#8b5a2b;color:#fff;border:none;border-radius:6px;cursor:pointer;';
    btn.innerHTML = '<i class="fas fa-heart"></i> 收藏';
    btn.onclick = async () => {
        const result = await API.Favorite.add(targetType, targetId, targetKey);
        if (result.code === 200) {
            btn.innerHTML = '<i class="fas fa-check"></i> 已收藏';
            btn.disabled = true;
        } else {
            alert(result.message || '收藏失败');
        }
    };
    container.appendChild(btn);
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

window.openTopicModal = openTopicModal;
window.closeModal = closeModal;
