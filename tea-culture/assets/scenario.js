/**
 * scenario.js - 场景化教程
 * 对接接口：
 *   - GET /api/scenario/list                       查询教程列表
 *   - GET /api/scenario/detail/{id}                查询教程详情（含冲泡参数）
 *   - GET /api/scenario/params/{scenarioId}        查询冲泡参数
 *   - POST /api/device/command                     上报设备指令日志
 *   - POST /api/favorite                           收藏
 */

let currentScenarioType = 'all';
let currentParams = null;
let currentKeyword = '';

document.addEventListener('DOMContentLoaded', async () => {
    const sp = new URLSearchParams(location.search);
    currentKeyword = (sp.get('keyword') || '').trim();

    await loadScenarioList();
    bindTabEvents();

    // MQTT 状态监听
    if (window.mqttManager) {
        mqttManager.onStatusChange(updateDeviceStatusUI);
    }

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('detailModal')) {
            closeModal();
        }
    });

    const openId = sp.get('openId');
    if (openId) openScenarioModal(parseInt(openId, 10));
});

// ===== 绑定 Tab 切换 =====
function bindTabEvents() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentScenarioType = btn.getAttribute('data-scenario');
            await loadScenarioList();
        });
    });
}

// ===== 加载教程列表 =====
async function loadScenarioList() {
    const list = document.getElementById('scenarioList');
    if (!list) return;

    const params = { pageNum: 1, pageSize: 100 };
    if (currentScenarioType && currentScenarioType !== 'all') {
        params.scenarioType = currentScenarioType;
    }
    if (currentKeyword) params.keyword = currentKeyword;

    const result = await API.Scenario.list(params);
    if (result.code !== 200) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">加载失败</p>';
        return;
    }

    const records = result.data.records || [];
    if (records.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂无教程</p>';
        return;
    }

    const typeNameMap = { home: '居家饮茶', office: '办公饮茶', outdoor: '户外饮茶' };
    list.innerHTML = records.map(item => `
        <div class="scenario-card" data-scenario="${item.scenarioType}">
            <div class="scenario-card-img">
                <img src="${item.coverImage || ''}" alt="${item.title}">
            </div>
            <div class="scenario-card-content">
                <span class="scenario-tag">${typeNameMap[item.scenarioType] || ''}</span>
                <h3>${item.title}</h3>
                <p class="scenario-desc">${item.summary || ''}</p>
            <div class="view-btn" onclick="openScenarioModal(${item.id})">查看教程</div>
            </div>
        </div>
    `).join('');
}

// ===== 显示教程详情 =====
async function openScenarioModal(id) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';
    modal.classList.add('active');

    const result = await API.Scenario.getById(id);
    if (result.code !== 200 || !result.data) {
        modalContent.innerHTML = '<h3>内容加载失败</h3>';
        return;
    }

    const scenario = result.data.scenario || result.data;
    const param = result.data.brewingParam || {};
    currentParams = param;

    modalContent.innerHTML = renderScenarioDetail(scenario, param);

    bindSyncButton();
    appendFavoriteBtn(modalContent, 'scenario', id);
    if (window.API && API.Learning) API.Learning.record('scenario', id).catch(() => {});
}

function renderScenarioDetail(scenario, param) {
    const title = escapeHtml(scenario?.title || '');
    const img = scenario?.coverImage ? `<img src="${scenario.coverImage}" alt="${title}" style="max-width:100%; border-radius:8px;">` : '';

    const parsed = parseScenarioDetail(String(scenario?.detailContent || ''));
    const toolsHtml = parsed.tools.length
        ? parsed.tools.map(t => `<li>${escapeHtml(t)}</li>`).join('')
        : '<li>—</li>';
    const stepsHtml = parsed.steps.length
        ? parsed.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')
        : '<li>—</li>';
    const tipsHtml = parsed.tips.length
        ? parsed.tips.map(t => `<p>• ${escapeHtml(t)}</p>`).join('')
        : '<p>• —</p>';

    const paramHtml = `
        <div class="param-section">
            <h4>推荐冲泡参数</h4>
            <div class="param-grid">
                <div class="param-item"><div class="param-label">茶类</div><div class="param-value">${escapeHtml(param?.teaType || '—')}</div></div>
                <div class="param-item"><div class="param-label">投茶量</div><div class="param-value">${escapeHtml(param?.amount || '—')}</div></div>
                <div class="param-item"><div class="param-label">水温</div><div class="param-value">${escapeHtml(param?.waterTemp || '—')}</div></div>
                <div class="param-item"><div class="param-label">冲泡时长</div><div class="param-value">${escapeHtml(param?.brewTime || '—')}</div></div>
                <div class="param-item"><div class="param-label">备注</div><div class="param-value">${escapeHtml(param?.note || '—')}</div></div>
            </div>
            <button class="sync-btn" id="syncDeviceBtn"><i class="fas fa-sync-alt"></i> 一键同步设备</button>
            <div class="sync-status" id="syncStatus"></div>
        </div>
    `;

    return `
        <h3>${title}</h3>
        ${img}
        <h4 class="step-title">准备工具</h4>
        <ul class="step-list">${toolsHtml}</ul>
        ${paramHtml}
        <h4 class="step-title">冲泡步骤</h4>
        <ul class="step-list">${stepsHtml}</ul>
        <div class="tips-box"><h4>小贴士</h4>${tipsHtml}</div>
    `;
}

