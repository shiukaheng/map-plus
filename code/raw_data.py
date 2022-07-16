# For combining the scraped web data and data from the M+ dataset into one accessible form, and checking their existence and downloading them if necessary.
import os
import shutil
import scraping
import pandas as pd

def check_files():
    # See if df = "../dataset/collection-data-master/objects.csv" exists:
    if os.path.exists("../dataset/collection-data-master/objects.csv") and os.path.exists("../dataset/collection-data-master/constituents.csv"):
        print("M+ dataset found.")
    else:
        print("M+ dataset not found. Fetching dataset.")
        scraping.fetch_dataset()
    # See if there are any files in "../scraped_images/":
    if os.listdir("../scraped_images/"):
        print("Scraped images found.")
    else:
        print("Scraped images not found. Fetching images.")
        # scraping.fetch_images()

def load_dataset():
    # Load the M+ dataset into a pandas dataframe and append a new column that includes an image of the artwork.
    # Potential optimization is to serialize this and load it from a file after it was run once, to reduce later load times (WARNING: over-optimization)
    check_files()
    objects = pd.read_csv("../dataset/collection-data-master/objects.csv")
    constituents = pd.read_csv("../dataset/collection-data-master/constituents.csv")
    # TODO: Later we will need to add a column for the image of the artwork.
    return objects, constituents