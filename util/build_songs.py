import json
from pathlib import Path
from urllib.request import Request, urlopen

JSON_PATH = Path("pages", "songbook", "songs.json")
RELEASE_API_URL = "https://api.github.com/repos/f-klubben/sangbog/releases/latest"

def get_songbook(file_path):
    request = Request(
        RELEASE_API_URL,
        headers={"Accept": "application/vnd.github+json"},
    )
    with urlopen(request) as response:
        release = json.load(response)

    asset = next(
        (asset for asset in release["assets"] if asset["name"] == "songs.json"),
        None,
    )
    if asset is None:
        raise RuntimeError("The latest sangbog release does not contain songs.json")

    with urlopen(asset["browser_download_url"]) as response:
        file_path.write_bytes(response.read())
    return file_path

if __name__ == "__main__":
    print("Fetching songs.json from the latest sangbog release")
    get_songbook(JSON_PATH)