function parseScenarioDetail(text) {
    const src = (text || '').trim();
    if (!src) return { tools: [], steps: [], tips: [] };

    const norm = src.replace(/\r\n/g, '\n');

    const toolIdx = norm.search(/工具[:：]/);
    const stepIdx = norm.search(/步骤[:：]/);
    const tipIdx = norm.search(/提示[:：]|小贴士[:：]/);

    const seg = (start, end) => {
        if (start < 0) return '';
        const s = norm.slice(start).replace(/^(工具|步骤|提示|小贴士)[:：]\s*/, '');
        if (end < 0) return s;
        return norm.slice(start, end).replace(/^(工具|步骤|提示|小贴士)[:：]\s*/, '');
    };

    const toolsText = toolIdx >= 0 ? seg(toolIdx, stepIdx >= 0 ? stepIdx : tipIdx) : '';
    const stepsText = stepIdx >= 0 ? seg(stepIdx, tipIdx) : '';
    const tipsText = tipIdx >= 0 ? seg(tipIdx, -1) : '';

    const splitTools = (s) => s
        .split(/[、，,;；\n]/)
        .map(x => x.trim())
        .filter(Boolean);
    const splitSteps = (s) => s
        .replace(/->/g, '→')
        .split(/[→\n;；。]/)
        .map(x => x.trim())
        .filter(Boolean);
    const splitTips = (s) => s
        .split(/[\n;；。]/)
        .map(x => x.trim())
        .filter(Boolean);

    const tools = toolsText ? splitTools(toolsText) : [];
    const steps = stepsText ? splitSteps(stepsText) : (toolIdx >= 0 || tipIdx >= 0 ? [] : splitSteps(norm));
    const tips = tipsText ? splitTips(tipsText) : [];

    return { tools, steps, tips };
}

function renderTextDetail(text) {
    const t = (text || '').trim();
    if (!t) return '<p style="text-align:center;color:#999;padding:20px;">暂无详情</p>';
    return `<div style="white-space:pre-wrap;line-height:1.8;">${escapeHtml(t)}</div>`;
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== 绑定同步按钮 =====
function bindSyncButton() {
    const syncBtn = document.getElementById('syncDeviceBtn');
    const syncStatus = document.getElementById('syncStatus');
    if (!syncBtn || !currentParams) return;

    if (window.DataValidator) {
        const validation = DataValidator.validateBrewParams(currentParams);
        if (!validation.isValid) {
            syncStatus.innerHTML = '参数配置异常';
            return;
        }
    }

    const newBtn = syncBtn.cloneNode(true);
    syncBtn.parentNode.replaceChild(newBtn, syncBtn);

    newBtn.addEventListener('click', async () => {
        console.log("当前的连接状态",mqttManager.isConnected())
        console.log("window的状态",window.mqttManager)
        if (!window.mqttManager || !mqttManager.isConnected()) {
            syncStatus.innerHTML = '设备离线，无法同步';
            return;
        }

        const command = {
            type: 'brew',
            teaType: currentParams.teaType,
            amount: currentParams.amount,
            waterTemp: currentParams.waterTemp,
            brewTime: currentParams.brewTime,
            note: currentParams.note,
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
            if (err) {
                syncStatus.innerHTML = '指令发送失败';
                // 上报失败日志
                await API.Device.reportCommand({
                    deviceId: 'tea_simulator',
                    commandType: 'brew',
                    topic: mqttManager.brewTopic,
                    teaType: command.teaType,
                    amount: command.amount,
                    waterTemp: command.waterTemp,
                    brewTime: command.brewTime,
                    note: command.note,
                    payload: JSON.stringify(command),
                    result: 2,
                    errorMsg: err.message
                });
            } else {
                syncStatus.innerHTML = '指令已下发，设备执行中';
                // 上报成功日志
                await API.Device.reportCommand({
                    deviceId: 'tea_simulator',
                    commandType: 'brew',
                    topic: mqttManager.brewTopic,
                    teaType: command.teaType,
                    amount: command.amount,
                    waterTemp: command.waterTemp,
                    brewTime: command.brewTime,
                    note: command.note,
                    payload: JSON.stringify(command),
                    result: 1
                });
                setTimeout(() => {
                    if (syncStatus.innerHTML.includes('执行中')) {
                        syncStatus.innerHTML = '设备执行完成，参数已生效';
                    }
                }, 3000);
            }
        });
    });
}

// ===== 设备状态 UI =====
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

window.openScenarioModal = openScenarioModal;
window.closeModal = closeModal;
