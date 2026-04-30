document.addEventListener('DOMContentLoaded', async () => {
    if (!AdminCommon.requireAdmin()) return;
    AdminCommon.bindAdminHeader();
    hydrateFiltersFromQuery();
    bindEvents();
    await load();
});

function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        AdminCommon.setQuery({ pageNum: 1, scenarioKey: document.getElementById('scenarioKey').value.trim(), keyword: document.getElementById('keyword').value.trim() });
        load();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('scenarioKey').value = '';
        document.getElementById('keyword').value = '';
        AdminCommon.setQuery({ pageNum: 1, scenarioKey: '', keyword: '' });
        load();
    });
    document.getElementById('addBtn').addEventListener('click', () => openEditor());
    document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changePage(1));
    document.getElementById('checkAll').addEventListener('change', (e) => {
        document.querySelectorAll('input[name="rowId"]').forEach(c => c.checked = e.target.checked);
    });
    document.getElementById('batchDeleteBtn').addEventListener('click', batchDelete);
}

function hydrateFiltersFromQuery() {
    const sp = new URLSearchParams(location.search);
    document.getElementById('scenarioKey').value = sp.get('scenarioKey') || '';
    document.getElementById('keyword').value = sp.get('keyword') || '';
}

async function load() {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const scenarioKey = document.getElementById('scenarioKey').value.trim();
    const keyword = document.getElementById('keyword').value.trim();
    const params = { pageNum, pageSize: 20 };
    if (scenarioKey) params.scenarioKey = scenarioKey;
    if (keyword) params.keyword = keyword;
    const result = await API.AdminBrewingParam.list(params);

    const tbody = document.getElementById('tbody');
    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="8" align="center">加载失败</td></tr>';
        return;
    }
    const records = result.data?.records || [];
    window.__paramMap = new Map(records.map(r => [String(r.id), r]));
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="8" align="center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = records.map(p => `
            <tr>
                <td><input type="checkbox" name="rowId" value="${p.id}"></td>
                <td>${p.id}</td>
                <td>${escapeHtml(p.scenarioKey || '')}</td>
                <td>${escapeHtml(p.teaType || '')}</td>
                <td>${escapeHtml(p.waterTemp || '')}</td>
                <td>${escapeHtml(p.amount || '')}</td>
                <td>${escapeHtml(p.brewTime || '')}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn light" onclick="openEditor('${p.id}')">编辑</button>
                        <button class="btn danger" onclick="deleteRow('${p.id}')">删除</button>
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

window.openEditor = function (id) {
    const data = id && window.__paramMap ? (window.__paramMap.get(String(id)) || {}) : {};
    AdminCommon.openModal(id ? '编辑冲泡参数' : '新增冲泡参数', `
        <div class="form-grid">
            <div class="form-item">
                <label>场景内容标识</label>
                <input id="f_scenarioKey" type="text" value="${escapeHtml(data.scenarioKey || '')}">
            </div>
            <div class="form-item">
                <label>茶类</label>
                <input id="f_teaType" type="text" value="${escapeHtml(data.teaType || '')}">
            </div>
            <div class="form-item">
                <label>投茶量</label>
                <input id="f_amount" type="text" value="${escapeHtml(data.amount || '')}">
            </div>
            <div class="form-item">
                <label>水温</label>
                <input id="f_waterTemp" type="text" value="${escapeHtml(data.waterTemp || '')}">
            </div>
            <div class="form-item">
                <label>冲泡时长</label>
                <input id="f_brewTime" type="text" value="${escapeHtml(data.brewTime || '')}">
            </div>
            <div class="form-item" style="grid-column:1/-1;">
                <label>备注</label>
                <textarea id="f_note">${escapeHtml(data.note || '')}</textarea>
            </div>
        </div>
    `, async () => {
        const payload = {
            scenarioKey: document.getElementById('f_scenarioKey').value.trim(),
            teaType: document.getElementById('f_teaType').value.trim(),
            amount: document.getElementById('f_amount').value.trim(),
            waterTemp: document.getElementById('f_waterTemp').value.trim(),
            brewTime: document.getElementById('f_brewTime').value.trim(),
            note: document.getElementById('f_note').value
        };
        if (!payload.scenarioKey) {
            alert('场景内容标识不能为空');
            return;
        }
        const r = id ? await API.AdminBrewingParam.update(id, payload) : await API.AdminBrewingParam.create(payload);
        if (r.code === 200) {
            closeModal();
            load();
        } else {
            alert(r.message || '保存失败');
        }
    });
};

window.deleteRow = async function (id) {
    if (!confirm('确定删除该记录吗？')) return;
    const r = await API.AdminBrewingParam.delete(id);
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
    const r = await API.AdminBrewingParam.batchDelete(ids);
    if (r.code === 200) load();
    else alert(r.message || '批量删除失败');
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
