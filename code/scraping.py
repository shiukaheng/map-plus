# Since the dataset does not include images, we will need to resort to scraping the M+ site for this.
# Moreover, the artworks and the URLs shown on the site do not share ids or whatsoever so this is also a challenge.

import os
import re
import json
import shutil
import zipfile
import multiprocessing

import requests
from bs4 import BeautifulSoup
import pandas as pd

zip_url = "https://github.com/mplusmuseum/collection-data/archive/refs/heads/master.zip"
artemis_url = "https://github.com/optas/artemis/archive/refs/heads/master.zip"

def check_directory(directory):
    print("Checking if directory exists:", directory)
    if not os.path.exists(directory):
        os.makedirs(directory)
        print("Directory created:", directory)

def fetch_dataset(directory="./dataset/", temp_dir="./"):
    # Clone the M+ dataset from https://github.com/mplusmuseum/collection-data into the directory specified.
    # This will download the dataset and extract it into the directory.

    # Check if directory exists, if not create it recursively.
    check_directory(directory)

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

# Parsing functions
def alphanumeric(title):
    try: return re.sub(r'[^a-zA-Z\d\s-]', '', title)
    except: return None

def lowercase(title):
    try: return title.lower()
    except: return None

def replace_spaces(title):
    try: return title.replace(' ', "-")
    except: return None

def fetch_images(objno, title, directory="./dataset/images/"):
    # Format title
    title_parsed = alphanumeric(title)
    title_parsed = lowercase(title_parsed)
    title_parsed = replace_spaces(title_parsed)
    if title_parsed is None:
        return (objno, (False, "Invalid title"))

    # Format object number
    try: objno_parsed = objno.replace('/', '-')
    except: objno_parsed = objno
    objno_parsed = lowercase(objno_parsed)
    objno_parsed = alphanumeric(objno_parsed)
    if objno_parsed is None:
        return (objno, (False, "Invalid object number"))

    # Get image URL
    html_url = f"https://www.mplus.org.hk/en/collection/objects/{title_parsed}-{objno_parsed}/"
    html_page = requests.get(html_url, objno_parsed)
    soup = BeautifulSoup(html_page.content, 'html.parser')
    img_divs = soup.find('meta', {'data-hid': 'og:image'})
    try: image_url = img_divs.attrs['content']
    except: # Artwork link not found
        return (objno, (False, "Invalid image URL"))

    if image_url not in ("https://www.mplus.org.hk/_nuxt/img/share.23eb426.jpg", "https://www.mplus.org.hk/api/images/728/width-1200|format-jpeg/"):
    # Save image to directory
        r = requests.get(image_url, stream = True)
        if r.status_code == 200:
            r.raw.decode_content = True
            filepath = os.path.join(os.path.expanduser(directory), objno_parsed+'.png')
            with open(filepath, 'wb') as f:
                shutil.copyfileobj(r.raw, f)
            return (objno, (True, objno_parsed))
        else: return (objno, (False, "Invalid image URL"))
    # No image on the M+ website or artwork link not found
    else: return (objno, (False, "Invalid image URL"))

# if __name__ == '__main__':
#     # Get artworks
#     fetch_dataset()
#     df = pd.read_csv('./dataset/collection-data-master/objects.csv')
#     df2 = df[['objectNumber', 'title']]

#     # Scrape M+ website
#     check_directory('./dataset/images/')
#     num_workers = multiprocessing.cpu_count()
#     with multiprocessing.Pool(processes=num_workers) as pool:
#         results = dict(pool.starmap(fetch_images, df2.values))

#     # Update dataframe
#     for index, row in df.iterrows():
#         df.at[index, 'hasImage'] = results[row['objectNumber']][0]
#         df.at[index, 'imageName'] = results[row['objectNumber']][1]
#     df3 = df.loc[df['hasImage'] == True] # Filter artworks with no image

#     print(f"{df.shape[0] - df3.shape[0]} errors were encountered")