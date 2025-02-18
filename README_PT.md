# Vanusa - Assistente de Voz

### Versão 0.0.1

Vanusa é uma assistente de voz personalizável, projetada para atuar como uma
secretária 24/7. Para isso, ele se integra ao Node-RED, permitindo automações.
Seja para controlar dispositivos, processar comandos ou interagir com sistemas
complexos, Vanusa oferece uma interface de voz natural para gerenciar suas
necessidades de automação pessoal ou profissional.

O programa conta com comandos de voz nativos e personalizáveis, permitindo
adicionar novos comandos ou modificar os existentes. Tudo isso rodando em
segundo plano no seu computador, com uma interface gráfica para personalizar
configurações como idioma, sensibilidade de fala, motores de texto-para-fala
(TTS) e reconhecimento de fala (STT). Disponível em Português e Inglês, Vanusa
simplifica suas tarefas diárias.

## 📌 Principais Funcionalidades

-  Conversão de fala para texto usando APIs poderosas (Picovoice, Whisper).
-  Respostas de voz com conversão de texto para áudio.
-  Totalmente personalizável por meio da interface gráfica.
-  Suporte a comandos de voz integrados ao Node-RED.
-  Suporte a idiomas: Português (PT-BR) e Inglês (EN).

## 🗣 Comandos de Voz

Vanusa reconhece os seguintes comandos que podem ser processados internamente ou
enviados para o Node-RED:

-  **Dorme**: Desliga o assistente.
-  **Vermelho**: Abre o Node-RED.
-  **Cancela**: Cancela a solicitação atual.
-  **Repete**: Repeate a última resposta.
-  **Repete Último**: Repeate a penúltima resposta.
-  **Configuração**: Abre a interface gráfica para configurações.
-  **Explica**: Abre um bloco de notas onde o usuário pode colar texto para ser
   explicado via voz.
-  **Traduz**: Abre um bloco de notas para colar texto que será traduzido e
   falado.
-  **Criar Áudio**: Abre um bloco de notas para receber texto e sintetizar como
   áudio.
-  **Transcrever**: Comando composto > Grava sua fala e gera um arquivo contendo
   o que foi dito em texto.
-  **Codigo**: Comando composto > Escuta sua solicitação e gera um arquivo com
   código correspondente.

(os arquivos gerados serão salvos na pasta "docummentos\Vanusa-files")

## 🔧 Instalação

Para instalar e rodar a Vanusa:

1. <a href="https://raw.githubusercontent.com/Igor-Mac-Dev/Vanusa-Voice_Assistant/refs/heads/main/installer.cmd" download>Clique
   aqui</a> para baixar o instalador e execute-o como administrador.
2. Abra o aplicativo e personalize as configurações pela interface gráfica.
   Quando estiver satisfeito, clique em "Salvar e Iniciar".
3. Os scripts de atualização e desinstalação estarão disponíveis na pasta
   'C:\Vanusa'.

## 🛠️ Configurações Personalizáveis

Acesse a interface gráfica para configurar o assistente conforme suas
preferências:

-  Idioma da assistenta
-  Iniciar com o PC: escolha se o programa deve iniciar automaticamente ao ligar
   o computador.
-  Tempo de gravação
-  Seleção do microfone
-  Sensibilidade do reconhecimento de fala
-  Tempo de silêncio para encerrar a gravação
-  Motores de reconhecimento de fala (STT): Whisper ou Picovoice
-  Motores de síntese de fala (TTS): Google, Picovoice ou OpenAI
-  Chave da API Picovoice
-  Modelo de chat GPT
-  Especificações do assistente: ajuste o comportamento virtual do assistente
-  Histórico de mensagens: defina o tamanho do histórico de conversação
-  Temperatura do GPT: ajuste a criatividade do modelo
-  Máximo de tokens: defina o limite de tokens da resposta do GPT
-  Chave da API OpenAI

> "Para quem não sabe onde quer ir, qualquer caminho serve." Sinta-se à vontade
> para usar as configurações padrão do programa, mas não se esqueça de adicionar
> suas chaves de API.

## 🚀 Executando o Assistente

Após instalado e configurado, a Vanusa roda em segundo plano, aguardando a
palavra-chave e pronto para responder suas perguntas ou processar comandos.

### Fluxo de Uso

#### 🎙️ Modo Ocioso

Vanusa aguarda a palavra-chave de ativação; neste estágio, também responde aos
comandos "Repetir" e "repetir último".

-  Palavra-chave padrão: "Vanusa" em PT-BR, "Scarlett" em EN.

#### 🎙️ Modo Gravação

Vanusa grava o que é dito até que o usuário pare de falar, o tempo limite seja
atingido ou um comando seja reconhecido.

