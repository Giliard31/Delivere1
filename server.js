const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Caminho do arquivo Pix permanente no servidor
const arquivoPixPath = path.join(__dirname, 'pix.json');

// Funções de leitura e salvamento persistente do Pix
function lerConfigPix() {
    try {
        if (fs.existsSync(arquivoPixPath)) {
            const dados = fs.readFileSync(arquivoPixPath, 'utf8');
            return JSON.parse(dados);
        }
    } catch (e) {
        console.error("Erro ao ler arquivo Pix:", e);
    }
    return { chave: "", nome: "", banco: "", cidade: "Brasil" };
}

function salvarConfigPix(config) {
    try {
        fs.writeFileSync(arquivoPixPath, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Erro ao salvar arquivo Pix:", e);
        return false;
    }
}

// Função padrão para gerar o Payload do Pix (Copia e Cola com valor)
function gerarPayloadPix(chave, nome, cidade, valor) {
    // Função simplificada/padrão de payload Pix do Banco Central
    // Se você já tem a sua função geradora no server.js, pode manter a sua.
    const formatarCampo = (id, valorCampo) => {
        const tamanho = String(valorCampo.length).padStart(2, '0');
        return `${id}${tamanho}${valorCampo}`;
    };

    const nomeFormatado = nome.substring(0, 25);
    const cidadeFormatada = cidade.substring(0, 15);
    const valorFormatado = Number(valor).toFixed(2);

    let payload = "000201";
    let contaInfo = formatarCampo("00", "BR.GOV.BCB.PIX") + formatarCampo("01", chave);
    payload += formatarCampo("26", contaInfo);
    payload += "52040000"; // MCC
    payload += "5303986";  // Moeda BRL
    if (valor > 0) {
        payload += formatarCampo("54", valorFormatado);
    }
    payload += "5802BR";
    payload += formatarCampo("59", nomeFormatado);
    payload += formatarCampo("60", cidadeFormatada);
    payload += "62070503***";
    payload += "6304"; // CRC16 placeholder

    return payload;
}

// --- ROTAS DO PIX ---

// Salvar Chave Pix (Admin)
app.post('/api/pix', (req, res) => {
    const { chave, nome, banco, cidade } = req.body;
    
    if (!chave) {
        return res.status(400).json({ sucesso: false, erro: "Chave Pix obrigatória." });
    }

    const novaConfig = {
        chave: chave.trim(),
        nome: nome ? nome.trim() : "Loja",
        banco: banco ? banco.trim() : "",
        cidade: cidade ? cidade.trim() : "Brasil"
    };

    const salvo = salvarConfigPix(novaConfig);
    if (salvo) {
        console.log("-> PIX SALVO COM SUCESSO NO SERVIDOR:", novaConfig);
        res.json({ sucesso: true });
    } else {
        res.status(500).json({ sucesso: false, erro: "Erro ao salvar arquivo Pix." });
    }
});

// Consultar Chave Pix (Cliente / Admin) com valor embutido
app.get('/api/pix', (req, res) => {
    const valorCompra = parseFloat(req.query.valor) || 0;
    const config = lerConfigPix();

    if (!config.chave) {
        return res.json({ chave: "", nome: "", banco: "", cidade: "", copiaECola: "" });
    }

    const copiaEColaComValor = gerarPayloadPix(
        config.chave,
        config.nome,
        config.cidade || "Brasil",
        valorCompra
    );

    res.json({
        ...config,
        copiaECola: copiaEColaComValor
    });
});

// (Mantenha aqui embaixo as suas outras rotas de produtos, usuários e pedidos que você já usa no projeto)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});        email: email.toLowerCase(),
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
// Variável global para armazenar a configuração do Pix na memória do servidor
let configuracaoPix = {
    chave: "",
    nome: "",
    banco: "",
    cidade: "Brasil"
};

// Rota para o Admin SALVAR a Chave Pix
app.post('/api/pix', (req, res) => {
    const { chave, nome, banco, cidade } = req.body;
    
    configuracaoPix = { 
        chave: chave || "", 
        nome: nome || "Loja", 
        banco: banco || "", 
        cidade: cidade || "Brasil" 
    };
    
    console.log("Chave Pix salva na memória:", configuracaoPix);
    res.json({ sucesso: true });
});

// Rota para o Cliente ou Admin BUSCAR o Pix (com o valor da compra embutido)
app.get('/api/pix', (req, res) => {
    const valorCompra = parseFloat(req.query.valor) || 0;
    
    // Se não houver chave cadastrada, retorna vazio
    if (!configuracaoPix.chave) {
        return res.json({ chave: "", nome: "", banco: "", cidade: "", copiaECola: "" });
    }

    // Gera o código Copia e Cola padrão do Banco Central com o valor
    const copiaEColaComValor = gerarPayloadPix(
        configuracaoPix.chave, 
        configuracaoPix.nome || "Loja", 
        configuracaoPix.cidade || "Brasil", 
        valorCompra
    );

    res.json({
        ...configuracaoPix,
        copiaECola: copiaEColaComValor
    });
});
