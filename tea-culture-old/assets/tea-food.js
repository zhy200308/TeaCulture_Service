
let deviceParams = {};

async function loadParams() {
    try {
        const response = await fetch('../data/tea-food-params.json');
        if (!response.ok) throw new Error('加载参数文件失败');
        deviceParams = await response.json();
        console.log('茶类参数加载成功', deviceParams);
    } catch (error) {
        console.error('参数加载失败，使用默认值', error);
        deviceParams = {
            green: { teaType: "绿茶", waterTemp: "80℃", amount: "3g", brewTime: "2分钟", note: "使用玻璃杯，先注水后投茶" },
            black: { teaType: "红茶", waterTemp: "90℃", amount: "4g", brewTime: "3分钟", note: "可用马克杯，适当延长闷泡" },
            oolong: { teaType: "乌龙茶", waterTemp: "100℃", amount: "7g", brewTime: "1分钟（首泡洗茶）", note: "推荐用盖碗或紫砂壶" },
            white: { teaType: "白茶", waterTemp: "90℃", amount: "5g", brewTime: "5分钟", note: "可用保温杯闷泡" }
        };
    }
}

const keyToTeaType = {
    'green-bean': 'green',
    'black-scone': 'black',
    'oolong-nut': 'oolong',
    'white-osmanthus': 'white'
};

const matchDetail = {
    "green-bean": `
        <h3>绿茶 + 绿豆糕</h3>
        <img src="../images/5.jpg" alt="绿茶+绿豆糕">
        <p class="match-info"><strong>适配茶品</strong>：龙井、碧螺春、信阳毛尖</p>
        <p class="match-info"><strong>搭配理由</strong>：绿茶性质偏凉，口感鲜爽，能中和绿豆糕的甜腻感；绿豆糕清热解暑，与绿茶的凉性相得益彰，是夏季绝佳搭配。</p>
        <p class="match-info"><strong>食用建议</strong>：选用低糖绿豆糕，搭配80℃水温冲泡的绿茶，小口品茶配小块糕点，口感更佳。</p>
        <div class="note-box"><h4>小贴士</h4><p>避免搭配高糖重油的绿豆糕，会掩盖绿茶的鲜爽口感；建议在上午或下午茶时段食用。</p></div>
    `,
    "black-scone": `
        <h3>红茶 + 黄油司康</h3>
        <img src="../images/5.1.jpg" alt="红茶+司康">
        <p class="match-info"><strong>适配茶品</strong>：祁门红茶、正山小种、滇红</p>
        <p class="match-info"><strong>搭配理由</strong>：红茶性质温和，口感甜醇，能中和黄油司康的油腻感；司康的奶香与红茶的蜜香交融，口感醇厚不腻。</p>
        <p class="match-info"><strong>食用建议</strong>：司康可搭配少量淡奶油，红茶冲泡水温90℃，焖泡3分钟后饮用，适合早餐或下午茶。</p>
        <div class="note-box"><h4>小贴士</h4><p>避免搭配过多黄油的司康，易加重肠胃负担；红茶可加少量蜂蜜，口感更协调。</p></div>
    `,
    "oolong-nut": `
        <h3>乌龙茶 + 盐焗坚果</h3>
        <img src="../images/5.2.jpg" alt="乌龙茶+坚果">
        <p class="match-info"><strong>适配茶品</strong>：铁观音、大红袍、凤凰单丛</p>
        <p class="match-info"><strong>搭配理由</strong>：乌龙茶香气高扬，回甘明显，能解坚果的咸香和油腻；坚果的油脂能衬托乌龙茶的岩韵/兰香，口感层次丰富。</p>
        <p class="match-info"><strong>食用建议</strong>：选用盐焗腰果、巴旦木，搭配95℃水温冲泡的乌龙茶，品茶时吃2-3颗坚果，解腻增香。</p>
        <div class="note-box"><h4>小贴士</h4><p>避免食用过多坚果，易上火；乌龙茶可冲泡多次，越泡越适合搭配坚果。</p></div>
    `,
    "white-osmanthus": `
        <h3>白茶 + 桂花糕</h3>
        <img src="../images/5.3.jpg" alt="白茶+桂花糕">
        <p class="match-info"><strong>适配茶品</strong>：白牡丹、寿眉、白毫银针</p>
        <p class="match-info"><strong>搭配理由</strong>：白茶清甜淡雅，性质温和，桂花糕的桂花香与白茶的毫香交融，口感温润不腻，适合四季食用。</p>
        <p class="match-info"><strong>食用建议</strong>：选用手工桂花糕，白茶冲泡水温85℃，焖泡5分钟后饮用，适合午后休闲时段。</p>
        <div class="note-box"><h4>小贴士</h4><p>桂花糕含糖量较高，建议少量食用；老白茶搭配桂花糕，口感更醇厚。</p></div>
    `
};

