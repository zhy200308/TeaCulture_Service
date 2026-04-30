/**
 * tea-food.js - 茶食搭配
 * 对接接口：
 *   - GET /api/tea-food/list                       查询搭配列表
 *   - GET /api/tea-food/detail/{key}               查询搭配详情（含设备参数）
 *   - GET /api/tea-food/tea-params/{teaTypeCode}   查询茶类设备参数
 *   - POST /api/device/command                     上报设备指令日志
 *   - POST /api/favorite                           收藏
 */

let currentTeaType = 'all';
let currentMatchKey = null;
let currentTeaParam = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadMatchList();
    bindTabEvents();

    if (window.mqttManager) {
        mqttManager.onStatusChange(updateDeviceStatusUI);
    }

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('detailModal')) {
            closeModal();
        }
    });
});

function bindTabEvents() {
    document.querySelectorAll('.tea-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.tea-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTeaType = btn.getAttribute('data-tea');
            await loadMatchList();
        });
    });
}

// ===== 加载搭配列表 =====
async function loadMatchList() {
    const list = document.getElementById('matchList');
    if (!list) return;

    const params = {};
    if (currentTeaType && currentTeaType !== 'all') {
        params.teaTypeCode = currentTeaType;
    }

    const result = await API.TeaFood.list(params);
    if (result.code !== 200) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">加载失败</p>';
        return;
    }

    const records = result.data?.records || result.data || [];
    if (records.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂无搭配</p>';
        return;
    }

    const teaNameMap = { green: '绿茶', black: '红茶', oolong: '乌龙茶', white: '白茶' };
    list.innerHTML = records.map(item => `
        <div class="match-card" data-tea="${item.teaTypeCode}">
            <div class="match-card-img">
                <img src="${item.coverImage || ''}" alt="${item.title}">
            </div>
            <div class="match-card-content">
                <span class="tea-tag">${teaNameMap[item.teaTypeCode] || item.teaName || ''}</span>
                <h3>${item.title}</h3>
                <p class="match-desc">${item.summary || ''}</p>
                <div class="detail-btn" onclick="openMatchModal('${item.matchKey}', ${item.id})">查看详情</div>
            </div>
        </div>
    `).join('');
}

// ===== 显示搭配详情 =====
async function openMatchModal(matchKey, id) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';
    modal.classList.add('active');
    currentMatchKey = matchKey;

    const result = await API.TeaFood.getByKey(matchKey);
    if (result.code !== 200 || !result.data) {
        modalContent.innerHTML = '<h3>内容加载失败</h3>';
        return;
    }

    const match = result.data.match || result.data;
    const param = result.data.teaTypeParam || {};
    currentTeaParam = param;

    let html = match.detailContent || '';

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
    appendFavoriteBtn(modalContent, 'food', id, matchKey);
}

function bindSyncButton() {
    const syncBtn = document.getElementById('syncDeviceBtn');
    const syncStatus = document.getElementById('syncStatus');
    if (!syncBtn || !currentTeaParam) return;

    syncBtn.addEventListener('click', async () => {
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

        syncStatus.innerHTML = '指令发送中...';
        syncBtn.disabled = true;

        mqttManager.publish(mqttManager.brewTopic, command, 1, async (err) => {
            syncBtn.disabled = false;
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

window.openMatchModal = openMatchModal;
window.closeModal = closeModal;
