# Vanusa - Assistente de Voz

### Versão 0.0.1

Vanusa é uma assistente de voz poderosa e personalizável que se integra ao
Node-RED para possibilitar automações avançadas. Seja para controlar
dispositivos, processar comandos ou interagir com sistemas complexos, Vanusa
oferece uma interface natural, baseada em voz, para facilitar suas automações
pessoais ou profissionais. O programa possui comandos de voz nativos e
personalizáveis, além de permitir a adição de novos comandos ou a personalização
dos já existentes. Tudo isso enquanto roda discretamente em segundo plano no seu
computador, com uma interface gráfica para personalizar parâmetros como idioma,
sensibilidade de fala, motor de conversão de texto para voz (TTS) e
reconhecimento de fala (STT). Disponível em inglês e português, Vanusa é ativada
por palavras-chave, simplificando o seu dia a dia com comandos e automações
poderosas.

## 📌 Principais Funcionalidades

-  Conversão de fala em texto usando APIs poderosas (OpenAI, Picovoice,
   Whisper).
-  Resposta por voz com conversão de texto para áudio.
-  Interface gráfica para personalização completa.
-  Suporte a comandos de voz, com ações imediatas ou integração com Node-RED.
-  Suporte a idiomas: Português (PT-BR) e Inglês (EN).
-  Ativação por palavra-chave: "Vanusa" em PT-BR, "Lilian" em EN.

## 🔧 Instalação

Para instalar e rodar Vanusa:

1. [Clique aqui](https://github.com/Igor-Mac-Dev/teste/blob/main/installer.cmd)
   para baixar o instalador.
2. Abra o aplicativo e personalize as configurações através da interface
   gráfica. Quando estiver satisfeito, aperte "Salvar e Iniciar".

## 🚀 Rodando o Assistente

Uma vez instalado e configurado, Vanusa será executada em segundo plano,
aguardando sua palavra-chave para ativação e pronta para responder às suas
perguntas ou processar comandos.

### ♻️ Fluxo de uso

O programa roda em segundo plano, então é importante seguir o fluxo correto de
comandos de voz:

#### Modo Ocioso

Vanusa espera pela palavra de ativação; nesta etapa, ela também responde ao
comando "Repeat".

#### Modo Input

Vanusa grava o que é dito até que o usuário pare de falar, atinja o tempo limite
definido ou reconheça um comando específico (o comando só é reconhecido se mais
nada for dito; por exemplo, "Explain" só será reconhecido isoladamente).

#### Modo de Espera

Vanusa está gerando e reproduzindo a resposta ou executando o comando. Nessa
etapa, o programa não aceita novos inputs até a resposta terminar de ser
reproduzida, mas reconhece o comando "Cancel". Depois disso, volta ao Modo
Ocioso e o ciclo recomeça.

## 🗣 Comandos de Voz

Vanusa reconhece uma série de comandos que podem ser processados diretamente ou
enviados para o Node-RED:

### Comandos processados pelo assistente:

-  **Turn off**: Desliga o assistente de voz.
-  **Red**: Abre o Node-RED.
-  **Cancel**: Cancela a solicitação atual.
-  **Repeat**: Repete a última resposta.
-  **Repeat last**: Repete a penúltima resposta.
-  **Config**: Abre a interface gráfica para configurações.

### Comandos enviados ao Node-RED:

-  **Explain**: Abre um bloco de notas onde o usuário pode colar texto para
   explicação por voz.
-  **Translate**: Abre um bloco de notas para colar texto que será traduzido e
   falado.
-  **Code**: Solicita um código específico para ser processado.

## 🎛 Configurações Personalizáveis

Acesse a interface gráfica para configurar o assistente conforme preferir:

-  Idioma do assistente
-  Iniciar com o PC
-  Tempo de gravação
-  Seleção do microfone
-  Sensibilidade do reconhecimento de fala
-  Tempo de silêncio para encerrar a gravação
-  Motores de reconhecimento de fala (STT): Whisper ou Picovoice
-  Motores de texto para fala (TTS): Google, Picovoice ou OpenAI
-  Chave de API do Picovoice
-  Modelo de chat GPT
-  Especificações do assistente virtual
-  Histórico de mensagens
-  Temperatura do GPT
-  Máximo de tokens
-  Chave de API da OpenAI

> "Para quem não sabe onde quer ir, qualquer caminho serve." Sinta-se à vontade
> para usar as configurações padrão oferecidas pelo programa, mas não se esqueça
> de adicionar suas chaves de API.

### Customização:

No console da Picovoice, você pode criar suas próprias palavras-chave, comandos
de voz e vocabulários personalizados para os motores de STT. Substitua os
arquivos na pasta "Assets" pelos que você criou, mantendo os mesmos nomes dos
arquivos. No caso dos comandos (Rhino), você não precisa substituir os arquivos
existentes; basta adicionar os arquivos na pasta referente ao seu idioma. Vanusa
reconhece os comandos e envia objetos contendo instruções
(`{intent: ~, [slot: ~, ...]}`) para o Node-RED, onde as ações desencadeadas
podem ser automatizadas manualmente.

## 💻 Suporte e Contribuições

Este projeto está em sua versão inicial (0.0.1). Feedbacks e contribuições são
bem-vindos! Se encontrar algum problema ou tiver sugestões, sinta-se à vontade
para abrir uma _issue_ ou enviar um _pull request_.

**Licença**: Este projeto é licenciado sob a AGPL-3.0.