function openModal(matchKey) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    if (!modal || !modalContent) return;

    const teaType = keyToTeaType[matchKey];
    const params = deviceParams[teaType] || {};
    const baseHtml = matchDetail[matchKey] || '<p>暂无详情</p>';

    const paramHtml = `
        <div class="param-section">
            <h4>智能茶器参数推荐</h4>
            <div class="param-grid">
                <div class="param-item"><div class="param-label">水温</div><div class="param-value">${params.waterTemp || '—'}</div></div>
                <div class="param-item"><div class="param-label">投茶量</div><div class="param-value">${params.amount || '—'}</div></div>
                <div class="param-item"><div class="param-label">冲泡时长</div><div class="param-value">${params.brewTime || '—'}</div></div>
                <div class="param-item"><div class="param-label">备注</div><div class="param-value">${params.note || '—'}</div></div>
            </div>
            <button class="sync-btn" id="syncDeviceBtn"><i class="fas fa-sync-alt"></i> 一键同步设备</button>
            <div class="sync-status" id="syncStatus"></div>
        </div>
    `;

    modalContent.innerHTML = baseHtml + paramHtml;
    modal.classList.add('active');

    const syncBtn = document.getElementById('syncDeviceBtn');
    const syncStatus = document.getElementById('syncStatus');
    if (syncBtn) {
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
                waterTemp: params.waterTemp,
                amount: params.amount,
                brewTime: params.brewTime,
                note: params.note,
                timestamp: Date.now()
            };
            syncStatus.innerHTML = '指令发送中...';
            newBtn.disabled = true;
            mqttManager.publish(mqttManager.brewTopic, command, 1, (err) => {
                newBtn.disabled = false;
                if (err) {
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
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('detailModal')) closeModal();
});

// 茶类筛选
const teaBtns = document.querySelectorAll('.tea-btn');
const matchCards = document.querySelectorAll('.match-card');
teaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        teaBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const teaType = btn.getAttribute('data-tea');
        matchCards.forEach(card => {
            card.style.display = (teaType === 'all' || card.getAttribute('data-tea') === teaType) ? 'block' : 'none';
        });
    });
});

// 更新设备状态
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

//  MQTT 状态变化监听
mqttManager.onStatusChange(updateDeviceStatusUI);

window.teaFoodOpenModal = openModal;
window.closeModal = closeModal;
document.addEventListener('DOMContentLoaded', loadParams);



// 定义全局模块数据对象
window.modulesData = window.modulesData || {};
window.modulesData.teaFoodParams = {};

