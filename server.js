const express = require('express');
const crypto = require('crypto');
const app = express();

// Обязательно используем express.json() или express.raw() для получения тела запроса
app.use(express.json());

// Ваш токен от Crypto Bot (лучше хранить в переменных окружения process.env.CRYPTO_BOT_TOKEN)
const CRYPTO_BOT_TOKEN = process.env.CRYPTO_BOT_TOKEN;

// Функция проверки подписи вебхука Crypto Bot (рекомендуется для безопасности)
function verifyCryptoBotSignature(req) {
    const cryptoBotSignature = req.header('crypto-pay-api-signature');
    if (!cryptoBotSignature) return false;

    const secret = crypto.createHash('sha256').update(CRYPTO_BOT_TOKEN).digest();
    const checkString = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

    return hmac === cryptoBotSignature;
}

// Эндпоинт, который будет принимать вебхуки от Crypto Bot
app.post('/webhook', async (req, res) => {
    try {
        const update = req.body;

        // Проверяем тип события: нас интересует успешная оплата инвойса (invoice_paid)
        if (update && update.update_type === 'invoice_paid') {
            const invoice = update.payload;

            const invoiceId = invoice.invoice_id;
            const amount = invoice.amount; // Сумма платежа
            const asset = invoice.asset;   // Валюта (например, USDT)
            const payload = invoice.payload; // Здесь вы можете передавать ID пользователя (например, его Telegram ID)

            // ЛОГИКА ОБНОВЛЕНИЯ БАЛАНСА В БАЗЕ ДАННЫХ:
            // payload — это строка, которую вы указали при создании инвойса (например, ID покупателя)
            if (payload) {
                console.log(`Инвойс ${invoiceId} успешно оплачен пользователем ${payload}. Сумма: ${amount} ${asset}`);
                
                // TODO: Напишите здесь запрос к вашей базе данных, чтобы пополнить баланс пользователя:
                // Пример: await db.query('UPDATE users SET balance = balance + $1 WHERE telegram_id = $2', [amount, payload]);
            }
        }

        // Обязательно возвращаем статус 200 OK, чтобы Crypto Bot понял, что вебхук доставлен
        return res.status(200).send('OK');
    } catch (error) {
        console.error('Ошибка обработки вебхука:', error);
        return.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
