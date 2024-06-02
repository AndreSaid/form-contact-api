const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '*****' : 'Not Set');

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
  console.log('Recebendo dados do formulário:', req.body);
  const { name, email, message } = req.body;

  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Novo contato do formulário',
    text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`
  };

  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recebemos seu contato',
    text: `Olá ${name},\n\nRecebemos sua mensagem:\n\n"${message}"\n\nEntraremos em contato em breve.\n\nAtenciosamente,\nSua Empresa`
  };

  transporter.sendMail(adminMailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar email ao administrador:', error);
      return res.status(500).json({ error: error.toString() });
    }
    console.log('Email enviado ao administrador:', info.response);

    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error('Erro ao enviar email ao usuário:', error);
        return res.status(500).json({ error: error.toString() });
      }
      console.log('Email enviado ao usuário:', info.response);
      res.status(200).json({ message: 'Email enviado com sucesso!', info: info.response });
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
