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
            deviceId: document.getElementById('deviceId').value.trim(),
            commandType: document.getElementById('commandType').value.trim()
        });
        load();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        ['userId', 'username', 'deviceId', 'commandType'].forEach(id => document.getElementById(id).value = '');
        AdminCommon.setQuery({ pageNum: 1, userId: '', username: '', deviceId: '', commandType: '' });
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
    document.getElementById('deviceId').value = sp.get('deviceId') || '';
    document.getElementById('commandType').value = sp.get('commandType') || '';
}

async function load() {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const userId = document.getElementById('userId').value.trim();
    const username = document.getElementById('username').value.trim();
    const deviceId = document.getElementById('deviceId').value.trim();
    const commandType = document.getElementById('commandType').value.trim();

    const params = { pageNum, pageSize: 20 };
    if (userId) params.userId = userId;
    if (username) params.username = username;
    if (deviceId) params.deviceId = deviceId;
    if (commandType) params.commandType = commandType;

    const result = await API.AdminDeviceCommand.list(params);
    const tbody = document.getElementById('tbody');
    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">加载失败</td></tr>';
        return;
    }
    const records = result.data?.records || [];
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = records.map(log => `
            <tr>
                <td><input type="checkbox" name="rowId" value="${log.id}"></td>
                <td>${log.id}</td>
                <td>${log.username || log.userId || ''}</td>
                <td>${log.deviceId || ''}</td>
                <td>${log.commandType || ''}</td>
                <td>${escapeHtml(`${log.topic || ''} ${log.teaType || ''} ${log.result == null ? '' : 'result=' + log.result}`.trim())}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn light" onclick="viewDetail('${log.id}')">查看</button>
                        <button class="btn danger" onclick="deleteRow('${log.id}')">删除</button>
                    </div>
                </td>
            </tr>
        `).join('');
        window.__deviceLogMap = new Map(records.map(r => [String(r.id), r]));
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

window.viewDetail = function (id) {
    const item = window.__deviceLogMap ? window.__deviceLogMap.get(String(id)) : null;
    if (!item) return;
    AdminCommon.openModal('日志详情', `
        <div style="color:#555;line-height:1.8;">
            <div><b>ID：</b>${item.id}</div>
            <div><b>用户：</b>${escapeHtml(item.username || '')} (${item.userId || ''})</div>
            <div><b>设备ID：</b>${escapeHtml(item.deviceId || '')}</div>
            <div><b>指令类型：</b>${escapeHtml(item.commandType || '')}</div>
            <div><b>主题：</b>${escapeHtml(item.topic || '')}</div>
            <div><b>茶类：</b>${escapeHtml(item.teaType || '')}</div>
            <div><b>投茶量：</b>${item.amount == null ? '' : item.amount}</div>
            <div><b>水温：</b>${item.waterTemp == null ? '' : item.waterTemp}</div>
            <div><b>冲泡时长：</b>${item.brewTime == null ? '' : item.brewTime}</div>
            <div><b>结果：</b>${item.result == null ? '' : item.result}</div>
            <div><b>错误信息：</b>${escapeHtml(item.errorMsg || '')}</div>
        </div>
    `, () => closeModal());
    const saveBtn = document.getElementById('modalSaveBtn');
    if (saveBtn) saveBtn.innerText = '关闭';
};

window.deleteRow = async function (id) {
    if (!confirm('确定删除该记录吗？')) return;
    const r = await API.AdminDeviceCommand.delete(id);
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
    const r = await API.AdminDeviceCommand.batchDelete(ids);
    if (r.code === 200) load();
    else alert(r.message || '批量删除失败');
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
