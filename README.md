# 📸 Clique & Poesia — Portal de Galeria e Seleção de Fotos

Landing Page independente, elegante e funcional baseada na identidade visual de **[Clique & Poesia](https://cliqueepoesia.vercel.app/)**, desenvolvida especialmente para compartilhar fotos com clientes (neste exemplo: **Fernanda — Meus 15 Anos**), permitindo visualizar em tela cheia, favoritar/selecionar fotos e fazer o download em alta resolução.

---

## ✨ Funcionalidades

1. **Design System Fiel ao Clique & Poesia**:
   - Paleta de cores oficial: Fundos botânicos escuros (`#0D130C`, `#151E14`), linho/creme suave (`#F2EDE3`) e dourados nobres (`#D6B985`, `#E4CDA1`).
   - Tipografia integrada via Adobe Fonts (Typekit) e Google Fonts (`Cormorant Garamond`, `Omnes`, `Canvas Script`).

2. **Visualização Completa (Lightbox Imersivo)**:
   - Clique em qualquer foto para abrir em tela cheia.
   - Navegação por teclado (setas esquerda/direita, ESC), toques na tela ou botões laterais.
   - Botão para favoritar e botão para baixar a foto individual direto do lightbox.

3. **Seleção Inteligente**:
   - Marque as fotos favoritas com 1 clique no coração/check.
   - A seleção é salva automaticamente no navegador (`localStorage`), de modo que o cliente não perde o que escolheu se fechar ou recarregar a página.
   - Aba para alternar entre "Todas as Fotos" e "Apenas Selecionadas".

4. **Downloads Flexíveis**:
   - **Download individual**: Cada foto tem seu botão de download de alta qualidade.
   - **Download em lote (.ZIP)**: Compactação direta no navegador das fotos selecionadas com barra de progresso visual.
   - **Download sequencial automático**: Fallback inteligente para garantir que todas as fotos selecionadas sejam salvas.

5. **Integração com WhatsApp e Códigos**:
   - **Enviar no WhatsApp**: Botão que abre o WhatsApp com a mensagem formatada contendo os nomes de todos os arquivos selecionados para o fotógrafo montar o álbum.
   - **Copiar Lista**: Copia os nomes dos arquivos (ex: `DSC01026, DSC01071...`) para a área de transferência.

---

## 🚀 Como Usar

### Opção 1: Usar Localmente com Servidor Automático (Recomendado)
Dê um duplo clique no arquivo:
```bash
iniciar-galeria.bat
```
ou no terminal:
```bash
node server.js
```
A página abrirá automaticamente no seu navegador em `http://localhost:3000`.

### Opção 2: Abrir Diretamente no Navegador
Basta dar dois cliques no arquivo **`index.html`**!

---

## 🔄 Como Atualizar para Novos Clientes ou Mais Fotos

1. Coloque os novos arquivos `.jpg` ou `.png` na pasta.
2. Execute no terminal:
   ```bash
   node generate-gallery.js
   ```
3. O script atualizará automaticamente o arquivo `gallery-data.js` com todos os novos arquivos ordenados!
4. Para alterar o nome do cliente ou o WhatsApp da Clique & Poesia, basta editar o início do arquivo `gallery-data.js`.
