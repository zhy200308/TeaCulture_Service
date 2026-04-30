/**
 * api.js - 茶文化服务平台前端接口封装
 * 
 * 统一封装所有后端接口请求
 * 后端基础地址：http://localhost:8080/api
 * 
 * 统一响应格式约定：
 * {
 *   "code": 200,        // 200成功，401未登录，403无权限，500服务器异常
 *   "message": "成功",
 *   "data": { ... }
 * }
 */

// ===================== 配置 =====================
const API_BASE_URL = 'http://localhost:8080/api';
const TOKEN_KEY = 'tea_token';
const USER_INFO_KEY = 'tea_user_info';

// ===================== Token 管理 =====================
const TokenManager = {
    getToken() { return localStorage.getItem(TOKEN_KEY); },
    setToken(token) { localStorage.setItem(TOKEN_KEY, token); },
    removeToken() { localStorage.removeItem(TOKEN_KEY); },
    getUserInfo() {
        const info = localStorage.getItem(USER_INFO_KEY);
        return info ? JSON.parse(info) : null;
    },
    setUserInfo(info) { localStorage.setItem(USER_INFO_KEY, JSON.stringify(info)); },
    removeUserInfo() { localStorage.removeItem(USER_INFO_KEY); },
    clear() {
        this.removeToken();
        this.removeUserInfo();
    }
};

