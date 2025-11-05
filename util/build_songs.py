import os
import json
import sys
from urllib.request import urlretrieve
from string import Template
from pathlib import Path
import base64

### LOCAL IMPORTS
from tex_to_html import tex_to_html
CWD = Path.cwd()
OUTPUT_IMAGE_PATH = Path(".").joinpath("media","songs")
OUTPUT_PATH = Path(".").joinpath("pages", "songbook", "songs")
TEMPALTE_PATH = CWD.joinpath("util","template")
JSON_PATH = CWD.joinpath("pages", "songbook", "songs.json")
### EXTRACTING PART ###

### EXTRACTING PART ###
def get_songbook_artifact(file_path):
    url = 'https://github.com/f-klubben/sangbog/releases/latest/download/songs.json'
    urlretrieve(url, file_path)
    songbook_json_string = "{}"
    with open(file_path, "rb") as file:
        songbook_json_string = file.read().decode('UTF-8')
    return json.loads(songbook_json_string)

def get_template(name):
    contents = ""
    with open(TEMPALTE_PATH.joinpath(f"{name}.pug"), mode="r") as data:
        contents = data.read()
    return Template(contents)

def get_song_body(body_list):
    pargraph = 0
    text_t = get_template("text") # type, line, text
    image_t = get_template("image") # b64image
    body = ""
    for el in body_list:
        if el[1] == "v":
            pargraph+=1
            body += text_t.substitute(
                type = "verse",
                line = f"{pargraph}.", 
                text = tex_to_html(el[2])
            ) 
        elif el[1] == "c":
            pargraph+=1
            body += text_t.substitute(
                type = "chorus",
                line = pargraph, 
                text = tex_to_html(el[2])
            )
        elif el[1] == "i":
            image_path = OUTPUT_IMAGE_PATH.joinpath(el[3].split("/")[1])
            os.makedirs(os.path.dirname(image_path), exist_ok=True)
            abs_image_path = CWD.joinpath(image_path)

            image = base64.decodebytes(el[4].encode('utf-8'))

            with open(abs_image_path, mode="wb")as f:
                f.write(image)
            body += image_t.substitute(
                image = f"../../../{image_path.as_posix()}"
            )
        body += "\n"
    return body

def generate_song(song_index, song_info, file_name):
    if song_info == None:
        return False
    body_list = song_info['body']
    song_body = get_song_body(body_list)
    song_t = get_template("song")
    song = song_t.substitute(
        num = song_index,
        name = song_info[0],
        melody = "Melody - "+  song_info[1].replace("\n", "") if song_info[1] != "" else song_info[1],
        sbody = song_body
    )
    path = OUTPUT_PATH.joinpath( file_name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(f"{path}.pug", encoding="utf-8", mode="w") as f:
        f.write(song)
    return True

def img2b64(path):
    with open(path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return encoded_string

class Counter:
    def __init__(self, order):
        self.order = order
        self.count = len(order)
        self.last = 0
    def get_count(self, file_name):
        try:
            self.last = (self.order.index(file_name) + 1)
        except:
            self.last = self.count
            self.count += 1
        return self.last

if __name__ == "__main__":
    json_res = {}
    songs = get_songbook_artifact("songs.json")
    song_count = len(songs)
    count = 0
    for index in songs:
        count += 1
        percent = (count/song_count)*100
        sys.stdout.write("\rGenerating songbook %d%%" % (percent))
        sys.stdout.flush()
        file_name = songs[index][3].split("/")[-1].split(".")[0]
        if generate_song(index, songs[index], file_name):
            json_res[index] = [songs[index][0], f"./songs/{file_name}.html"]

    print("\n\rWriting to json")
    with open(JSON_PATH, encoding="utf-8", mode="w") as f:
        f.write(json.dumps(json_res, ensure_ascii=False))