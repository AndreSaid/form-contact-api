const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.json());
app.use(cors());

app.post('/api/contact', (req, res) => {
  console.log('Recebendo dados do formulário:', req.body); // Log dos dados recebidos
  const { name, email, message } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const msg = {
    to: process.env.EMAIL_USER, // Seu próprio email
    from: process.env.EMAIL_USER,
    subject: 'Novo contato do formulário',
    text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email enviado');
      res.status(200).json({ message: 'Email enviado com sucesso!' });
    })
    .catch(error => {
      console.error('Erro ao enviar email:', error);
      res.status(500).json({ error: error.toString() });
    });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
