function toInt(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function formatDay(d) {
    const m = String(d || '');
    if (!m) return '';
    return m;
}

function renderBars(container, rows, nameKey, valueKey) {
    if (!container) return;
    const max = Math.max(1, ...rows.map(r => toInt(r[valueKey])));
    container.innerHTML = `
        <div class="bar-list">
            ${rows.map(r => {
                const v = toInt(r[valueKey]);
                const pct = Math.round(v * 100 / max);
                return `
                    <div class="bar-row">
                        <div class="bar-name">${r[nameKey]}</div>
                        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                        <div class="bar-val">${v}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function loadDashboard() {
    const res = await API.AdminDashboard.stats();
    if (!res || res.code !== 200) {
        alert(res?.message || '加载失败');
        return;
    }
    const d = res.data || {};

    const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(val ?? '0');
    };

    setText('kpiUserCount', d.userCount);
    setText('kpiKnowledgeCount', d.knowledgeCount);
    setText('kpiTopicCount', d.topicCount);
    setText('kpiScenarioCount', d.scenarioCount);
    setText('kpiFoodCount', d.foodCount);

    const typeMap = { knowledge: '茶识', topic: '专题', scenario: '场景教程', food: '茶食搭配' };
    const favRows = (d.favoriteAgg || []).map(r => ({
        name: typeMap[r.targetType] || r.targetType,
        value: toInt(r.favoriteCount),
        userCount: toInt(r.userCount)
    })).sort((a, b) => b.value - a.value);

    renderBars(document.getElementById('favChart'), favRows, 'name', 'value');
    const favNote = document.getElementById('favNote');
    if (favNote) {
        favNote.textContent = favRows.length
            ? favRows.map(r => `${r.name}：${r.value}次收藏 / ${r.userCount}人`).join('，')
            : '暂无收藏数据';
    }

    const start = d.learningStartDay ? new Date(d.learningStartDay + 'T00:00:00') : new Date();
    const dayMap = new Map();
    (d.learningAgg || []).forEach(r => {
        dayMap.set(String(r.day), toInt(r.cnt));
    });

    const days = [];
    for (let i = 0; i < 7; i++) {
        const dd = new Date(start.getTime() + i * 86400000);
        const key = dd.toISOString().slice(0, 10);
        days.push({ name: formatDay(key), value: dayMap.get(key) || 0 });
    }

    renderBars(document.getElementById('learnChart'), days, 'name', 'value');

    const learnTypeRows = (d.learningByType || []).map(r => ({
        name: typeMap[r.targetType] || r.targetType,
        value: toInt(r.cnt)
    })).sort((a, b) => b.value - a.value);

    renderBars(document.getElementById('learnTypeChart'), learnTypeRows, 'name', 'value');
}

document.addEventListener('DOMContentLoaded', () => {
    if (!AdminCommon.requireAdmin()) return;
    AdminCommon.bindAdminHeader();
    loadDashboard();
});

