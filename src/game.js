
// 默认游戏配置
let CONFIG = {
    totalCells: 24,
    cellRadius: 230,
    centerX: 300,
    centerY: 300,
    eventCells: {},
    playerNames: {1: "红方", 2: "蓝方"}
};

// 内置事件类型和匹配规则
const BUILTIN_EVENT_RULES = [
    // {
    //     pattern: /^前进[:：]\s*(\d+)$/,
    //     handler: (match, playerId) => movePlayerStepByStep(parseInt(match[1]), false)
    // },
    // {
    //     pattern: /^后退[:：]\s*(\d+)$/,
    //     handler: (match, playerId) => movePlayerStepByStep(-parseInt(match[1]), false)
    // },
    // {
    //     pattern: /^暂停$/,
    //     handler: (match, playerId) => switchPlayer()

    // },
    // {
    //     pattern: /^交换位置$/,
    //     handler: (match, playerId) => {
    //         const otherPlayer = playerId === 1 ? 2 : 1;
    //         const tempPos = gameState.positions[playerId];
    //         gameState.positions[playerId] = gameState.positions[otherPlayer];
    //         gameState.positions[otherPlayer] = tempPos;
    //         updatePlayerPosition(playerId);
    //         updatePlayerPosition(otherPlayer);
    //         console.log("交换位置");
    //         // switchPlayer()
    //     }
    // }
];

// 游戏状态
let gameState = {
    currentPlayer: 1, // 1=红方, 2=蓝方
    positions: {1: 0, 2: 0}, // 玩家位置(格子索引)
    gameStarted: false
};

// 初始化游戏
function initGame() {
    // 设置配置按钮事件
    document.getElementById('applyConfig').addEventListener('click', applyConfig);

    const dice = document.querySelector('.dice');
    dice.textContent = '开始';
    dice.style.top = '50%';
    dice.style.left = '50%';
    dice.style.transform = 'translate(-50%, -50%)';
    // 应用初始配置
    applyConfig();
}

// 应用配置
function applyConfig() {
    // 重置游戏状态
    gameState = {
        currentPlayer: 1,
        positions: {1: 0, 2: 0},
        gameStarted: false
    };
    
    // 获取配置值
    CONFIG.totalCells = parseInt(document.getElementById('cellCount').value) || 24;
    CONFIG.playerNames[1] = document.getElementById('player1Name').value || "红方";
    CONFIG.playerNames[2] = document.getElementById('player2Name').value || "蓝方";
    
    // 解析事件配置
    const eventText = document.getElementById('eventConfig').value;
    const events = eventText.split('\n').filter(e => e.trim());
    CONFIG.eventCells = {};
    
    // 分配事件到格子
    events.forEach((event, index) => {
        const cellIndex = Math.floor((index / events.length) * CONFIG.totalCells);
        CONFIG.eventCells[cellIndex] = event.trim();
    });
    
    // 更新玩家名称显示
    updatePlayerNames();
    
    // 重新创建棋盘
    const board = document.querySelector('.board');
    board.innerHTML = '';
    createBoard();
    positionPlayers();
    
    // 重新设置骰子
    setupDice();
}

// 更新玩家名称显示
function updatePlayerNames() {
    document.querySelector('.player[data-player="1"] .player-name').textContent = CONFIG.playerNames[1];
    document.querySelector('.player[data-player="2"] .player-name').textContent = CONFIG.playerNames[2];
}

// 创建环形棋盘
function createBoard() {
    const board = document.querySelector('.board');
    const angleStep = (2 * Math.PI) / CONFIG.totalCells;
    
    for (let i = 0; i < CONFIG.totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        
        // 计算格子位置(环形布局)
        const angle = i * angleStep;
        const x = CONFIG.centerX + CONFIG.cellRadius * Math.cos(angle);
        const y = CONFIG.centerY + CONFIG.cellRadius * Math.sin(angle);
        
        cell.style.left = `${x}px`;
        cell.style.top = `${y}px`;
        
        // 标记事件格子
        if (CONFIG.eventCells[i]) {
            cell.classList.add('event-cell');
            cell.title = CONFIG.eventCells[i];
        }
        
        board.appendChild(cell);
    }
}

// 定位玩家棋子
function positionPlayers() {
    const players = document.querySelectorAll('.player');
    players.forEach(player => {
        updatePlayerPosition(parseInt(player.dataset.player));
    });
}

