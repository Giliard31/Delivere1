const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Bancos de dados em memória do servidor
let produtosServidor = [];
let pedidosServidor = [];
let usuariosServidor = [];

// Rotas de Produtos
app.get('/api/produtos', (req, res) => {
    res.json(produtosServidor);
});

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

app.delete('/api/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    produtosServidor = produtosServidor.filter(p => p.id !== id);
    res.json({ sucesso: true });
});

// Rotas de Pedidos
app.get('/api/pedidos', (req, res) => {
    res.json(pedidosServidor);
});

app.post('/api/pedidos', (req, res) => {
    const novoPedido = {
        id: Date.now(),
        cliente: req.body.cliente,
        endereco: req.body.endereco,
        itens: req.body.itens,
        total: req.body.total,
        pagamento: req.body.pagamento,
        troco: req.body.troco,
        status: 'Pendente', // Pendente, Em Preparo, Saiu para Entrega, Concluído
        tempoPreparo: 'A definir'
    };
    pedidosServidor.push(novoPedido);
    res.json({ sucesso: true, pedido: novoPedido });
});

app.put('/api/pedidos/:id', (req, res) => {
    const id = Number(req.params.id);
    const { status, tempoPreparo } = req.body;
    
    pedidosServidor = pedidosServidor.map(p => {
        if(p.id === id) {
            return {
                ...p,
                status: status || p.status,
                tempoPreparo: tempoPreparo !== undefined ? tempoPreparo : p.tempoPreparo
            };
        }
        return p;
    });
    res.json({ sucesso: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
