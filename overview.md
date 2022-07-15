# Structure overview
Scraping -> Raw data -> Preprocessing (and deep features) -> Mapify -> Visualization

For each of the modules, just write functions. We will call these functions in main.py.

## Scraping
We will need to scrape the M+ website for its images as features / for visualization.
The entry point will be https://www.mplus.org.hk/en/collection/objects/<object-string>/, and we can (try) and use the entries in the dataset as an entry point to get the photos. But how the names in the datasets map to the URL is not exactly clear and will need experimentation.
- Make sure the scraped results are put in the ./scraped_images directory in the format of <id>.webp (or the format anyway)

## Raw data
This module is for loading the scraped data and dataset into a pandas dataframe, so they can be easily loaded in later stages.

## Preprocessing
Processing the raw data into the final format loaded into umap. Will require calling stuff from deep_features.py for crafting such features.

### Deep features
Mainly:
- Use word2vec / sentence2vec to transform textual features in the raw data into vectors
- Use autoencoder to vectorize images
- Take care to think about how we deal with arrays of data of arbritrary length

## Mapify
The code that actually transforms the high dimensional representation of the artwork into the spehrical map. Use the umap-learn module from PyPI and spherical space. Make sure to have a function for exporting maps, since we may choose different sets of features to do mapify our data to see how the look. Export them to the ./maps directory.R

## Visualization
Use some interactive python modules to visualize our maps preliminarily. Will need to bridge from there to the web dev part later on.