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
                <div class="form-item">
                    <label>昵称</label>
                    <input type="text" id="editNickname" value="${user.nickname || ''}" placeholder="请输入昵称">
                </div>
                <div class="form-item">
                    <label>头像URL</label>
                    <input type="text" id="editAvatar" value="${user.avatar || ''}" placeholder="请输入头像URL">
                </div>
                <div class="form-item">
                    <label>个人简介</label>
                    <textarea id="editDesc" rows="3" placeholder="一句话介绍自己">${user.description || ''}</textarea>
                </div>
                <h4 style="margin-top:20px;">修改密码（可选）</h4>
                <div class="form-item">
                    <label>原密码</label>
                    <input type="password" id="oldPwd" placeholder="留空则不修改">
                </div>
                <div class="form-item">
                    <label>新密码</label>
                    <input type="password" id="newPwd" placeholder="至少6位">
                </div>
                <div class="modal-btns">
                    <button onclick="closeUserModal()">取消</button>
                    <button class="primary" onclick="saveProfile()">保存</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

window.saveProfile = async function () {
    const nickname = document.getElementById('editNickname').value.trim();
    const avatar = document.getElementById('editAvatar').value.trim();
    const description = document.getElementById('editDesc').value.trim();
    const oldPwd = document.getElementById('oldPwd').value;
    const newPwd = document.getElementById('newPwd').value;

    // 资料保存
    const r1 = await API.User.updateProfile({ nickname, avatar, description });
    if (r1.code !== 200) {
        alert(r1.message || '资料更新失败');
        return;
    }

    // 密码修改
    if (oldPwd && newPwd) {
        if (newPwd.length < 6) {
            alert('新密码至少6位');
            return;
        }
        const r2 = await API.User.changePassword(oldPwd, newPwd);
        if (r2.code !== 200) {
            alert(r2.message || '密码修改失败');
            return;
        }
    }

    alert('保存成功');
    closeUserModal();
    await loadUserProfile();
};

// ===== 我的收藏弹窗 =====
async function showFavoriteModal() {
    const result = await API.Favorite.list();
    const records = result.data?.records || result.data || [];

    const typeMap = { knowledge: '茶识', topic: '专题', scenario: '教程', food: '茶食搭配' };
    const items = records.length === 0
        ? '<p style="text-align:center;color:#999;padding:30px;">暂无收藏</p>'
        : records.map(f => `
            <div class="fav-item">
                <span class="fav-type">${typeMap[f.targetType] || f.targetType}</span>
                <span class="fav-title">${f.targetTitle || f.targetKey}</span>
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
        btn.closest('.fav-item').remove();
    } else {
        alert(result.message || '取消失败');
    }
};

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
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
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

window.closeUserModal = function (e) {
    const mask = document.querySelector('.user-modal-mask');
    if (mask) mask.remove();
};

// ===== 退出登录 =====
function bindLogoutEvent() {
    const logoutBtn = document.querySelector('.nav-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            // 仅当文字含"返回"或"退出"时拦截
            const txt = logoutBtn.innerText;
            if (txt.includes('退出')) {
                e.preventDefault();
                await API.Auth.logout();
                TokenManager.clear();
                window.location.href = './login.html';
            }
        });
    }
}
