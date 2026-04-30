function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setQueryKeyword(keyword) {
    const sp = new URLSearchParams(location.search);
    if (!keyword) sp.delete('keyword');
    else sp.set('keyword', keyword);
    const qs = sp.toString();
    const url = location.pathname + (qs ? '?' + qs : '');
    history.replaceState({}, '', url);
}

function buildItemHtml(item, type) {
    const title = escapeHtml(item.title || '');
    const summary = escapeHtml(item.summary || '');
    const id = item.id;
    const tagMap = { knowledge: '茶识', topic: '专题', scenario: '教程', food: '茶食搭配' };
    const iconMap = { knowledge: 'fa-book-open', topic: 'fa-layer-group', scenario: 'fa-mug-hot', food: 'fa-utensils' };

    return `
        <div class="result-item" data-type="${type}" data-id="${id}">
            <div class="result-title">${title}</div>
            <div class="result-summary">${summary || '暂无摘要'}</div>
            <div class="result-tag"><i class="fas ${iconMap[type]}"></i>${tagMap[type]}</div>
        </div>
    `;
}

function bindItemClicks() {
    document.querySelectorAll('.result-item').forEach(el => {
        el.addEventListener('click', () => {
            const type = el.getAttribute('data-type');
            const id = el.getAttribute('data-id');
            if (!type || !id) return;
            const map = {
                knowledge: `./basic.html?openId=${encodeURIComponent(id)}`,
                topic: `./advanced.html?openId=${encodeURIComponent(id)}`,
                scenario: `./scenario.html?openId=${encodeURIComponent(id)}`,
                food: `./tea-food.html?openId=${encodeURIComponent(id)}`
            };
            location.href = map[type] || './basic.html';
        });
    });
}

function renderSection(id, title, icon, items, type) {
    const box = document.getElementById(id);
    if (!box) return;
    const list = (items || []).map(it => buildItemHtml(it, type)).join('');
    box.innerHTML = `
        <h3><i class="fas ${icon}"></i>${title}<span class="result-count">${(items || []).length}</span></h3>
        <div class="result-list">${list || '<div style="color:#999;padding:10px;">暂无匹配内容</div>'}</div>
    `;
}

async function doSearch(keyword) {
    const kw = String(keyword || '').trim();
    const tip = document.getElementById('searchTip');
    if (tip) tip.textContent = kw ? `关键词：${kw}` : '请输入关键词搜索';
    if (!kw) {
        renderSection('secKnowledge', '茶识', 'fa-book-open', [], 'knowledge');
        renderSection('secTopic', '专题', 'fa-layer-group', [], 'topic');
        renderSection('secScenario', '教程', 'fa-mug-hot', [], 'scenario');
        renderSection('secFood', '茶食搭配', 'fa-utensils', [], 'food');
        bindItemClicks();
        return;
    }

    const res = await API.Search.search(kw);
    if (!res || res.code !== 200) {
        alert(res?.message || '搜索失败');
        return;
    }
    const d = res.data || {};
    renderSection('secKnowledge', '茶识', 'fa-book-open', d.knowledge || [], 'knowledge');
    renderSection('secTopic', '专题', 'fa-layer-group', d.topics || [], 'topic');
    renderSection('secScenario', '教程', 'fa-mug-hot', d.scenarios || [], 'scenario');
    renderSection('secFood', '茶食搭配', 'fa-utensils', d.foodMatches || [], 'food');
    bindItemClicks();
}

document.addEventListener('DOMContentLoaded', async () => {
    const sp = new URLSearchParams(location.search);
    const kw = sp.get('keyword') || '';
    const input = document.getElementById('pageSearchInput');
    if (input) {
        input.value = kw;
        input.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            const next = input.value.trim();
            setQueryKeyword(next);
            doSearch(next);
        });
    }
    await doSearch(kw);
});

