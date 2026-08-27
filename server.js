const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Banco de dados com produtos de exemplo já prontos para visualização
let produtosServidor = [
    {
        id: 1710000001,
        nome: "X-Burguer Especial",
        preco: 22.90,
        foto: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
        ativo: true
    },
    {
        id: 1710000002,
        nome: "Pizza Calabresa Família",
        preco: 49.90,
        foto: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80",
        ativo: true
    },
    {
        id: 1710000003,
        nome: "Batata Frita Grande",
        preco: 18.00,
        foto: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=300&q=80",
        ativo: false // Exemplo de item oculto/indisponível
    }
];

let pedidosServidor = [
    {
        id: 1710000099,
        cliente: "João Silva",
        endereco: "Rua das Flores, 123 - Centro (Ref: Próximo à praça)",
        itens: [{ id: 1, nome: "X-Burguer Especial", preco: 22.90, qtd: 2 }],
        total: 45.80,
        pagamento: "Pix",
        troco: "Não precisa",
        status: "Em Preparo",
        tempoPreparo: "25 min"
    }
];

app.get('/api/produtos', (req, res) => {
    res.json(produtosServidor);
});

app.post('/api/produtos', (req, res) => {
    const novoProduto = {
        id: Date.now(),
        nome: req.body.nome,
        preco: req.body.preco,
        foto: req.body.foto || "https://via.placeholder.com/150",
        ativo: true
    };
    produtosServidor.push(novoProduto);
    res.json({ sucesso: true, produto: novoProduto });
});

app.put('/api/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    produtosServidor = produtosServidor.map(p => {
        if(p.id === id) {
            return { ...p, ativo: req.body.ativo !== undefined ? req.body.ativo : p.ativo };
        }
        return p;
    });
    res.json({ sucesso: true });
});

app.delete('/api/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    produtosServidor = produtosServidor.filter(p => p.id !== id);
    res.json({ sucesso: true });
});

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
        status: 'Pendente',
        tempoPreparo: 'Aguardando confirmação'
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
