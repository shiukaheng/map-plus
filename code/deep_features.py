# This file will mainly export functions that allow us to interpret textual / image data into vectors that can be fed into umap.
# It will probably involve either tensorflow and / or sci-kit. We can then call these functions in preprocessing.py so it doesn't get too messy there.

# Image vectorization (via convolutional autoencoder, trained specifically on the M+ dataset)

def encode_image(image):
    raise NotImplementedError

# Sentence vectorization (via siamese bert)

def encode_sentence(sentence):
    raise NotImplementedError

# Word vectorization (via word2vec)

def encode_words(word):
    raise NotImplementedError