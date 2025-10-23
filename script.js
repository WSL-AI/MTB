// Глобальные переменные состояния
let userData = {
    nickname: '',
    selectedCategories: [],
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    coffeeCount: 0,
    savingsAmount: 0,
    cashbackEarned: 0,
    deposits: [
        {
            id: 'flex',
            name: 'Накопительный FLEX',
            balance: 3200,
            rate: 7.5,
            termMonths: 12,
            monthsPassed: 5,
            interestAccrued: 132,
            monthlyTopUp: 200,
            nextPayoutInDays: 12,
            nextPayoutAmount: 18.75,
            capitalisation: true,
            replenishment: true
        },
        {
            id: 'travel',
            name: 'Цель: Путешествие',
            balance: 1850,
            rate: 8.2,
            termMonths: 9,
            monthsPassed: 3,
            interestAccrued: 79,
            monthlyTopUp: 150,
            nextPayoutInDays: 5,
            nextPayoutAmount: 12.62,
            capitalisation: true,
            replenishment: true
        },
        {
            id: 'reserve',
            name: 'Резервный фонд',
            balance: 950,
            rate: 6.0,
            termMonths: 6,
            monthsPassed: 4,
            interestAccrued: 28,
            monthlyTopUp: 0,
            nextPayoutInDays: 20,
            nextPayoutAmount: 4.75,
            capitalisation: false,
            replenishment: false
        }
    ],
    analytics: {
        budget: 1800,
        totalSpent: 1425,
        savingsAmount: 375,
        savingsRate: 21,
        categories: [
            { id: 'food', name: 'Продукты', amount: 420, percent: 29, color: '#2563eb' },
            { id: 'transport', name: 'Транспорт', amount: 180, percent: 13, color: '#f97316' },
            { id: 'entertainment', name: 'Развлечения', amount: 240, percent: 17, color: '#10b981' },
            { id: 'shopping', name: 'Шопинг', amount: 310, percent: 22, color: '#8b5cf6' },
            { id: 'other', name: 'Другое', amount: 275, percent: 19, color: '#64748b' }
        ],
        weeklyTrend: [
            { week: '1-7', current: 320, previous: 280 },
            { week: '8-14', current: 360, previous: 310 },
            { week: '15-21', current: 295, previous: 330 },
            { week: '22-28', current: 450, previous: 390 }
        ],
        subscriptions: [
            { name: 'Видеосервис', amount: 12.99, renewal: '15 числа' },
            { name: 'Музыка', amount: 7.49, renewal: '2 числа' },
            { name: 'Спортзал', amount: 35.00, renewal: '25 числа' }
        ],
        recommendations: [
            'Попробуйте устанавливать недельные лимиты на доставку еды, чтобы удерживать план расходов.',
            'Добавьте автоматическое пополнение вклада при каждом поступлении зарплаты.',
            'Пересмотрите подписку на спортзал — при оплате на год вперед стоимость снизится на 15%.'
        ]
    },
    streak: 0,
    achievements: [],
    cardColor: '#6366f1',
    theme: 'ocean',
    cardPhoto: null,
    completedTasks: {
        login: true,
        coffee: false,
        transaction: false
    },
    lastActivityDate: new Date().toDateString()
};

const availableThemes = ['ocean', 'forest', 'sunset', 'berry'];

// 3D Coffee Animation Variables
let scene, camera, renderer, coffeeCup, animationId;
let isAnimating = false;
let fbxLoader;
let coffeeModel;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadUserData();
    setupEventListeners();
    applyTheme(userData.theme);
    checkStreak();
    // Инициализируем 3D сцену сразу при загрузке
    initCoffee3D();
});

function initializeApp() {
    // Всегда показываем начальный экран для демонстрации
    showWelcomeScreen();
}

function showWelcomeScreen() {
    document.getElementById('welcome-screen').classList.add('active');
    document.getElementById('main-screen').classList.remove('active');
    // Обновляем состояние кнопки при показе экрана
    setTimeout(() => {
        updateContinueButton();
    }, 100);
}

function showMainScreen() {
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    updateUserInterface();
}

function applyTheme(themeName) {
    if (!availableThemes.includes(themeName)) {
        themeName = 'ocean';
    }

    availableThemes.forEach(name => {
        document.body.classList.toggle(`theme-${name}`, name === themeName);
    });

    document.querySelectorAll('.theme-option').forEach(option => {
        const isActive = option.dataset.theme === themeName;
        option.classList.toggle('active', isActive);
        option.setAttribute('aria-pressed', isActive);
    });

    userData.theme = themeName;
    saveUserData();
}

function setupEventListeners() {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            applyTheme(this.dataset.theme);
        });
    });

    // Выбор категорий
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            toggleCategory(this);
            // Добавляем анимацию при выборе
            if (this.classList.contains('selected')) {
                this.classList.add('pulse');
            } else {
                this.classList.remove('pulse');
            }
        });
    });

    // Проверка никнейма
    document.getElementById('check-nickname').addEventListener('click', checkNickname);
    document.getElementById('nickname-input').addEventListener('input', function() {
        document.getElementById('nickname-status').textContent = '';
        // Обновляем никнейм в данных и проверяем кнопку
        userData.nickname = this.value.trim();
        updateContinueButton();
    });

    // Продолжить
    document.getElementById('continue-btn').addEventListener('click', function() {
        this.classList.add('pulse');
        setTimeout(() => {
            this.classList.remove('pulse');
            completeSetup();
        }, 300);
    });

    // Навигация
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.add('pulse');
            setTimeout(() => {
                this.classList.remove('pulse');
                switchTab(this.dataset.tab);
            }, 200);
        });
    });

    // Покупка кофе
    document.getElementById('buy-coffee-btn').addEventListener('click', function() {
        this.classList.add('pulse');
        setTimeout(() => {
            this.classList.remove('pulse');
            buyCoffee();
        }, 300);
    });
    document.getElementById('buy-coffee-main-btn').addEventListener('click', function() {
        this.classList.add('pulse');
        setTimeout(() => {
            this.classList.remove('pulse');
            buyCoffee();
        }, 300);
    });

    const simulateTransactionBtn = document.getElementById('simulate-transaction-btn');
    if (simulateTransactionBtn) {
        simulateTransactionBtn.addEventListener('click', function() {
            this.classList.add('pulse');
            setTimeout(() => {
                this.classList.remove('pulse');
                simulateTransaction();
            }, 300);
        });
    }

    const openDepositBtn = document.getElementById('open-deposit-btn');
    if (openDepositBtn) {
        openDepositBtn.addEventListener('click', function() {
            this.classList.add('pulse');
            setTimeout(() => {
                this.classList.remove('pulse');
                showNotification('Наш менеджер свяжется с вами для открытия нового вклада.', 'info');
            }, 300);
        });
    }

    // Кастомизация карты
    document.getElementById('photo-upload').addEventListener('change', handlePhotoUpload);
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            selectCardColor(this);
        });
    });

    // Закрытие модального окна
    document.getElementById('close-coffee-modal').addEventListener('click', closeCoffeeModal);

    // Задания
    document.getElementById('check-tasks-btn').addEventListener('click', function() {
        switchTab('tasks');
    });
}

