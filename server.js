const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do middleware
app.use(bodyParser.json());
app.use(cors());

// Configuração do Nodemailer para usar Hotmail/Outlook
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER, // Usa variável de ambiente
    pass: process.env.EMAIL_PASS  // Usa variável de ambiente
  }
});

// Rota para receber o formulário de contato
app.post('/api/contact', (req, res) => {
  console.log('Recebendo dados do formulário:', req.body); // Log dos dados recebidos
  const { name, email, message } = req.body;
  
  // Opções do e-mail que será enviado ao administrador
  const adminMailOptions = {
    from: process.env.EMAIL_USER, // Usa o email autenticado
    to: process.env.EMAIL_USER, // Envia para o administrador
    subject: 'Novo contato do formulário',
    text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`
  };

  // Opções do e-mail que será enviado ao usuário
  const userMailOptions = {
    from: process.env.EMAIL_USER, // Usa o email autenticado
    to: email, // Envia para o usuário
    subject: 'Recebemos seu contato',
    text: `Olá ${name},\n\nRecebemos sua mensagem:\n\n"${message}"\n\nEntraremos em contato em breve.\n\nAtenciosamente,\nSua Empresa`
  };

  // Envia o e-mail ao administrador
  transporter.sendMail(adminMailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar email ao administrador:', error); // Log do erro detalhado
      return res.status(500).json({ error: error.toString() }); // Retornar resposta em JSON
    }
    console.log('Email enviado ao administrador:', info.response); // Log do sucesso

    // Envia o e-mail ao usuário
    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error('Erro ao enviar email ao usuário:', error); // Log do erro detalhado
        return res.status(500).json({ error: error.toString() }); // Retornar resposta em JSON
      }
      console.log('Email enviado ao usuário:', info.response); // Log do sucesso
      res.status(200).json({ message: 'Email enviado com sucesso!', info: info.response }); // Retornar resposta em JSON
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
