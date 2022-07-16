# This file is mainly used for processing the raw artwork data. The key is to take in all the original data and output the final features
# that will get thrown into the UMAP algorithm.

from typing import Literal
import pandas as pd

EMBEDDING_LANGUAGE = Literal["eng", "zh-tc", "averaged"]

def preprocess(objects, constituents, embedding_language: EMBEDDING_LANGUAGE="eng"):

    # Create a new blank dataframe to hold the processed data.
    processed_df = pd.DataFrame()

    # Copy all the items, but only with the id
    processed_df["id"] = objects["id"]

    # Copy all the required numerical columns as is: beginDate, endDate
    processed_df["beginDate"] = objects["beginDate"]
    processed_df["endDate"] = objects["endDate"]

    # Create literal column embeddings with language specified
    # The original columns include the following:
    # area, category, title, medium, creditLine, constituentsRole
    # There is also a seperate version in Chinese with the same column names but with TC appended to the end: e.g., area -> areaTC