// 更新玩家位置
function updatePlayerPosition(playerId) {
    const player = document.querySelector(`.player[data-player="${playerId}"]`);
    const angle = (2 * Math.PI * gameState.positions[playerId]) / CONFIG.totalCells;
    
    const x = CONFIG.centerX + CONFIG.cellRadius * Math.cos(angle);
    const y = CONFIG.centerY + CONFIG.cellRadius * Math.sin(angle);
    
    player.style.left = `${x}px`;
    player.style.top = `${y}px`;
}

// 设置骰子点击事件
function setupDice() {
    const dice = document.querySelector('.dice');
    dice.textContent = '开始';
    dice.addEventListener('click', rollDice);

    dice.textContent = '开始';
    dice.style.top = '50%';
    dice.style.left = '50%';
    dice.style.transform = 'translate(-50%, -50%)';
}

// 添加动画状态管理
const AnimationState = {
    IDLE: 0,
    MOVING: 1
  };
  let animationState = AnimationState.IDLE;
  
  // 改进后的逐步移动函数
function movePlayerStepByStep(totalSteps) {
    if (animationState === AnimationState.MOVING) return;
    animationState = AnimationState.MOVING;
    
    const playerId = gameState.currentPlayer;
    const playerElement = document.querySelector(`.player[data-player="${playerId}"]`);
    let stepsCompleted = 0;

    console.log(`开始移动玩家${playerId}，总步数：${totalSteps}`);
    
    // 添加移动中的视觉效果
    playerElement.classList.add('moving');
    
    const moveInterval = setInterval(() => {
        if (stepsCompleted < totalSteps) {
            // 计算下一步位置
            const nextPos = (gameState.positions[playerId] + 1) % CONFIG.totalCells;
    // 更新游戏状态
            gameState.positions[playerId] = nextPos;     // 计算新位置坐标
            const angle = (2 * Math.PI * nextPos) / CONFIG.totalCells;
            const x = CONFIG.centerX + CONFIG.cellRadius * Math.cos(angle);
            const y = CONFIG.centerY + CONFIG.cellRadius * Math.sin(angle);
            
            // 应用动画
            playerElement.style.transition = 'all 0.3s ease-out';
            playerElement.style.left = `${x}px`;
            playerElement.style.top = `${y}px`;
            
            // 添加脚步声效（需先加载音效）
            if (typeof audioSteps !== 'undefined') {
                audioSteps.currentTime = 0;
                audioSteps.play();
            }
            
            stepsCompleted++;
        } else {
            clearInterval(moveInterval);
            playerElement.classList.remove('moving');
            animationState = AnimationState.IDLE;
            
            // 移动完成后检查事件
            setTimeout(() => {
                checkCellEvent(gameState.positions[playerId], playerId);
            }, 300);
        }
    }, 300); // 每步300毫秒
}

// 投掷骰子
function rollDice() {
    if (!gameState.gameStarted) {
        gameState.gameStarted = true;
        // document.querySelector('.dice').textContent = '投掷';

        const dice = document.querySelector('.dice');
        dice.textContent = '投掷';
        dice.style.top = '50%';
        dice.style.left = '50%';
        // dice.style.transform = 'translate(-50%, -50%)';
        return;
    }

    // 禁用骰子防止连续点击
    // const dice = document.querySelector('.dice');
    // dice.style.pointerEvents = 'none';
    
    // 模拟骰子动画
    // let rolls = 0;
    // const maxRolls = 10;
    // const rollInterval = setInterval(() => {
    //     const value = Math.floor(Math.random() * 6) + 1;
    //     dice.textContent = value;
        
    //     if (++rolls >= maxRolls) {
    //         clearInterval(rollInterval);
    //         movePlayer(value);
    //     }
    // }, 100);

    // dice.style.animation = 'diceRoll 0.5s infinite';

    // setTimeout(() => {
    //     dice.style.animation = '';
    //     const value = Math.floor(Math.random() * 6) + 1;
    //     dice.textContent = value;
    //     movePlayerStepByStep(value);
    //   }, 3500 + Math.random() * 2500); // 3.5-6秒随机时长

    const dice = document.querySelector('.dice');
    if (dice.classList.contains('rolling')) return;
    
    // 禁用骰子防止连续点击
    dice.style.pointerEvents = 'none';
    dice.classList.add('rolling');
    
    // 随机决定动画持续时间(3.5-6秒)
    const duration = 3500 + Math.random() * 2500;
    let lastValue = 0;
    
    // 快速切换骰子数值
    const fastChangeInterval = setInterval(() => {
        const value = Math.floor(Math.random() * 6) + 1;
        if (value !== lastValue) {
            dice.textContent = value;
            lastValue = value;
        }
    }, 100);

    // 动画结束后处理
    setTimeout(() => {
        clearInterval(fastChangeInterval);
        dice.classList.remove('rolling');
        
        // 确定最终骰子数值
        const finalValue = Math.floor(Math.random() * 6) + 1;
        dice.textContent = finalValue;
        
        // 添加骰子落定效果
        dice.style.transform = 'translate(-50%， -50%)';
        dice.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        
        // 播放骰子落定音效
        if (typeof audioDiceLand !== 'undefined') {
            audioDiceLand.play();
        }
        
        // 开始移动玩家
        movePlayerStepByStep(finalValue);
        
        // 恢复骰子点击
        setTimeout(() => {
            dice.style.pointerEvents = 'auto';
        }, 1000);
    }, duration);
}

