const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

const CRYPTO_BOT_TOKEN = process.env.CRYPTO_BOT_TOKEN;

function verifyCryptoBotSignature(req) {
    const cryptoBotSignature = req.header('crypto-pay-api-signature');
    if (!cryptoBotSignature) return false;

    const secret = crypto.createHash('sha256').update(CRYPTO_BOT_TOKEN).digest();
    const checkString = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

    return hmac === cryptoBotSignature;
}

app.post('/webhook', async (req, res) => {
    try {
        const update = req.body;

        if (update && update.update_type === 'invoice_paid') {
            const invoice = update.payload;

            const invoiceId = invoice.invoice_id;
            const amount = invoice.amount;
            const asset = invoice.asset;
            const payload = invoice.payload;

            console.log(`Инвойс ${invoiceId} оплачен! Пользователь: ${payload}, Сумма: ${amount} ${asset}`);
        }

        return res.status(200).send('OK');
    } catch (error) {
        console.error('Ошибка обработки вебхука:', error);
        return res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
