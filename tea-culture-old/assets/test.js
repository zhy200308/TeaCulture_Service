const mqtt = require('mqtt');
const client = mqtt.connect('ws://broker.emqx.io:8083');

client.on('connect', () => {
    console.log('虚拟设备已连接');
    client.subscribe('/tea/brew/command', (err) => {
        if (!err) console.log('已订阅指令主题');
    });
});

client.on('message', (topic, message) => {
    console.log('收到指令:', message.toString());
    
});