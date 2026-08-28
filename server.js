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
// ==========================================
// FUNÇÕES DO PIX (Copie e cole no seu server.js)
// ==========================================

// Variável para guardar o Pix na memória do servidor
const fs = require('fs');
const path = require('path');

// Caminho do arquivo onde o Pix será salvo permanentemente no servidor
const arquivoPixPath = path.join(__dirname, 'pix.json');

// Função para ler a configuração do Pix salva no arquivo
function lerConfigPix() {
    try {
        if (fs.existsSync(arquivoPixPath)) {
            const dados = fs.readFileSync(arquivoPixPath, 'utf8');
            return JSON.parse(dados);
        }
    } catch (e) {
        console.error("Erro ao ler o arquivo Pix:", e);
    }
    // Retorno padrão caso o arquivo não exista
    return { chave: "", nome: "", banco: "", cidade: "Brasil" };
}

// Função para salvar a configuração do Pix no arquivo
function salvarConfigPix(config) {
    try {
        fs.writeFileSync(arquivoPixPath, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Erro ao salvar o arquivo Pix:", e);
        return false;
    }
}

// 1. Rota para o Admin SALVAR a Chave Pix (agora salva em arquivo permanente)
app.post('/api/pix', (req, res) => {
    const { chave, nome, banco, cidade } = req.body;
    
    const novaConfig = { 
        chave: chave || "", 
        nome: nome || "Loja", 
        banco: banco || "", 
        cidade: cidade || "Brasil" 
    };
    
    const salvo = salvarConfigPix(novaConfig);
    
    if (salvo) {
        console.log("Chave Pix salva permanentemente:", novaConfig);
        res.json({ sucesso: true });
    } else {
        res.status(500).json({ sucesso: false, erro: "Não foi possível salvar o arquivo Pix." });
    }
});

// 2. Rota para o Cliente ou Admin BUSCAR o Pix (lê do arquivo e gera o Payload com valor)
app.get('/api/pix', (req, res) => {
    const valorCompra = parseFloat(req.query.valor) || 0;
    const configuracaoPix = lerConfigPix();
    
    // Se a chave estiver vazia, retorna os dados vazios
    if (!configuracaoPix.chave) {
        return res.json({ chave: "", nome: "", banco: "", copiaECola: "" });
    }

    // Gera o código completo Copia e Cola com o valor exato da compra
    const copiaEColaComValor = gerarPayloadPix(
        configuracaoPix.chave, 
        configuraPixSegura(configuracaoPix.nome), 
        configuracaoPix.cidade || "Brasil", 
        valorCompra
    );

    res.json({
        ...configuracaoPix,
        copiaECola: copiaEColaComValor
    });
});

// Função auxiliar para evitar erros caso o nome venha vazio
function configuraPixSegura(texto) {
    return texto && texto.trim() !== "" ? texto : "Loja";
}
