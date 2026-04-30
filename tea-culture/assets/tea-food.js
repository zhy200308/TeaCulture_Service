/**
 * tea-food.js - 茶食搭配
 * 对接接口：
 *   - GET /api/tea-food/list                       查询搭配列表
 *   - GET /api/tea-food/detail/{id}                查询搭配详情（含设备参数）
 *   - GET /api/tea-food/tea-params/{teaTypeCode}   查询茶类设备参数
 *   - POST /api/device/command                     上报设备指令日志
 *   - POST /api/favorite                           收藏
 */

let currentTeaType = 'all';
let currentTeaParam = null;
let allMatches = [];
let teaTypeNameMap = {};

document.addEventListener('DOMContentLoaded', async () => {
    await initTeaFood();

    if (window.mqttManager) {
        mqttManager.onStatusChange(updateDeviceStatusUI);
    }
// 1. 看回调有没有注册上
    mqttManager.onStatusChange(c => console.log('回调收到:', c));

// 2. 手动触发一次 UI 更新
    document.getElementById('deviceStatusText').innerText = '在线';
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('detailModal')) {
            closeModal();
        }
    });
});

async function initTeaFood() {
    await loadTeaTypesAndMatches();
    renderTeaTabs();
    bindTabEvents();
    renderMatchList();
}

async function loadTeaTypesAndMatches() {
    const listResp = await API.TeaFood.list({});
    allMatches = listResp.code === 200 ? (listResp.data || []) : [];

    const paramsResp = await API.TeaFood.listTeaTypeParams();
    const params = paramsResp.code === 200 ? (paramsResp.data || []) : [];
    teaTypeNameMap = {};
    params.forEach(p => {
        if (p && p.teaTypeCode) teaTypeNameMap[p.teaTypeCode] = p.teaTypeName || p.teaTypeCode;
    });
}

function renderTeaTabs() {
    const container = document.querySelector('.tea-tabs');
    if (!container) return;

    const codes = Array.from(new Set(allMatches.map(m => m.teaTypeCode).filter(Boolean)));
    const tabs = [{ code: 'all', name: '全部茶类' }].concat(
        codes.map(code => ({ code, name: teaTypeNameMap[code] || code }))
    );

    container.innerHTML = tabs.map(t => `
        <div class="tea-btn ${t.code === currentTeaType ? 'active' : ''}" data-tea="${t.code}">${escapeHtml(t.name)}</div>
    `).join('');
}

function bindTabEvents() {
    document.querySelectorAll('.tea-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tea-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTeaType = btn.getAttribute('data-tea');
            renderMatchList();
        });
    });
}

function renderMatchList() {
    const list = document.getElementById('matchList');
    if (!list) return;

    const records = currentTeaType === 'all'
        ? allMatches
        : allMatches.filter(m => m.teaTypeCode === currentTeaType);

    if (!records.length) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂无搭配</p>';
        return;
    }

    list.innerHTML = records.map(item => `
        <div class="match-card" data-tea="${item.teaTypeCode}">
            <div class="match-card-img">
                <img src="${item.coverImage || ''}" alt="${item.title}">
            </div>
            <div class="match-card-content">
                <span class="tea-tag">${escapeHtml(teaTypeNameMap[item.teaTypeCode] || item.teaName || item.teaTypeCode || '')}</span>
                <h3>${escapeHtml(item.title || '')}</h3>
                <p class="match-desc">${escapeHtml(item.summary || '')}</p>
                <div class="detail-btn" onclick="openMatchModal(${item.id})">查看详情</div>
            </div>
        </div>
    `).join('');
}

// ===== 显示搭配详情 =====
async function openMatchModal(id) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';
    modal.classList.add('active');

    const result = await API.TeaFood.getById(id);
    if (result.code !== 200 || !result.data) {
        modalContent.innerHTML = '<h3>内容加载失败</h3>';
        return;
    }

    const match = result.data.match || result.data;
    const param = result.data.teaTypeParam || {};
    currentTeaParam = param;

    let html = renderMatchDetail(match);

    // 拼接设备参数 + 同步按钮
    html += `
        <div class="param-section">
            <h4>智能茶器参数推荐</h4>
            <div class="param-grid">
                <div class="param-item"><div class="param-label">水温</div><div class="param-value">${param.waterTemp || '—'}</div></div>
                <div class="param-item"><div class="param-label">投茶量</div><div class="param-value">${param.amount || '—'}</div></div>
                <div class="param-item"><div class="param-label">冲泡时长</div><div class="param-value">${param.brewTime || '—'}</div></div>
                <div class="param-item"><div class="param-label">备注</div><div class="param-value">${param.note || '—'}</div></div>
            </div>
            <button class="sync-btn" id="syncDeviceBtn"><i class="fas fa-sync-alt"></i> 一键同步设备</button>
            <div class="sync-status" id="syncStatus"></div>
        </div>
    `;

    modalContent.innerHTML = html;

    bindSyncButton();
    appendFavoriteBtn(modalContent, 'food', id);
    if (window.API && API.Learning) API.Learning.record('food', id).catch(() => {});
}

