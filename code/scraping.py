# Since the dataset does not include images, we will need to resort to scraping the M+ site for this.
# Moreover, the artworks and the URLs shown on the site do not share ids or whatsoever so this is also a challenge.

import zipfile
import requests
import os
import shutil

zip_url = "https://github.com/mplusmuseum/collection-data/archive/refs/heads/master.zip"

def fetch_dataset(directory="../dataset/", temp_dir="./"):
    # Clone the M+ dataset from https://github.com/mplusmuseum/collection-data into the directory specified.
    # This will download the dataset and extract it into the directory.

    # Check if directory exists, if not create it recursively.
    print("Checking if directory exists:", directory)
    if not os.path.exists(directory):
        os.makedirs(directory)
        print("Directory created:", directory)

    # Download the zip file:
    print("Downloading zip file:", zip_url)
    r = requests.get(zip_url, stream=True)
    r.raise_for_status()

    # Save the zip file to a temporary directory:
    print("Saving zip file to temporary directory:", temp_dir)
    with open(temp_dir + "temp.zip", "wb") as f:
        shutil.copyfileobj(r.raw, f)

    # Unzip the zip file to the directory:
    print("Unzipping zip file to directory:", directory)
    with zipfile.ZipFile(temp_dir + "temp.zip", "r") as zip_ref:
        zip_ref.extractall(directory)

    print("M+ dataset fetching complete.")

def fetch_images():
    raise NotImplementedError()

artemis_url = "https://github.com/optas/artemis/archive/refs/heads/master.zip"

# def fetch_dataset(zip_url, directory="./unzipped", temp_dir="./"):
#     # Clone the M+ dataset from https://github.com/mplusmuseum/collection-data into the directory specified.
#     # This will download the dataset and extract it into the directory.

#     # Check if directory exists, if not create it recursively.
#     print("Checking if directory exists:", directory)
#     if not os.path.exists(directory):
#         os.makedirs(directory)
#         print("Directory created:", directory)

#     # Download the zip file:
#     print("Downloading zip file:", zip_url)
#     r = requests.get(zip_url, stream=True)
#     r.raise_for_status()

#     # Save the zip file to a temporary directory:
#     print("Saving zip file to temporary directory:", temp_dir)
#     with open(temp_dir + "temp.zip", "wb") as f:
#         shutil.copyfileobj(r.raw, f)

#     # Unzip the zip file to the directory:
#     print("Unzipping zip file to directory:", directory)
#     with zipfile.ZipFile(temp_dir + "temp.zip", "r") as zip_ref:
#         zip_ref.extractall(directory)

#     # Clean up the temporary zip file:
#     print("Cleaning up temporary zip file:", temp_dir + "temp.zip")
#     os.remove(temp_dir + "temp.zip")

#     print("Process complete.")
