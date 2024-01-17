const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');



const app = express();
const port = process.env.PORT || 3001;

// Configuração do MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'a1b2c3d4',
  database: 'admproject',
});

// Conectar ao MySQL
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conectado ao MySQL');
  }
});

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Rota de registro



// ...

app.post('/register', async (req, res) => {
  console.log(req.body);
  const { username, password, name, email, birthday } = req.body.registration;
  const userId = uuid.v4();
  console.log(req.body.password);

  try {
    // Verifique se o e-mail já está registrado
    const emailCheckQuery = 'SELECT * FROM usersdb WHERE email = ?';
    db.query(emailCheckQuery, [email], async (emailCheckErr, emailCheckResults) => {
      if (emailCheckErr) {
        console.error(emailCheckErr);
        return res.status(500).json({ message: 'Erro ao verificar e-mail duplicado' });
      }

      // Se o e-mail já existe, retorne uma resposta de erro
      if (emailCheckResults.length > 0) {
        return res.status(400).json({ message: 'E-mail já registrado. Escolha outro e-mail.' });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10); // 10 é o número de rodadas de salto
        console.log(hashedPassword);

        db.query('INSERT INTO usersdb (username, password, name, email, birthday, id) VALUES (?, ?, ?, ?, ?, ?)', [username, hashedPassword, name, email, birthday, userId], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao registrar usuário' });
          } else {
            res.json({ message: 'Usuário registrado com sucesso!' });
          }
        });
      } catch (error) {
        console.error('Erro ao criar hash da senha:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
      }
    });
  } catch (error) {
    console.error('Erro ao processar o registro:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});


// Rota de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM usersdb WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao autenticar usuário' });
    } else if (results.length > 0) {
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const token = jwt.sign({ username }, 'seuSegredoJWT', { expiresIn: '1h' });
        console.log(token)
        res.json({ token });
      } else {
        res.status(401).json({ message: 'Credenciais inválidas' });
      }
    } else {
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
