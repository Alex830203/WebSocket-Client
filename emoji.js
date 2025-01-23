// 定義 Emoji 資料
const emojis = {
    "表情": ["😀", "😃", "😄", "😁"],
    "動物": ["🐶", "🐱", "🐭", "🐹"],
    "食物": ["🍎", "🍌", "🍇", "🍉"]
};

// 初始化 Emoji 選擇器
function initializeEmojiSelector() {
    const tabsContainer = document.querySelector('#emojiTabs');
    const emojisContainer = document.querySelector('#emojiContainer');

    // 動態生成 Tabs 和按鈕
    Object.keys(emojis).forEach(category => {
        // 創建 Tab 按鈕
        const tabButton = document.createElement('button');
        tabButton.textContent = category;
        tabButton.onclick = () => {
            // 清空容器並顯示該類別的表情
            emojisContainer.innerHTML = '';
            emojis[category].forEach(emoji => {
                const emojiButton = document.createElement('button');
                emojiButton.textContent = emoji;
                emojiButton.onclick = () => insertEmoji(emoji);
                emojisContainer.appendChild(emojiButton);
            });
        };
        tabsContainer.appendChild(tabButton);
    });

    // 預設顯示第一個類別的 Emoji
    const firstCategory = Object.keys(emojis)[0];
    if (firstCategory) {
        emojisContainer.innerHTML = '';
        emojis[firstCategory].forEach(emoji => {
            const emojiButton = document.createElement('button');
            emojiButton.textContent = emoji;
            emojiButton.onclick = () => insertEmoji(emoji);
            emojisContainer.appendChild(emojiButton);
        });
    }
}

// 插入 Emoji 到輸入框
function insertEmoji(emoji) {
    const inputField = document.querySelector('#sendMsg');
    if (inputField) {
        inputField.value += emoji;
        inputField.focus();
    }
}

// 確保 DOM 載入後初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeEmojiSelector();
});