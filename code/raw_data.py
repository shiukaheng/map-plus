# For combining the scraped web data and data from the M+ dataset into one accessible form

def load_dataset():
    # Load the M+ dataset into a pandas dataframe and append a new column that includes an image of the artwork.
    # Potential optimization is to serialize this and load it from a file after it was run once, to reduce later load times (WARNING: over-optimization)
    raise NotImplementedError