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
    const items = records.length === 0
        ? '<p style="text-align:center;color:#999;padding:30px;">暂无收藏</p>'
        : records.map(f => `
            <div class="fav-item">
                <span class="fav-type">${typeMap[f.targetType] || f.targetType}</span>
                <span class="fav-title" style="cursor:pointer;" onclick="openFavoriteDetail('${f.targetType}', ${f.targetId})">${f.targetTitle || ''}</span>
                <button onclick="openFavoriteDetail('${f.targetType}', ${f.targetId})" style="background:#4a7c59;">查看</button>
                <button onclick="removeFavorite('${f.targetType}', ${f.targetId}, this)">取消</button>
            </div>
        `).join('');

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
        const item = btn && btn.closest ? btn.closest('.fav-item') : null;
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
        box.innerHTML = `
            <h4 style="margin:10px 0;color:#4a7c59;">${scenario.title || ''}</h4>
            ${renderTextDetail(scenario.detailContent)}
            <div style="margin-top:15px;background:#f8f6f2;border-radius:10px;padding:12px;">
                <div style="font-weight:600;color:#4a7c59;margin-bottom:8px;">推荐冲泡参数</div>
                <div>茶类：${param.teaType || '—'}</div>
                <div>投茶量：${param.amount || '—'}</div>
                <div>水温：${param.waterTemp || '—'}</div>
                <div>冲泡时长：${param.brewTime || '—'}</div>
                <div>备注：${param.note || '—'}</div>
            </div>
        `;
    } else if (targetType === 'food') {
        const match = result.data.match || result.data;
        const param = result.data.teaTypeParam || {};
        box.innerHTML = `
            <h4 style="margin:10px 0;color:#4a7c59;">${match.title || ''}</h4>
            ${renderTextDetail(match.detailContent)}
            <div style="margin-top:15px;background:#f8f6f2;border-radius:10px;padding:12px;">
                <div style="font-weight:600;color:#4a7c59;margin-bottom:8px;">智能茶器参数推荐</div>
                <div>水温：${param.waterTemp || '—'}</div>
                <div>投茶量：${param.amount || '—'}</div>
                <div>冲泡时长：${param.brewTime || '—'}</div>
                <div>备注：${param.note || '—'}</div>
            </div>
        `;
    } else {
        const data = result.data;
        box.innerHTML = `
            <h4 style="margin:10px 0;color:#4a7c59;">${data.title || ''}</h4>
            ${renderTextDetail(data.detailContent)}
        `;
    }
};

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
