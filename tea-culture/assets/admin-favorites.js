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
            targetType: document.getElementById('targetType').value
        });
        load();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        ['userId', 'username'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('targetType').value = '';
        AdminCommon.setQuery({ pageNum: 1, userId: '', username: '', targetType: '' });
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
}

async function load() {
    const pageNum = AdminCommon.getQueryInt('pageNum', 1);
    const userId = document.getElementById('userId').value.trim();
    const username = document.getElementById('username').value.trim();
    const targetType = document.getElementById('targetType').value;

    const params = { pageNum, pageSize: 20 };
    if (userId) params.userId = userId;
    if (username) params.username = username;
    if (targetType) params.targetType = targetType;

    const result = await API.AdminFavorite.list(params);
    const tbody = document.getElementById('tbody');
    if (result.code !== 200) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">加载失败</td></tr>';
        return;
    }
    const records = result.data?.records || [];
    const typeMap = { knowledge: '茶识', topic: '专题', scenario: '场景教程', food: '茶食搭配' };
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = records.map(f => `
            <tr>
                <td><input type="checkbox" name="rowId" value="${f.id}"></td>
                <td>${f.id}</td>
                <td>${f.username || f.userId || ''}</td>
                <td>${typeMap[f.targetType] || f.targetType || ''}</td>
                <td>${f.targetId || ''}</td>
                <td>${escapeHtml(f.targetTitle || '')}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn light" onclick="viewDetail('${f.id}')">详情</button>
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

window.viewDetail = async function (id) {
    const r = await API.AdminFavorite.detail(id);
    if (!r || r.code !== 200 || !r.data) {
        alert(r?.message || '加载失败');
        return;
    }
    const d = r.data;
    const cover = normalizeImageUrl(d.targetCoverImage);
    const coverHtml = cover ? `<img src="${cover}" alt="" style="width:100%;max-height:220px;object-fit:cover;border-radius:10px;border:1px solid #eee;">` : '';
    const detail = String(d.targetDetailContent || '').trim();
    const detailHtml = detail
        ? `<pre style="white-space:pre-wrap;word-break:break-word;background:#f8f6f2;border-radius:8px;padding:10px;border:1px solid #f0e6d8;max-height:360px;overflow:auto;">${escapeHtml(detail)}</pre>`
        : '<div style="color:#999;">无详情内容</div>';

    AdminCommon.openModal('收藏内容详情', `
        <div style="color:#555;line-height:1.8;">
            <div><b>收藏ID：</b>${d.id}</div>
            <div><b>用户：</b>${escapeHtml(d.username || '')} (${d.userId || ''})</div>
            <div><b>类型：</b>${escapeHtml(d.targetType || '')}</div>
            <div><b>目标ID：</b>${d.targetId || ''}</div>
            <div style="margin-top:10px;"><b>标题：</b>${escapeHtml(d.targetTitle || '')}</div>
            <div><b>摘要：</b>${escapeHtml(d.targetSummary || '')}</div>
            ${coverHtml ? `<div style="margin-top:10px;">${coverHtml}</div>` : ''}
            <div style="margin-top:10px;"><b>详情：</b></div>
            ${detailHtml}
        </div>
    `, () => closeModal());
    const saveBtn = document.getElementById('modalSaveBtn');
    if (saveBtn) saveBtn.innerText = '关闭';
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

function normalizeImageUrl(url) {
    const u = String(url || '').trim();
    if (!u) return '';
    if (u.startsWith('./images/')) return `../images/${u.slice('./images/'.length)}`;
    if (u.startsWith('/images/')) return `..${u}`;
    return u;
}
