// 管理员后台JavaScript

// 检查登录状态
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn !== 'true') {
        // 未登录，跳转到登录页面
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 首先检查登录状态
    if (!checkAdminLogin()) {
        return;
    }
    
    // 初始化侧边栏导航
    initSidebar();
    
    // 初始化内容标签页
    initContentTabs();
    
    // 加载商品数据
    loadGoodsData();
    
    // 加载冲泡参数数据
    loadBrewingData();
    
    // 加载茶食搭配数据
    loadTeaFoodData();
    
    // 初始化表单提交
    initFormSubmit();
    
    // 初始化所有按钮事件
    initAllButtons();
});

// 初始化侧边栏导航
function initSidebar() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.admin-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // 移除所有active类
            menuItems.forEach(mi => mi.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));
            
            // 添加active类到当前项
            this.classList.add('active');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// 初始化内容标签页
function initContentTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.content-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 移除所有active类
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // 添加active类到当前项
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 加载商品数据
async function loadGoodsData() {
    try {
        const response = await fetch('../data/goods.json');
        const goods = await response.json();
        
        const tbody = document.getElementById('goodsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        goods.forEach(good => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${good.id}</td>
                <td><img src="${good.image}" alt="${good.name}" class="goods-thumb"></td>
                <td>${good.name}</td>
                <td>${getCategoryName(good.category)}</td>
                <td>¥${good.price.toFixed(2)}/${good.unit}</td>
                <td>${good.tags.map(tag => `<span class="status-badge published">${tag}</span>`).join(' ')}</td>
                <td><span class="status-badge published">在售</span></td>
                <td>
                    <button class="action-btn edit" onclick="editGoods('${good.id}')"><i class="fas fa-edit"></i> 编辑</button>
                    <button class="action-btn delete" onclick="deleteGoods('${good.id}')"><i class="fas fa-trash"></i> 删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('加载商品数据失败:', error);
    }
}

// 获取分类名称
function getCategoryName(category) {
    const categories = {
        'tea-set': '茶具',
        'tea-leaf': '茶叶',
        'accessory': '茶配件'
    };
    return categories[category] || category;
}

// 加载冲泡参数数据
async function loadBrewingData() {
    try {
        const response = await fetch('../data/brewing-params.json');
        const params = await response.json();
        
        const tbody = document.getElementById('brewingTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        Object.keys(params).forEach(key => {
            const param = params[key];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${key}</td>
                <td>${getBrewingName(key)}</td>
                <td>${param.teaType}</td>
                <td>${param.amount}</td>
                <td>${param.waterTemp}</td>
                <td>${param.brewTime}</td>
                <td>
                    <button class="action-btn edit" onclick="editBrewing('${key}')"><i class="fas fa-edit"></i> 编辑</button>
                    <button class="action-btn delete" onclick="deleteBrewing('${key}')"><i class="fas fa-trash"></i> 删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('加载冲泡参数失败:', error);
    }
}

// 获取冲泡方案名称
function getBrewingName(id) {
    const names = {
        'home-kungfu': '居家功夫茶泡法',
        'office-simple': '办公室简易冲泡',
        'outdoor-portable': '户外便携冲泡',
        'home-cold': '家庭冷泡茶'
    };
    return names[id] || id;
}

// 加载茶食搭配数据
async function loadTeaFoodData() {
    try {
        const response = await fetch('../data/tea-food-params.json');
        const data = await response.json();
        
        const tbody = document.getElementById('teaFoodTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        data.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${getTeaTypeName(item.teaType)}</td>
                <td>${item.foodName}</td>
                <td>${item.reason}</td>
                <td>${getDifficultyName(item.difficulty)}</td>
                <td>
                    <button class="action-btn edit" onclick="editTeaFood(${index})"><i class="fas fa-edit"></i> 编辑</button>
                    <button class="action-btn delete" onclick="deleteTeaFood(${index})"><i class="fas fa-trash"></i> 删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('加载茶食搭配数据失败:', error);
    }
}

// 获取茶类名称
function getTeaTypeName(type) {
    const types = {
        'green': '绿茶',
        'black': '红茶',
        'oolong': '乌龙茶',
        'white': '白茶',
        'dark': '黑茶',
        'yellow': '黄茶'
    };
    return types[type] || type;
}

// 获取难度等级名称
function getDifficultyName(difficulty) {
    const difficulties = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
    };
    return difficulties[difficulty] || difficulty;
}

// 打开商品弹窗
function openGoodsModal() {
    document.getElementById('goodsModal').classList.add('show');
    document.getElementById('goodsForm').reset();
}

// 关闭商品弹窗
function closeGoodsModal() {
    document.getElementById('goodsModal').classList.remove('show');
}

// 编辑商品
function editGoods(id) {
    alert('编辑商品: ' + id);
    openGoodsModal();
}

// 删除商品
function deleteGoods(id) {
    if (confirm('确定要删除这个商品吗？')) {
        alert('已删除商品: ' + id);
        // 实际应用中应该调用API删除数据
        loadGoodsData();
    }
}

// 打开冲泡参数弹窗
function openBrewingModal() {
    document.getElementById('brewingModal').classList.add('show');
    document.getElementById('brewingForm').reset();
}

// 关闭冲泡参数弹窗
function closeBrewingModal() {
    document.getElementById('brewingModal').classList.remove('show');
}

// 编辑冲泡参数
function editBrewing(id) {
    alert('编辑冲泡参数: ' + id);
    openBrewingModal();
}

// 删除冲泡参数
function deleteBrewing(id) {
    if (confirm('确定要删除这个冲泡方案吗？')) {
        alert('已删除冲泡方案: ' + id);
        loadBrewingData();
    }
}

// 打开茶食搭配弹窗
function openTeaFoodModal() {
    document.getElementById('teaFoodModal').classList.add('show');
    document.getElementById('teaFoodForm').reset();
}

// 关闭茶食搭配弹窗
function closeTeaFoodModal() {
    document.getElementById('teaFoodModal').classList.remove('show');
}

// 编辑茶食搭配
function editTeaFood(index) {
    alert('编辑茶食搭配: ' + (index + 1));
    openTeaFoodModal();
}

// 删除茶食搭配
function deleteTeaFood(index) {
    if (confirm('确定要删除这个茶食搭配方案吗？')) {
        alert('已删除茶食搭配方案: ' + (index + 1));
        loadTeaFoodData();
    }
}

// 打开内容弹窗
function openContentModal(type) {
    alert('新增' + getContentTypeName(type) + '内容');
}

// 获取内容类型名称
function getContentTypeName(type) {
    const types = {
        'basic': '基础茶识',
        'advanced': '进阶专题',
        'scenario': '场景教程'
    };
    return types[type] || type;
}

// 打开用户弹窗
function openUserModal() {
    alert('添加新用户');
}

// 初始化表单提交
function initFormSubmit() {
    // 商品表单
    const goodsForm = document.getElementById('goodsForm');
    if (goodsForm) {
        goodsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(goodsForm);
            const data = Object.fromEntries(formData);
            
            console.log('保存商品数据:', data);
            alert('商品保存成功！');
            closeGoodsModal();
            loadGoodsData();
        });
    }
    
    // 冲泡参数表单
    const brewingForm = document.getElementById('brewingForm');
    if (brewingForm) {
        brewingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(brewingForm);
            const data = Object.fromEntries(formData);
            
            console.log('保存冲泡参数:', data);
            alert('冲泡参数保存成功！');
            closeBrewingModal();
            loadBrewingData();
        });
    }
    
    // 茶食搭配表单
    const teaFoodForm = document.getElementById('teaFoodForm');
    if (teaFoodForm) {
        teaFoodForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(teaFoodForm);
            const data = Object.fromEntries(formData);
            
            console.log('保存茶食搭配:', data);
            alert('茶食搭配保存成功！');
            closeTeaFoodModal();
            loadTeaFoodData();
        });
    }
    
    // 系统设置表单
    const settingsForm = document.querySelector('.settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('系统设置保存成功！');
        });
    }
}

