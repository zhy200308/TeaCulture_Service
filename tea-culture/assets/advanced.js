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
                ${renderTopicCardImage(item)}
            </div>
            <div class="topic-card-content">
                <span class="topic-tag">${item.topicName || ''}</span>
                <h3>${item.title}</h3>
                <p class="topic-desc">${item.summary || ''}</p>
                <div class="detail-btn" onclick="openTopicModal(${item.id})">查看详情</div>
            </div>
        </div>
    `).join('');
}

// ===== 显示专题详情 =====
async function openTopicModal(id) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';
    modal.classList.add('active');

    const result = await API.Topic.getById(id);
    if (result.code === 200 && result.data) {
        modalContent.innerHTML = renderTopicDetail(result.data);
        // 添加收藏按钮
        appendFavoriteBtn(modalContent, 'topic', id);
        if (window.API && API.Learning) API.Learning.record('topic', id).catch(() => {});
    } else {
        modalContent.innerHTML = '<h3>内容加载失败</h3><p>请稍后重试</p>';
    }
}

function renderTopicDetail(data) {
    const title = escapeHtml(data?.title || '');
    const imgUrl = normalizeImageUrl(data?.coverImage) || getTopicFallbackImage(title);
    const img = imgUrl ? `<img src="${imgUrl}" alt="${title}" onerror="this.style.display='none'">` : '';

    const audioUrl = normalizeImageUrl(data?.audioUrl) || (title.includes('陈皮普洱') ? '../images/3.5.m4a' : '');
    const audioHtml = audioUrl ? `<div class="audio-player"><audio controls src="${audioUrl}"></audio></div>` : '';

    const { sections, tip, classic } = parseTopicContent(String(data?.detailContent || ''));
    const classicTitle = classic ? resolveClassicTitle(classic) : '';
    const classicHtml = classic ? `<div class="classic-text"><h4>${escapeHtml(classicTitle)}</h4><p>${escapeHtml(classic)}</p></div>` : '';

    const coreTitle = resolveCoreSectionTitle(data);
    const summary = String(data?.summary || '').trim();
    const coreHtml = summary
        ? `
            <div class="topic-section">
                <h4>${escapeHtml(coreTitle)}</h4>
                <p>${escapeHtml(summary)}</p>
            </div>
        `
        : '';

    const sectionHtml = sections.map(s => `
        <div class="topic-section">
            <h4>${escapeHtml(s.title)}</h4>
            ${s.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
        </div>
    `).join('');

    const tipHtml = tip ? `<div class="tips-box"><h4>小贴士</h4><p>${escapeHtml(tip)}</p></div>` : '';

    return `
        <h3>${title}</h3>
        ${img}
        ${coreHtml}
        ${sectionHtml}
        ${classicHtml}
        ${audioHtml}
        ${tipHtml}
    `;
}

function parseTopicContent(text) {
    const src = (text || '').trim();
    if (!src) return { sections: [], tip: '', classic: '' };

    const lines = src.replace(/\r\n/g, '\n').split('\n').map(s => s.trim()).filter(Boolean);
    const sections = [];
    let tip = '';
    let classic = '';
    let current = null;

    const pushCurrent = () => {
        if (current && current.paragraphs.length) sections.push(current);
        current = null;
    };

    lines.forEach(line => {
        const m = line.match(/^([^：]{2,20})[:：]\s*(.*)$/);
        if (m) {
            const key = m[1].trim();
            const rest = (m[2] || '').trim();
            if (key.includes('小贴士')) {
                pushCurrent();
                tip = rest || '';
                return;
            }
            if (key.includes('典籍选读')) {
                pushCurrent();
                classic = rest.replace(/^《/, '《');
                return;
            }
            pushCurrent();
            current = { title: key, paragraphs: [] };
            if (rest) current.paragraphs.push(rest);
            return;
        }

        if (!current) current = { title: '内容', paragraphs: [] };
        current.paragraphs.push(line);
    });

    pushCurrent();
    return { sections, tip, classic };
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalizeImageUrl(url) {
    const u = String(url || '').trim();
    if (!u) return '';
    if (u.startsWith('./images/')) return `../images/${u.slice('./images/'.length)}`;
    if (u.startsWith('/images/')) return `..${u}`;
    return u;
}

function getTopicFallbackImage(title) {
    const t = String(title || '');
    if (t.includes('普洱茶熟茶发酵工艺')) return '../images/3.png';
    if (t.includes('西湖龙井核心产区')) return '../images/3.1.png';
    if (t.includes('乌龙茶香气品鉴技巧')) return '../images/3.2.png';
    if (t.includes('白茶自然萎凋工艺')) return '../images/3.3.png';
    if (t.includes('陈皮普洱')) return '../images/3.4.jpg';
    if (t.includes('唐宋茶器')) return '../images/3.6.png';
    return '';
}

function resolveTopicImage(item) {
    const cover = normalizeImageUrl(item?.coverImage);
    if (cover) return cover;
    return getTopicFallbackImage(item?.title || '');
}

function renderTopicCardImage(item) {
    const url = resolveTopicImage(item);
    if (!url) return '';
    return `<img src="${url}" alt="${escapeHtml(item?.title || '')}" onerror="this.style.display='none'">`;
}

function resolveClassicTitle(text) {
    const m = String(text || '').match(/(《[^》]{1,30}》)/);
    if (m) return `典籍选读 · ${m[1]}`;
    return '典籍选读';
}

function resolveCoreSectionTitle(data) {
    const title = String(data?.title || '');
    if (title.includes('发酵') || title.includes('萎凋') || title.includes('工艺')) return '工艺核心';
    if (title.includes('产区')) return '五大核心产区';
    if (title.includes('品鉴')) return '品鉴三步法';
    if (title.includes('茶疗')) return '茶疗原理';
    if (title.includes('唐宋') || title.includes('茶器')) return '唐代茶器';
    return '核心内容';
}

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

window.openTopicModal = openTopicModal;
window.closeModal = closeModal;
