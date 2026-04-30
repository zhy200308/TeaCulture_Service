document.addEventListener('DOMContentLoaded', async () => {
    if (!AdminCommon.requireAdmin()) return;
    AdminCommon.bindAdminHeader();
    hydrateFiltersFromQuery();
    bindEvents();
    await load();
});

function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        AdminCommon.setQuery({
            pageNum: 1,
            userId: document.getElementById('userId').value.trim(),
            username: document.getElementById('username').value.trim(),
            targetType: document.getElementById('targetType').value,
            targetKey: document.getElementById('targetKey').value.trim()
        });
        load();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        ['userId', 'username', 'targetKey'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('targetType').value = '';
        AdminCommon.setQuery({ pageNum: 1, userId: '', username: '', targetType: '', targetKey: '' });
        load();
    });
    document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changePage(1));
    document.getElementById('checkAll').addEventListener('change', (e) => {
        document.querySelectorAll('input[name="rowId"]').forEach(c => c.checked = e.target.checked);
    });
    document.getElementById('batchDeleteBtn').addEventListener('click', batchDelete);
}

function hydrateFiltersFromQuery() {
    const sp = new URLSearchParams(location.search);
    document.getElementById('userId').value = sp.get('userId') || '';
    document.getElementById('username').value = sp.get('username') || '';
    document.getElementById('targetType').value = sp.get('targetType') || '';
    document.getElementById('targetKey').value = sp.get('targetKey') || '';
}

async function load() {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const userId = document.getElementById('userId').value.trim();
    const username = document.getElementById('username').value.trim();
    const targetType = document.getElementById('targetType').value;
    const targetKey = document.getElementById('targetKey').value.trim();

    const params = { pageNum, pageSize: 20 };
    if (userId) params.userId = userId;
    if (username) params.username = username;
    if (targetType) params.targetType = targetType;
    if (targetKey) params.targetKey = targetKey;

    const result = await API.AdminFavorite.list(params);
    const tbody = document.getElementById('tbody');
    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">加载失败</td></tr>';
        return;
    }
    const records = result.data?.records || [];
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = records.map(f => `
            <tr>
                <td><input type="checkbox" name="rowId" value="${f.id}"></td>
                <td>${f.id}</td>
                <td>${f.username || f.userId || ''}</td>
                <td>${f.targetType || ''}</td>
                <td>${f.targetId || ''}</td>
                <td>${escapeHtml(f.targetTitle || f.targetKey || '')}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn danger" onclick="deleteRow('${f.id}')">删除</button>
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

window.deleteRow = async function (id) {
    if (!confirm('确定删除该记录吗？')) return;
    const r = await API.AdminFavorite.delete(id);
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
    const r = await API.AdminFavorite.batchDelete(ids);
    if (r.code === 200) load();
    else alert(r.message || '批量删除失败');
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
