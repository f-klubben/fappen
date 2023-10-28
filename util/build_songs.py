import os
import zipfile
import re
import json
import fileinput
from urllib.request import urlretrieve
from string import Template

OUTPUT_PATH = os.path.join(os.path.curdir, 'pages', 'songbook', 'songs')
OUTPUT_IMAGE_PATH = os.path.join(os.path.curdir, 'media', 'songs')
def get_songbook(file_path):
    url = 'https://github.com/f-klubben/sangbog/archive/master.zip'
    urlretrieve(url, file_path)
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

def img2b64(path):
    with open(path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return encoded_string

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

def get_template(name):
    contents = ""
    with open(os.path.join(os.getcwd(), f"util/template/{name}.pug"), mode="r") as data:
        contents = data.read()
    return Template(contents)

def merge_lists(v, c, i):
    l = []
    l.extend(v)
    l.extend(c)
    l.extend(i)
    return sorted(l, key=lambda x: x[0])

def fix_string_formatting(s):
    return (s
        .rstrip()
        .replace("\n", "<br/>")
        .replace('\LaTeX{}', "$\LaTeX$ ")
        .replace("\\&", "&")
        .replace("{", "")
        .replace("}", "")
        .replace("\em", "")
        .replace("\sl", "")
        .replace("\sf", "")
        .replace("\sc", "")
        .replace("\\bf", "")
        .replace("\\tt", "")
        .replace("\small", "")
        .replace("\\vspace1mm", "")
    )
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
                line = f"&nbsp{pargraph}.", 
                text = fix_string_formatting(el[2])
            ) 
        elif el[1] == "c":
            pargraph+=1
            body += text_t.substitute(
                type = "chorus",
                line = pargraph, 
                text = fix_string_formatting(el[2])
            )
        elif el[1] == "i": 
            image = get_file_contents(
                archive,
                f"sangbog-main/{el[3]}"
            )
            image_path = os.path.join(OUTPUT_IMAGE_PATH, el[3].split("/")[1])
            with open(image_path, mode="wb")as f:
                f.write(image)
            body += image_t.substitute(
                image = f"../../.{image_path}"
            )
        body += "\n"
    return body

def generate_song(song_info, file_name, contents, archive):
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
        name = song_info[0],
        melody = "Melody - "+  song_info[1].replace("\n", "") if song_info[1] != "" else song_info[1],
        sbody = song_body
    )
    path = os.path.join(OUTPUT_PATH, file_name)
    with open(f"{path}.pug", "w") as f:
        f.write(song)
    return True

def main():
    json_res = {}
    archive_path = os.path.join(os.getcwd(), 'sangbog-main.zip')
    get_songbook(archive_path)
    with zipfile.ZipFile(archive_path, mode="r") as archive:
        for info in archive.infolist():
            if info.filename.startswith("sangbog-main/sange"):
                print(f"{info.filename}\n")
                contents = get_file_contents(archive, info.filename).decode('UTF-8')
                song_info = get_song_info(contents)
                file_name = filename = info.filename.split("/")[-1].split(".")[0]
                if generate_song(song_info, file_name, contents, archive):
                    json_res[song_info[0]] = f"./songs/{file_name}.html"
    with open(os.path.join(os.path.curdir, 'pages', 'songbook', 'songs.json'), encoding="utf-8", mode="w") as f:
       f.write(json.dumps(json_res, ensure_ascii=False))
    os.remove(os.path.join(os.getcwd(), 'sangbog-main.zip'))

main()