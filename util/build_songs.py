import os
import re
import json
import shutil
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

            with open(file_path) as f:
                s = f.read()
                s = s.replace("\n", "<\n NEWLINE>")
            with open(file_path, "w") as f:
                f.write(s)

            cmd = f"pandoc -s {file_path} -o {out} --template={template_path} --metadata title='{file_name}'"
            os.system(cmd)

            song_name = get_song_name(file_path)
            if song_name != None:
                json_res[song_name] = f"./songs/{file_name}.html"





    with open(os.path.join(os.path.curdir, 'pages', 'songbook', 'songs.json'), encoding="utf-8", mode="w") as f:
        f.write(json.dumps(json_res, ensure_ascii=False))
    remove_folder(os.path.join(os.path.curdir, 'sangbog'))
    for file in os.listdir(out_path):
        file_path = os.path.join(out_path, file)
        with open(file_path) as f:
            s = f.read()
            s = s.replace("&lt;", "")
            s = s.replace("&gt;", "")
            s = s.replace("NEWLINE", "<br/>")
            s = "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"> \n" + s
        with open(file_path, "w") as f:
           f.write(s)


def clean_folder(path):
    files = os.listdir(path)
    for file in files:
        os.remove(os.path.join(path, file))


def remove_folder(path):
    if os.path.exists(path) and os.path.isdir(path):
        shutil.rmtree(path)


def get_song_name(file_path):
    with open(file_path, encoding="utf-8") as f:
        line = f.readline()
        reg = re.compile(r"\\begin\{sang\}\{([^\}]*)")
        match = reg.match(line)
        if match != None:
            return match.group(1)


main()
