const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

console.log('EMAIL_USER:', process.env.EMAIL_USER); // Log para verificar a variável de ambiente
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '*****' : 'Not Set'); // Log para verificar a variável de ambiente
console.log('GMAIL_USER:', process.env.GMAIL_USER); // Log para verificar a variável de ambiente
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? '*****' : 'Not Set'); // Log para verificar a variável de ambiente

const transporterHotmail = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const transporterGmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
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

  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Novo contato do formulário',
    text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`
  };

  const adminMailOptionsGmail = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: 'Novo contato do formulário',
    text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`
  };

  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recebi seu contato',
    text: `Olá ${name},\n\Recebi sua mensagem:\n\n"${message}"\n\nEntrarei em contato em breve.\n\nAtenciosamente,\nAndré Luís Said Domingues`
  };

  let hotmailSent = false;
  let gmailSent = false;

  const sendUserEmail = () => {
    transporterHotmail.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error('Erro ao enviar email ao usuário pelo Hotmail:', error);
      } else {
        console.log('Email enviado ao usuário pelo Hotmail:', info.response);
      }

      transporterGmail.sendMail(userMailOptions, (error, info) => {
        if (error) {
          console.error('Erro ao enviar email ao usuário pelo Gmail:', error);
        } else {
          console.log('Email enviado ao usuário pelo Gmail:', info.response);
        }
      });
    });
  };

  transporterHotmail.sendMail(adminMailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar email ao administrador pelo Hotmail:', error);
    } else {
      hotmailSent = true;
      console.log('Email enviado ao administrador pelo Hotmail:', info.response);
    }

    transporterGmail.sendMail(adminMailOptionsGmail, (error, info) => {
      if (error) {
        console.error('Erro ao enviar email ao administrador pelo Gmail:', error);
      } else {
        gmailSent = true;
        console.log('Email enviado ao administrador pelo Gmail:', info.response);
      }

      if (hotmailSent || gmailSent) {
        sendUserEmail();
        return res.status(200).json({ message: 'Email enviado com sucesso!' });
      } else {
        return res.status(500).json({ error: 'Falha ao enviar email para ambos os provedores.' });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
