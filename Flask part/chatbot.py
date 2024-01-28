import tensorflow as tf
import unicodedata
import re
import numpy as np
from nltk.stem import WordNetLemmatizer
import pickle

from models import Encoder, Decoder, BahdanauAttention


class chatbot():
    def __init__(self):
        self.embedding_dim = 300
        self.units = 512
        self.vocab_quest = 546
        self.vocab_answ = 1956
        self.BATCH_SIZE = 64
        self.max_length_inp = 19
        self.max_length_targ = 254
        self.tokenizer_quest = None
        self.tokenizer_answ = None
        self.embedding_matrix_que = None
        self.embedding_matrix_answ = None
        self.encoder = None
        self.attention_layer = None
        self.decoder = None

    def unicode_to_ascii(self, s):
        return ''.join(c for c in unicodedata.normalize('NFD', s)
                       if unicodedata.category(c) != 'Mn')

    def preprocess_sentence(self, w):
        w = self.unicode_to_ascii(w.lower().strip())
        w = '<start> ' + w + ' <end>'
        return w

    def prepare_tokenz(self):

        with open('./tokinzers/tokenizers_ques.pickle', 'rb') as handle:
            self.tokenizer_quest = pickle.load(handle)

        # to load
        with open('./tokinzers/tokenizers_answ.pickle', 'rb') as handle:
            self.tokenizer_answ = pickle.load(handle)

    def prepare_glove(self):

        # Load the GloVe embeddings into a dictionary
        embeddings_index = {}
        with open('./glove.6B.300d.txt', 'r', encoding='utf-8') as f:
            for line in f:
                values = line.split()
                word = values[0]
                coefs = np.asarray(values[1:], dtype='float32')
                embeddings_index[word] = coefs

        # Create embedding matrix for questions
        self.embedding_matrix_que = np.zeros(
            (self.vocab_quest, 300))  # the first value is vocab_ques
        for word, i in self.tokenizer_quest.word_index.items():
            embedding_vector = embeddings_index.get(word)
            if embedding_vector is not None:
                self.embedding_matrix_que[i] = embedding_vector

        # Create embedding matrix for answers
        self.embedding_matrix_answ = np.zeros(
            (self.vocab_answ, 300))  # the second value is vocab_answ
        for word, i in self.tokenizer_answ.word_index.items():
            embedding_vector = embeddings_index.get(word)
            if embedding_vector is not None:
                self.embedding_matrix_answ[i] = embedding_vector

    def prepare_models(self):
        print("Preparing the encoder...")
        self.encoder = Encoder(self.vocab_quest, self.embedding_dim,
                               self.units, self.BATCH_SIZE, self.embedding_matrix_que)
        sample_input = tf.ones((64, 19))
        sample_hidden = self.encoder.initialize_hidden_state()
        sample_output, sample_hidden = self.encoder(
            sample_input, sample_hidden)
        self.encoder.load_weights(
            "./weights/encoder/encoder_512_ep450_bs64_cpu_100.h5")
        print("Encoder prepared :)")

        print("Preparing the bahandu layer...")
        self.attention_layer = BahdanauAttention(128)
        self.attention_layer(sample_hidden, sample_output)
        print("bahandu layer prepared :)")

        print("Preparing the decoder...")
        self.decoder = Decoder(self.vocab_answ, self.embedding_dim,
                               self.units, self.BATCH_SIZE, self.embedding_matrix_answ)
        self.decoder(tf.random.uniform((64, 1)), sample_hidden, sample_output)
        self.decoder.load_weights(
            "./weights/decoder/decoder_512_ep450_bs64_cpu100.h5")
        print("Decoder prepared :)")

    def launch(self):
        self.prepare_tokenz()
        self.prepare_glove()
        self.prepare_models()

    def remove_tags(self, sentence):
        return sentence.split("<start>")[-1].split("<end>")[0]

    def pipeline(self, text):
        text = re.sub(r"[^a-zA-Z]+", " ", text)
        text = text.lower()
        text = re.sub(r"I'm", "I am",  text)
        text = re.sub(r"he's", "he is",  text)
        text = re.sub(r"she's", "she is",  text)
        text = re.sub(r"it's", "it is",  text)
        text = re.sub(r"that's", "that is",  text)
        text = re.sub(r"what's", "that is",  text)
        text = re.sub(r"where's", "where is",  text)
        text = re.sub(r"how's", "how is",  text)
        text = re.sub(r"/'ll", " will",  text)
        text = re.sub(r"/'ve", " have",  text)
        text = re.sub(r"/'re", " are",  text)
        text = re.sub(r"/'d", " would",  text)
        text = re.sub(r"/'re", " are",  text)
        text = re.sub(r"won't", "will not",  text)
        text = re.sub(r"can't", "cannot",  text)
        text = re.sub(r"n't", " not",  text)
        text = re.sub(r"'til", "until",  text)
        text = re.sub(r"ensakh", "ensa khouribga",  text)
        text = re.sub(
            r"ecole national des sciences appliquées de khouribga", "ensa khouribga",  text)
        text = re.sub(r"\?", "?",  text)
        text = " ".join([WordNetLemmatizer().lemmatize(word)
                        for word in text.split()])
        text = " ".join(text.split())
        return text

    def evaluate(self, sentence):
        print(f"sentence before pipeline: {sentence}")
        sentence = self.pipeline(sentence)
        print(f"sentence before preprocess_sentence : {sentence}")
        sentence = self.preprocess_sentence(sentence)
        print(f"sentence before strip : {sentence}")
        sentence.strip()
        print(f"sentence after strip : {sentence}")
        inputs = [self.tokenizer_quest.word_index[i]
                  for i in sentence.split(" ")]
        inputs = tf.keras.preprocessing.sequence.pad_sequences([inputs],
                                                               maxlen=self.max_length_inp,
                                                               padding='post')
        inputs = tf.convert_to_tensor(inputs)

        result = ''

        hidden = [tf.zeros((1, self.units))]
        enc_out, enc_hidden = self.encoder(inputs, hidden)

        dec_hidden = enc_hidden
        dec_input = tf.expand_dims(
            [self.tokenizer_answ.word_index['<start>']], 0)

        for t in range(self.max_length_targ):
            predictions, dec_hidden, attention_weights = self.decoder(dec_input,
                                                                      dec_hidden,
                                                                      enc_out)

            # storing the attention weights to plot later on
            attention_weights = tf.reshape(attention_weights, (-1, ))

            predicted_id = tf.argmax(predictions[0]).numpy()

            result += self.tokenizer_answ.index_word[predicted_id] + ' '

            if self.tokenizer_answ.index_word[predicted_id] == '<end>':
                return self.remove_tags(result), self.remove_tags(sentence)

            # the predicted ID is fed back into the model
            dec_input = tf.expand_dims([predicted_id], 0)

        return self.remove_tags(result), self.remove_tags(sentence)


def predict(chatbot_, sentence):
    try:
        result, sentence = chatbot_.evaluate(sentence)
        return result
    except:
        result = """ sorry, I don't understand what you are trying to say. try asking a different question or reform your question."""
        return result
