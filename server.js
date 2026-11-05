// === КОНСТАНТЫ И НАСТРОЙКИ ===
const OWNER_TELEGRAM_ID = '8127900151';

// База данных в памяти (или таблица в PostgreSQL для продакшена)
let dbKeys = []; // Сгенерированные ключи
let dbProducts = []; // Товары на модерации и витрине
let dbUsers = {
  [OWNER_TELEGRAM_ID]: { role: 'OWNER', balance: 0, spent: 0, orders: 0 }
};

// 1. Генерация ключа владельцем
app.post('/api/owner/create-key', (req, res) => {
  const { owner_id, role, target_id, details } = req.body;
  if (owner_id !== OWNER_TELEGRAM_ID) {
    return res.status(403).json({ error: 'Доступ запрещен. Только владелец!' });
  }

  // Формат ключа: WTS-ROLE-TARGET_ID
  const keyCode = `WTS-${role}-${target_id}`;
  dbKeys.push({
    keyCode,
    role,
    target_id,
    details, // Описание обязанностей или описание магазина
    status: 'active'
  });

  res.json({ success: true, keyCode });
});

// 2. Активация ключа пользователем
app.post('/api/user/activate-key', (req, res) => {
  const { user_id, keyCode } = req.body;
  const foundKey = dbKeys.find(k => k.keyCode === keyCode && k.target_id === user_id);

  if (!foundKey) {
    return res.status(400).json({ error: 'Неверный ключ или ключ не принадлежит вашему ID!' });
  }

  // Обновляем роль пользователя
  if (!dbUsers[user_id]) dbUsers[user_id] = { balance: 0, spent: 0, orders: 0 };
  dbUsers[user_id].role = foundKey.role;
  dbUsers[user_id].details = foundKey.details;

  res.json({ success: true, role: foundKey.role });
});

// 3. Удаление / Блокировка товара владельцем
app.post('/api/owner/delete-product', (req, res) => {
  const { owner_id, product_id, reason } = req.body;
  if (owner_id !== OWNER_TELEGRAM_ID) {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }

  dbProducts = dbProducts.filter(p => p.id !== product_id);
  console.log(`Товар ${product_id} удален владельцем. Причина: ${reason}`);
  res.json({ success: true });
});

// 4. Оформление возврата (доступно Поддержке и Владельцу)
app.post('/api/support/refund', (req, res) => {
  const { operator_id, order_id } = req.body;
  // Проверка, что оператор — Владелец или Поддержка
  // ... логика возврата денег покупателю, возврата товара продавцу и рассылки уведомлений ...
  res.json({ success: true, message: 'Возврат успешно оформлен, средства возвращены покупателю.' });
});
