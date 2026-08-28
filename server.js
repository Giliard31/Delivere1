const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' })); // Permite fotos e dados maiores
app.use(cors());

// Memória do Servidor (Se preferir, você pode trocar por banco de dados depois)
let produtos = [];
let pedidos = [];
let usuarios = [];

// ================= ROTAS DE USUÁRIOS =================

// Listar todos os usuários (Usado no Login e no Painel Admin)
app.get('/api/usuarios', (req, res) => {
    res.json(usuarios);
});

// Cadastrar novo usuário (POST)
app.post('/api/usuarios', (req, res) => {
    const { nome, email, senha, endereco, desconto } = req.body;
    
    if (!email || !senha || !nome) {
        return res.status(400).json({ sucesso: false, erro: "Preencha todos os campos obrigatórios." });
    }

    // Verifica se já existe o e-mail cadastrado
    const existe = usuarios.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (existe) {
        return res.status(400).json({ sucesso: false, erro: "Este e-mail já está cadastrado!" });
    }

    const novoUsuario = {
        id: Date.now(),
        nome,
        email: email.toLowerCase(),
        senha,
        endereco: endereco || "Endereço não informado",
        desconto: desconto || 0
    };

    usuarios.push(novoUsuario);
    res.json({ sucesso: true, usuario: novoUsuario });
});

// Atualizar desconto individual do usuário
app.put('/api/usuarios/:id/desconto', (req, res) => {
    const { id } = req.params;
    const { desconto } = req.body;
    
    const usuario = usuarios.find(u => u.id == id);
    if (usuario) {
        usuario.desconto = desconto;
        res.json({ sucesso: true });
    } else {
        res.status(404).json({ sucesso: false, erro: "Usuário não encontrado" });
    }
});


// ================= ROTAS DE PRODUTOS =================

app.get('/api/produtos', (req, res) => {
    res.json(produtos);
});

app.post('/api/produtos', (req, res) => {
    const { nome, preco, foto } = req.body;
    const novoProduto = {
        id: Date.now(),
        nome,
        preco: parseFloat(preco),
        foto: foto || "",
        ativo: true
    };
    produtos.push(novoProduto);
    res.json({ sucesso: true, produto: novoProduto });
});

app.put('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { ativo } = req.body;
    const produto = produtos.find(p => p.id == id);
    if (produto) {
        if (ativo !== undefined) produto.ativo = ativo;
        res.json({ sucesso: true });
    } else {
        res.status(404).json({ sucesso: false, erro: "Produto não encontrado" });
    }
});

app.delete('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    produtos = produtos.filter(p => p.id != id);
    res.json({ sucesso: true });
});


// ================= ROTAS DE PEDIDOS =================

app.get('/api/pedidos', (req, res) => {
    res.json(pedidos);
});

app.post('/api/pedidos', (req, res) => {
    const novoPedido = {
        id: Date.now(),
        ...req.body
    };
    pedidos.push(novoPedido);
    res.json({ sucesso: true, pedido: novoPedido });
});

app.put('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const dadosAtualizados = req.body;
    
    const pedido = pedidos.find(p => p.id == id);
    if (pedido) {
        Object.assign(pedido, dadosAtualizados);
        res.json({ sucesso: true, pedido });
    } else {
        res.status(404).json({ sucesso: false, erro: "Pedido não encontrado" });
    }
});

app.delete('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const tamanhoAntes = pedidos.length;
    pedidos = pedidos.filter(p => p.id != id);
    
    if (pedidos.length < tamanhoAntes) {
        res.json({ sucesso: true });
    } else {
        res.status(404).json({ sucesso: false, erro: "Pedido não encontrado para exclusão" });
    }
});

// Inicialização do Servidor na porta do Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
