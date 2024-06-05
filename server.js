const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.use(bodyParser.json());
app.use(cors());

app.post('/api/contact', (req, res) => {
  console.log('Recebendo dados do formulário:', req.body);
  const { name, email, phone, message } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Novo contato do formulário',
    text: `Nome: ${name}\nEmail: ${email}\nTelefone: ${phone}\nMensagem: ${message}`
  };

  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmação de Recebimento de Contato',
    text: `Olá ${name},\n\nRecebI sua mensagem:\n\n"${message}"\n\nEntrarei em contato assim que possivel.\n\nAtenciosamente,\nAndré Luís Said Domingues\nAnalista Desenvolvedor Senior`
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
      res.status(200).json({ message: 'Emails enviados com sucesso!', info: info.response });
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