function toggleCategory(card) {
    const category = card.dataset.category;
    const index = userData.selectedCategories.indexOf(category);
    
    if (index > -1) {
        userData.selectedCategories.splice(index, 1);
        card.classList.remove('selected');
    } else {
        userData.selectedCategories.push(category);
        card.classList.add('selected');
    }
    
    updateContinueButton();
}

function updateContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    const hintEl = document.querySelector('.continue-hint');
    const hasCategories = userData.selectedCategories.length > 0;
    const hasNickname = userData.nickname.length > 0;
    
    const isEnabled = hasCategories && hasNickname;
    continueBtn.disabled = !isEnabled;
    
    // Отладочная информация (можно убрать в продакшене)
    // console.log('Categories:', userData.selectedCategories, 'Nickname:', userData.nickname, 'Enabled:', isEnabled);
    
    // Скрываем подсказку, когда кнопка активна
    if (hintEl) {
        hintEl.style.display = isEnabled ? 'none' : 'block';
    }
}

function checkNickname() {
    const nickname = document.getElementById('nickname-input').value.trim();
    const statusEl = document.getElementById('nickname-status');
    
    if (nickname.length < 3) {
        statusEl.textContent = 'Никнейм должен содержать минимум 3 символа';
        statusEl.className = 'taken';
        userData.nickname = '';
        updateContinueButton();
        return;
    }
    
    // Симуляция проверки доступности никнейма
    const availableNicknames = ['user123', 'admin', 'test'];
    const isAvailable = !availableNicknames.includes(nickname.toLowerCase());
    
    if (isAvailable) {
        userData.nickname = nickname;
        statusEl.textContent = '✓ Никнейм доступен';
        statusEl.className = 'available';
    } else {
        userData.nickname = '';
        statusEl.textContent = '✗ Никнейм уже занят';
        statusEl.className = 'taken';
    }
    
    updateContinueButton();
}

function completeSetup() {
    if (userData.selectedCategories.length === 0 || !userData.nickname) {
        return;
    }
    
    // Добавляем начальные достижения
    userData.achievements.push('first_setup');
    
    saveUserData();
    showMainScreen();
    
    // Показываем поздравление
    showNotification('Добро пожаловать в МТБанк! 🎉', 'success');
}

function switchTab(tabName) {
    // Обновляем навигацию
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const nextNavItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (nextNavItem) {
        nextNavItem.classList.add('active');
    }
    
    // Показываем соответствующий контент
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Обновляем интерфейс для конкретной вкладки
    if (tabName === 'card') {
        updateCardPreview();
    } else if (tabName === 'deposits') {
        updateDepositsView();
    } else if (tabName === 'analytics') {
        updateAnalyticsView();
    }
}

function updateUserInterface() {
    // Обновляем никнейм
    document.getElementById('user-nickname').textContent = userData.nickname;
    document.getElementById('profile-nickname').textContent = userData.nickname;
    document.getElementById('card-nickname').textContent = userData.nickname;
    
    // Обновляем уровень
    document.getElementById('user-level').textContent = userData.level;
    document.getElementById('profile-level').textContent = userData.level;
    
    // Обновляем XP
    const xpPercentage = (userData.xp / userData.xpToNextLevel) * 100;
    document.getElementById('xp-progress').style.width = `${xpPercentage}%`;
    
    // Обновляем статистику
    document.getElementById('coffee-count').textContent = userData.coffeeCount;
    document.getElementById('profile-coffee').textContent = userData.coffeeCount;
    
    document.getElementById('cashback-earned').textContent = `${userData.cashbackEarned} BYN`;
    document.getElementById('profile-cashback').textContent = `${userData.cashbackEarned} BYN`;
    
    document.getElementById('savings-amount').textContent = `${userData.savingsAmount} BYN`;
    document.getElementById('profile-savings').textContent = `${userData.savingsAmount} BYN`;
    
    document.getElementById('streak-count').textContent = userData.streak;
    document.getElementById('profile-streak').textContent = `${userData.streak} дней`;
    
    document.getElementById('achievements-count').textContent = userData.achievements.length;
    
    // Обновляем прогресс сбережений
    const savingsPercentage = Math.min((userData.savingsAmount / 1000) * 100, 100);
    document.getElementById('savings-progress').style.width = `${savingsPercentage}%`;
    document.getElementById('savings-total').textContent = `${userData.savingsAmount} BYN`;
    
    // Обновляем задания
    updateTasksDisplay();

    // Обновляем вкладки с вкладами
    updateDepositsView();

    // Обновляем аналитику
    updateAnalyticsView();
}

function formatCurrency(value, fractionDigits = 2) {
    return Number(value || 0).toLocaleString('ru-RU', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    });
}

