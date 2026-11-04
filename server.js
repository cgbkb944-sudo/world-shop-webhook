const express = require('express');
const crypto = require('crypto');
const приложение = express();

// Обязательно используйте express.json() или express.urlencoded() для парсинга тела запроса
приложение.use(express.json());

// Ваш токен от Crypto Bot (лучше хранить в окружении, но оставим так)
const CRYPTO_BOT_TOKEN = process.env.CRYPTO_BOT_TOKEN;

// Функция проверки подлинности вебхука Crypto Bot
function verifyCryptoBotSignature(req) {
    const cryptoBotSignature = req.header('crypto-pay-api-signature');
    if (!cryptoBotSignature) return false;

    const secret = crypto.createHash('sha256').update(CRYPTO_BOT_TOKEN).digest();
    const checkString = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

    return hmac === cryptoBotSignature;
}

// Конечная точка, которая будет принимать вебхуки от Crypto Bot
приложение.post('/webhook', async (async (req, res) => {
    try {
        const обновить = req.тело;

        // Проверяем тип событий: нас интересует update_type == 'invoice_paid'
        if (обновить && обновить.update_type === 'invoice_paid') {
            const счет_фактура = обновить.payload;

            const invoice_id = счет_фактура.invoice_id;
            const amount = счет_фактура.amount;
            const asset = счет_фактура.asset;
            const status = счет_фактура.status;

            // ЛОГИКА ОБНОВЛЕНИЯ БАЛАНСА В БАЗЕ ДАННЫХ
            // payload — это строка, которую вы передали при создании инвойса
            // (полезная нагрузка) с ID пользователя или заказа.
            const payload = счет_фактура.payload;
            console.log(`Инвойс ${invoice_id} оплачен! Пользователь: ${payload}, Сумма: ${amount} ${asset}`);

            // TODO: Задача: Напишите запрос sql в вашу базу данных, чтобы обновить баланс
            // Пример: await db.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, payload]);
        }

        // Обязательно возвращаем статус 200 ОК, чтобы Crypto Bot не отправлял вебхук повторно
        return res.status(200).send('OK');
    } catch (ошибка) {
        console.ошибка('Ошибка обработки вебхука:', ошибка);
        return res.status(500).send('Server Error');
    }
}));

const PORT = process.env.PORT || 3000;
приложение.слушать(PORT, () => {
    console.лог(`Сервер запущен на порту ${PORT}`);
});

const ответ = await получить('https://pay.crypt.bot/api/createInvoice', {
    метод: 'POST',
    заголовки: {
        'Crypto-Pay-API-Token': CRYPTO_BOT_TOKEN,
        'Content-Type': 'application/json'
    },
    тело: JSON.stringify({
        asset: 'USDT',
        amount: '1.00',
        description: 'Оплата заказа в World Shop',
        payload: 'user_12345',
        paid_btn_name: 'openBot',
        paid_btn_url: 'https://t.me/world_shop_bot'
    })
});
