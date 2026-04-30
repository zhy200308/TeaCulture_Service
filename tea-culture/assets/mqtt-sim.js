
const MOCK_MODE = false;   // 设置为 false 启用真实 MQTT

const mqttManager = (function() {
    const config = {
        // 公共 MQTT Broker
        brokerUrl: 'ws://broker.emqx.io:8083/mqtt',
        options: {
            clientId: 'tea_' + Math.random().toString(16).substr(2, 8),
            clean: true,
            reconnectPeriod: 1000,
        },
        brewTopic: '/tea/brew/command'     
    };

    let client = null;
    let connected = false;
    let statusCallbacks = [];

    function notifyStatusChange() {
        statusCallbacks.forEach(cb => cb(connected));
    }

    function onStatusChange(callback) {
        statusCallbacks.push(callback);
        callback(connected);
    }

    function mockPublish(topic, message, qos, callback) {
        console.log('[模拟模式] 指令发送成功', message);
        setTimeout(() => callback && callback(null), 300);
        return true;
    }

    // 真实模式
    function realPublish(topic, message, qos, callback) {
        if (!connected || !client) {
            callback && callback(new Error('MQTT not connected'));
            return false;
        }
        const payload = typeof message === 'object' ? JSON.stringify(message) : message;
        console.log('[MQTT] 发布指令:', payload); 
        client.publish(topic, payload, { qos }, callback);
        return true;
    }

    const publish = MOCK_MODE ? mockPublish : realPublish;

    // 建立连接
    function connect() {
        if (MOCK_MODE) {
            console.log('[模拟模式] MQTT 已连接');
            connected = true;
            notifyStatusChange();
            return;
        }

        if (typeof mqtt === 'undefined') {
            console.error('真实模式需要先加载 MQTT 库，请检查 <script src="mqtt.min.js">');
            return;
        }

        client = mqtt.connect(config.brokerUrl, config.options);
        client.on('connect', () => {
            console.log('MQTT 已连接');
            connected = true;
            notifyStatusChange();
        });
        client.on('error', (err) => {
            console.error('MQTT 连接失败', err);
            connected = false;
            notifyStatusChange();
        });
        client.on('offline', () => {
            connected = false;
            notifyStatusChange();
        });
    }

    function isConnected() {
        return connected;
    }

    function getClient() {
        return client;
    }
    connect();
    return {
        onStatusChange,
        publish,
        getClient,
        isConnected,
        brewTopic: config.brewTopic
    };
})();
window.mqttManager = mqttManager;