function pluralizeDays(days) {
    const absDays = Math.abs(days);
    const lastDigit = absDays % 10;
    const lastTwoDigits = absDays % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${days} дней`;
    }
    if (lastDigit === 1) {
        return `${days} день`;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${days} дня`;
    }
    return `${days} дней`;
}

function formatFutureDate(daysFromNow) {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    return target.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function updateDepositsView() {
    const totalEl = document.getElementById('deposits-total');
    if (!totalEl) return;

    const deposits = userData.deposits || [];
    const totalBalance = deposits.reduce((sum, deposit) => sum + deposit.balance, 0);
    const monthlyIncome = deposits.reduce((sum, deposit) => {
        return sum + (deposit.balance * (deposit.rate / 100) / 12);
    }, 0);
    const accruedInterest = deposits.reduce((sum, deposit) => sum + deposit.interestAccrued, 0);
    const averageRate = deposits.length
        ? deposits.reduce((sum, deposit) => sum + deposit.rate, 0) / deposits.length
        : 0;

    const sortedByPayout = [...deposits].sort((a, b) => a.nextPayoutInDays - b.nextPayoutInDays);
    const nearestPayout = sortedByPayout[0];

    totalEl.textContent = `${formatCurrency(totalBalance)} BYN`;
    const monthlyIncomeEl = document.getElementById('deposits-monthly-income');
    if (monthlyIncomeEl) {
        monthlyIncomeEl.textContent = `${formatCurrency(monthlyIncome)} BYN`;
    }
    const averageRateEl = document.getElementById('deposits-average-rate');
    if (averageRateEl) {
        averageRateEl.textContent = `${averageRate.toFixed(1)}%`;
    }
    const accruedInterestEl = document.getElementById('deposits-interest-earned');
    if (accruedInterestEl) {
        accruedInterestEl.textContent = `${formatCurrency(accruedInterest)} BYN`;
    }
    const nextPayoutSummaryEl = document.getElementById('deposits-next-payout-summary');
    if (nextPayoutSummaryEl && nearestPayout) {
        nextPayoutSummaryEl.textContent = `${formatCurrency(nearestPayout.nextPayoutAmount)} BYN • ${nearestPayout.nextPayoutInDays === 0 ? 'сегодня' : pluralizeDays(nearestPayout.nextPayoutInDays)}`;
    }

    const listEl = document.getElementById('deposit-list');
    if (listEl) {
        listEl.innerHTML = '';
        deposits.forEach(deposit => {
            const progress = deposit.termMonths
                ? Math.min(100, Math.round((deposit.monthsPassed / deposit.termMonths) * 100))
                : 0;
            const monthlyAccrual = deposit.balance * (deposit.rate / 100) / 12;
            const card = document.createElement('div');
            card.className = 'deposit-card';
            card.innerHTML = `
                <div class="deposit-card__header">
                    <div>
                        <h4 class="deposit-name">${deposit.name}</h4>
                        <p class="deposit-meta">${deposit.capitalisation ? 'Капитализация' : 'Без капитализации'} · ${deposit.replenishment ? 'Пополнение доступно' : 'Без пополнения'}</p>
                    </div>
                    <div class="deposit-rate">${deposit.rate.toFixed(1)}%</div>
                </div>
                <div class="deposit-card__body">
                    <div class="deposit-amount">
                        <span class="label">Сумма на счете</span>
                        <span class="value">${formatCurrency(deposit.balance)} BYN</span>
                    </div>
                    <div class="deposit-stats">
                        <div>
                            <span class="label">Начислено процентов</span>
                            <span class="value">${formatCurrency(deposit.interestAccrued)} BYN</span>
                        </div>
                        <div>
                            <span class="label">Месячное начисление</span>
                            <span class="value">~${formatCurrency(monthlyAccrual)} BYN</span>
                        </div>
                        <div>
                            <span class="label">Пополнение</span>
                            <span class="value">${deposit.monthlyTopUp ? `${formatCurrency(deposit.monthlyTopUp)} BYN/мес` : '—'}</span>
                        </div>
                    </div>
                    <div class="deposit-progress">
                        <div class="deposit-progress-bar">
                            <div class="deposit-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="deposit-progress-info">
                            <span>${deposit.monthsPassed} из ${deposit.termMonths} мес.</span>
                            <span>${progress}%</span>
                        </div>
                    </div>
                </div>
                <div class="deposit-card__footer">
                    <div>
                        <span class="label">Следующее начисление</span>
                        <span class="value">${deposit.nextPayoutInDays === 0 ? 'Сегодня' : `Через ${pluralizeDays(deposit.nextPayoutInDays)}`}</span>
                    </div>
                    <div>
                        <span class="label">Сумма начисления</span>
                        <span class="value">${formatCurrency(deposit.nextPayoutAmount)} BYN</span>
                    </div>
                    <div>
                        <span class="label">Дата</span>
                        <span class="value">${formatFutureDate(deposit.nextPayoutInDays)}</span>
                    </div>
                </div>
            `;
            listEl.appendChild(card);
        });
    }

    const payoutsEl = document.getElementById('deposit-payouts');
    if (payoutsEl) {
        payoutsEl.innerHTML = '';
        sortedByPayout.forEach(deposit => {
            const row = document.createElement('div');
            row.className = 'payout-item';
            row.innerHTML = `
                <div>
                    <span class="payout-name">${deposit.name}</span>
                    <span class="payout-date">${formatFutureDate(deposit.nextPayoutInDays)}</span>
                </div>
                <div class="payout-amount">${formatCurrency(deposit.nextPayoutAmount)} BYN</div>
            `;
            payoutsEl.appendChild(row);
        });
    }

    const recommendationsEl = document.getElementById('deposit-recommendations');
    if (recommendationsEl) {
        recommendationsEl.innerHTML = '';
        if (deposits.length) {
            const slowest = deposits.reduce((acc, deposit) => {
                const accProgress = acc.termMonths ? acc.monthsPassed / acc.termMonths : 0;
                const depProgress = deposit.termMonths ? deposit.monthsPassed / deposit.termMonths : 0;
                return depProgress < accProgress ? deposit : acc;
            }, deposits[0]);
            const highestRate = deposits.reduce((acc, deposit) => deposit.rate > acc.rate ? deposit : acc, deposits[0]);
            const soonest = nearestPayout || deposits[0];

            const recommendations = [
                `Пополните вклад «${slowest.name}» на 200 BYN — вы ускорите накопление и приблизите цель по нему.`,
                `Держите основную сумму на «${highestRate.name}»: ставка ${highestRate.rate.toFixed(1)}% обеспечивает максимальный доход.`,
                `Через ${soonest.nextPayoutInDays === 0 ? 'сегодня' : pluralizeDays(soonest.nextPayoutInDays)} (${formatFutureDate(soonest.nextPayoutInDays)}) получите ${formatCurrency(soonest.nextPayoutAmount)} BYN по вкладу «${soonest.name}».`
            ];

            recommendations.forEach(text => {
                const li = document.createElement('li');
                li.textContent = text;
                recommendationsEl.appendChild(li);
            });
        }
    }
}

function updateAnalyticsView() {
    const analytics = userData.analytics;
    const totalEl = document.getElementById('analytics-total-spent');
    if (!totalEl || !analytics) return;

    totalEl.textContent = `${formatCurrency(analytics.totalSpent)} BYN`;

    const budgetEl = document.getElementById('analytics-budget');
    if (budgetEl) {
        budgetEl.textContent = `${formatCurrency(analytics.budget)} BYN`;
    }

    const savingsRateEl = document.getElementById('analytics-savings-rate');
    if (savingsRateEl) {
        savingsRateEl.textContent = `${analytics.savingsRate}%`;
    }

    const savingsAmountEl = document.getElementById('analytics-savings-amount');
    if (savingsAmountEl) {
        savingsAmountEl.textContent = `${formatCurrency(analytics.savingsAmount)} BYN`;
    }

    const activeSubsEl = document.getElementById('analytics-active-subscriptions');
    if (activeSubsEl) {
        activeSubsEl.textContent = analytics.subscriptions.length;
    }

    const subsTotalEl = document.getElementById('analytics-subscription-total');
    if (subsTotalEl) {
        const totalSubs = analytics.subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
        subsTotalEl.textContent = `${formatCurrency(totalSubs)} BYN`;
    }

    const categoryChartEl = document.getElementById('analytics-category-chart');
    if (categoryChartEl) {
        categoryChartEl.innerHTML = '';
        analytics.categories.forEach(category => {
            const row = document.createElement('div');
            row.className = 'category-chart__row';
            row.innerHTML = `
                <div class="category-chart__label">
                    <span class="category-name">${category.name}</span>
                    <span class="category-amount">${formatCurrency(category.amount)} BYN</span>
                </div>
                <div class="category-chart__bar">
                    <div class="category-chart__fill" style="width: ${category.percent}%; background: ${category.color};"></div>
                </div>
                <span class="category-chart__percent">${category.percent}%</span>
            `;
            categoryChartEl.appendChild(row);
        });
    }

    const trendChartEl = document.getElementById('analytics-weekly-trend');
    if (trendChartEl) {
        trendChartEl.innerHTML = '';
        const maxValue = analytics.weeklyTrend.reduce((max, point) => {
            return Math.max(max, point.current, point.previous);
        }, 0);

        analytics.weeklyTrend.forEach(point => {
            const currentWidth = maxValue ? Math.round((point.current / maxValue) * 100) : 0;
            const previousWidth = maxValue ? Math.round((point.previous / maxValue) * 100) : 0;
            const row = document.createElement('div');
            row.className = 'trend-row';
            row.innerHTML = `
                <div class="trend-week">${point.week}</div>
                <div class="trend-bars">
                    <div class="trend-bar current" style="width: ${currentWidth}%">
                        <span class="trend-bar__amount">${formatCurrency(point.current)} BYN</span>
                        <span class="trend-bar__label">текущий месяц</span>
                    </div>
                    <div class="trend-bar previous" style="width: ${previousWidth}%">
                        <span class="trend-bar__amount">${formatCurrency(point.previous)} BYN</span>
                        <span class="trend-bar__label">прошлый месяц</span>
                    </div>
                </div>
            `;
            trendChartEl.appendChild(row);
        });
    }

    const subsListEl = document.getElementById('analytics-subscriptions');
    if (subsListEl) {
        subsListEl.innerHTML = '';
        analytics.subscriptions.forEach(sub => {
            const item = document.createElement('div');
            item.className = 'subscription-item';
            item.innerHTML = `
                <div>
                    <span class="subscription-name">${sub.name}</span>
                    <span class="subscription-renewal">Списание ${sub.renewal}</span>
                </div>
                <div class="subscription-amount">${formatCurrency(sub.amount)} BYN</div>
            `;
            subsListEl.appendChild(item);
        });
    }

    const recommendationsEl = document.getElementById('analytics-recommendations');
    if (recommendationsEl) {
        recommendationsEl.innerHTML = '';
        analytics.recommendations.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            recommendationsEl.appendChild(li);
        });
    }
}

