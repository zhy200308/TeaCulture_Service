// scenario.js 

const brewingParams = {
    "home-kungfu": { teaType: "乌龙茶", amount: "6g", waterTemp: "100℃", brewTime: "8-10秒", note: "第一泡洗茶,后续每泡增加2秒" },
    "office-simple": { teaType: "绿茶/红茶", amount: "4g", waterTemp: "80℃ (绿茶) / 90℃ (红茶)", brewTime: "2-3分钟", note: "使用马克杯，避免久泡" },
    "outdoor-portable": { teaType: "白茶", amount: "5g", waterTemp: "90℃", brewTime: "5分钟", note: "可用保温杯携带热水" },
    "home-cold": { teaType: "绿茶/乌龙茶", amount: "9g", waterTemp: "常温", brewTime: "4-6小时", note: "冰箱冷藏冷泡" }
};

const scenarioDetail = {
    "home-kungfu": {
        title: "居家功夫茶（乌龙茶）冲泡教程", img: "../images/4.jpg",
        tools: ["白瓷盖碗（100ml）", "公道杯、品茗杯、烧水壶", "茶叶：铁观音/大红袍（5-7g）"],
        steps: ["温杯：沸水烫洗盖碗、公道杯、品茗杯，提升器具温度", "投茶：将茶叶投入盖碗，占碗身1/2容量", "洗茶：注入沸水，快速出汤（5秒内），洗去茶叶浮尘", "冲泡：再次注沸水，焖泡8-10秒后出汤", "分茶：将茶汤平均分入品茗杯，七分满即可"],
        tips: ["后续冲泡可逐次增加焖泡时间（每次+2秒）", "水温需保持95℃以上，才能激发乌龙茶香气"]
    },
    "office-simple": {
        title: "办公室简易泡茶（绿茶/红茶）教程", img: "../images/4.1.jpg",
        tools: ["马克杯（300ml）", "茶漏（可选）", "茶叶：绿茶/红茶（3-5g）"],
        steps: ["温杯：少量热水冲洗马克杯，倒掉水", "投茶：将茶叶放入杯中（用茶漏更易清理）", "注水：绿茶注80℃温水，红茶注90℃热水，水量占杯身2/3", "静置：绿茶焖泡2分钟，红茶焖泡3分钟即可饮用"],
        tips: ["避免用保温杯泡茶，易闷熟茶叶影响口感", "可多次加水，最后将茶叶捞出避免久泡"]
    },
    "outdoor-portable": {
        title: "户外便携泡茶（白茶）教程", img: "../images/4.2.jpg",
        tools: ["旅行茶具（一壶两杯）", "便携式烧水壶/保温杯（装热水）", "茶叶：白牡丹/寿眉（4-6g）"],
        steps: ["温具：用热水烫洗旅行茶具，提升温度", "投茶：将茶叶投入旅行壶中", "注水：注入90℃热水，焖泡5分钟", "分茶：将茶汤倒入便携茶杯，即可饮用"],
        tips: ["无热水时可用矿泉水冷泡，静置30分钟即可", "旅行茶具选陶瓷/玻璃材质，轻便且不吸味"]
    },
    "home-cold": {
        title: "夏季居家冷泡茶（绿茶/乌龙茶）教程", img: "../images/4.3.jpg",
        tools: ["密封玻璃罐/矿泉水瓶（500ml）", "茶叶：绿茶/轻发酵乌龙茶（8-10g）", "常温矿泉水（500ml）"],
        steps: ["洗茶：用少量常温水快速冲洗茶叶，倒掉水", "投茶：将茶叶放入密封容器", "注水：倒入常温矿泉水，密封容器", "冷藏：放入冰箱冷藏4-6小时", "饮用：取出后过滤掉茶叶，即可饮用"],
        tips: ["冷藏时间不超过8小时，避免茶汤过涩", "可加入柠檬片/薄荷，口感更丰富"]
    }
};

function renderTutorial(key) {
    const data = scenarioDetail[key];
    if (!data) return '';
    const params = brewingParams[key] || {};
    const toolsHtml = data.tools.map(t => `<li>${t}</li>`).join('');
    const stepsHtml = data.steps.map(step => `<li>${step}</li>`).join('');
    const tipsHtml = data.tips.map(t => `<p>• ${t}</p>`).join('');
    const paramHtml = `
        <div class="param-section">
            <h4>推荐冲泡参数</h4>
            <div class="param-grid">
                <div class="param-item"><div class="param-label">茶类</div><div class="param-value">${params.teaType || '—'}</div></div>
                <div class="param-item"><div class="param-label">投茶量</div><div class="param-value">${params.amount || '—'}</div></div>
                <div class="param-item"><div class="param-label">水温</div><div class="param-value">${params.waterTemp || '—'}</div></div>
                <div class="param-item"><div class="param-label">冲泡时长</div><div class="param-value">${params.brewTime || '—'}</div></div>
                <div class="param-item"><div class="param-label">备注</div><div class="param-value">${params.note || '—'}</div></div>
            </div>
            <button class="sync-btn" id="syncDeviceBtn"><i class="fas fa-sync-alt"></i> 一键同步设备</button>
            <div class="sync-status" id="syncStatus"></div>
        </div>
    `;
    return `
        <h3>${data.title}</h3>
        <img src="${data.img}" alt="${data.title}" style="max-width:100%; border-radius:8px;">
        <h4 class="step-title">准备工具</h4><ul class="step-list">${toolsHtml}</ul>
        ${paramHtml}
        <h4 class="step-title">冲泡步骤</h4><ul class="step-list">${stepsHtml}</ul>
        <div class="tips-box"><h4>小贴士</h4>${tipsHtml}</div>
    `;
}

