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
        AdminCommon.setQuery({ pageNum: 1, keyword: document.getElementById('keyword').value.trim(), topicCode: document.getElementById('topicCode').value });
        load();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('keyword').value = '';
        document.getElementById('topicCode').value = '';
        AdminCommon.setQuery({ pageNum: 1, keyword: '', topicCode: '' });
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
    const sel = document.getElementById('topicCode');
    const r = await API.Topic.listCategories();
    if (r.code !== 200) return;
    (r.data || []).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.topicCode;
        opt.textContent = c.topicName;
        sel.appendChild(opt);
    });
}

function hydrateFiltersFromQuery() {
    const sp = new URLSearchParams(location.search);
    document.getElementById('keyword').value = sp.get('keyword') || '';
    document.getElementById('topicCode').value = sp.get('topicCode') || '';
}

async function load() {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const keyword = document.getElementById('keyword').value.trim();
    const topicCode = document.getElementById('topicCode').value;
    const result = await API.Topic.list({ pageNum, pageSize: 10, keyword: keyword || undefined, topicCode: topicCode || undefined });

    const tbody = document.getElementById('tbody');
    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="6" align="center">加载失败</td></tr>';
        return;
    }
    const records = result.data?.records || [];
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="6" align="center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = records.map(t => `
            <tr>
                <td><input type="checkbox" name="rowId" value="${t.id}"></td>
                <td>${t.id}</td>
                <td>${t.topicName || t.topicCode || ''}</td>
                <td>${t.title || ''}</td>
                <td>${t.status === 1 ? '<span class="tag">已发布</span>' : '<span class="tag" style="background:#fff1f1;color:#ff5252;">草稿</span>'}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn light" onclick="openEditor('${t.id}')">编辑</button>
                        <button class="btn danger" onclick="deleteRow('${t.id}')">删除</button>
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
        const r = await API.Topic.getById(id);
        if (r.code === 200 && r.data) data = r.data;
    }

    AdminCommon.openModal(id ? '编辑专题' : '新增专题', `
        <div class="form-grid">
            <div class="form-item">
                <label>分类</label>
                <select id="f_code"></select>
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
                <label>音频文件（可选）</label>
                <input id="f_audioFile" type="file" accept="audio/*">
                <input id="f_audio" type="hidden" value="${escapeHtml(data.audioUrl || '')}">
                <div style="display:${data.audioUrl ? 'block' : 'none'};margin-top:8px;color:#666;font-size:13px;word-break:break-all;" id="f_audioText">${escapeHtml(data.audioUrl || '')}</div>
            </div>
            <div class="form-item">
                <label>状态</label>
                <select id="f_status">
                    <option value="1">已发布</option>
                    <option value="0">草稿</option>
                </select>
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

        let audioUrl = document.getElementById('f_audio').value.trim();
        const audioFile = document.getElementById('f_audioFile').files && document.getElementById('f_audioFile').files[0];
        if (audioFile) {
            const up = await API.Upload.uploadFile(audioFile);
            if (up.code !== 200 || !up.data) {
                alert(up.message || '音频上传失败');
                return;
            }
            audioUrl = up.data;
        }
        const payload = {
            topicCode: document.getElementById('f_code').value,
            title: document.getElementById('f_title').value.trim(),
            coverImage,
            audioUrl,
            summary: document.getElementById('f_summary').value,
            detailContent: document.getElementById('f_detail').value,
            status: parseInt(document.getElementById('f_status').value, 10)
        };
        if (!payload.title) {
            alert('标题不能为空');
            return;
        }
        const r = id ? await API.Topic.update(id, payload) : await API.Topic.create(payload);
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
    const audioFile = document.getElementById('f_audioFile');
    const audioText = document.getElementById('f_audioText');
    if (audioFile && audioText) {
        audioFile.addEventListener('change', () => {
            const file = audioFile.files && audioFile.files[0];
            if (file) {
                audioText.innerText = file.name;
                audioText.style.display = 'block';
            }
        });
    }

    const sel = document.getElementById('f_code');
    const categories = document.querySelectorAll('#topicCode option');
    categories.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.textContent;
        sel.appendChild(o);
    });
    sel.value = data.topicCode || '';
    document.getElementById('f_status').value = String(data.status == null ? 1 : (data.status === true ? 1 : data.status));
};

window.deleteRow = async function (id) {
    if (!confirm('确定删除该记录吗？')) return;
    const r = await API.Topic.delete(id);
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
    const r = await API.Topic.batchDelete(ids);
    if (r.code === 200) load();
    else alert(r.message || '批量删除失败');
}

function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