function buyCoffee() {
    const coffeePrice = 3;
    
    // Проверяем баланс (в реальном приложении здесь была бы проверка счета)
    if (userData.savingsAmount + coffeePrice > 10000) {
        showNotification('Превышен лимит сбережений!', 'error');
        return;
    }
    
    // Добавляем кофе и сбережения
    userData.coffeeCount++;
    userData.savingsAmount += coffeePrice;
    userData.xp += 10;
    
    // Проверяем повышение уровня
    checkLevelUp();
    
    // Обновляем задания
    userData.completedTasks.coffee = true;
    updateTasksDisplay();
    
    // Показываем 3D анимацию
    showCoffee3DAnimation();
    
    // Плавно обновляем интерфейс через 1 секунду
    setTimeout(() => {
        animateSavingsUpdate();
        updateUserInterface();
    }, 1000);
    
    // Сохраняем данные
    saveUserData();
    
    // Проверяем достижения
    checkAchievements();
}

function showCoffeeModal() {
    const modal = document.getElementById('coffee-modal');
    modal.classList.add('active');
    
    // Анимация кофе
    const coffeeCup = document.getElementById('coffee-cup-3d');
    coffeeCup.style.animation = 'none';
    setTimeout(() => {
        coffeeCup.style.animation = 'bounce 1s ease-in-out';
    }, 100);
}

