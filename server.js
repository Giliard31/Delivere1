const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' })); // Permite receber imagens em base64
app.use(cors());

// Banco de dados em memória temporário no servidor
let produtosServidor = [];

// Rota para pegar os produtos
app.get('/api/produtos', (req, res) => {
    res.json(produtosServidor);
});

// Rota para cadastrar um produto
app.post('/api/produtos', (req, res) => {
    const novoProduto = {
        id: Date.now(),
        nome: req.body.nome,
        preco: req.body.preco,
        foto: req.body.foto,
        ativo: true
    };
    produtosServidor.push(novoProduto);
    res.json({ sucesso: true, produto: novoProduto });
});

// Rota para alternar status ou excluir (simplificada)
app.delete('/api/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    produtosServidor = produtosServidor.filter(p => p.id !== id);
    res.json({ sucesso: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
