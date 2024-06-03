const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

console.log('EMAIL_USER:', process.env.EMAIL_USER); // Log para verificar a variável de ambiente
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '*****' : 'Not Set'); // Log para verificar a variável de ambiente

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.use(bodyParser.json());
app.use(cors());

app.post('/api/contact', (req, res) => {
  console.log('Recebendo dados do formulário:', req.body); // Log dos dados recebidos
  const { name, email, message } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Seu próprio email
    subject: 'Novo contato do formulário',
    text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar email:', error);
      return res.status(500).json({ error: error.toString() });
    }
    console.log('Email enviado:', info.response);
    res.status(200).json({ message: 'Email enviado com sucesso!', info: info.response });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
