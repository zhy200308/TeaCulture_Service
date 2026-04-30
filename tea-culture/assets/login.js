/**
 * login.js - 登录注册页面逻辑
 * 对接接口：
 *   - POST /api/auth/login
 *   - POST /api/auth/register
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // 登录按钮
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }

    // 注册按钮
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleRegister();
        });
    }

    // 切换显示
    window.showRegister = function () {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    };
    window.showLogin = function () {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    };
});

async function handleLogin() {
    const username = document.querySelector('#loginForm input[type="text"]').value.trim();
    const password = document.querySelector('#loginForm input[type="password"]').value.trim();
    const role = document.querySelector('#loginForm input[name="role"]:checked').value;

    if (!username || !password) {
        alert('用户名和密码不能为空');
        return;
    }

    const result = await API.Auth.login(username, password, role);
    if (result.code === 200) {
        TokenManager.setToken(result.data.token);
        TokenManager.setUserInfo(result.data.userInfo);
        alert('登录成功');
        // 根据角色跳转
        if (result.data.userInfo.role === 'admin') {
            window.location.href = '../pages/admin.html';
        } else {
            window.location.href = '../index.html';
        }
    } else {
        alert(result.message || '登录失败');
    }
}

async function handleRegister() {
    const inputs = document.querySelectorAll('#registerForm input[type="text"], #registerForm input[type="password"]');
    const username = inputs[0].value.trim();
    const password = inputs[1].value.trim();
    const confirmPwd = inputs[2].value.trim();
    const role = document.querySelector('#registerForm input[name="regRole"]:checked').value;

    if (!username || !password) {
        alert('用户名和密码不能为空');
        return;
    }
    if (password !== confirmPwd) {
        alert('两次密码输入不一致');
        return;
    }
    if (password.length < 6) {
        alert('密码至少 6 位');
        return;
    }

    const result = await API.Auth.register(username, password, role);
    if (result.code === 200) {
        alert('注册成功，请登录');
        window.showLogin();
    } else {
        alert(result.message || '注册失败');
    }
}
