import logging
from chatbot import chatbot,predict
from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.logger.setLevel(logging.INFO)
chatbot_ = chatbot()
chatbot_.launch()

@app.route('/chat', methods=['POST'])
def predict_():
    input_string = request.json['input']
    app.logger.info(input_string)
    print("hello")
    print(input_string)
    output_string = predict(chatbot_,input_string)
    app.logger.info(output_string)
    return jsonify({'output': output_string})

if __name__ == '__main__':
    app.run(port=5000)
