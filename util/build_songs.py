import os
import zipfile
import re
import json
import sys
from urllib.request import urlretrieve
from string import Template
from pathlib import Path

### LOCAL IMPORTS
from tex_to_html import tex_to_html
CWD = Path.cwd()
OUTPUT_IMAGE_PATH = Path(".").joinpath("media","songs")
OUTPUT_PATH = Path(".").joinpath("pages", "songbook", "songs")
TEMPALTE_PATH = CWD.joinpath("util","template")
ARCHIVE_PATH = Path(".").joinpath("sangbog-main.zip")
JSON_PATH = CWD.joinpath("pages", "songbook", "songs.json")
### EXTRACTING PART ###

def reporthook(count, _, total_size):
    percent = ((count*8192)/total_size)*100
    sys.stdout.write("\rDownloading songbook %d%%" % (percent))
    sys.stdout.flush()

def get_songbook(file_path):
    url = 'https://github.com/f-klubben/sangbog/archive/master.zip'
    urlretrieve(url, file_path, reporthook)
    print("")
    return file_path

def get_file_contents(archive, path):
    contents = ""
    with archive.open(path, mode="r") as data:
        contents = data.read()
    return contents

def get_song_info(content):
    reg = re.compile(r"\\begin\{sang\}\{([^\}]*)\}\{([^\}]*)\}")
    match = reg.match(content)
    if match != None:
        return (
            match.group(1).capitalize(), 
            match.group(2).replace("\\ldots", "…").replace("Melodi - ", "").replace("Melodi:", "").lstrip().capitalize()
        )

def get_verses(content):
    matches = re.compile(r"(?s)\\begin\{vers\}\s?(.*?)\\end\{vers\}", re.MULTILINE|re.DOTALL)
    res = []
    for match in matches.finditer(content):
        start = content[0:match.start()].count("\n")
        res.append((start, "v",match.group(1)))
    return res

def get_choruses(content):
    matches = re.compile(r"\\begin\{omkvaed\}\[?\w?\]?\s*([^\\]*)", re.MULTILINE|re.DOTALL)
    res = []
    for match in matches.finditer(content):
        start = content[0:match.start()].count("\n")
        res.append((start,"c", match.group(1)))
    return res

def get_images(content):
    matches = re.compile(r"\\includegraphics\s*\[width=(\d*.\d)\\*\w*\]\{([^\}]*)\}", re.MULTILINE|re.DOTALL)
    res = []
    for match in matches.finditer(content):
        start = content[0:match.start()].count("\n")
        res.append((start, "i", match.group(1),match.group(2).replace(".eps", ".png")))
    return res

def get_song_order(content):
    matches = re.compile(r"\\input\{([^\}]*)\/([^.}]*)(.tex|\})", re.MULTILINE|re.DOTALL)
    res = []
    for match in matches.finditer(content):
        start = content[0:match.start()].count("\n")
        res.append(match.group(2))
    return res

def get_template(name):
    contents = ""
    with open(TEMPALTE_PATH.joinpath(f"{name}.pug"), mode="r") as data:
        contents = data.read()
    return Template(contents)

def get_song_body(body_list, archive):
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
            image = get_file_contents(
                archive,
                f"sangbog-main/{el[3]}"
            )
            image_path = OUTPUT_IMAGE_PATH.joinpath(el[3].split("/")[1])
            os.makedirs(os.path.dirname(image_path), exist_ok=True)
            abs_image_path = CWD.joinpath(image_path)
            with open(abs_image_path, mode="wb")as f:
                f.write(image)
            body += image_t.substitute(
                image = f"../../../{image_path.as_posix()}"
            )
        body += "\n"
    return body

def generate_song(song_info, file_name, contents, counter, archive):
    if song_info == None:
        return False
    body_list = merge_lists(
        get_verses(contents),
        get_choruses(contents),
        get_images(contents),
    )
    song_body = get_song_body(body_list, archive)
    song_t = get_template("song")
    song = song_t.substitute(
        num = counter.get_count(file_name),
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

def merge_lists(v, c, i):
    l = []
    l.extend(v)
    l.extend(c)
    l.extend(i)
    return sorted(l, key=lambda x: x[0])

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
    if (not ARCHIVE_PATH.exists()):
        get_songbook(ARCHIVE_PATH)
    with zipfile.ZipFile(ARCHIVE_PATH, mode="r") as archive:
        c = get_file_contents(archive, "sangbog-main/main.tex").decode('UTF-8')
        counter = Counter(get_song_order(c))
        songs = list(filter(
            lambda x: x.filename.startswith("sangbog-main/sange") and not x.is_dir(),
            archive.infolist())
        )
        song_count = len(songs)
        count = 0
        for info in songs:
            count +=1
            percent = (count/song_count)*100
            sys.stdout.write("\rGenerating songbook %d%%" % (percent))
            sys.stdout.flush()
            contents = get_file_contents(archive, info.filename).decode('UTF-8')
            song_info = get_song_info(contents)
            file_name = filename = info.filename.split("/")[-1].split(".")[0]
            if generate_song(song_info, file_name, contents, counter, archive):
                json_res[counter.last] = [song_info[0], f"./songs/{file_name}.html"]
    print("\n\rWriting to json")
    with open(JSON_PATH, encoding="utf-8", mode="w") as f:
        f.write(json.dumps(json_res, ensure_ascii=False))
    print("\rRemoving archive")
    CWD.joinpath(ARCHIVE_PATH).unlink()
