document.addEventListener('DOMContentLoaded', async () => {
    if (!AdminCommon.requireAdmin()) return;
    AdminCommon.bindAdminHeader();
    await loadCategories();
    hydrateFiltersFromQuery();
    bindEvents();
    await load();
});

function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        AdminCommon.setQuery({ pageNum: 1, keyword: document.getElementById('keyword').value.trim(), categoryCode: document.getElementById('categoryCode').value });
        load();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('keyword').value = '';
        document.getElementById('categoryCode').value = '';
        AdminCommon.setQuery({ pageNum: 1, keyword: '', categoryCode: '' });
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

async function loadCategories() {
    const sel = document.getElementById('categoryCode');
    const r = await API.Knowledge.listCategories();
    if (r.code !== 200) return;
    (r.data || []).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.categoryCode;
        opt.textContent = c.categoryName;
        sel.appendChild(opt);
    });
}

function hydrateFiltersFromQuery() {
    const sp = new URLSearchParams(location.search);
    document.getElementById('keyword').value = sp.get('keyword') || '';
    document.getElementById('categoryCode').value = sp.get('categoryCode') || '';
}

async function load() {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const keyword = document.getElementById('keyword').value.trim();
    const categoryCode = document.getElementById('categoryCode').value;
    const result = await API.Knowledge.list({ pageNum, pageSize: 10, keyword: keyword || undefined, categoryCode: categoryCode || undefined });

    const tbody = document.getElementById('tbody');
    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="6" align="center">加载失败</td></tr>';
        return;
    }
    const records = result.data?.records || [];
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="6" align="center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = records.map(k => `
            <tr>
                <td><input type="checkbox" name="rowId" value="${k.id}"></td>
                <td>${k.id}</td>
                <td>${k.categoryName || k.categoryCode || ''}</td>
                <td>${k.title || ''}</td>
                <td>${k.status === 1 ? '<span class="tag">已发布</span>' : '<span class="tag" style="background:#fff1f1;color:#ff5252;">草稿</span>'}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn light" onclick="openEditor('${k.id}','${k.knowledgeKey}')">编辑</button>
                        <button class="btn danger" onclick="deleteRow('${k.id}')">删除</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    const total = result.data?.total || 0;
    document.getElementById('pageInfo').innerText = `第 ${pageNum} 页，共 ${Math.max(1, Math.ceil(total / 10))} 页（${total} 条）`;
    document.getElementById('prevBtn').disabled = pageNum <= 1;
    document.getElementById('nextBtn').disabled = pageNum >= Math.ceil(total / 10);
    document.getElementById('checkAll').checked = false;
}

function changePage(delta) {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const next = Math.max(1, pageNum + delta);
    AdminCommon.setQuery({ pageNum: next });
    load();
}

window.openEditor = async function (id, knowledgeKey) {
    let data = { status: 1 };
    if (knowledgeKey) {
        const r = await API.Knowledge.getByKey(knowledgeKey);
        if (r.code === 200 && r.data) data = r.data;
    }

    AdminCommon.openModal(id ? '编辑茶识' : '新增茶识', `
        <div class="form-grid">
            <div class="form-item">
                <label>knowledgeKey</label>
                <input id="f_key" type="text" value="${escapeHtml(data.knowledgeKey || '')}" ${id ? 'disabled' : ''}>
            </div>
            <div class="form-item">
                <label>分类</label>
                <select id="f_category"></select>
            </div>
            <div class="form-item">
                <label>标题</label>
                <input id="f_title" type="text" value="${escapeHtml(data.title || '')}">
            </div>
            <div class="form-item">
                <label>封面图</label>
                <input id="f_cover" type="text" value="${escapeHtml(data.coverImage || '')}">
            </div>
            <div class="form-item" style="grid-column:1/-1;">
                <label>摘要</label>
                <textarea id="f_summary">${escapeHtml(data.summary || '')}</textarea>
            </div>
            <div class="form-item" style="grid-column:1/-1;">
                <label>详情HTML</label>
                <textarea id="f_detail">${escapeHtml(data.detailContent || '')}</textarea>
            </div>
            <div class="form-item">
                <label>状态</label>
                <select id="f_status">
                    <option value="1">已发布</option>
                    <option value="0">草稿</option>
                </select>
            </div>
            <div class="form-item">
                <label>排序</label>
                <input id="f_sort" type="number" value="${data.sortOrder == null ? '' : data.sortOrder}">
            </div>
        </div>
    `, async () => {
        const payload = {
            knowledgeKey: document.getElementById('f_key').value.trim(),
            categoryCode: document.getElementById('f_category').value,
            title: document.getElementById('f_title').value.trim(),
            coverImage: document.getElementById('f_cover').value.trim(),
            summary: document.getElementById('f_summary').value,
            detailContent: document.getElementById('f_detail').value,
            status: parseInt(document.getElementById('f_status').value, 10),
            sortOrder: document.getElementById('f_sort').value === '' ? null : parseInt(document.getElementById('f_sort').value, 10)
        };
        if (!id && !payload.knowledgeKey) {
            alert('knowledgeKey不能为空');
            return;
        }
        const r = id ? await API.Knowledge.update(id, payload) : await API.Knowledge.create(payload);
        if (r.code === 200) {
            closeModal();
            load();
        } else {
            alert(r.message || '保存失败');
        }
    });

    const sel = document.getElementById('f_category');
    const categories = document.querySelectorAll('#categoryCode option');
    categories.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.textContent;
        sel.appendChild(o);
    });
    sel.value = data.categoryCode || '';
    document.getElementById('f_status').value = String(data.status == null ? 1 : (data.status === true ? 1 : data.status));
};

window.deleteRow = async function (id) {
    if (!confirm('确定删除该记录吗？')) return;
    const r = await API.Knowledge.delete(id);
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
    const r = await API.Knowledge.batchDelete(ids);
    if (r.code === 200) load();
    else alert(r.message || '批量删除失败');
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
