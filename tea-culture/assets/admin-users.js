document.addEventListener('DOMContentLoaded', async () => {
    if (!AdminCommon.requireAdmin()) return;
    AdminCommon.bindAdminHeader();

    document.getElementById('searchBtn').addEventListener('click', () => {
        AdminCommon.setQuery({ pageNum: 1, keyword: document.getElementById('keyword').value.trim(), role: document.getElementById('role').value, status: document.getElementById('status').value });
        load();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('keyword').value = '';
        document.getElementById('role').value = '';
        document.getElementById('status').value = '';
        AdminCommon.setQuery({ pageNum: 1, keyword: '', role: '', status: '' });
        load();
    });
    document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changePage(1));
    document.getElementById('checkAll').addEventListener('change', (e) => {
        document.querySelectorAll('input[name="rowId"]').forEach(c => c.checked = e.target.checked);
    });
    document.getElementById('batchDeleteBtn').addEventListener('click', batchDelete);

    hydrateFiltersFromQuery();
    await load();
});

function hydrateFiltersFromQuery() {
    const sp = new URLSearchParams(location.search);
    const keyword = sp.get('keyword') || '';
    const role = sp.get('role') || '';
    const status = sp.get('status') || '';
    document.getElementById('keyword').value = keyword;
    document.getElementById('role').value = role;
    document.getElementById('status').value = status;
}

async function load() {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const keyword = document.getElementById('keyword').value.trim();
    const role = document.getElementById('role').value;
    const status = document.getElementById('status').value;

    const result = await API.AdminUser.list({ pageNum, pageSize: 20, keyword: keyword || undefined, role: role || undefined, status: status === '' ? undefined : parseInt(status, 10) });
    const tbody = document.getElementById('tbody');
    if (!tbody) return;
    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">加载失败</td></tr>';
        return;
    }

    const records = result.data?.records || [];
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = records.map(u => `
            <tr>
                <td><input type="checkbox" name="rowId" value="${u.id}"></td>
                <td>${u.id}</td>
                <td>${u.username || ''}</td>
                <td>${u.nickname || ''}</td>
                <td>${u.role === 'admin' ? '<span class="tag">admin</span>' : 'user'}</td>
                <td>${u.status === 1 ? '<span class="tag">正常</span>' : '<span class="tag" style="background:#fff1f1;color:#ff5252;">禁用</span>'}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn light" onclick="editUser('${u.id}','${u.role}',${u.status})">编辑</button>
                        <button class="btn light" onclick="resetPassword('${u.id}')">重置密码</button>
                        <button class="btn danger" onclick="deleteUser('${u.id}')">删除</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    const total = result.data?.total || 0;
    document.getElementById('pageInfo').innerText = `第 ${pageNum} 页，共 ${Math.max(1, Math.ceil(total / 20))} 页（${total} 条）`;
    document.getElementById('prevBtn').disabled = pageNum <= 1;
    document.getElementById('nextBtn').disabled = pageNum >= Math.ceil(total / 20);
    document.getElementById('checkAll').checked = false;
}

function changePage(delta) {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const next = Math.max(1, pageNum + delta);
    AdminCommon.setQuery({ pageNum: next });
    load();
}

window.editUser = function (id, role, status) {
    AdminCommon.openModal('编辑用户', `
        <div class="form-grid">
            <div class="form-item">
                <label>角色</label>
                <select id="editRole">
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                </select>
            </div>
            <div class="form-item">
                <label>状态</label>
                <select id="editStatus">
                    <option value="1">正常</option>
                    <option value="0">禁用</option>
                </select>
            </div>
        </div>
    `, async () => {
        const newRole = document.getElementById('editRole').value;
        const newStatus = parseInt(document.getElementById('editStatus').value, 10);
        const r = await API.AdminUser.update(id, { role: newRole, status: newStatus });
        if (r.code === 200) {
            closeModal();
            load();
        } else {
            alert(r.message || '修改失败');
        }
    });
    document.getElementById('editRole').value = role || 'user';
    document.getElementById('editStatus').value = String(status);
};

window.resetPassword = async function (id) {
    if (!confirm('确定重置该用户密码为 123456 吗？')) return;
    const r = await API.AdminUser.resetPassword(id);
    if (r.code === 200) alert('已重置');
    else alert(r.message || '重置失败');
};

window.deleteUser = async function (id) {
    if (!confirm('确定删除该用户吗？')) return;
    const r = await API.AdminUser.delete(id);
    if (r.code === 200) load();
    else alert(r.message || '删除失败');
};

async function batchDelete() {
    const ids = AdminCommon.getCheckedIds('rowId');
    if (!ids.length) {
        alert('请先勾选要删除的记录');
        return;
    }
    if (!confirm(`确定批量删除 ${ids.length} 条记录吗？`)) return;
    const r = await API.AdminUser.batchDelete(ids);
    if (r.code === 200) load();
    else alert(r.message || '批量删除失败');
}