// ===================== HTTP 请求封装 =====================
async function request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : API_BASE_URL + url;
    const headers = { ...(options.headers || {}) };
    const token = TokenManager.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    try {
        const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
        if (!isFormData && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
        const response = await fetch(fullUrl, {
            ...options,
            headers,
            body: options.body
                ? (isFormData
                    ? options.body
                    : (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)))
                : undefined
        });

        if (!response.ok && response.status !== 400) {
            // 401 未登录 → 跳转登录页
            if (response.status === 401) {
                TokenManager.clear();
                if (!window.location.pathname.includes('login.html')) {
                    alert('登录已过期，请重新登录');
                    window.location.href = '/pages/login.html';
                }
                return { code: 401, message: '未登录', data: null };
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        if (result.code !== 200 && result.code !== undefined) {
            console.warn('[API业务错误]', result);
        }
        return result;
    } catch (err) {
        console.error('[API请求失败]', fullUrl, err);
        return { code: 500, message: err.message || '网络异常', data: null };
    }
}

const http = {
    get(url, params) {
        if (params) {
            const qs = new URLSearchParams(params).toString();
            url += (url.includes('?') ? '&' : '?') + qs;
        }
        return request(url, { method: 'GET' });
    },
    post(url, body) { return request(url, { method: 'POST', body }); },
    put(url, body) { return request(url, { method: 'PUT', body }); },
    delete(url) { return request(url, { method: 'DELETE' }); },
    upload(url, formData) { return request(url, { method: 'POST', body: formData }); }
};

// ===================== 1. 认证模块 =====================
const AuthAPI = {
    /**
     * 用户登录
     * POST /api/auth/login
     * 入参：{ username, password, role }
     * 返回：{ token, userInfo: { id, username, nickname, role, avatar, tag } }
     */
    login(username, password, role) {
        return http.post('/auth/login', { username, password, role });
    },

    /**
     * 用户注册
     * POST /api/auth/register
     * 入参：{ username, password, role }
     */
    register(username, password, role) {
        return http.post('/auth/register', { username, password, role });
    },

    /**
     * 退出登录
     * POST /api/auth/logout
     */
    logout() {
        return http.post('/auth/logout');
    },

    /**
     * 获取当前登录用户信息
     * GET /api/auth/me
     */
    getCurrentUser() {
        return http.get('/auth/me');
    }
};

// ===================== 2. 基础茶识模块 =====================
const KnowledgeAPI = {
    /**
     * 查询所有分类
     * GET /api/knowledge/categories
     * 返回：[{ id, categoryCode, categoryName, sortOrder }]
     */
    listCategories() {
        return http.get('/knowledge/categories');
    },

    /**
     * 分页查询基础茶识列表
     * GET /api/knowledge/list
     * 入参：{ categoryCode?, keyword?, pageNum=1, pageSize=20 }
     * 返回：{ records: [...], total, pageNum, pageSize }
     */
    list(params = {}) {
        return http.get('/knowledge/list', params);
    },

    /**
     * 根据 key 获取基础茶识详情
     * GET /api/knowledge/detail/{key}
     */
    getByKey(key) {
        return http.get(`/knowledge/detail/${key}`);
    },

    /**
     * 查询所有茶器
     * GET /api/knowledge/wares
     */
    listWares() {
        return http.get('/knowledge/wares');
    },

    /**
     * 根据 key 获取茶器详情
     * GET /api/knowledge/wares/{key}
     */
    getWareByKey(key) {
        return http.get(`/knowledge/wares/${key}`);
    },

    /**
     * 新增茶识（管理员）
     * POST /api/knowledge
     * 入参：{ knowledgeKey, categoryCode, title, summary, detailContent, coverImage, status }
     */
    create(data) {
        return http.post('/knowledge', data);
    },

    /**
     * 修改茶识（管理员）
     * PUT /api/knowledge/{id}
     */
    update(id, data) {
        return http.put(`/knowledge/${id}`, data);
    },

    /**
     * 删除茶识（管理员）
     * DELETE /api/knowledge/{id}
     */
    delete(id) {
        return http.delete(`/knowledge/${id}`);
    },

    batchDelete(ids = []) {
        return http.post('/knowledge/batch-delete', { ids });
    }
};

// ===================== 3. 进阶专题模块 =====================
const TopicAPI = {
    /**
     * 查询所有专题分类
     * GET /api/topic/categories
     */
    listCategories() {
        return http.get('/topic/categories');
    },

    /**
     * 分页查询专题列表
     * GET /api/topic/list
     * 入参：{ topicCode?, keyword?, pageNum=1, pageSize=20 }
     */
    list(params = {}) {
        return http.get('/topic/list', params);
    },

    /**
     * 根据 key 获取专题详情
     * GET /api/topic/detail/{key}
     */
    getByKey(key) {
        return http.get(`/topic/detail/${key}`);
    },

    /**
     * 新增专题（管理员）
     * POST /api/topic
     */
    create(data) {
        return http.post('/topic', data);
    },

    /**
     * 修改专题（管理员）
     * PUT /api/topic/{id}
     */
    update(id, data) {
        return http.put(`/topic/${id}`, data);
    },

    /**
     * 删除专题（管理员）
     * DELETE /api/topic/{id}
     */
    delete(id) {
        return http.delete(`/topic/${id}`);
    },

    batchDelete(ids = []) {
        return http.post('/topic/batch-delete', { ids });
    }
};

// ===================== 4. 场景教程模块 =====================
const ScenarioAPI = {
    /**
     * 查询场景教程列表
     * GET /api/scenario/list
     * 入参：{ scenarioType?, pageNum=1, pageSize=20 }
     */
    list(params = {}) {
        return http.get('/scenario/list', params);
    },

    /**
     * 根据 key 获取场景教程详情（包含冲泡参数）
     * GET /api/scenario/detail/{key}
     * 返回：{ scenario: {...}, brewingParam: {...} }
     */
    getByKey(key) {
        return http.get(`/scenario/detail/${key}`);
    },

    /**
     * 查询场景对应的冲泡参数
     * GET /api/scenario/params/{scenarioKey}
     */
    getBrewingParam(scenarioKey) {
        return http.get(`/scenario/params/${scenarioKey}`);
    },

    /**
     * 新增场景教程（管理员）
     * POST /api/scenario
     */
    create(data) {
        return http.post('/scenario', data);
    },

    /**
     * 修改场景教程（管理员）
     * PUT /api/scenario/{id}
     */
    update(id, data) {
        return http.put(`/scenario/${id}`, data);
    },

    /**
     * 删除场景教程（管理员）
     * DELETE /api/scenario/{id}
     */
    delete(id) {
        return http.delete(`/scenario/${id}`);
    },

    batchDelete(ids = []) {
        return http.post('/scenario/batch-delete', { ids });
    }
};

// ===================== 5. 茶食搭配模块 =====================
const TeaFoodAPI = {
    /**
     * 查询茶食搭配列表
     * GET /api/tea-food/list
     * 入参：{ teaTypeCode? }
     */
    list(params = {}) {
        return http.get('/tea-food/list', params);
    },

    /**
     * 根据 key 获取茶食搭配详情（包含设备参数）
     * GET /api/tea-food/detail/{key}
     * 返回：{ match: {...}, teaTypeParam: {...} }
     */
    getByKey(key) {
        return http.get(`/tea-food/detail/${key}`);
    },

    /**
     * 查询所有茶类设备参数
     * GET /api/tea-food/tea-params
     */
    listTeaTypeParams() {
        return http.get('/tea-food/tea-params');
    },

    /**
     * 根据茶类编码获取设备参数
     * GET /api/tea-food/tea-params/{teaTypeCode}
     */
    getTeaTypeParam(teaTypeCode) {
        return http.get(`/tea-food/tea-params/${teaTypeCode}`);
    },

    adminList(params = {}) {
        return http.get('/tea-food/admin/list', params);
    },

    create(data) {
        return http.post('/tea-food', data);
    },

    update(id, data) {
        return http.put(`/tea-food/${id}`, data);
    },

    delete(id) {
        return http.delete(`/tea-food/${id}`);
    },

    batchDelete(ids = []) {
        return http.post('/tea-food/batch-delete', { ids });
    }
};

// ===================== 6. 用户中心 =====================
const UserAPI = {
    /**
     * 查询当前用户资料
     * GET /api/user/profile
     */
    getProfile() {
        return http.get('/user/profile');
    },

    /**
     * 更新当前用户资料
     * PUT /api/user/profile
     * 入参：{ nickname, avatar, description }
     */
    updateProfile(data) {
        return http.put('/user/profile', data);
    },

    /**
     * 修改密码
     * PUT /api/user/password
     * 入参：{ oldPassword, newPassword }
     */
    changePassword(oldPassword, newPassword) {
        return http.put('/user/password', { oldPassword, newPassword });
    }
};

// ===================== 7. 收藏模块 =====================
const FavoriteAPI = {
    /**
     * 查询当前用户的收藏列表
     * GET /api/favorite/list
     * 入参：{ targetType?, pageNum=1, pageSize=20 }
     */
    list(params = {}) {
        return http.get('/favorite/list', params);
    },

    /**
     * 添加收藏
     * POST /api/favorite
     * 入参：{ targetType, targetId, targetKey }
     */
    add(targetType, targetId, targetKey) {
        return http.post('/favorite', { targetType, targetId, targetKey });
    },

    /**
     * 取消收藏
     * DELETE /api/favorite?targetType=xxx&targetId=xxx
     */
    remove(targetType, targetId) {
        return http.delete(`/favorite?targetType=${targetType}&targetId=${targetId}`);
    },

    /**
     * 检查是否已收藏
     * GET /api/favorite/check?targetType=xxx&targetId=xxx
     */
    check(targetType, targetId) {
        return http.get('/favorite/check', { targetType, targetId });
    }
};

// ===================== 8. 意见反馈 =====================
const FeedbackAPI = {
    /**
     * 提交反馈
     * POST /api/feedback
     * 入参：{ feedbackType, content, contact, images }
     */
    submit(data) {
        return http.post('/feedback', data);
    },

    /**
     * 查询当前用户的反馈记录
     * GET /api/feedback/list
     */
    listMine() {
        return http.get('/feedback/list');
    },

    /**
     * 管理员查询反馈列表
     * GET /api/feedback/admin/list
     * 入参：{ status?, pageNum, pageSize }
     */
    adminList(params = {}) {
        return http.get('/feedback/admin/list', params);
    },

    /**
     * 管理员回复
     * PUT /api/feedback/{id}/reply
     * 入参：{ reply, status }
     */
    reply(id, reply, status) {
        return http.put(`/feedback/${id}/reply`, { reply, status });
    },

    adminDelete(id) {
        return http.delete(`/feedback/${id}`);
    },

    adminBatchDelete(ids = []) {
        return http.post('/feedback/admin/batch-delete', { ids });
    }
};

// ===================== 9. 设备指令日志 =====================
const DeviceAPI = {
    /**
     * 上报设备指令日志
     * POST /api/device/command
     * 入参：{ deviceId, commandType, topic, teaType, amount, waterTemp, brewTime, note, payload, result, errorMsg }
     */
    reportCommand(data) {
        return http.post('/device/command', data);
    },

    /**
     * 查询当前用户的指令历史
     * GET /api/device/history
     */
    history(params = {}) {
        return http.get('/device/history', params);
    }
};

// ===================== 10. 管理员 - 用户管理 =====================
const AdminUserAPI = {
    /**
     * 分页查询用户列表
     * GET /api/admin/users
     * 入参：{ keyword?, role?, status?, pageNum, pageSize }
     */
    list(params = {}) {
        return http.get('/admin/users', params);
    },

    /**
     * 修改用户状态/角色
     * PUT /api/admin/users/{id}
     */
    update(id, data) {
        return http.put(`/admin/users/${id}`, data);
    },

    /**
     * 重置密码
     * PUT /api/admin/users/{id}/reset-password
     */
    resetPassword(id) {
        return http.put(`/admin/users/${id}/reset-password`);
    },

    /**
     * 删除用户
     * DELETE /api/admin/users/{id}
     */
    delete(id) {
        return http.delete(`/admin/users/${id}`);
    },

    batchDelete(ids = []) {
        return http.post('/admin/users/batch-delete', { ids });
    }
};

const AdminFavoriteAPI = {
    list(params = {}) {
        return http.get('/admin/favorites', params);
    },

    delete(id) {
        return http.delete(`/admin/favorites/${id}`);
    },

    batchDelete(ids = []) {
        return http.post('/admin/favorites/batch-delete', { ids });
    }
};

const AdminDeviceCommandAPI = {
    list(params = {}) {
        return http.get('/admin/device-commands', params);
    },

    delete(id) {
        return http.delete(`/admin/device-commands/${id}`);
    },

    batchDelete(ids = []) {
        return http.post('/admin/device-commands/batch-delete', { ids });
    }
};

const AdminTeaCategoryAPI = {
    list(params = {}) {
        return http.get('/admin/knowledge-categories', params);
    },
    create(data) {
        return http.post('/admin/knowledge-categories', data);
    },
    update(id, data) {
        return http.put(`/admin/knowledge-categories/${id}`, data);
    },
    delete(id) {
        return http.delete(`/admin/knowledge-categories/${id}`);
    },
    batchDelete(ids = []) {
        return http.post('/admin/knowledge-categories/batch-delete', { ids });
    }
};

const AdminTopicCategoryAPI = {
    list(params = {}) {
        return http.get('/admin/topic-categories', params);
    },
    create(data) {
        return http.post('/admin/topic-categories', data);
    },
    update(id, data) {
        return http.put(`/admin/topic-categories/${id}`, data);
    },
    delete(id) {
        return http.delete(`/admin/topic-categories/${id}`);
    },
    batchDelete(ids = []) {
        return http.post('/admin/topic-categories/batch-delete', { ids });
    }
};

const AdminTeaWareAPI = {
    list(params = {}) {
        return http.get('/admin/tea-wares', params);
    },
    create(data) {
        return http.post('/admin/tea-wares', data);
    },
    update(id, data) {
        return http.put(`/admin/tea-wares/${id}`, data);
    },
    delete(id) {
        return http.delete(`/admin/tea-wares/${id}`);
    },
    batchDelete(ids = []) {
        return http.post('/admin/tea-wares/batch-delete', { ids });
    }
};

const AdminBrewingParamAPI = {
    list(params = {}) {
        return http.get('/admin/brewing-params', params);
    },
    create(data) {
        return http.post('/admin/brewing-params', data);
    },
    update(id, data) {
        return http.put(`/admin/brewing-params/${id}`, data);
    },
    delete(id) {
        return http.delete(`/admin/brewing-params/${id}`);
    },
    batchDelete(ids = []) {
        return http.post('/admin/brewing-params/batch-delete', { ids });
    }
};

const AdminTeaTypeParamAPI = {
    list(params = {}) {
        return http.get('/admin/tea-type-params', params);
    },
    create(data) {
        return http.post('/admin/tea-type-params', data);
    },
    update(id, data) {
        return http.put(`/admin/tea-type-params/${id}`, data);
    },
    delete(id) {
        return http.delete(`/admin/tea-type-params/${id}`);
    },
    batchDelete(ids = []) {
        return http.post('/admin/tea-type-params/batch-delete', { ids });
    }
};

// ===================== 11. 搜索 =====================
const SearchAPI = {
    /**
     * 全站搜索
     * GET /api/search?keyword=xxx
     * 返回：{ knowledge: [...], topics: [...], scenarios: [...], foodMatches: [...] }
     */
    search(keyword) {
        return http.get('/search', { keyword });
    }
};

const UploadAPI = {
    uploadImage(file) {
        const fd = new FormData();
        fd.append('file', file);
        return http.upload('/upload/image', fd);
    },
    uploadFile(file) {
        const fd = new FormData();
        fd.append('file', file);
        return http.upload('/upload/file', fd);
    }
};

// ===================== 全局导出 =====================
window.API = {
    Auth: AuthAPI,
    Knowledge: KnowledgeAPI,
    Topic: TopicAPI,
    Scenario: ScenarioAPI,
    TeaFood: TeaFoodAPI,
    User: UserAPI,
    Favorite: FavoriteAPI,
    Feedback: FeedbackAPI,
    Device: DeviceAPI,
    AdminUser: AdminUserAPI,
    AdminFavorite: AdminFavoriteAPI,
    AdminDeviceCommand: AdminDeviceCommandAPI,
    AdminTeaCategory: AdminTeaCategoryAPI,
    AdminTopicCategory: AdminTopicCategoryAPI,
    AdminTeaWare: AdminTeaWareAPI,
    AdminBrewingParam: AdminBrewingParamAPI,
    AdminTeaTypeParam: AdminTeaTypeParamAPI,
    Upload: UploadAPI,
    Search: SearchAPI
};
window.TokenManager = TokenManager;
window.http = http;

console.log('[API模块] 已加载，基础地址：' + API_BASE_URL);
