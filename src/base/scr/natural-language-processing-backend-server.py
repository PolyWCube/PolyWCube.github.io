from flask import Flask, request, jsonify
from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer

app = Flask(__name__)

chatbot = ChatBot('Alan')

trainer = ChatterBotCorpusTrainer(chatbot)
trainer.train('chatterbot.corpus.english')

@app.route('/get_response', methods=['POST'])
def get_response():
    user_message = request.json['message']
    bot_response = str(chatbot.get_response(user_message))
    return jsonify({'response': bot_response})

if __name__ == '__main__':
    app.run()