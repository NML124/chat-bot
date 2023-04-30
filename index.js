
const openai = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const chatbot = new openai.OpenAIApi( new openai.Configuration({
    apiKey: process.env.API_KEY
}))


const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 21;
limit_messages=0;
const role_chat_bot ="Tu es une IA implementée dans une bibliothèque numérique et tu es sensé aidé les personnes concernant les livres de la bibliothèque. Tu réponds le plus simplement et concisément possible. Tu ne réponds aux questions qui ne sont pas axé à ta mission d'IA de bibliothèque numérique.";
messages_bot=[
  {role:"system",content:role_chat_bot}
];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

  socket.on('connection', (numberOfMessages) => {
    limit_messages= numberOfMessages;
  })
  socket.on('chat message', msg => {

    io.to(socket.id).emit('chat message', msg);
    messages_bot.push(
      {role:"user",content:msg}
    );
  if (limit_messages===0){
    io.to(socket.id).emit('end', "La version free est expirée. Attendez demain.");
  }else{
    chatbot.createChatCompletion({
      model:"gpt-3.5-turbo",
      messages:messages_bot,
  }).then(res =>{
    messages_bot.push(
      res.data.choices[0].message
    )
    console.log(res.data);
    io.to(socket.id).emit('chat message', res.data.choices[0].message.content);
  })
    limit_messages-=1;
  }
    

  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at ${port}/`);
});
