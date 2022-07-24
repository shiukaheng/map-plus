# This file will mainly export functions that allow us to interpret textual / image data into vectors that can be fed into umap.
# Most of our embedding functions are (luckily) provided by a high level interface from the sentence-transformer library. We can then call these functions in preprocessing.py so it doesn't get too messy there.

from sentence_transformers import SentenceTransformer, util
from PIL import Image
from typing import Literal
import pandas as pd
import functools

roberta = SentenceTransformer("all-distilroberta-v1")
# clip = SentenceTransformer("clip-ViT-B-32-multilingual-v1")

MODEL = Literal["roberta", "clip"]

# def map_memoized(func, series):
#     # The encode function of both clip and roberta allows inputting a list of sentences or a list of images.
#     # However, (I speculate) that repeated elements will be run through the model multiple times.
#     # Thus here we will get all the unique values of the list, run them through the model, then map the results back to the original list.

#     # First, get the unique values of the series in a list.
#     # Check if it is actually a series first:
#     if isinstance(series, pd.Series):
#         unique_values = series.unique().tolist()
#     elif isinstance(series, list):
#         # We can do it similarly by turning it into a set and then back into a list.
#         unique_values = list(set(series))
#     else:
#         raise ValueError("Invalid input. Must be a pandas series or a list.")

#     # Then, run the model on the unique values.
#     encoded_values = func(unique_values)

#     # Merge these to a dictionary.
#     encoded_dict = dict(zip(unique_values, encoded_values))

#     # Then, map the results back to the original series.
#     print(encoded_dict)
#     if isinstance(series, pd.Series):
#         return series.map(lambda x: encoded_dict[x])
#     elif isinstance(series, list):
#         return [encoded_dict[x] for x in series]


# Image vectorization (via convolutional autoencoder, trained specifically on the M+ dataset)

def encode_image(image):
    return roberta.encode(image)

# Sentence vectorization (via siamese bert)

def encode_sentences(sentences, model="roberta"):
    return _encode_sentences(tuple(sentences), model)

@functools.lru_cache(maxsize=512)
def _encode_sentences(sentence, model:MODEL="roberta"):
    if model == "roberta":
        encoder = roberta
    elif model == "clip":
        encoder = clip
    else:
        raise ValueError("Invalid model. Must be either 'roberta' or 'clip'.")
    # Use map_memoized if input is a list
    # print("Encoding sentence:", sentence)
    if isinstance(sentence, list):
        return encoder.encode(sentence)
    # Otherwise, just run the encoder on the sentence
    else:
        return encoder.encode(sentence)

def encode_sentence(sentence, model="roberta"):
    return _encode_sentences(sentence, model)

# Lets not try word embeddings for now, as sentence embeddings allow for more flexibility.
# def encode_words(word):
#     raise NotImplementedError