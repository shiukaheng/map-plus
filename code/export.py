import os

def export(dataframe, path="../exported/combined.csv"):
    # Make sure path folders exist, if not create them
    if not os.path.exists(os.path.dirname(path)):
        os.makedirs(os.path.dirname(path))
    # Export dataframe to csv
    dataframe.to_csv(path, index=False)
    print("Exported to: " + path)
    return