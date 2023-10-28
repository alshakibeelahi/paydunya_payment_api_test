const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const masterKey = 'i4y97T3G-9Hpt-jGIZ-3XqC-eFjwMSgwYun8';
const privateToken = 'test_private_uPpwmvA2DQbKoaEeVSLrKt85wC6';
const paydunyaToken = 'ozRX1bxEQs7oFfjDidvt';

app.get('/', (req, res) => {
  res.send(`
    <form action="/create_invoice" method="POST">
      <label for="total_amount">Total Amount:</label>
      <input type="number" id="total_amount" name="total_amount" required><br><br>
      <label for="description">Description:</label>
      <input type="text" id="description" name="description" required><br><br>
      <label for="store_name">Store Name:</label>
      <input type="text" id="store_name" name="store_name" required><br><br>
      <input type="submit" value="Create Invoice">
    </form>
  `);
});

app.post('/create_invoice', async (req, res) => {
  try {
    const { total_amount, description, store_name } = req.body;

    const response = await axios.post('https://app.paydunya.com/api/v1/checkout-invoice/create', {
      invoice: { total_amount, description },
      store: { name: store_name }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': masterKey,
        'PAYDUNYA-PRIVATE-KEY': privateToken,
        'PAYDUNYA-TOKEN': paydunyaToken
      }
    });

    console.log('Response:---->', response.data)
    const invoiceUrl = response.data.response_text.checkout_url;

    res.send(`
      <h2>Invoice Created Successfully</h2>
      <p>Total Amount: ${total_amount}</p>
      <p>Description: ${description}</p>
      <p>Store Name: ${store_name}</p>
      <p>Invoice URL: <a href="${invoiceUrl}" target="_blank">${invoiceUrl}</a></p>
    `);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/get_disbursement_invoice', async (req, res) => {
  try {
      const { account_alias, amount, withdraw_mode } = req.body;
      console.log('invoice details:---->', req.body)
      const response = await axios.post('https://app.paydunya.com/api/v1/disburse/get-invoice', {
          account_alias,
          amount,
          withdraw_mode
      }, {
          headers: {
              'Content-Type': 'application/json',
              'PAYDUNYA-MASTER-KEY': masterKey,
              'PAYDUNYA-PRIVATE-KEY': privateToken,
              'PAYDUNYA-TOKEN': paydunyaToken
          }
      });

      res.json(response.data);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = 3000;
app.listen(port, '192.168.195.88', () => {
  console.log(`Server is running on http://192.168.195.88:${port}`);
});
