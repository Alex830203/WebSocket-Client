var ws;
var nickname = '';
let clientId = null; // 儲存客戶端的 ID

// 監聽按鈕事件
document.querySelector('#sendBtn')?.addEventListener('click', () => {
    const msg = document.querySelector('#sendMsg')?.value;
    if (msg) {
        sendMessage(msg);
        document.querySelector('#sendMsg').value = ''; // 清空輸入框
    }
});

// 監聽輸入框中的按鍵事件
document.querySelector('#sendMsg')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const msg = document.querySelector('#sendMsg')?.value;
        if (msg) {
            sendMessage(msg);
            document.querySelector('#sendMsg').value = ''; // 清空輸入框
        }
        event.preventDefault(); // 防止預設的換行行為
    }
});

document.querySelector('#setNickname')?.addEventListener('click', () => {
    const input = document.querySelector('#nickname')?.value;
    if (input) {
        nickname = input;
        alert(`暱稱設定為: ${nickname}`);
        // 向伺服器發送暱稱更新
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'setNickname', payload: { nickname } }));
        }
    } else {
        alert('請輸入有效暱稱。');
    }
});

// 網頁載入後立即連線 WebSocket
window.onload = () => {
    connect();
};

function connect() {
    ws = new WebSocket('ws://13.239.135.6:8080');

    ws.onopen = () => {
        console.log('[open connection]');
        alert('已連接聊天伺服器!');
    };

    ws.onmessage = event => {
        try {
            const message = JSON.parse(event.data);
    
            if (message.type === 'init') {
                // 初始化時儲存自己的 ID
                clientId = message.payload.id;
                console.log(`Connected with ID: ${clientId}`);
            } else if (message.type === 'updateClientList') {
                updateOnlineUsers(message.payload);
            } else if (message.type === 'join') {
                displaySystemMessage(message.payload.msg);
            } else if (message.type === 'leave') {
                displaySystemMessage(message.payload.msg);
            } else if (message.type === 'message') {
                const { id, nickname, msg } = message.payload;
                displayMessage(nickname, id, msg);
            }
        } catch (err) {
            console.error('Error parsing message:', event.data);
        }
    };

    ws.onclose = () => {
        console.log('[close connection]');
        alert('Disconnected from the chat server.');
    };

    ws.onerror = err => {
        console.error('[WebSocket error]', err);
        alert('An error occurred. Please check the console for more details.');
    };
}

function sendMessage(msg) {
    if (!nickname) {
        alert('送出訊息之前，請先設定暱稱。');
        return;
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ type: 'message', payload: { nickname, msg } });
        ws.send(message);
    } else {
        alert('Connection is not open.');
    }
}

// Display messages in chatBox
function displayMessage(nickname, id, msg) {
    const chatBox = document.querySelector('#chatBox');
    const messageElement = document.createElement('div');
    const isSelf = id === clientId;

    // 外層樣式設定
    messageElement.style.textAlign = isSelf ? 'right' : 'left'; // 靠左或靠右對齊
    messageElement.style.margin = '10px 0'; // 增加上下間距

    // 氣泡框容器
    const bubble = document.createElement('span');
    bubble.style.display = 'inline-block';
    bubble.style.maxWidth = '70%'; // 限制寬度
    bubble.style.padding = '10px'; // 內距
    bubble.style.borderRadius = '10px'; // 圓角
    bubble.style.backgroundColor = isSelf ? '#d1f7d6' : '#f1f1f1'; // 訊息氣泡顏色
    bubble.style.color = '#333'; // 文字顏色
    bubble.style.whiteSpace = 'pre-wrap'; // 自動換行
    bubble.style.textAlign = 'left'; // 文字靠左對齊

    // 訊息的標頭（暱稱）
    const header = document.createElement('span');
    header.style.fontWeight = 'bold'; // 暱稱部分粗體
    header.style.fontStyle = 'italic'; // 暱稱部分斜體
    header.style.color = '#888'; // 暱稱部分淺灰色
    header.textContent = isSelf ? `` : `${nickname}`;
    bubble.appendChild(header); // 將標頭內容加到氣泡框內

    if (!isSelf) {
        const lineBreak = document.createElement('br'); // 插入換行標籤
        bubble.appendChild(lineBreak); // 在名稱和訊息之間插入換行
    }
    
    // 訊息內容
    const messageContent = document.createElement('span');
    // 顯示圖片預覽
    const imagePreview = displayImagePreview(msg);
    if (imagePreview) {
        bubble.appendChild(imagePreview);
    } else {
        // 網址轉換為超連結
        messageContent.innerHTML = convertUrlsToLinks(msg); // 使用 convertUrlsToLinks 函數
    }

    // 將訊息內容加到氣泡框內
    bubble.appendChild(messageContent);

    // 將訊息加到聊天框
    messageElement.appendChild(bubble);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // 滾動到底部
}

// Display system messages in chatBox
function displaySystemMessage(msg) {
    const chatBox = document.querySelector('#chatBox');
    const messageElement = document.createElement('div');
    messageElement.textContent = `[System]: ${msg}`;
    messageElement.style.textAlign = 'center';
    messageElement.style.color = 'gray';
    messageElement.style.fontStyle = 'italic';
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Update online users list
function updateOnlineUsers(users) {
    const userListContainer = document.querySelector('#onlineUsers');
    userListContainer.innerHTML = ''; // 清空舊的列表

    users.forEach(user => {
        const userElement = document.createElement('div');

        // 判斷是否是自己，若是，改變樣式
        if (user.id === clientId) {
            userElement.textContent = `${user.nickname} (${user.id})`;
            userElement.style.fontWeight = 'bold'; // 設為粗體
            userElement.style.color = '#e6c405';
        } else {
            userElement.textContent = `${user.nickname} (${user.id})`;
            userElement.style.color = '#888'; // 顯示淺灰色
        }

        userElement.style.margin = '5px 0';
        userListContainer.appendChild(userElement);
    });

    // 更新人數統計
    const userCountElement = document.querySelector('#userCount');
    if (userCountElement) {
        userCountElement.textContent = `線上人數: ${users.length}`;
    }
}

// 網址變超連結
function convertUrlsToLinks(msg) {
    const urlPattern = /(https?:\/\/[^\s]+)/g; // 匹配 HTTP 或 HTTPS 開頭的網址
    return msg.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" style="color: #1a73e8; text-decoration: none;">${url}</a>`;
    });
}

// 圖片連結變圖片
function displayImagePreview(msg) {
    const imgPattern = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|svg))/i; // 匹配圖片 URL
    const match = msg.match(imgPattern);
    if (match) {
        const imgElement = document.createElement('img');
        imgElement.src = match[0];
        imgElement.style.maxWidth = '200px'; // 設定圖片最大寬度
        imgElement.style.borderRadius = '10px'; // 圓角
        return imgElement;
    }
    return null;
}
