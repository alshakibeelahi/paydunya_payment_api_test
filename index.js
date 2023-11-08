const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//setting up i18next
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-node-fs-backend');

i18next
.use(Backend)
.use(i18nextMiddleware.LanguageDetector)
.init({
  backend: {
    loadPath: __dirname + '/locales/{{lng}}/translation.json',
  },
  detection: {
    order: ['header'],
    caches: ['cookie']
  },
  preload: ['en', 'fr'],
  fallbackLng: 'fr',
});
app.use(i18nextMiddleware.handle(i18next));

const masterKey = 'i4y97T3G-9Hpt-jGIZ-3XqC-eFjwMSgwYun8';
const privateToken = 'live_private_usA0HXYhGXCQEOp1JJcAw7qOwoM';
const paydunyaToken = 'ZouqPb1pKM85ni1WhJF2';

app.get('/disburse-', (req, res) => {
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
    //const { total_amount, description, store_name } = req.body;

    const response = await axios.post('https://app.paydunya.com/api/v1/checkout-invoice/create', {
      "invoice": { "total_amount": 5000, "description": "Chaussure VANS dernier modèle" }, "store": { "name": "Magasin le Choco" }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': masterKey,
        'PAYDUNYA-PRIVATE-KEY': privateToken,
        'PAYDUNYA-TOKEN': paydunyaToken
      }
    });

    console.log('Response:---->', response.data, masterKey, privateToken, paydunyaToken)

    res.json(response.data);
    // res.send(`
    //   <h2>Invoice Created Successfully</h2>
    //   <p>Total Amount: ${total_amount}</p>
    //   <p>Description: ${description}</p>
    //   <p>Store Name: ${store_name}</p>
    //   <p>Invoice URL: <a href="${invoiceUrl}" target="_blank">${invoiceUrl}</a></p>
    // `);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

//push api
app.get('/get_disbursement_invoice', async (req, res) => {
  try {
    console.log('invoice details:---->', req.body)
    const response = await axios.post('https://app.paydunya.com/api/v1/disburse/get-invoice', {
      account_alias: "771111111",
      amount: "1000",
      withdraw_mode: "orange-money-senegal"
    }, {
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': masterKey,
        'PAYDUNYA-PRIVATE-KEY': privateToken,
        'PAYDUNYA-TOKEN': paydunyaToken
      }
    });
    if(response.data.response_code==='4002'){
      console.log('Error:---->', response.data)
    }
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/', (req, res) => {
  console.log('Detected language:', req.language); // Check detected language
  res.send(req.t('welcome'));
});



const port = 12000;
app.listen(port, '192.168.10.18', () => {
  console.log(`Server is running on http://192.168.10.18:${port}`);
});
