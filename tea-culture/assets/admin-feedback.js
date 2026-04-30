document.addEventListener('DOMContentLoaded', async () => {
    if (!AdminCommon.requireAdmin()) return;
    AdminCommon.bindAdminHeader();
    hydrateFiltersFromQuery();
    bindEvents();
    await load();
});

function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        AdminCommon.setQuery({ pageNum: 1, keyword: document.getElementById('keyword').value.trim(), status: document.getElementById('status').value });
        load();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('keyword').value = '';
        document.getElementById('status').value = '';
        AdminCommon.setQuery({ pageNum: 1, keyword: '', status: '' });
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
    document.getElementById('keyword').value = sp.get('keyword') || '';
    document.getElementById('status').value = sp.get('status') || '';
}

async function load() {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const keyword = document.getElementById('keyword').value.trim();
    const status = document.getElementById('status').value;
    const result = await API.Feedback.adminList({ pageNum, pageSize: 20, keyword: keyword || undefined, status: status === '' ? undefined : parseInt(status, 10) });

    const tbody = document.getElementById('tbody');
    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">加载失败</td></tr>';
        return;
    }
    const records = result.data?.records || [];
    window.__feedbackMap = new Map(records.map(f => [String(f.id), f]));
    const statusMap = { 0: '未处理', 1: '处理中', 2: '已处理' };
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = records.map(f => `
            <tr>
                <td><input type="checkbox" name="rowId" value="${f.id}"></td>
                <td>${f.id}</td>
                <td>${f.username || f.userId || ''}</td>
                <td>${f.feedbackType || ''}</td>
                <td>${escapeHtml((f.content || '').slice(0, 80))}${(f.content || '').length > 80 ? '...' : ''}</td>
                <td>${statusMap[f.status] || f.status}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn light" onclick="openReply('${f.id}')">回复/更新</button>
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

window.openReply = function (id, reply, status) {
    const item = window.__feedbackMap ? window.__feedbackMap.get(String(id)) : null;
    reply = item ? (item.reply || '') : '';
    status = item && item.status != null ? item.status : 0;
    AdminCommon.openModal('回复反馈', `
        <div class="form-grid">
            <div class="form-item" style="grid-column:1/-1;">
                <label>回复内容</label>
                <textarea id="f_reply">${escapeHtml(reply || '')}</textarea>
            </div>
            <div class="form-item">
                <label>状态</label>
                <select id="f_status">
                    <option value="0">未处理</option>
                    <option value="1">处理中</option>
                    <option value="2">已处理</option>
                </select>
            </div>
        </div>
    `, async () => {
        const r = await API.Feedback.reply(id, document.getElementById('f_reply').value, parseInt(document.getElementById('f_status').value, 10));
        if (r.code === 200) {
            closeModal();
            load();
        } else {
            alert(r.message || '更新失败');
        }
    });
    document.getElementById('f_status').value = String(status == null ? 0 : status);
};

window.deleteRow = async function (id) {
    if (!confirm('确定删除该记录吗？')) return;
    const r = await API.Feedback.adminDelete(id);
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
    const r = await API.Feedback.adminBatchDelete(ids);
    if (r.code === 200) load();
    else alert(r.message || '批量删除失败');
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