function bindSyncButton(key) {
    const syncBtn = document.getElementById('syncDeviceBtn');
    const syncStatus = document.getElementById('syncStatus');
    if (!syncBtn) return;
    const params = brewingParams[key];
    if (!params) { syncStatus.innerHTML = '该教程暂无参数配置'; return; }
    const newBtn = syncBtn.cloneNode(true);
    syncBtn.parentNode.replaceChild(newBtn, syncBtn);
    newBtn.addEventListener('click', () => {
        if (!mqttManager.isConnected()) {
            syncStatus.innerHTML = '设备离线，无法同步';
            return;
        }
        const command = {
            type: 'brew',
            teaType: params.teaType,
            amount: params.amount,
            waterTemp: params.waterTemp,
            brewTime: params.brewTime,
            note: params.note,
            timestamp: Date.now()
        };
        syncStatus.innerHTML = '⏳ 指令发送中...';
        newBtn.disabled = true;
        mqttManager.publish(mqttManager.brewTopic, command, 1, (err) => {
            newBtn.disabled = false;
            if (err) {
                console.error('发布失败', err);
                syncStatus.innerHTML = '指令发送失败';
            } else {
                syncStatus.innerHTML = '指令已下发，设备执行中';
                setTimeout(() => {
                    if (syncStatus.innerHTML.includes('执行中')) syncStatus.innerHTML = ' 设备执行完成，参数已生效';
                }, 3000);
            }
        });
    });
}

function openModal(key) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = renderTutorial(key);
    modal.classList.add('active');
    setTimeout(() => bindSyncButton(key), 0);
}

function closeModal() { document.getElementById('detailModal').classList.remove('active'); }

// 教程筛选
const tabBtns = document.querySelectorAll('.tab-btn');
const scenarioCards = document.querySelectorAll('.scenario-card');
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const t = btn.getAttribute('data-scenario');
        scenarioCards.forEach(card => {
            card.style.display = (t === 'all' || card.getAttribute('data-scenario') === t) ? 'block' : 'none';
        });
    });
});

function updateDeviceStatusUI(connected) {
    const statusText = document.getElementById('deviceStatusText');
    const indicator = document.getElementById('deviceStatusIndicator');
    if (statusText && indicator) {
        if (connected) {
            statusText.innerText = '在线';
            indicator.className = 'status-indicator status-online';
        } else {
            statusText.innerText = '离线';
            indicator.className = 'status-indicator status-offline';
        }
    }
}

mqttManager.onStatusChange(updateDeviceStatusUI);
window.addEventListener('click', (e) => { if (e.target === document.getElementById('detailModal')) closeModal(); });
window.openModal = openModal;
window.closeModal = closeModal;



// 定义全局模块数据对象
window.modulesData = window.modulesData || {};
window.modulesData.scenarioParams = brewingParams;
window.modulesData.tutorials = scenarioDetail;


document.addEventListener('DOMContentLoaded', () => {
    if (window.DataValidator) {
        // 校验教程数据
        const tutorialResult = DataValidator.validateAllData(scenarioDetail, 'tutorial');
        if (tutorialResult.invalid > 0) {
            console.warn('[数据校验] 教程数据异常:', tutorialResult.details);
        } else {
            console.log(`[数据校验] 场景化教程校验通过，共 ${tutorialResult.valid} 个教程`);
        }
        
        // 校验冲泡参数
        let paramsValid = 0;
        for (const [key, params] of Object.entries(brewingParams)) {
            const result = DataValidator.validateBrewParams(params);
            if (result.isValid) paramsValid++;
            else console.warn(`[参数校验] ${key}:`, result.errors);
        }
        console.log(`[参数校验] 通过 ${paramsValid}/${Object.keys(brewingParams).length} 个参数配置`);
        
    
        document.querySelectorAll('.scenario-card-img img').forEach(img => {
            DataValidator.handleImageError(img);
        });
    }
});


function bindSyncButton(key) {
    const syncBtn = document.getElementById('syncDeviceBtn');
    const syncStatus = document.getElementById('syncStatus');
    if (!syncBtn) return;

    const params = brewingParams[key];
    if (!params) {
        syncStatus.innerHTML = '该教程暂无参数配置';
        return;
    }
    
    // 参数校验
    if (window.DataValidator) {
        const validation = DataValidator.validateBrewParams(params);
        if (!validation.isValid) {
            console.error('[参数校验失败]', validation.errors);
            syncStatus.innerHTML = '参数配置异常';
            return;
        }
    }

    const newBtn = syncBtn.cloneNode(true);
    syncBtn.parentNode.replaceChild(newBtn, syncBtn);

    newBtn.addEventListener('click', () => {
        if (!mqttManager.isConnected()) {
            syncStatus.innerHTML = '设备离线，无法同步';
            return;
        }

        const command = {
            type: 'brew',
            teaType: params.teaType,
            amount: params.amount,
            waterTemp: params.waterTemp,
            brewTime: params.brewTime,
            note: params.note,
            timestamp: Date.now()
        };
        
        // MQTT消息校验
        if (window.DataValidator) {
            const msgValidation = DataValidator.validateMqttMessage(command);
            if (!msgValidation.isValid) {
                console.error('[MQTT消息校验失败]', msgValidation.errors);
                syncStatus.innerHTML = '消息格式错误';
                return;
            }
        }

        syncStatus.innerHTML = '指令发送中';
        newBtn.disabled = true;

        mqttManager.publish(mqttManager.brewTopic, command, 1, (err) => {
            newBtn.disabled = false;
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