// 初始化所有按钮事件
function initAllButtons() {
    // 内容管理 - 编辑按钮
    document.querySelectorAll('.content-panel .action-btn.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const title = row.cells[1].textContent;
            alert('编辑内容: ' + title);
        });
    });

    // 内容管理 - 删除按钮
    document.querySelectorAll('.content-panel .action-btn.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const title = row.cells[1].textContent;
            if (confirm('确定要删除 "' + title + '" 吗？')) {
                row.remove();
                showNotification('删除成功', 'success');
            }
        });
    });

    // 用户管理 - 查看按钮
    document.querySelectorAll('#users .action-btn.view').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const username = row.cells[1].textContent;
            alert('查看用户详情: ' + username);
        });
    });

    // 用户管理 - 编辑按钮
    document.querySelectorAll('#users .action-btn.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const username = row.cells[1].textContent;
            alert('编辑用户: ' + username);
        });
    });

    // 用户管理 - 禁用按钮
    document.querySelectorAll('#users .action-btn.ban').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const username = row.cells[1].textContent;
            if (confirm('确定要禁用用户 "' + username + '" 吗？')) {
                const statusBadge = row.querySelector('.status-badge');
                statusBadge.textContent = '已禁用';
                statusBadge.className = 'status-badge inactive';
                
                // 将禁用按钮改为启用按钮
                const banBtn = this;
                banBtn.innerHTML = '<i class="fas fa-check"></i> 启用';
                banBtn.className = 'action-btn enable';
                
                showNotification('用户已禁用', 'success');
            }
        });
    });

    // 用户管理 - 启用按钮
    document.querySelectorAll('#users .action-btn.enable').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const username = row.cells[1].textContent;
            if (confirm('确定要启用用户 "' + username + '" 吗？')) {
                const statusBadge = row.querySelector('.status-badge');
                statusBadge.textContent = '正常';
                statusBadge.className = 'status-badge active';
                
                // 将启用按钮改为禁用按钮
                const enableBtn = this;
                enableBtn.innerHTML = '<i class="fas fa-ban"></i> 禁用';
                enableBtn.className = 'action-btn ban';
                
                showNotification('用户已启用', 'success');
            }
        });
    });

    // 系统设置 - 轮播图编辑按钮
    document.querySelectorAll('.carousel-edit-controls .small-btn:not(.danger)').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('编辑轮播图（功能开发中）');
        });
    });

    // 系统设置 - 轮播图删除按钮
    document.querySelectorAll('.carousel-edit-controls .small-btn.danger').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('确定要删除这个轮播图吗？')) {
                const carouselItem = this.closest('.carousel-item-setting');
                carouselItem.remove();
                showNotification('轮播图已删除', 'success');
            }
        });
    });

    // 系统设置 - 添加轮播图按钮
    const addCarouselBtn = document.querySelector('.add-carousel-btn');
    if (addCarouselBtn) {
        addCarouselBtn.addEventListener('click', function() {
            alert('添加轮播图功能（功能开发中）');
        });
    }

    // 数据管理按钮
    document.querySelectorAll('.data-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            
            if (action.includes('导出')) {
                showNotification('正在导出数据...', 'info');
                setTimeout(() => {
                    showNotification('数据导出成功', 'success');
                }, 1500);
            } else if (action.includes('导入')) {
                alert('导入数据功能（功能开发中）');
            } else if (action.includes('清理')) {
                if (confirm('确定要清理缓存数据吗？')) {
                    showNotification('缓存清理成功', 'success');
                }
            } else if (action.includes('重置')) {
                if (confirm('警告：此操作将重置所有统计数据，确定要继续吗？')) {
                    showNotification('统计数据已重置', 'warning');
                }
            }
        });
    });

    // 退出管理按钮
    const logoutBtn = document.querySelector('.nav-right .nav-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('确定要退出管理后台吗？')) {
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminLoginTime');
                window.location.href = '../index.html';
            }
        });
    }
}

// 显示通知消息
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 30px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#e0f0e8' : type === 'warning' ? '#fff3e0' : '#e8f4f8'};
        color: ${type === 'success' ? '#5a8b6b' : type === 'warning' ? '#f57c00' : '#5a8b9b'};
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        border: 2px solid ${type === 'success' ? '#c8e0d4' : type === 'warning' ? '#ffe0b2' : '#c8e8f0'};
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 点击弹窗外部关闭
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('show');
    }
});

// ESC键关闭弹窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
});
