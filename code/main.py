import raw_data
import preprocessing
import deep_features
import pandas as pd
import numpy as np
import mapify
import export

pd.set_option('display.max_columns', None)
objects, constituents = raw_data.load_dataset() # Load / download the raw data

flattened, filtered = preprocessing.preprocess(objects, constituents) # Preprocess the raw data for use in the UMAP algorithm
# Takes around a minute on macbook pro. Sit down and relax!

x, y, z = mapify.mapify(flattened) # Mapify the preprocessed data
# 1 minute again.

# Combine the x, y, z coordinates into a single array
combined = filtered.copy()
combined["mapify_x"] = x
combined["mapify_y"] = y
combined["mapify_z"] = z

export.export_json(combined) # Export the combined data to a json file