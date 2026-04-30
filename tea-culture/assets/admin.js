/**
 * admin.js - 管理后台
 * 对接接口：
 *   - GET /api/admin/users                查询用户列表
 *   - PUT /api/admin/users/{id}           修改用户
 *   - DELETE /api/admin/users/{id}        删除用户
 *   - GET /api/knowledge/list             查询基础茶识
 *   - POST/PUT/DELETE /api/knowledge      增删改基础茶识
 *   - GET /api/topic/list                 查询进阶专题
 *   - POST/PUT/DELETE /api/topic          增删改进阶专题
 *   - GET /api/scenario/list              查询场景教程
 *   - POST/PUT/DELETE /api/scenario       增删改场景教程
 *   - GET /api/feedback/admin/list        查询反馈
 *   - PUT /api/feedback/{id}/reply        回复反馈
 */

// 全局权限检查
document.addEventListener('DOMContentLoaded', async () => {
    const userInfo = TokenManager.getUserInfo();
    if (!TokenManager.getToken() || !userInfo || userInfo.role !== 'admin') {
        alert('无管理员权限');
        window.location.href = './login.html';
        return;
    }

    // 初始加载用户管理
    await loadUsers();
});

// ===== 切换左侧菜单 =====
window.showSection = async function (id) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    // 按需加载
    if (id === 'users') await loadUsers();
    else if (id === 'content') await loadContent('basic-knowledge');
    else if (id === 'feedback') await loadFeedbacks();
};

// ===== 切换内容标签 =====
window.showTab = async function (id) {
    document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
    await loadContent(id);
};

// ===================== 1. 用户管理 =====================
async function loadUsers() {
    const result = await API.AdminUser.list({ pageNum: 1, pageSize: 50 });
    const tbody = document.querySelector('#users tbody');
    if (!tbody) return;

    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="5" align="center">加载失败</td></tr>';
        return;
    }

    const records = result.data?.records || [];
    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" align="center">暂无用户</td></tr>';
        return;
    }

    tbody.innerHTML = records.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.username}${u.nickname ? ' (' + u.nickname + ')' : ''}</td>
            <td>${u.role === 'admin' ? '管理员' : '用户'}</td>
            <td>${u.status === 1 ? '<span class="status-badge active">正常</span>' : '<span style="color:#ff5252;">禁用</span>'}</td>
            <td>
                <button class="action-btn edit" onclick="editUser(${u.id}, '${u.username}', '${u.role}', ${u.status})">编辑</button>
                <button class="action-btn delete" onclick="deleteUser(${u.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

window.editUser = async function (id, username, role, status) {
    const newRole = prompt('修改角色（user/admin）：', role);
    if (!newRole) return;
    const newStatus = prompt('修改状态（1正常/0禁用）：', status);
    if (newStatus === null) return;

    const result = await API.AdminUser.update(id, {
        role: newRole.trim(),
        status: parseInt(newStatus)
    });
    if (result.code === 200) {
        alert('修改成功');
        await loadUsers();
    } else {
        alert(result.message || '修改失败');
    }
};

window.deleteUser = async function (id) {
    if (!confirm('确定删除该用户吗？')) return;
    const result = await API.AdminUser.delete(id);
    if (result.code === 200) {
        alert('删除成功');
        await loadUsers();
    } else {
        alert(result.message || '删除失败');
    }
};

// ===================== 2. 内容管理 =====================
async function loadContent(panelId) {
    if (panelId === 'basic-knowledge') await loadKnowledgeAdmin();
    else if (panelId === 'advanced-topics') await loadTopicAdmin();
    else if (panelId === 'scenario-tutorials') await loadScenarioAdmin();
}

// --- 基础茶识 ---
async function loadKnowledgeAdmin() {
    const result = await API.Knowledge.list({ pageNum: 1, pageSize: 100 });
    const panel = document.getElementById('basic-knowledge');
    if (!panel) return;

    const records = result.code === 200 ? (result.data?.records || []) : [];
    panel.innerHTML = `
        <div class="panel-header">
            <h3>基础茶识</h3>
            <button class="add-btn" onclick="addKnowledge()">新增文章</button>
        </div>
        <table class="data-table">
            <thead><tr><th>ID</th><th>标题</th><th>分类</th><th>浏览</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
                ${records.length === 0
                    ? '<tr><td colspan="6" align="center">暂无数据</td></tr>'
                    : records.map(k => `
                        <tr>
                            <td>${k.id}</td>
                            <td>${k.title}</td>
                            <td>${k.categoryName || k.categoryCode}</td>
                            <td>${k.viewCount || 0}</td>
                            <td>${k.status === 1 ? '<span class="status-badge published">已发布</span>' : '草稿'}</td>
                            <td>
                                <button class="action-btn edit" onclick="editKnowledge(${k.id})">编辑</button>
                                <button class="action-btn delete" onclick="deleteKnowledge(${k.id})">删除</button>
                            </td>
                        </tr>
                    `).join('')}
            </tbody>
        </table>
    `;
}

