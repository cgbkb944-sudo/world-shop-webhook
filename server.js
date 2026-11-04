const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.post('/webhook', async (req, res) => {
  console.log('Полный пейлоад:', JSON.stringify(req.body));
  try {
    const event = req.body;
    if (event && event.event === 'invoice_paid') {
      const paymentData = event.payload;
      const userId = paymentData.user_id;
      const amount = paymentData.amount;

      if (!userId || !amount) {
        return res.status(400).json({ error: 'Неверные данные платежа' });
      }

      const query = `
        UPDATE users
        SET balance = balance + $1
        WHERE telegram_id = $2
      `;

      await pool.query(query, [amount, userId]);
      console.log(`Баланс пользователя ${userId} успешно пополнен на ${amount}`);
      return res.status(200).json({ success: true });
    }
    return res.status(200).json({ status: 'ignored event' });
  } catch (error) {
    console.error('Ошибка при обработке вебхука:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running and connected to DB!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

