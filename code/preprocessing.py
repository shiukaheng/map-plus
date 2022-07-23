# This file is mainly used for processing the raw artwork data. The key is to take in all the original data and output the final features
# that will get thrown into the UMAP algorithm.

from typing import Literal
import pandas as pd
from pyparsing import col
import deep_features
from iteration_utilities import flatten
from sklearn.preprocessing import normalize
import numpy as np
from sklearn.preprocessing import StandardScaler, normalize, MinMaxScaler
import ast

EMBEDDING_LANGUAGE = Literal["eng", "zh-tc", "averaged"]
language_suffixes = {
    "eng": "",
    "zh-tc": "TC",
}

def preprocess(
    objects,
    constituents,
    embedding_language: EMBEDDING_LANGUAGE="eng",
    numerical_features=["beginDate", "endDate"],
    ml_string_features=["title", "medium", "creditLine"],
    identifying_features=["id"]
    ):

    expanded_ml_string_features = list(flatten([[f + s for f in ml_string_features] for s in language_suffixes.values()]))
    all_features = numerical_features + expanded_ml_string_features + identifying_features
    constituent_features = ["name", "roles", "gender", "nationality"]

    transformed_objects = pd.DataFrame()
    transformed_constituents = pd.DataFrame()

    # Stage 1: Filter NaN so all the processing works later
    objects = objects.dropna(subset=all_features)
    constituents = constituents.dropna(subset=constituent_features)

    # Stage 2A: Copy numerical features and identifying features
    for feature in numerical_features + identifying_features + ['constituents']:
        transformed_objects[feature] = objects[feature]

    # Stage 2B: Embed multilingual string features
    # TODO: Try priming the strings before embedding to give the encoder more information on what the strings are: e.g., "Paper" vs "Medium: Paper"
    if embedding_language != "averaged":
        suffix = language_suffixes[embedding_language]
        for feature in ml_string_features:
            sentences = objects[feature].tolist()
            embeddings = deep_features.encode_sentence(sentences)
            transformed_objects[feature+"Embedding"] = list(embeddings)

    if embedding_language == "averaged":
        raise NotImplementedError("Averaging not implemented yet")
    
    print(transformed_objects)
    print("")

    # TODO: Stage 2C: Embed multilang list of string features

    # Stage 2D: Integrate and embed constituents information
    transformed_constituents["id"] = constituents["id"]
    if embedding_language != "averaged":
        suffix = language_suffixes[embedding_language]
        for feature in constituent_features:
            sentences = constituents[feature].tolist()
            embeddings = deep_features.encode_sentence(sentences)
            transformed_constituents[feature+"Embedding"] = list(embeddings)
    
    print(transformed_constituents.head(10))

    for index, row in transformed_objects.head(1).iterrows():
        # try:
        row_constituent = ast.literal_eval(row['constituents'])
        constituent = row_constituent[0]
        embedding = transformed_constituents.loc[transformed_constituents['id'] == constituent].iloc[:, 1:].values.flatten().tolist()

        transformed_objects["constituentName"] = np.nan
        transformed_objects['constituentName'].astype('object')
        transformed_objects.at[index, "constituentName"] = [1,2]

    # except:
        print(f"Failed to get constituents information for {row['id']}")
    print("Transformed:")
    print(transformed_objects.head(10))
            
    # # Stage 3: Discard identifying features and flatten each row into a single vector
    # flattened = transformed_objects.drop(identifying_features, axis=1).values
    # columns = list(flattened.transpose()) # Transpose to get a list of columns
    # columns = [np.array(c.tolist()) for c in columns] # Fix nested np.arrays, so now all columns are np.arrays
    

    # # Normalize each column
    # normalized_columns = []
    # for c in columns:
    #     if c.ndim == 1:
    #         normalized_columns.append(
    #             normalize(c.reshape(-1, 1), norm='l2', axis=1)
    #         )
    #     else: # Here we are using dimension > 1 as a proxy that it is an embedding.. not ideal, but it works for now
    #         normalized_columns.append(
    #             normalize(c, norm='l2', axis=1)
    #         )

    # # - For numerical features, simply normalize
    # # - For embedded features, perform normalization, then PCA before vectorization
    # #   - Alternatively, perform normalization, then perform PCA after vectorization
    # # - For numerical features, simply normalize

    # # Stage 4: Flatten the columns into a single vector
    # flattened = np.concatenate(normalized_columns, axis=1)

    # return flattened, objects

preprocess(pd.read_csv("../dataset/collection-data-master/objects.csv").head(10), pd.read_csv("../dataset/collection-data-master/constituents.csv").head(300))