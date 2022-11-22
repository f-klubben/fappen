import os
import re
import json
import fileinput


def main():
    in_path = os.path.join(os.path.curdir, 'sangbog', 'sange')
    out_path = os.path.join(os.path.curdir, 'pages', 'songbook', 'songs')
    template_path = os.path.join(os.path.curdir, 'util', 'templates', 'tex_to.html')
    black_list = ["enkortenlang.tex", "vendelboensfestsang.tex"]
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
            cmd = f"pandoc -s {file_path} -o {out} --template={template_path} --metadata title='{file_name}' --lua-filter ./util/fix_formatting.lua"
            os.system(cmd)
            song_name = get_song_name(file_path)
            if song_name != None:
                make_song_pug_file(os.path.join(out_path , file_name), file_name)
                json_res[song_name] = f"./songs/{file_name}.html"

    with open(os.path.join(os.path.curdir, 'pages', 'songbook', 'songs.json'), encoding="utf-8", mode="w") as f:
       f.write(json.dumps(json_res, ensure_ascii=False))


def clean_folder(path):
    files = os.listdir(path)
    for file in files:
        os.remove(os.path.join(path, file))

def get_song_name(file_path):
    with open(file_path, encoding="utf-8") as f:
        line = f.readline()
        reg = re.compile(r"\\begin\{sang\}\{([^\}]*)")
        match = reg.match(line)
        if match != None:
            return match.group(1)


def make_song_pug_file(file_path, file_name):
    with open(file_path + ".pug", mode = "w", encoding="utf-8") as f:
        pug_text = "extends ../../../components/base_layout \n" \
                   "block content \n" \
                   f"    include {file_name}.html"
        f.write(pug_text)


main()