// 移动玩家
// function movePlayer(steps) {
//     const playerId = gameState.currentPlayer;
//     let newPosition = (gameState.positions[playerId] + steps) % CONFIG.totalCells;
//     // 处理负数情况
//     if (newPosition < 0) newPosition += CONFIG.totalCells;
    
//     // 更新位置
//     gameState.positions[playerId] = newPosition;
//     updatePlayerPosition(playerId);
    
//     // 检查事件触发
//     checkCellEvent(newPosition, playerId);
// }

function movePlayer(steps, immediate = false) {
    if (immediate) {
        // 直接跳转到目标位置
        const playerId = gameState.currentPlayer;
        const newPosition = (gameState.positions[playerId] + steps) % CONFIG.totalCells;
        // 处理负数情况
        if (newPosition < 0) newPosition += CONFIG.totalCells;

        gameState.positions[playerId] = newPosition;
        updatePlayerPosition(playerId);
        checkCellEvent(newPosition, playerId);
    } else {
        // 使用逐步移动
        movePlayerStepByStep(steps);
    }
}

// 检查格子事件
function checkCellEvent(cellIndex, playerId) {
    if (CONFIG.eventCells[cellIndex]) {
        console.log(`事件触发: ${CONFIG.eventCells[cellIndex]}`)
        showEvent(CONFIG.eventCells[cellIndex], playerId);
        return; // 事件处理完成后才切换玩家
    }else {
        // 没有事件则直接切换玩家
        switchPlayer();
        //return;
    }
    //switchPlayer();
}

// 显示事件提示
function showEvent(message, playerId) {
    const popup = document.querySelector('.event-popup');
    const content = document.querySelector('.event-content');
    const countdown = document.querySelector('.countdown');
    
    // 添加关闭按钮
    if (!popup.querySelector('.close-btn')) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => {
            clearInterval(window.eventTimer);
            applyEventEffect(message, playerId);
            popup.classList.add('hidden');
            switchPlayer();
        });
        popup.appendChild(closeBtn);
    }
    
    content.textContent = `${CONFIG.playerNames[playerId]}触发事件: ${message}`;
    popup.classList.remove('hidden');
    
    // 30秒倒计时
    let seconds = 30;
    countdown.textContent = `倒计时: ${seconds}秒`;
    
    window.eventTimer = setInterval(() => {
        seconds--;
        countdown.textContent = `倒计时: ${seconds}秒`;
        
        if (seconds <= 0) {
            clearInterval(window.eventTimer);
            applyEventEffect(message, playerId);
            popup.classList.add('hidden');
            switchPlayer();
        }
    }, 1000);
}

// 应用事件效果
function applyEventEffect(message, playerId) {
    // 检查是否为内置事件
    for (const rule of BUILTIN_EVENT_RULES) {
        const match = message.match(rule.pattern);
        if (match) {
            console.log(`${message} : 应用内置事件规则: ${rule.pattern}`);
            rule.handler(match, playerId);
            return;
        }
    }
    // 否则为纯文本事件，无需特殊处理
}

// 修改movePlayer函数以支持不触发事件
function movePlayer(steps, checkEvent = true) {
    const playerId = gameState.currentPlayer;
    let newPosition = (gameState.positions[playerId] + steps) % CONFIG.totalCells;
    // 处理负数情况
    if (newPosition < 0) newPosition += CONFIG.totalCells;
    
    console.log(`玩家${playerId}移动了${steps}步，到达位置：${newPosition}`);

    // 更新位置
    gameState.positions[playerId] = newPosition;
    updatePlayerPosition(playerId);
    
    // 检查事件触发
    if (checkEvent) {
        checkCellEvent(newPosition, playerId);
    }
}

// 切换玩家
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    const dice = document.querySelector('.dice');
    dice.style.pointerEvents = 'auto';
    dice.textContent = '投掷';
    console.log(`交换控制权：当前玩家: ${gameState.currentPlayer}`);
}

// 启动游戏
window.onload = initGame;
