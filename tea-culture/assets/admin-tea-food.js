document.addEventListener('DOMContentLoaded', async () => {
    if (!AdminCommon.requireAdmin()) return;
    AdminCommon.bindAdminHeader();
    hydrateFiltersFromQuery();
    bindEvents();
    await load();
});

function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        AdminCommon.setQuery({ pageNum: 1, keyword: document.getElementById('keyword').value.trim(), teaTypeCode: document.getElementById('teaTypeCode').value.trim() });
        load();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('keyword').value = '';
        document.getElementById('teaTypeCode').value = '';
        AdminCommon.setQuery({ pageNum: 1, keyword: '', teaTypeCode: '' });
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
    document.getElementById('teaTypeCode').value = sp.get('teaTypeCode') || '';
}

async function load() {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const keyword = document.getElementById('keyword').value.trim();
    const teaTypeCode = document.getElementById('teaTypeCode').value.trim();
    const result = await API.TeaFood.adminList({ pageNum, pageSize: 10, keyword: keyword || undefined, teaTypeCode: teaTypeCode || undefined });

    const tbody = document.getElementById('tbody');
    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="6" align="center">加载失败</td></tr>';
        return;
    }
    const records = result.data?.records || [];
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="6" align="center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = records.map(m => `
            <tr>
                <td><input type="checkbox" name="rowId" value="${m.id}"></td>
                <td>${m.id}</td>
                <td>${m.teaTypeCode || ''}</td>
                <td>${m.title || ''}</td>
                <td>${m.status === true || m.status === 1 ? '<span class="tag">已发布</span>' : '<span class="tag" style="background:#fff1f1;color:#ff5252;">草稿</span>'}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn light" onclick="openEditor('${m.id}')">编辑</button>
                        <button class="btn danger" onclick="deleteRow('${m.id}')">删除</button>
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

window.openEditor = async function (id) {
    let data = { status: 1 };
    if (id) {
        const r = await API.TeaFood.getById(id);
        if (r.code === 200 && r.data) data = r.data.match || r.data;
    }

    AdminCommon.openModal(id ? '编辑茶食搭配' : '新增茶食搭配', `
        <div class="form-grid">
            <div class="form-item">
                <label>茶类编码</label>
                <input id="f_teaTypeCode" type="text" value="${escapeHtml(data.teaTypeCode || '')}">
            </div>
            <div class="form-item">
                <label>茶名</label>
                <input id="f_teaName" type="text" value="${escapeHtml(data.teaName || '')}">
            </div>
            <div class="form-item">
                <label>食物名</label>
                <input id="f_foodName" type="text" value="${escapeHtml(data.foodName || '')}">
            </div>
            <div class="form-item">
                <label>标题</label>
                <input id="f_title" type="text" value="${escapeHtml(data.title || '')}">
            </div>
            <div class="form-item">
                <label>封面图</label>
                <input id="f_coverFile" type="file" accept="image/*">
                <input id="f_cover" type="hidden" value="${escapeHtml(data.coverImage || '')}">
                <img id="f_coverPreview" src="${escapeHtml(data.coverImage || '')}" style="display:${data.coverImage ? 'block' : 'none'};margin-top:8px;width:100%;max-width:260px;height:140px;object-fit:cover;border-radius:8px;border:1px solid #eee;">
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
            <div class="form-item" style="grid-column:1/-1;">
                <label>摘要</label>
                <textarea id="f_summary">${escapeHtml(data.summary || '')}</textarea>
            </div>
            <div class="form-item" style="grid-column:1/-1;">
                <label>详情内容</label>
                <textarea id="f_detail">${escapeHtml(data.detailContent || '')}</textarea>
            </div>
        </div>
    `, async () => {
        let coverImage = document.getElementById('f_cover').value.trim();
        const coverFile = document.getElementById('f_coverFile').files && document.getElementById('f_coverFile').files[0];
        if (coverFile) {
            const up = await API.Upload.uploadImage(coverFile);
            if (up.code !== 200 || !up.data) {
                alert(up.message || '封面上传失败');
                return;
            }
            coverImage = up.data;
        }
        const payload = {
            teaTypeCode: document.getElementById('f_teaTypeCode').value.trim(),
            teaName: document.getElementById('f_teaName').value.trim(),
            foodName: document.getElementById('f_foodName').value.trim(),
            title: document.getElementById('f_title').value.trim(),
            coverImage,
            summary: document.getElementById('f_summary').value,
            detailContent: document.getElementById('f_detail').value,
            status: parseInt(document.getElementById('f_status').value, 10),
            sortOrder: document.getElementById('f_sort').value === '' ? null : parseInt(document.getElementById('f_sort').value, 10)
        };
        if (!payload.title) {
            alert('标题不能为空');
            return;
        }
        const r = id ? await API.TeaFood.update(id, payload) : await API.TeaFood.create(payload);
        if (r.code === 200) {
            closeModal();
            load();
        } else {
            alert(r.message || '保存失败');
        }
    });

    const coverFile = document.getElementById('f_coverFile');
    const coverPreview = document.getElementById('f_coverPreview');
    if (coverFile && coverPreview) {
        coverFile.addEventListener('change', () => {
            const file = coverFile.files && coverFile.files[0];
            if (file) {
                coverPreview.src = URL.createObjectURL(file);
                coverPreview.style.display = 'block';
            }
        });
    }

    document.getElementById('f_status').value = String(data.status == null ? 1 : (data.status === true ? 1 : data.status));
};

window.deleteRow = async function (id) {
    if (!confirm('确定删除该记录吗？')) return;
    const r = await API.TeaFood.delete(id);
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
    const r = await API.TeaFood.batchDelete(ids);
    if (r.code === 200) load();
    else alert(r.message || '批量删除失败');
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
