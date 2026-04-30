/**
 * user.js - 个人中心
 * 对接接口：
 *   - GET /api/user/profile               获取个人资料
 *   - PUT /api/user/profile               修改个人资料
 *   - PUT /api/user/password              修改密码
 *   - GET /api/favorite/list              查询收藏列表
 *   - DELETE /api/favorite                取消收藏
 *   - POST /api/feedback                  提交反馈
 *   - GET /api/feedback/list              查询我的反馈
 *   - POST /api/auth/logout               退出登录
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 检查登录
    if (!TokenManager.getToken()) {
        alert('请先登录');
        window.location.href = './login.html';
        return;
    }

    await loadUserProfile();
    bindMenuEvents();
    bindLogoutEvent();
});

// ===== 加载用户资料 =====
async function loadUserProfile() {
    const result = await API.User.getProfile();
    if (result.code !== 200) {
        alert('获取用户信息失败');
        return;
    }
    const user = result.data;
    TokenManager.setUserInfo(user);

    const nameEl = document.querySelector('.user-name');
    const descEl = document.querySelector('.user-desc');
    const tagEl = document.querySelector('.user-tag');
    const navUserEl = document.querySelector('.nav-user-text');

    if (nameEl) nameEl.innerText = user.nickname || user.username;
    if (descEl) descEl.innerText = user.description || '热爱茶文化，静心品茶，乐享生活';
    if (tagEl) tagEl.innerText = (user.tag || '普通会员') + ' · 茶文化爱好者';
    if (navUserEl) navUserEl.innerHTML = `<i class="fas fa-user-circle"></i> 欢迎你，${user.nickname || user.username}`;
}

// ===== 绑定菜单事件 =====
function bindMenuEvents() {
    const menuItems = document.querySelectorAll('.user-menu-item');
    menuItems.forEach(item => {
        const text = item.querySelector('span').innerText;
        item.addEventListener('click', () => {
            if (text.includes('个人资料')) showProfileModal();
            else if (text.includes('收藏')) showFavoriteModal();
            else if (text.includes('反馈')) showFeedbackModal();
        });
    });
}

// ===== 个人资料修改弹窗 =====
function showProfileModal() {
    const user = TokenManager.getUserInfo() || {};
    const html = `
        <div class="user-modal-mask" onclick="closeUserModal(event)">
            <div class="user-modal" onclick="event.stopPropagation()">
                <h3>个人资料修改</h3>
                <h4>头像</h4>
                <div class="form-item">
                    <label>选择头像</label>
                    <input type="file" id="avatarFile" accept="image/*">
                </div>
                <div class="form-item">
                    <label>头像预览</label>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <img id="avatarPreview" src="${user.avatar || ''}" style="display:${user.avatar ? 'block' : 'none'};width:64px;height:64px;border-radius:50%;object-fit:cover;border:1px solid #eee;">
                        <div style="color:#888;font-size:13px;">选择后可预览，不满意可重新选择</div>
                    </div>
                </div>
                <div class="modal-btns" style="margin-top:10px;">
                    <button onclick="closeUserModal()">取消</button>
                    <button class="primary" onclick="saveAvatar()">保存头像</button>
                </div>

                <h4 style="margin-top:20px;">资料</h4>
                <div class="form-item">
                    <label>昵称</label>
                    <input type="text" id="editNickname" value="${user.nickname || ''}" placeholder="请输入昵称">
                </div>
                <div class="form-item">
                    <label>个人简介</label>
                    <textarea id="editDesc" rows="3" placeholder="一句话介绍自己">${user.description || ''}</textarea>
                </div>
                <div class="modal-btns" style="margin-top:10px;">
                    <button class="primary" onclick="saveProfileBase()">保存资料</button>
                </div>

                <h4 style="margin-top:20px;">密码</h4>
                <div class="form-item">
                    <label>原密码</label>
                    <input type="password" id="oldPwd" placeholder="请输入原密码">
                </div>
                <div class="form-item">
                    <label>新密码</label>
                    <input type="password" id="newPwd" placeholder="至少6位">
                </div>
                <div class="modal-btns">
                    <button class="primary" onclick="savePassword()">修改密码</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    bindAvatarPreview();
}

function bindAvatarPreview() {
    const input = document.getElementById('avatarFile');
    const preview = document.getElementById('avatarPreview');
    if (!input || !preview) return;
    input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        preview.src = url;
        preview.style.display = 'block';
    });
}

window.saveAvatar = async function () {
    const input = document.getElementById('avatarFile');
    if (!input || !input.files || !input.files[0]) {
        alert('请先选择头像文件');
        return;
    }
    const file = input.files[0];
    const upload = await API.Upload.uploadImage(file);
    if (upload.code !== 200 || !upload.data) {
        alert(upload.message || '头像上传失败');
        return;
    }
    const avatar = upload.data;
    const r = await API.User.updateProfile({ avatar });
    if (r.code !== 200) {
        alert(r.message || '头像保存失败');
        return;
    }
    alert('头像已更新');
    await loadUserProfile();
    closeUserModal();
};

window.saveProfileBase = async function () {
    const nickname = document.getElementById('editNickname').value.trim();
    const description = document.getElementById('editDesc').value.trim();
    const r = await API.User.updateProfile({ nickname, description });
    if (r.code !== 200) {
        alert(r.message || '资料保存失败');
        return;
    }
    alert('资料已更新');
    await loadUserProfile();
    closeUserModal();
};

window.savePassword = async function () {
    const oldPwd = document.getElementById('oldPwd').value;
    const newPwd = document.getElementById('newPwd').value;
    if (!oldPwd || !newPwd) {
        alert('请输入原密码与新密码');
        return;
    }
    if (newPwd.length < 6) {
        alert('新密码至少6位');
        return;
    }
    const r = await API.User.changePassword(oldPwd, newPwd);
    if (r.code !== 200) {
        alert(r.message || '密码修改失败');
        return;
    }
    alert('密码已修改');
    closeUserModal();
};

// ===== 我的收藏弹窗 =====
async function showFavoriteModal() {
    const result = await API.Favorite.list({ pageNum: 1, pageSize: 200 });
    const records = result.data?.records || result.data || [];

    const typeMap = { knowledge: '茶识', topic: '专题', scenario: '教程', food: '茶食搭配' };
    const iconMap = { knowledge: 'fa-book', topic: 'fa-layer-group', scenario: 'fa-mug-hot', food: 'fa-utensils' };
    const items = records.length === 0
        ? '<p style="text-align:center;color:#999;padding:30px;">暂无收藏</p>'
        : `
            <div class="fav-grid">
                ${records.map(f => `
                    <div class="fav-card" onclick="openFavoriteDetail('${f.targetType}', ${f.targetId})">
                        <div class="fav-card-img">
                            ${f.targetCoverImage ? `<img src="${f.targetCoverImage}" alt="">` : `<i class="fas ${iconMap[f.targetType] || 'fa-heart'}"></i>`}
                        </div>
                        <div class="fav-card-body">
                            <div class="fav-card-title">${escapeHtml(f.targetTitle || '')}</div>
                            <div class="fav-card-type">${typeMap[f.targetType] || f.targetType}</div>
                            <div class="fav-card-actions">
                                <button onclick="event.stopPropagation();removeFavorite('${f.targetType}', ${f.targetId}, this)">取消</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    const html = `
        <div class="user-modal-mask" onclick="closeUserModal(event)">
            <div class="user-modal" onclick="event.stopPropagation()" style="max-width:600px;">
                <h3>我的收藏</h3>
                <div class="fav-list">${items}</div>
                <div class="modal-btns">
                    <button onclick="closeUserModal()">关闭</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

window.removeFavorite = async function (targetType, targetId, btn) {
    if (!confirm('确定要取消收藏吗？')) return;
    const result = await API.Favorite.remove(targetType, targetId);
    if (result.code === 200) {
        const item = btn && btn.closest ? (btn.closest('.fav-card') || btn.closest('.fav-item')) : null;
        if (item) item.remove();
        else closeUserModal();
    } else {
        alert(result.message || '取消失败');
    }
};

window.openFavoriteDetail = async function (targetType, targetId) {
    const html = `
        <div class="user-modal-mask" onclick="closeUserModal(event)">
            <div class="user-modal" onclick="event.stopPropagation()" style="max-width:760px;">
                <h3>收藏详情</h3>
                <div id="favDetailContent" style="min-height:120px;"></div>
                <div class="modal-btns">
                    <button onclick="closeUserModal()">关闭</button>
                    <button class="primary" onclick="removeFavorite('${targetType}', ${targetId}, this)">取消收藏</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    const box = document.getElementById('favDetailContent');
    if (!box) return;
    box.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">加载中...</p>';

    let result = null;
    if (targetType === 'knowledge') result = await API.Knowledge.getById(targetId);
    else if (targetType === 'topic') result = await API.Topic.getById(targetId);
    else if (targetType === 'scenario') result = await API.Scenario.getById(targetId);
    else if (targetType === 'food') result = await API.TeaFood.getById(targetId);

    if (!result || result.code !== 200 || !result.data) {
        box.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">内容加载失败</p>';
        return;
    }

    if (targetType === 'scenario') {
        const scenario = result.data.scenario || result.data;
        const param = result.data.brewingParam || {};
        box.innerHTML = renderScenarioDetail(scenario, param);
    } else if (targetType === 'food') {
        const match = result.data.match || result.data;
        const param = result.data.teaTypeParam || {};
        box.innerHTML = renderTeaFoodDetail(match, param);
    } else {
        const data = result.data;
        box.innerHTML = renderCommonDetail(data);
    }
};

function renderCommonDetail(data) {
    const title = escapeHtml(data?.title || '');
    const img = data?.coverImage ? `<img src="${data.coverImage}" alt="${title}" style="max-width:100%; border-radius:8px;">` : '';
    return `
        <h3 style="text-align:center;color:#8b5a2b;margin:0 0 18px;">${title}</h3>
        ${img}
        ${renderTextDetail(data?.detailContent)}
    `;
}

function renderTeaFoodDetail(match, param) {
    const title = escapeHtml(match?.title || '');
    const img = match?.coverImage ? `<img src="${match.coverImage}" alt="${title}" style="max-width:100%; border-radius:8px;">` : '';
    const detail = String(match?.detailContent || '').trim();
    const lines = detail ? detail.split('\n').map(s => s.trim()).filter(Boolean) : [];

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

    const tipHtml = tip ? `<div class="note-box"><h4>小贴士</h4><p>${escapeHtml(tip)}</p></div>` : '';

    const paramHtml = `
        <div class="param-section">
            <h4>智能茶器参数推荐</h4>
            <div class="param-grid">
                <div class="param-item"><div class="param-label">水温</div><div class="param-value">${escapeHtml(param?.waterTemp || '—')}</div></div>
                <div class="param-item"><div class="param-label">投茶量</div><div class="param-value">${escapeHtml(param?.amount || '—')}</div></div>
                <div class="param-item"><div class="param-label">冲泡时长</div><div class="param-value">${escapeHtml(param?.brewTime || '—')}</div></div>
                <div class="param-item"><div class="param-label">备注</div><div class="param-value">${escapeHtml(param?.note || '—')}</div></div>
            </div>
        </div>
    `;

    return `
        <h3 style="text-align:center;color:#8b5a2b;margin:0 0 18px;">${title}</h3>
        ${img}
        ${detail ? info.join('') : renderTextDetail(detail)}
        ${tipHtml}
        ${paramHtml}
    `;
}

function renderScenarioDetail(scenario, param) {
    const title = escapeHtml(scenario?.title || '');
    const img = scenario?.coverImage ? `<img src="${scenario.coverImage}" alt="${title}" style="max-width:100%; border-radius:8px;">` : '';
    const parsed = parseScenarioDetail(String(scenario?.detailContent || ''));
    const toolsHtml = parsed.tools.length ? parsed.tools.map(t => `<li>${escapeHtml(t)}</li>`).join('') : '<li>—</li>';
    const stepsHtml = parsed.steps.length ? parsed.steps.map(t => `<li>${escapeHtml(t)}</li>`).join('') : '<li>—</li>';
    const tipsHtml = parsed.tips.length ? parsed.tips.map(t => `<p>• ${escapeHtml(t)}</p>`).join('') : '<p>• —</p>';

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
        </div>
    `;

    return `
        <h3 style="text-align:center;color:#8b5a2b;margin:0 0 18px;">${title}</h3>
        ${img}
        <h4 style="color:#8b5a2b;margin:18px 0 10px;">准备工具</h4>
        <ul style="padding-left:18px;color:#555;line-height:1.9;">${toolsHtml}</ul>
        ${paramHtml}
        <h4 style="color:#8b5a2b;margin:18px 0 10px;">冲泡步骤</h4>
        <ul style="padding-left:18px;color:#555;line-height:1.9;">${stepsHtml}</ul>
        <div class="note-box"><h4>小贴士</h4>${tipsHtml}</div>
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
        if (end < 0) return norm.slice(start).replace(/^(工具|步骤|提示|小贴士)[:：]\s*/, '');
        return norm.slice(start, end).replace(/^(工具|步骤|提示|小贴士)[:：]\s*/, '');
    };

    const toolsText = toolIdx >= 0 ? seg(toolIdx, stepIdx >= 0 ? stepIdx : tipIdx) : '';
    const stepsText = stepIdx >= 0 ? seg(stepIdx, tipIdx) : '';
    const tipsText = tipIdx >= 0 ? seg(tipIdx, -1) : '';

    const splitTools = (s) => s.split(/[、，,;；\n]/).map(x => x.trim()).filter(Boolean);
    const splitSteps = (s) => s.replace(/->/g, '→').split(/[→\n;；。]/).map(x => x.trim()).filter(Boolean);
    const splitTips = (s) => s.split(/[\n;；。]/).map(x => x.trim()).filter(Boolean);

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