function renderMatchDetail(match) {
    const title = escapeHtml(match?.title || '');
    const img = match?.coverImage ? `<img src="${match.coverImage}" alt="${title}">` : '';

    const detail = String(match?.detailContent || '').trim();
    if (!detail) {
        return `
            <h3>${title}</h3>
            ${img}
            <p style="text-align:center;color:#999;padding:20px;">暂无详情</p>
        `;
    }

    const lines = detail.split('\n').map(s => s.trim()).filter(Boolean);

    let matchTea = '';
    let reason = '';
    let suggest = '';
    let tip = '';
    const others = [];

    lines.forEach(line => {
        const m1 = line.match(/^适配茶品[:：]\s*(.*)$/);
        const m2 = line.match(/^搭配理由[:：]\s*(.*)$/);
        const m3 = line.match(/^食用建议[:：]\s*(.*)$/);
        const m4 = line.match(/^小贴士[:：]\s*(.*)$/);
        if (m1) matchTea = m1[1];
        else if (m2) reason = m2[1];
        else if (m3) suggest = m3[1];
        else if (m4) tip = m4[1];
        else others.push(line);
    });

    const info = [];
    if (matchTea) info.push(`<p class="match-info"><strong>适配茶品</strong>：${escapeHtml(matchTea)}</p>`);
    if (reason) info.push(`<p class="match-info"><strong>搭配理由</strong>：${escapeHtml(reason)}</p>`);
    if (suggest) info.push(`<p class="match-info"><strong>食用建议</strong>：${escapeHtml(suggest)}</p>`);
    others.forEach(t => info.push(`<p class="match-info">${escapeHtml(t)}</p>`));

    const tipHtml = tip
        ? `<div class="note-box"><h4>小贴士</h4><p>${escapeHtml(tip)}</p></div>`
        : '';

    return `
        <h3>${title}</h3>
        ${img}
        ${info.join('')}
        ${tipHtml}
    `;
}

function renderTextDetail(text) {
    const t = (text || '').trim();
    if (!t) return '<p style="text-align:center;color:#999;padding:20px;">暂无详情</p>';
    return `<div style="white-space:pre-wrap;line-height:1.8;">${escapeHtml(t)}</div>`;
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function bindSyncButton() {
    const syncBtn = document.getElementById('syncDeviceBtn');
    const syncStatus = document.getElementById('syncStatus');
    if (!syncBtn || !currentTeaParam) return;

    if (window.DataValidator) {
        const validation = DataValidator.validateBrewParams({
            amount: currentTeaParam.amount,
            waterTemp: currentTeaParam.waterTemp
        });
        if (!validation.isValid) {
            syncStatus.innerHTML = '参数配置异常';
            return;
        }
    }

    const newBtn = syncBtn.cloneNode(true);
    syncBtn.parentNode.replaceChild(newBtn, syncBtn);

    newBtn.addEventListener('click', async () => {
        if (!window.mqttManager || !mqttManager.isConnected()) {
            syncStatus.innerHTML = '设备离线，无法同步';
            return;
        }

        const command = {
            type: 'brew',
            teaType: currentTeaParam.teaTypeName || currentTeaParam.teaType,
            amount: currentTeaParam.amount,
            waterTemp: currentTeaParam.waterTemp,
            brewTime: currentTeaParam.brewTime,
            note: currentTeaParam.note,
            timestamp: Date.now()
        };

        if (window.DataValidator) {
            const msgValidation = DataValidator.validateMqttMessage(command);
            if (!msgValidation.isValid) {
                syncStatus.innerHTML = '消息格式错误';
                return;
            }
        }

        syncStatus.innerHTML = '指令发送中...';
        newBtn.disabled = true;

        mqttManager.publish(mqttManager.brewTopic, command, 1, async (err) => {
            newBtn.disabled = false;
            const logData = {
                deviceId: 'tea_simulator',
                commandType: 'brew',
                topic: mqttManager.brewTopic,
                teaType: command.teaType,
                amount: command.amount,
                waterTemp: command.waterTemp,
                brewTime: command.brewTime,
                note: command.note,
                payload: JSON.stringify(command),
                result: err ? 2 : 1,
                errorMsg: err ? err.message : null
            };
            await API.Device.reportCommand(logData);

            if (err) {
                syncStatus.innerHTML = '指令发送失败';
            } else {
                syncStatus.innerHTML = '指令已下发，设备执行中';
                setTimeout(() => {
                    if (syncStatus.innerHTML.includes('执行中')) {
                        syncStatus.innerHTML = '设备执行完成，参数已生效';
                    }
                }, 3000);
            }
        });
    });
}

function updateDeviceStatusUI(connected) {
    const statusText = document.getElementById('deviceStatusText');
    const indicator = document.getElementById('deviceStatusIndicator');
    if (statusText && indicator) {
        statusText.innerText = connected ? '在线' : '离线';
        indicator.className = 'status-indicator ' + (connected ? 'status-online' : 'status-offline');
    }
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

window.openMatchModal = openMatchModal;
window.closeModal = closeModal;
