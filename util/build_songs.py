import os
import re
import json
import fileinput
import base64

def main():
    in_path = os.path.join(os.path.curdir, 'sangbog', 'sange')
    out_path = os.path.join(os.path.curdir, 'pages', 'songbook', 'songs')
    template_path = os.path.join(os.path.curdir, 'util', 'templates', 'tex_to.html')
    black_list = [] #["enkortenlang.tex", "vendelboensfestsang.tex"]
    files = os.listdir(in_path)
    json_res = {}

    if not os.path.exists(out_path):
        os.mkdir(out_path)
    else:
        clean_folder(out_path)
    
    for file in files:
        if file not in black_list:
            file_path = os.path.join(in_path, file)
            file_name = os.path.splitext(os.path.basename(file_path))[0]
            out = os.path.join(out_path, file_name + ".html")
            #cmd = f"pandoc -s {file_path} -o {out} --template={template_path} --metadata title='{file_name}' --lua-filter ./util/fix_formatting.lua"
            #os.system(cmd)
            song_info = get_song_info(file_path)
            if song_info != None:
                f = open(file_path, encoding="utf-8")
                columns = get_song_columns(f)
                hasColumns = False
                if columns != None:
                    hasColumns = True
                    #print(columns)
                f.seek(0, 0) # reset to top of file
                content = f.read()
                f.close()
                verses = get_verses(content)
                omkvaed = get_verses2(content)
                images = get_images(content)
                if verses != [] or images != []:
                    res = generate_document(song_info, verses, omkvaed, images)
                    with open(f"{os.path.join(out_path, file_name)}.html", "w") as f:
                        f.write(res)
                    make_song_pug_file(os.path.join(out_path, file_name), file_name)
                    json_res[song_info[0]] = f"./songs/{file_name}.html"

    with open(os.path.join(os.path.curdir, 'pages', 'songbook', 'songs.json'), encoding="utf-8", mode="w") as f:
       f.write(json.dumps(json_res, ensure_ascii=False))


def generate_document(song_info, verses, omkvaed, images):
    name, melody = song_info
    IS_VERSE = 2
    content = []
    content.extend(verses)
    content.extend(omkvaed)
    content.extend(images)
    sorted(content, key=lambda x: x[0])

    sbody = ""
    x = 0
    for el in content:
        if el[1] == "v":
            x+=1
            temp = el[2].rstrip().replace("\n", "<br/>")
            sbody+= f"""
        <div class="verse wrap">
            <div class="num wrap-child">{x}. </div>
            <div class="vtext wrap-child">{fixStr(temp)}</div>
        </div><br/><br/>"""
        elif el[1] == "o":
            x+=1
            temp = el[2].rstrip().replace("\n", "<br/>")
            sbody+= f"""
        <div class="omkvead wrap">
            <div class="num wrap-child">{x}. </div>
            <div class="vtext wrap-child">{fixStr(temp)}</div>
        </div><br/><br/>"""
        elif el[1] == "i":
            sbody+= f"""<img class="image" src="data:image/png;base64, {img2b64("./sangbog/"+el[3]).decode()}" alt="Red dot" /><br/>"""
    return f"""
    <div class="info wrap">
        <div class="name wrap-child">{name}</div>
        <div class="melody wrap-child">Melody - {melody}</div>
    </div>
    <div class="song-body">
        <br/><br/>
        {sbody}
    </div>
    <script>
    document.addEventListener("DOMContentLoaded", function() {{
        renderMathInElement(document.body, {{
          // customised options
          // • auto-render specific keys, e.g.:
          delimiters: [
              {{left: '$$', right: '$$', display: true}},
              {{left: '$', right: '$', display: false}},
          ],
          // • rendering keys, e.g.:
          throwOnError : false
        }});
    }})
    </script>

"""


def img2b64(path):
    with open(path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return encoded_string

def clean_folder(path):
    files = os.listdir(path)
    for file in files:
        os.remove(os.path.join(path, file))

def get_verses(content):
    matches = re.compile(r"(?s)\\begin\{vers\}\s?(.*?)\\end\{vers\}", re.MULTILINE|re.DOTALL)
    res = []
    for match in matches.finditer(content):
        start = content[0:match.start()].count("\n")
        res.append((start, "v",match.group(1)))
    return res

def get_verses2(content):
    matches = re.compile(r"\\begin\{omkvaed\}\[?\w?\]?\s*([^\\]*)", re.MULTILINE|re.DOTALL)
    res = []
    for match in matches.finditer(content):
        start = content[0:match.start()].count("\n")
        res.append((start,"o", match.group(1)))
    return res

def get_images(content):
    matches = re.compile(r"\\includegraphics\s*\[width=(\d*.\d)\\*\w*\]\{([^\}]*)\}", re.MULTILINE|re.DOTALL)
    res = []
    for match in matches.finditer(content):
        start = content[0:match.start()].count("\n")
        res.append((start, "i", match.group(1),match.group(2).replace(".eps", ".png")))
    return res
    
def get_song_info(file_path):
    with open(file_path, encoding="utf-8") as f:
        line = f.readline()
        reg = re.compile(r"\\begin\{sang\}\{([^\}]*)\}\{([^\}]*)\}")
        match = reg.match(line)
        if match != None:
            return (
                match.group(1)
                .capitalize(), 
                match.group(2)
                    .replace("\\ldots", "…")
                    .replace("Melodi - ", "")
                    .replace("Melodi:", "")
                    .lstrip()
                    .capitalize()
            )

def get_song_columns(f):
        line = f.readline()
        match = None
        x = 0
        while (match == None and x < 10):
            line = f.readline()
            reg = re.compile(r"\\spal\s*(\d*)")
            match = reg.match(line)
            x += 1
        if match != None:
            return match.group(1)
        
              
def make_song_pug_file(file_path, file_name):
    with open(file_path + ".pug", mode = "w", encoding="utf-8") as f:
        pug_text = "extends ../../../components/base_layout \n" \
                    "block head \n" \
                    '    link(rel="stylesheet" href="/styles/songbook.scss")\n' \
                    '    link(rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css")\n' \
                    '    script(src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" defer)\n'\
                    '    script(src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" defer)\n'\
                   "block content \n" \
                   f"    include {file_name}.html\n" 
        f.write(pug_text)

#<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
#<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
#<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"
#    onload="renderMathInElement(document.body);"></script>



def fixStr(string):
    return string.replace('\LaTeX{}', "$\LaTeX$ ").replace("{", "<b>").replace("}", "</b").replace("\em", "").replace("\sl", "").replace("\sf", "").replace("\sc", "").replace("\\bf", "").replace("\\tt", "").replace("\small", "").replace("\\vspace1mm", "")
main()
