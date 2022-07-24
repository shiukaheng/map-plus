# Code to take in all vectorized features, and compress them into a globe
# Should probably use umap module with spherical space

import umap
import numpy as np

reducer = umap.UMAP(output_metric='haversine', n_neighbors=50) # Haversine for spherical distance

def mapify(vectorized_artworks):
    embedding = reducer.fit_transform(vectorized_artworks)
    x = np.sin(embedding[:, 0]) * np.cos(embedding[:, 1])
    y = np.sin(embedding[:, 0]) * np.sin(embedding[:, 1])
    z = np.cos(embedding[:, 0])
    return x, y, z