function closeCoffeeModal() {
    document.getElementById('coffee-modal').classList.remove('active');
}

// 3D Coffee Animation Functions
function initCoffee3D() {
    const canvas = document.getElementById('coffee-canvas');
    if (!canvas) return;
    
    // Создаем сцену
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.background.alpha = 0;
    
    // Создаем камеру - вид спереди для ОГРОМНОГО стаканчика
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.8, 2); // Очень близко для огромного стаканчика
    camera.lookAt(0, 0, 0);
    
    // Создаем рендерер с тенями
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Создаем загрузчик FBX
    fbxLoader = new THREE.FBXLoader();
    
    // Загружаем модель кофе
    loadCoffeeModel();
    
    // Добавляем освещение с тенями
    setupLighting();
    
    // Добавляем плоскость для теней
    addShadowPlane();
}

function loadCoffeeModel() {
    fbxLoader.load('Vaso.fbx', function(object) {
        coffeeModel = object;
        
        // Настраиваем модель
        coffeeModel.scale.setScalar(0.1);
        coffeeModel.position.set(0, 0, 0);
        coffeeModel.visible = false; // Скрываем по умолчанию
        
        // Включаем тени для модели
        coffeeModel.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(coffeeModel);
        console.log('FBX модель загружена успешно');
    }, function(progress) {
        console.log('Загрузка модели:', (progress.loaded / progress.total * 100) + '%');
    }, function(error) {
        console.error('Ошибка загрузки модели:', error);
        // Создаем красивую модель если FBX не загрузился
        createBeautifulCoffeeCup();
    });
}

function setupLighting() {
    // Основной свет
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);
    
    // Заполняющий свет
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-3, 5, -3);
    scene.add(fillLight);
    
    // Окружающий свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
}

function addShadowPlane() {
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);
}

function createBeautifulCoffeeCup() {
    const group = new THREE.Group();
    
    // Создаем красивую чашку с яркими цветами
    const cupGeometry = new THREE.CylinderGeometry(1.2, 0.8, 1.8, 64);
    const cupMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFF6B35, // Яркий оранжевый
        shininess: 200,
        specular: 0xFFFFFF,
        emissive: 0x331100
    });
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    cup.position.y = 0;
    cup.castShadow = true;
    cup.receiveShadow = true;
    group.add(cup);
    
    // Кофе внутри - темно-коричневый
    const coffeeGeometry = new THREE.CylinderGeometry(1.1, 0.7, 0.6, 64);
    const coffeeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4A2C17,
        shininess: 150,
        transparent: true,
        opacity: 0.95,
        emissive: 0x110000
    });
    const coffee = new THREE.Mesh(coffeeGeometry, coffeeMaterial);
    coffee.position.y = 0.3;
    coffee.castShadow = true;
    coffee.receiveShadow = true;
    group.add(coffee);
    
    // Пенка сверху - кремовая
    const foamGeometry = new THREE.CylinderGeometry(1.0, 0.6, 0.2, 64);
    const foamMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFF8DC,
        shininess: 100,
        transparent: true,
        opacity: 0.95,
        emissive: 0x444400
    });
    const foam = new THREE.Mesh(foamGeometry, foamMaterial);
    foam.position.y = 0.7;
    foam.castShadow = true;
    foam.receiveShadow = true;
    group.add(foam);
    
    // Крышка - темно-коричневая
    const lidGeometry = new THREE.CylinderGeometry(1.3, 1.3, 0.3, 64);
    const lidMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2C1810,
        shininess: 150,
        specular: 0x888888,
        emissive: 0x111111
    });
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.y = 1.05;
    lid.castShadow = true;
    lid.receiveShadow = true;
    group.add(lid);
    
    // Отверстие для питья - черное
    const holeGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.1, 32);
    const holeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000,
        transparent: true,
        opacity: 0.9,
        shininess: 100
    });
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    hole.position.set(0.5, 1.15, 0);
    hole.castShadow = true;
    hole.receiveShadow = true;
    group.add(hole);
    
    // Ручка - яркая
    const handleGeometry = new THREE.TorusGeometry(0.5, 0.12, 16, 32, Math.PI);
    const handleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFF6B35,
        shininess: 200,
        specular: 0xFFFFFF
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(1.4, 0.4, 0);
    handle.rotation.z = Math.PI / 2;
    handle.castShadow = true;
    handle.receiveShadow = true;
    group.add(handle);
    
    // Логотип на чашке
    const logoGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16);
    const logoMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFFFFF,
        shininess: 100,
        emissive: 0x222222
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(0.6, 0.2, 0);
    logo.castShadow = true;
    logo.receiveShadow = true;
    group.add(logo);
    
    // Красивый пар - много частиц
    for (let i = 0; i < 20; i++) {
        const steamGeometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 16, 16);
        const steamMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.9,
            emissive: 0x444444
        });
        const steam = new THREE.Mesh(steamGeometry, steamMaterial);
        steam.position.set(
            (Math.random() - 0.5) * 0.8,
            1.3 + Math.random() * 0.6,
            (Math.random() - 0.5) * 0.8
        );
        steam.scale.setScalar(0.5 + Math.random() * 0.8);
        group.add(steam);
    }
    
    coffeeModel = group;
    coffeeModel.visible = false; // Скрываем по умолчанию
    scene.add(coffeeModel);
    console.log('Красивая яркая модель кофе создана');
}