// 跨模块检测
document.addEventListener('DOMContentLoaded', async () => {
    await loadParams();
    
    window.modulesData.teaFoodParams = deviceParams;
    

    if (window.DataValidator && window.modulesData.scenarioParams) {
        const crossResult = DataValidator.crossModuleCheck({
            scenarioParams: window.modulesData.scenarioParams,
            teaFoodParams: window.modulesData.teaFoodParams
        });
        
        if (!crossResult.isValid) {
            console.warn('[跨模块检测] 发现参数不一致:');
            crossResult.issues.forEach(issue => {
                console.warn(`  - [${issue.type}] ${issue.module}: ${issue.detail}`);
            });
        } else {
            console.log('[跨模块检测] 场景教程与茶食搭配参数一致');
        }
    }
    
    // 加载失败处理
    document.querySelectorAll('.match-card-img img').forEach(img => {
        if (window.DataValidator) DataValidator.handleImageError(img);
    });
});

// 修改 openModal 添加参数校验
const originalTeaFoodOpenModal = window.teaFoodOpenModal;
window.teaFoodOpenModal = function(matchKey) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    if (!modal || !modalContent) return;

    const teaType = keyToTeaType[matchKey];
    const params = deviceParams[teaType] || {};
    
    // 参数校验
    if (window.DataValidator && params.teaType) {
        const validation = DataValidator.validateBrewParams(params);
        if (!validation.isValid) {
            console.warn('[参数校验]', validation.errors);
        }
    }
    
    const baseHtml = matchDetail[matchKey] || '<p>暂无详情</p>';

    const paramHtml = `
        <div class="param-section">
            <h4>智能茶器参数推荐</h4>
            <div class="param-grid">
                <div class="param-item"><div class="param-label">水温</div><div class="param-value">${params.waterTemp || '—'}</div></div>
                <div class="param-item"><div class="param-label">投茶量</div><div class="param-value">${params.amount || '—'}</div></div>
                <div class="param-item"><div class="param-label">冲泡时长</div><div class="param-value">${params.brewTime || '—'}</div></div>
                <div class="param-item"><div class="param-label">备注</div><div class="param-value">${params.note || '—'}</div></div>
            </div>
            <button class="sync-btn" id="syncDeviceBtn"><i class="fas fa-sync-alt"></i> 一键同步设备</button>
            <div class="sync-status" id="syncStatus"></div>
        </div>
    `;

    modalContent.innerHTML = baseHtml + paramHtml;
    modal.classList.add('active');
    

    setTimeout(() => {
        modalContent.querySelectorAll('img').forEach(img => {
            if (window.DataValidator) DataValidator.handleImageError(img);
        });
    }, 100);

    const syncBtn = document.getElementById('syncDeviceBtn');
    const syncStatus = document.getElementById('syncStatus');
    if (syncBtn) {
        const newBtn = syncBtn.cloneNode(true);
        syncBtn.parentNode.replaceChild(newBtn, syncBtn);
        newBtn.addEventListener('click', () => {
            if (!mqttManager.isConnected()) {
                syncStatus.innerHTML = '设备离线，无法同步';
                return;
            }
            
            // MQTT消息校验
            const command = {
                type: 'brew',
                teaType: params.teaType,
                waterTemp: params.waterTemp,
                amount: params.amount,
                brewTime: params.brewTime,
                note: params.note,
                timestamp: Date.now()
            };
            
            if (window.DataValidator) {
                const msgValidation = DataValidator.validateMqttMessage(command);
                if (!msgValidation.isValid) {
                    console.error('[MQTT消息校验失败]', msgValidation.errors);
                    syncStatus.innerHTML = '消息格式错误';
                    return;
                }
            }
            
            syncStatus.innerHTML = '指令发送中...';
            newBtn.disabled = true;
            mqttManager.publish(mqttManager.brewTopic, command, 1, (err) => {
                newBtn.disabled = false;
                if (err) {
                    syncStatus.innerHTML = '指令发送失败';
                } else {
                    syncStatus.innerHTML = '指令已下发，设备执行中';
                    setTimeout(() => {
                        if (syncStatus.innerHTML.includes('执行中')) syncStatus.innerHTML = '✅ 设备执行完成，参数已生效';
                    }, 3000);
                }
            });
        });
    }
};