// ===== 意见反馈弹窗 =====
function showFeedbackModal() {
    const html = `
        <div class="user-modal-mask" onclick="closeUserModal(event)">
            <div class="user-modal" onclick="event.stopPropagation()">
                <h3>意见反馈</h3>
                <div class="form-item">
                    <label>反馈类型</label>
                    <select id="fbType">
                        <option value="bug">问题报告</option>
                        <option value="suggestion">功能建议</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="form-item">
                    <label>反馈内容</label>
                    <textarea id="fbContent" rows="5" placeholder="请详细描述您的反馈..."></textarea>
                </div>
                <div class="form-item">
                    <label>联系方式（可选）</label>
                    <input type="text" id="fbContact" placeholder="邮箱/手机号">
                </div>
                <div class="modal-btns">
                    <button onclick="closeUserModal()">取消</button>
                    <button class="primary" onclick="submitFeedback()">提交</button>
                </div>
                <h4 style="margin-top:20px;">我的反馈记录</h4>
                <div id="myFeedbackList" style="max-height:320px;overflow:auto;border-top:1px solid #f0f0f0;padding-top:10px;"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    loadMyFeedbackList();
}

window.submitFeedback = async function () {
    const feedbackType = document.getElementById('fbType').value;
    const content = document.getElementById('fbContent').value.trim();
    const contact = document.getElementById('fbContact').value.trim();

    if (!content) {
        alert('反馈内容不能为空');
        return;
    }

    const result = await API.Feedback.submit({ feedbackType, content, contact });
    if (result.code === 200) {
        alert('反馈提交成功，感谢您的支持');
        closeUserModal();
    } else {
        alert(result.message || '提交失败');
    }
};

async function loadMyFeedbackList() {
    const box = document.getElementById('myFeedbackList');
    if (!box) return;
    box.innerHTML = '<p style="text-align:center;color:#999;padding:10px;">加载中...</p>';
    const result = await API.Feedback.listMine();
    const records = result.code === 200 ? (result.data || []) : [];
    if (!records.length) {
        box.innerHTML = '<p style="text-align:center;color:#999;padding:10px;">暂无反馈</p>';
        return;
    }
    const statusMap = { 0: '未处理', 1: '处理中', 2: '已处理' };
    box.innerHTML = records.map(f => `
        <div style="padding:10px;border:1px solid #f0f0f0;border-radius:8px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;gap:10px;">
                <div style="font-weight:600;color:#4a7c59;">${f.feedbackType || '反馈'}</div>
                <div style="color:#888;">${statusMap[f.status] || f.status}</div>
            </div>
            <div style="margin-top:6px;color:#555;">${(f.content || '').replace(/</g, '&lt;')}</div>
            ${f.reply ? `<div style="margin-top:8px;background:#f8f6f2;border-radius:8px;padding:8px;"><div style="color:#4a7c59;font-weight:600;">回复</div><div style="color:#555;margin-top:4px;">${(f.reply || '').replace(/</g, '&lt;')}</div></div>` : ''}
        </div>
    `).join('');
}

window.closeUserModal = function (e) {
    const masks = document.querySelectorAll('.user-modal-mask');
    if (masks.length) masks[masks.length - 1].remove();
};

// ===== 退出登录 =====
function bindLogoutEvent() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await API.Auth.logout();
        TokenManager.clear();
        window.location.href = './login.html';
    });
}