function showCoffee3DAnimation() {
    if (isAnimating) return;
    
    const container = document.getElementById('coffee-3d-container');
    container.classList.add('active');
    
    // Затемняем фон приложения
    const app = document.getElementById('app');
    app.style.filter = 'blur(3px) brightness(0.7)';
    app.style.transition = 'filter 0.5s ease';
    
    isAnimating = true;
    
    // Показываем GIF анимацию
    showCoffeeGIF();
    
    // Показываем уведомление через 2 секунды
    setTimeout(() => {
        showNotification('Кофе куплен! 3 BYN переведены на сберегательный счет ☕', 'success');
    }, 2000);
    
    // Закрываем анимацию через 4 секунды
    setTimeout(() => {
        hideCoffee3DAnimation();
    }, 4000);
}

function showCoffeeGIF() {
    const container = document.getElementById('coffee-3d-container');
    if (!container) return;
    
    // Создаем GIF элемент
    const gifElement = document.createElement('img');
    gifElement.src = 'coffee-20_256.gif';
    gifElement.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        height: 300px;
        z-index: 1000;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        animation: coffeeAppear 0.5s ease-out;
    `;
    
    // Добавляем CSS анимацию (без вращения)
    const style = document.createElement('style');
    style.textContent = `
        @keyframes coffeeAppear {
            0% {
                transform: translate(-50%, -50%) scale(0.1);
                opacity: 0;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.1);
                opacity: 0.8;
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
        
        @keyframes coffeeFloat {
            0%, 100% {
                transform: translate(-50%, -50%) translateY(0px);
            }
            50% {
                transform: translate(-50%, -50%) translateY(-5px);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Добавляем GIF в контейнер
    container.appendChild(gifElement);
    
    // Добавляем плавающую анимацию
    setTimeout(() => {
        gifElement.style.animation = 'coffeeFloat 2s ease-in-out infinite';
        gifElement.classList.add('glow');
    }, 500);
    
    // Сохраняем ссылку для удаления
    window.currentCoffeeGIF = gifElement;
}

function animateCoffeeFly() {
    if (!coffeeCup) return;
    
    const startTime = Date.now();
    const duration = 4000; // 4 секунды
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Плавная анимация с easing
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const easeInOutSine = Math.sin(progress * Math.PI);
        
        // Траектория полета (дуга)
        const angle = progress * Math.PI * 2;
        const radius = 8;
        
        coffeeCup.position.x = Math.cos(angle) * radius * easeOutQuart;
        coffeeCup.position.y = Math.sin(angle) * radius * 0.5 + 3 * (1 - easeOutQuart);
        coffeeCup.position.z = 5 - progress * 20;
        
        // Вращение с ускорением
        coffeeCup.rotation.x += 0.05 * (1 + progress);
        coffeeCup.rotation.y += 0.08 * (1 + progress);
        coffeeCup.rotation.z += 0.03 * (1 + progress);
        
        // Пульсация масштаба
        const pulseScale = 1 + Math.sin(progress * Math.PI * 6) * 0.15;
        coffeeCup.scale.setScalar(pulseScale);
        
        // Анимация пара
        coffeeCup.children.forEach((child, index) => {
            if (child.material && child.material.opacity !== undefined) {
                // Пар поднимается вверх
                child.position.y += 0.02;
                child.material.opacity = Math.max(0, 0.6 - progress * 0.8);
                
                // Пар рассеивается
                child.position.x += (Math.random() - 0.5) * 0.01;
                child.position.z += (Math.random() - 0.5) * 0.01;
            }
        });
        
        // Эффект исчезновения
        if (progress > 0.7) {
            coffeeCup.children.forEach(child => {
                if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = Math.max(0, 1 - (progress - 0.7) * 3);
                }
            });
        }
        
        renderer.render(scene, camera);
        
        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function showCoffeeSimple() {
    if (!coffeeModel) {
        // Если модель не загружена, создаем красивую
        createBeautifulCoffeeCup();
        return;
    }
    
    // Показываем модель
    coffeeModel.visible = true;
    
    // Сбрасываем позицию модели (ОГРОМНЫЙ размер)
    coffeeModel.position.set(0, 0, 0);
    coffeeModel.rotation.set(0, 0, 0);
    coffeeModel.scale.setScalar(0.8); // ОГРОМНЫЙ размер - в 8 раз больше!
    
    // Анимация появления
    animateCoffeeAppearance();
    
    // Улучшенная анимация - больше движений
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const time = elapsed * 0.001; // время в секундах
        
        if (coffeeModel && coffeeModel.visible) {
            // Активное вращение по всем осям
            coffeeModel.rotation.y = Math.sin(time * 0.5) * 0.3; // Более активное вращение
            coffeeModel.rotation.x = Math.sin(time * 0.3) * 0.2; // Наклон
            coffeeModel.rotation.z = Math.sin(time * 0.4) * 0.15; // Крен
            
            // Движение в пространстве
            coffeeModel.position.y = Math.sin(time * 0.6) * 0.2; // Покачивание вверх-вниз
            coffeeModel.position.x = Math.sin(time * 0.4) * 0.15; // Покачивание влево-вправо
            coffeeModel.position.z = Math.sin(time * 0.35) * 0.1; // Покачивание вперед-назад
            
            // Пульсация масштаба (ОГРОМНЫЙ размер)
            const pulseScale = 1 + Math.sin(time * 0.8) * 0.1;
            coffeeModel.scale.setScalar(0.8 * pulseScale);
        }
        
        renderer.render(scene, camera);
        
        if (isAnimating) {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function animateCoffeeAppearance() {
    if (!coffeeModel) return;
    
    const startTime = Date.now();
    const duration = 2000; // 2 секунды
    
    // Начальное состояние - модель невидима и маленькая
    coffeeModel.scale.setScalar(0.01);
    coffeeModel.position.y = -2;
    coffeeModel.position.x = 0;
    coffeeModel.position.z = 0;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Плавное появление с easing
        const easeOutBack = 1 - Math.pow(1 - progress, 3) * (1 - progress * 0.3);
        const easeInOutCubic = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        // Масштаб - плавное увеличение с пульсацией (ОГРОМНЫЙ размер)
        const baseScale = 0.8 * easeOutBack; // ОГРОМНЫЙ базовый размер
        const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.15;
        coffeeModel.scale.setScalar(baseScale * pulseScale);
        
        // Позиция - поднимается снизу с покачиванием
        coffeeModel.position.y = -2 + 2 * easeInOutCubic;
        coffeeModel.position.x = Math.sin(progress * Math.PI * 3) * 0.3; // Покачивание влево-вправо
        coffeeModel.position.z = Math.sin(progress * Math.PI * 2) * 0.2; // Покачивание вперед-назад
        
        // Более активное вращение при появлении
        coffeeModel.rotation.y = progress * Math.PI * 1.5; // Полтора оборота
        coffeeModel.rotation.x = Math.sin(progress * Math.PI * 2) * 0.2; // Наклон
        coffeeModel.rotation.z = Math.sin(progress * Math.PI * 3) * 0.1; // Крен
        
        renderer.render(scene, camera);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function animateCoffeeDisappear() {
    const startTime = Date.now();
    const duration = 1500; // 1.5 секунды для более плавного исчезновения
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Очень плавное исчезновение
        const easeInCubic = progress * progress * progress;
        const fadeOut = 1 - easeInCubic;
        
        // Плавное уменьшение масштаба
        coffeeCup.scale.setScalar(1.1 * fadeOut);
        
        // Плавное исчезновение прозрачности
        coffeeCup.children.forEach(child => {
            if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = Math.max(0, fadeOut);
            }
        });
        
        // Очень медленное поднятие вверх
        coffeeCup.position.y = progress * 1.5;
        
        // Финальное вращение для остановки
        if (progress > 0.5) {
            const finalRotation = (progress - 0.5) * 2; // Последние 50% времени
            coffeeCup.rotation.y = Math.PI * 6 * 0.7 + Math.PI * 0.5 + finalRotation * Math.PI * 0.2;
        }
        
        renderer.render(scene, camera);
        
        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function animateSavingsUpdate() {
    // Анимация обновления счетчика кофе
    const coffeeCountEl = document.getElementById('coffee-count');
    const profileCoffeeEl = document.getElementById('profile-coffee');
    
    if (coffeeCountEl) {
        coffeeCountEl.style.transform = 'scale(1.2)';
        coffeeCountEl.style.color = '#10b981';
        setTimeout(() => {
            coffeeCountEl.style.transform = 'scale(1)';
            coffeeCountEl.style.color = '';
        }, 500);
    }
    
    if (profileCoffeeEl) {
        profileCoffeeEl.style.transform = 'scale(1.2)';
        profileCoffeeEl.style.color = '#10b981';
        setTimeout(() => {
            profileCoffeeEl.style.transform = 'scale(1)';
            profileCoffeeEl.style.color = '';
        }, 500);
    }
    
    // Анимация обновления суммы сбережений
    const savingsAmountEl = document.getElementById('savings-amount');
    const profileSavingsEl = document.getElementById('profile-savings');
    const savingsTotalEl = document.getElementById('savings-total');
    
    if (savingsAmountEl) {
        savingsAmountEl.style.transform = 'scale(1.2)';
        savingsAmountEl.style.color = '#10b981';
        setTimeout(() => {
            savingsAmountEl.style.transform = 'scale(1)';
            savingsAmountEl.style.color = '';
        }, 500);
    }
    
    if (profileSavingsEl) {
        profileSavingsEl.style.transform = 'scale(1.2)';
        profileSavingsEl.style.color = '#10b981';
        setTimeout(() => {
            profileSavingsEl.style.transform = 'scale(1)';
            profileSavingsEl.style.color = '';
        }, 500);
    }
    
    if (savingsTotalEl) {
        savingsTotalEl.style.transform = 'scale(1.2)';
        savingsTotalEl.style.color = '#10b981';
        setTimeout(() => {
            savingsTotalEl.style.transform = 'scale(1)';
            savingsTotalEl.style.color = '';
        }, 500);
    }
    
    // Анимация прогресс-бара
    const progressBar = document.getElementById('savings-progress');
    if (progressBar) {
        const currentWidth = progressBar.style.width;
        progressBar.style.transition = 'width 1s ease-out';
        setTimeout(() => {
            const savingsPercentage = Math.min((userData.savingsAmount / 1000) * 100, 100);
            progressBar.style.width = `${savingsPercentage}%`;
        }, 100);
    }
}

function hideCoffee3DAnimation() {
    const container = document.getElementById('coffee-3d-container');
    container.classList.remove('active');
    
    // Убираем затемнение фона
    const app = document.getElementById('app');
    app.style.filter = 'none';
    app.style.transition = 'filter 0.5s ease';
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    isAnimating = false;
    
    // Удаляем GIF анимацию
    if (window.currentCoffeeGIF) {
        window.currentCoffeeGIF.remove();
        window.currentCoffeeGIF = null;
    }
    
    // Очищаем контейнер
    container.innerHTML = '';
}

function checkLevelUp() {
    if (userData.xp >= userData.xpToNextLevel) {
        userData.level++;
        userData.xp -= userData.xpToNextLevel;
        userData.xpToNextLevel = Math.floor(userData.xpToNextLevel * 1.5);
        
        showNotification(`Поздравляем! Вы достигли уровня ${userData.level}! 🎉`, 'success');
        
        // Добавляем достижение
        if (!userData.achievements.includes(`level_${userData.level}`)) {
            userData.achievements.push(`level_${userData.level}`);
        }
        
        // Бонусы за уровень
        const levelBonuses = {
            2: { cashback: 50, message: 'Бонус: +50% кешбэк на неделю!' },
            3: { cashback: 100, message: 'Бонус: +100% кешбэк на неделю!' },
            5: { cashback: 200, message: 'Бонус: +200% кешбэк на неделю!' },
            10: { cashback: 500, message: 'Бонус: +500% кешбэк на неделю!' }
        };
        
        if (levelBonuses[userData.level]) {
            userData.cashbackEarned += levelBonuses[userData.level].cashback;
            showNotification(levelBonuses[userData.level].message, 'success');
        }
    }
}

function checkStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (userData.lastActivityDate === yesterday) {
        // Продолжаем страйк
        userData.streak++;
    } else if (userData.lastActivityDate !== today) {
        // Сбрасываем страйк
        userData.streak = 0;
    }
    
    userData.lastActivityDate = today;
    updateStreakRewards();
}

function updateStreakRewards() {
    const streakRewards = {
        7: { bonus: 1.02, message: 'Неделя страйка! +2% кешбэк' },
        14: { bonus: 1.05, message: 'Две недели! +5% кешбэк' },
        30: { bonus: 1.1, message: 'Месяц страйка! +10% кешбэк' },
        100: { bonus: 1.2, message: '100 дней! +20% кешбэк' },
        365: { bonus: 1.5, message: 'Год страйка! +50% кешбэк и подарок!' }
    };
    
    for (const [days, reward] of Object.entries(streakRewards)) {
        if (userData.streak >= parseInt(days) && !userData.achievements.includes(`streak_${days}`)) {
            userData.achievements.push(`streak_${days}`);
            showNotification(reward.message, 'success');
        }
    }
}

function updateTasksDisplay() {
    const tasks = document.querySelectorAll('.task-item');
    tasks.forEach(task => {
        const taskType = task.dataset.task;
        const checkbox = task.querySelector('.task-checkbox');
        if (!checkbox) return;

        const isCompleted = Boolean(userData.completedTasks[taskType]);
        checkbox.classList.toggle('checked', isCompleted);
        checkbox.textContent = isCompleted ? '✓' : '';
    });
}

function checkAchievements() {
    const newAchievements = [];
    
    // Первая чашка кофе
    if (userData.coffeeCount === 1 && !userData.achievements.includes('first_coffee')) {
        newAchievements.push({ id: 'first_coffee', name: 'Первая чашка', icon: 'fas fa-coffee' });
    }
    
    // 10 чашек кофе
    if (userData.coffeeCount === 10 && !userData.achievements.includes('coffee_lover')) {
        newAchievements.push({ id: 'coffee_lover', name: 'Любитель кофе', icon: 'fas fa-coffee' });
    }
    
    // 100 чашек кофе
    if (userData.coffeeCount === 100 && !userData.achievements.includes('coffee_master')) {
        newAchievements.push({ id: 'coffee_master', name: 'Мастер кофе', icon: 'fas fa-coffee' });
    }
    
    // Неделя страйка
    if (userData.streak === 7 && !userData.achievements.includes('week_streak')) {
        newAchievements.push({ id: 'week_streak', name: 'Неделя страйка', icon: 'fas fa-fire' });
    }
    
    // Месяц страйка
    if (userData.streak === 30 && !userData.achievements.includes('month_streak')) {
        newAchievements.push({ id: 'month_streak', name: 'Месяц страйка', icon: 'fas fa-fire' });
    }
    
    // Добавляем новые достижения
    newAchievements.forEach(achievement => {
        userData.achievements.push(achievement.id);
        showNotification(`Новое достижение: ${achievement.name}! 🏆`, 'success');
    });
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            userData.cardPhoto = e.target.result;
            updateCardPreview();
            saveUserData();
        };
        reader.readAsDataURL(file);
    }
}

function selectCardColor(option) {
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('active');
    });
    option.classList.add('active');
    
    userData.cardColor = option.dataset.color;
    updateCardPreview();
    saveUserData();
}

function updateCardPreview() {
    const card = document.getElementById('preview-card');
    const backgroundEl = card.querySelector('.card-background');
    
    if (userData.cardPhoto) {
        backgroundEl.style.backgroundImage = `url(${userData.cardPhoto})`;
        backgroundEl.style.backgroundSize = 'cover';
        backgroundEl.style.backgroundPosition = 'center';
        backgroundEl.style.opacity = '0.3';
        backgroundEl.style.filter = 'brightness(0.7)';
    } else {
        backgroundEl.style.backgroundImage = 'none';
        backgroundEl.style.opacity = '0.9';
        backgroundEl.style.filter = 'none';
    }
    
    const photoEl = card.querySelector('.card-photo');
    if (userData.cardPhoto) {
        photoEl.style.backgroundImage = `url(${userData.cardPhoto})`;
        photoEl.style.backgroundSize = 'cover';
        photoEl.style.backgroundPosition = 'center';
        photoEl.innerHTML = '';
    } else {
        photoEl.style.backgroundImage = 'none';
        photoEl.innerHTML = '<i class="fas fa-user"></i>';
    }
}

function adjustColor(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    const computedStyles = getComputedStyle(document.body);
    const accentColor = computedStyles.getPropertyValue('--accent').trim() || '#6366f1';
    const successColor = computedStyles.getPropertyValue('--success').trim() || '#10b981';
    const dangerColor = computedStyles.getPropertyValue('--danger').trim() || '#ef4444';
    const backgroundColor = type === 'success' ? successColor : type === 'error' ? dangerColor : accentColor;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function saveUserData() {
    // Отключено для демонстрации
    // localStorage.setItem('mtbankUserData', JSON.stringify(userData));
}

function loadUserData() {
    // Отключено для демонстрации
    // const savedData = localStorage.getItem('mtbankUserData');
    // if (savedData) {
    //     userData = { ...userData, ...JSON.parse(savedData) };
    // }
}

// Симуляция транзакций для демонстрации
function simulateTransaction() {
    userData.completedTasks.transaction = true;
    userData.xp += 15;
    userData.cashbackEarned += Math.floor(Math.random() * 50) + 10;
    
    checkLevelUp();
    updateUserInterface();
    saveUserData();
    
    showNotification('Транзакция совершена! Получен кешбэк! 💰', 'success');
}

// Добавляем CSS для анимаций уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Симуляция ежедневных заданий
setInterval(() => {
    // Сбрасываем ежедневные задания в полночь
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        userData.completedTasks.coffee = false;
        userData.completedTasks.transaction = false;
        updateTasksDisplay();
        saveUserData();
    }
}, 60000); // Проверяем каждую минуту