window.addKnowledge = async function () {
    const title = prompt('标题：');
    if (!title) return;
    const categoryCode = prompt('分类编码（tea-type/tea-ware/tea-health/tea-history/tea-etiquette）：');
    if (!categoryCode) return;
    const knowledgeKey = prompt('业务key（英文，唯一）：');
    if (!knowledgeKey) return;
    const summary = prompt('摘要：') || '';
    const detailContent = prompt('详情HTML内容：') || '';

    const result = await API.Knowledge.create({
        knowledgeKey, categoryCode, title, summary, detailContent, status: 1
    });
    if (result.code === 200) {
        alert('新增成功');
        await loadKnowledgeAdmin();
    } else {
        alert(result.message || '新增失败');
    }
};

window.editKnowledge = async function (id) {
    const r = await API.Knowledge.list({ pageNum: 1, pageSize: 1 });
    // 简化：管理员实际编辑应该有专门弹窗，这里走 prompt
    const title = prompt('修改标题：');
    if (title === null) return;
    const summary = prompt('修改摘要：') || '';
    const detailContent = prompt('修改详情HTML：') || '';
    const result = await API.Knowledge.update(id, { title, summary, detailContent });
    if (result.code === 200) {
        alert('修改成功');
        await loadKnowledgeAdmin();
    } else {
        alert(result.message || '修改失败');
    }
};

window.deleteKnowledge = async function (id) {
    if (!confirm('确定删除？')) return;
    const result = await API.Knowledge.delete(id);
    if (result.code === 200) {
        alert('删除成功');
        await loadKnowledgeAdmin();
    } else {
        alert(result.message || '删除失败');
    }
};

// --- 进阶专题 ---
async function loadTopicAdmin() {
    const result = await API.Topic.list({ pageNum: 1, pageSize: 100 });
    const panel = document.getElementById('advanced-topics');
    if (!panel) return;

    const records = result.code === 200 ? (result.data?.records || []) : [];
    panel.innerHTML = `
        <div class="panel-header">
            <h3>进阶专题</h3>
            <button class="add-btn" onclick="addTopic()">新增专题</button>
        </div>
        <table class="data-table">
            <thead><tr><th>ID</th><th>标题</th><th>分类</th><th>浏览</th><th>操作</th></tr></thead>
            <tbody>
                ${records.length === 0
                    ? '<tr><td colspan="5" align="center">暂无数据</td></tr>'
                    : records.map(t => `
                        <tr>
                            <td>${t.id}</td>
                            <td>${t.title}</td>
                            <td>${t.topicName || t.topicCode}</td>
                            <td>${t.viewCount || 0}</td>
                            <td>
                                <button class="action-btn edit" onclick="editTopic(${t.id})">编辑</button>
                                <button class="action-btn delete" onclick="deleteTopic(${t.id})">删除</button>
                            </td>
                        </tr>
                    `).join('')}
            </tbody>
        </table>
    `;
}

window.addTopic = async function () {
    const title = prompt('标题：');
    if (!title) return;
    const topicCode = prompt('分类编码（process/region/taste/health/culture）：');
    if (!topicCode) return;
    const topicKey = prompt('业务key：');
    if (!topicKey) return;
    const summary = prompt('简述：') || '';
    const detailContent = prompt('详情HTML：') || '';

    const result = await API.Topic.create({
        topicKey, topicCode, title, summary, detailContent, status: 1
    });
    if (result.code === 200) {
        alert('新增成功');
        await loadTopicAdmin();
    } else {
        alert(result.message || '新增失败');
    }
};

window.editTopic = async function (id) {
    const title = prompt('修改标题：');
    if (title === null) return;
    const summary = prompt('简述：') || '';
    const detailContent = prompt('详情HTML：') || '';
    const result = await API.Topic.update(id, { title, summary, detailContent });
    if (result.code === 200) {
        alert('修改成功');
        await loadTopicAdmin();
    } else {
        alert(result.message || '修改失败');
    }
};

