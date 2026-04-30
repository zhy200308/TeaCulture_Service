document.addEventListener('DOMContentLoaded', async () => {
    if (!AdminCommon.requireAdmin()) return;
    AdminCommon.bindAdminHeader();
    hydrateFiltersFromQuery();
    bindEvents();
    await load();
});

function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        AdminCommon.setQuery({ pageNum: 1, keyword: document.getElementById('keyword').value.trim() });
        load();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('keyword').value = '';
        AdminCommon.setQuery({ pageNum: 1, keyword: '' });
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
    document.getElementById('keyword').value = sp.get('keyword') || '';
}

async function load() {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const keyword = document.getElementById('keyword').value.trim();
    const result = await API.AdminTeaWare.list({ pageNum, pageSize: 20, keyword: keyword || undefined });

    const tbody = document.getElementById('tbody');
    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="6" align="center">加载失败</td></tr>';
        return;
    }
    const records = result.data?.records || [];
    window.__wareMap = new Map(records.map(r => [String(r.id), r]));
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="6" align="center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = records.map(w => `
            <tr>
                <td><input type="checkbox" name="rowId" value="${w.id}"></td>
                <td>${w.id}</td>
                <td>${escapeHtml(w.wareKey || '')}</td>
                <td>${escapeHtml(w.name || '')}</td>
                <td>${escapeHtml(w.suitableTea || '')}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn light" onclick="openEditor('${w.id}')">编辑</button>
                        <button class="btn danger" onclick="deleteRow('${w.id}')">删除</button>
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
    const data = id && window.__wareMap ? (window.__wareMap.get(String(id)) || {}) : {};
    AdminCommon.openModal(id ? '编辑茶器' : '新增茶器', `
        <div class="form-grid">
            <div class="form-item">
                <label>wareKey</label>
                <input id="f_key" type="text" value="${escapeHtml(data.wareKey || '')}">
            </div>
            <div class="form-item">
                <label>name</label>
                <input id="f_name" type="text" value="${escapeHtml(data.name || '')}">
            </div>
            <div class="form-item">
                <label>image</label>
                <input id="f_image" type="text" value="${escapeHtml(data.image || '')}">
            </div>
            <div class="form-item">
                <label>suitableTea</label>
                <input id="f_suitable" type="text" value="${escapeHtml(data.suitableTea || '')}">
            </div>
            <div class="form-item">
                <label>sortOrder</label>
                <input id="f_sort" type="number" value="${data.sortOrder == null ? '' : data.sortOrder}">
            </div>
            <div class="form-item" style="grid-column:1/-1;">
                <label>detailContent</label>
                <textarea id="f_detail">${escapeHtml(data.detailContent || '')}</textarea>
            </div>
        </div>
    `, async () => {
        const payload = {
            wareKey: document.getElementById('f_key').value.trim(),
            name: document.getElementById('f_name').value.trim(),
            image: document.getElementById('f_image').value.trim(),
            suitableTea: document.getElementById('f_suitable').value.trim(),
            sortOrder: document.getElementById('f_sort').value === '' ? null : parseInt(document.getElementById('f_sort').value, 10),
            detailContent: document.getElementById('f_detail').value
        };
        if (!payload.wareKey) {
            alert('wareKey不能为空');
            return;
        }
        const r = id ? await API.AdminTeaWare.update(id, payload) : await API.AdminTeaWare.create(payload);
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
    const r = await API.AdminTeaWare.delete(id);
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
    const r = await API.AdminTeaWare.batchDelete(ids);
    if (r.code === 200) load();
    else alert(r.message || '批量删除失败');
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
