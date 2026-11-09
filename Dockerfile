# ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
# ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
# ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
# * dev: Dev Soberano
# * GitHub: https://github.com/leandromemes

# Usa Ubuntu como imagem base
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Instala Node.js 20 e ferramentas necessárias (como o ImageMagick que instalamos no Windows)
RUN apt update && \
    apt upgrade -y && \
    apt install -y curl git imagemagick openssh-client ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt install -y nodejs && \
    npm install -g npm && \
    rm -rf /var/lib/apt/lists/*

# Diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia todos os arquivos do seu projeto para dentro do contêiner
COPY . .

# Instala as dependências e inicia o bot
CMD npm install && node index.js