#### 🎙️ Modo Espera

Vanusa gera e reproduz a resposta ou executa o comando. Durante esta fase, o
programa não aceita novas entradas até a resposta ser concluída, mas reconhece o
comando "Cancelar". Em seguida, retorna ao Modo Ocioso e o ciclo se repete.

## 🦏 Personalização de Comandos

No console do Picovoice, você pode criar suas próprias palavras-chave, comandos
de voz e vocabulários personalizados para os motores STT. Basta substituir os
arquivos de palavra chave (.ppn) na pasta "vanusa\assets\models" pelos criados
por você, mantendo os mesmos nomes. Para comandos (.rhn), basta adicionar os
arquivos na pasta "vanusa\assets\models\Rhino" do seu idioma. Vanusa reconhece
os comandos e envia
[objetos com instruções](https://www.youtube.com/watch?v=IPC_pCT9r1o&t=157s)
(`{intent: ..., slots: {...}}`) para o Node-RED, onde você pode automatizar
manualmente as ações ativadas pelos seus comandos personalizados.

### Flows do Node-RED

Implementar um flow existente no Node-RED é tão simples quanto arrasta-los Para
o flow da Vanusa, ou usar web-sockets para conecta-los. Se você fez um fluxo
para ser usado com a Vanusa, você pode compartilhar com a comunidade. Eu sugiro
a
[comunidade do Node-RED](https://nodered.org/community/voice-assistant-community/)
para encontrar e compartilhar seus fluxos. Por favor, informe também o formato
do commando experado pelo fluxo e informe que ele foi criado para ser usado com
a Vanusa.

### Porta do Node Red

Se você quiser definir uma porta diferente para o Node-RED, você pode editandar
o arquivo ecosystem.config.cjs e alterando o valor do argumento: "... -p _nova
porta_ " no objeto 'V-node-red'.

### Comandos Compostos

O detector de intenção do Picovoice não entende nada que não tenha sido
explicitamente programado, então foi adicionada uma funcionalidade para criar
comandos compostos, ou seja, comandos que podem conter palavras/números não
programados previamente no console do Picovoice. Para usá-los, siga um dos
caminhos:

1. Adicione o prefixo "C\_" ao seu arquivo .rhn (como em
   `./assets/models/Rhino/en/C_Code_en_windows_v3_0_0.rhn`). Assim, quando você
   chamar o comando, o Vanusa tocará o
   [bipe de comando](https://github.com/Igor-Mac-Dev/Vanusa-Voice_Assistant/blob/main/assets/beeps/cmd.wav)
   e ouvirá normalmente. Ao parar de falar, será adicionada uma propriedade
   `transcription` ao objeto `cmd.slots`, contendo a transcrição do que foi
   dito.
2. Adicione um arquivo na pasta "vanusa/assets/templates", nomeado com o mesmo
   nome da intenção (intent) do comando, seguido de um underscore e do código do
   idioma, como em "vanusa\assets\templates\código_pt.txt". Esse arquivo deve
   conter um template JSON, que será enviado para a API de completação, onde a
   resposta será formatada como um objeto pela IA e mesclada ao objeto
   `cmd.slots`.

## 🧠 LLM Local

Não implementei um LLM local porque a maioria das pessoas assim como eu não pode
pagar por isso, mas se você quiser, sinta-se à vontade para alterar o arquivo
.\src\OpenAI\completion.ts para fazer isso. Contanto que o módulo mantenha a
_não explicita mas presente_ interface atual, receba uma string e retorne a
conclusão, deve funcionar perfeitamente.

## 🐧 Versão Linux

Tentei fazer a Vanusa rodar com PM2 para melhorar compatibilidade, mas não
funcionou bem como eu esperava, o pm2 abre janelas do shell constantemente no
windows. Na versão final pretendo programar a Vanusa para rodar como um processo
no Windows, mas enquanto não faço issa, estou lançando com o PM2, para
posteriormente poder usar as configurações já existentes para lançar a versão de
Linux. Por enquanto, a programa não deve rodar diretamente no Linux,
principalmente por alguns códigos específicos do Windows, como a funcionalidade
de monitoramento de energia e os arquivos Picovoice, que são específicos para
cada sistema operacional e possuem limites de download.

## 💪 Suporte e Contribuições

Este projeto está em sua versão inicial (0.0.1). Feedback e contribuições são
bem-vindos! Caso encontre problemas ou tenha sugestões, fique à vontade para
abrir uma issue ou enviar um pull request.

**Licença**: Este projeto está licenciado sob AGPL-3.0. **Termos de uso**:
[Aqui](https://github.com/Igor-Mac-Dev/Vanusa-Voice_Assistant/blob/main/TERMS_PT.md).