window.deleteTopic = async function (id) {
    if (!confirm('确定删除？')) return;
    const result = await API.Topic.delete(id);
    if (result.code === 200) {
        alert('删除成功');
        await loadTopicAdmin();
    } else {
        alert(result.message || '删除失败');
    }
};

// --- 场景教程 ---
async function loadScenarioAdmin() {
    const result = await API.Scenario.list({ pageNum: 1, pageSize: 100 });
    const panel = document.getElementById('scenario-tutorials');
    if (!panel) return;

    const records = result.code === 200 ? (result.data?.records || []) : [];
    panel.innerHTML = `
        <div class="panel-header">
            <h3>场景教程</h3>
            <button class="add-btn" onclick="addScenario()">新增教程</button>
        </div>
        <table class="data-table">
            <thead><tr><th>ID</th><th>标题</th><th>场景</th><th>浏览</th><th>操作</th></tr></thead>
            <tbody>
                ${records.length === 0
                    ? '<tr><td colspan="5" align="center">暂无数据</td></tr>'
                    : records.map(s => `
                        <tr>
                            <td>${s.id}</td>
                            <td>${s.title}</td>
                            <td>${s.scenarioType}</td>
                            <td>${s.viewCount || 0}</td>
                            <td>
                                <button class="action-btn edit" onclick="editScenario(${s.id})">编辑</button>
                                <button class="action-btn delete" onclick="deleteScenario(${s.id})">删除</button>
                            </td>
                        </tr>
                    `).join('')}
            </tbody>
        </table>
    `;
}

window.addScenario = async function () {
    const title = prompt('标题：');
    if (!title) return;
    const scenarioType = prompt('场景类型（home/office/outdoor）：');
    if (!scenarioType) return;
    const scenarioKey = prompt('业务key：');
    if (!scenarioKey) return;
    const summary = prompt('简述：') || '';
    const detailContent = prompt('详情HTML：') || '';

    const result = await API.Scenario.create({
        scenarioKey, scenarioType, title, summary, detailContent, status: 1
    });
    if (result.code === 200) {
        alert('新增成功');
        await loadScenarioAdmin();
    } else {
        alert(result.message || '新增失败');
    }
};

window.editScenario = async function (id) {
    const title = prompt('修改标题：');
    if (title === null) return;
    const summary = prompt('简述：') || '';
    const detailContent = prompt('详情HTML：') || '';
    const result = await API.Scenario.update(id, { title, summary, detailContent });
    if (result.code === 200) {
        alert('修改成功');
        await loadScenarioAdmin();
    } else {
        alert(result.message || '修改失败');
    }
};

window.deleteScenario = async function (id) {
    if (!confirm('确定删除？')) return;
    const result = await API.Scenario.delete(id);
    if (result.code === 200) {
        alert('删除成功');
        await loadScenarioAdmin();
    } else {
        alert(result.message || '删除失败');
    }
};

// ===================== 3. 反馈管理 =====================
async function loadFeedbacks() {
    const result = await API.Feedback.adminList({ pageNum: 1, pageSize: 50 });
    const tbody = document.querySelector('#feedback tbody');
    if (!tbody) return;

    const records = result.code === 200 ? (result.data?.records || []) : [];
    const statusMap = { 0: '<span style="color:#ff9800;">未处理</span>', 1: '处理中', 2: '<span class="status-badge active">已处理</span>' };

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" align="center">暂无反馈</td></tr>';
        return;
    }

    tbody.innerHTML = records.map(f => `
        <tr>
            <td>${f.id}</td>
            <td>${f.username || f.userId}</td>
            <td>${f.feedbackType || '-'}</td>
            <td>${f.content.substring(0, 30)}${f.content.length > 30 ? '...' : ''}</td>
            <td>${statusMap[f.status] || f.status}</td>
            <td><button class="action-btn edit" onclick="replyFeedback(${f.id})">回复</button></td>
        </tr>
    `).join('');
}

window.replyFeedback = async function (id) {
    const reply = prompt('回复内容：');
    if (!reply) return;
    const result = await API.Feedback.reply(id, reply, 2);
    if (result.code === 200) {
        alert('回复成功');
        await loadFeedbacks();
    } else {
        alert(result.message || '回复失败');
    }
};
