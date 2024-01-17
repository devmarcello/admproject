var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Rota de login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Consulta o banco de dados para verificar as credenciais
      db.query('SELECT * FROM usersdb WHERE username = ?', [username], async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Erro ao autenticar usuário' });
        }
  
        if (results.length > 0) {
          const user = results[0];
          const passwordMatch = await bcrypt.compare(password, user.password);
  
          if (passwordMatch) {
            // Credenciais corretas, gerar token JWT ou redirecionar para a página principal
            const token = jwt.sign({ username: user.username }, 'seuSegredoJWT', { expiresIn: '1h' });
            res.json({ success: true, token });
          } else {
            // Senha incorreta
            res.status(401).json({ success: false, message: 'Credenciais inválidas' });
          }
        } else {
          // Usuário não encontrado
          res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Erro ao autenticar usuário' });
    }
  });
  
  module.exports = router;


//Home 



//



