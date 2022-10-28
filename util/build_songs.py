import os
import re
import json
import shutil

def main():
   in_path = os.path.join(os.path.curdir, 'sangbog', 'sange')
   out_path = os.path.join(os.path.curdir,  'pages', 'songbook', 'songs')
   template_path = os.path.join(os.path.curdir, 'util', 'templates', 'tex_to.html')
   pug_path = os.path.join(os.path.curdir, 'util', 'templates', 'songbook.pug')
   black_list = ["enkortenlang.tex", "vendelboensfestsang.tex"]
   files = os.listdir(in_path)
   clean_folder(out_path)
   pug_res = ""
   with open(pug_path, encoding="utf-8") as f:
        pug_res = f.read()
   pug_res += "\n"
   if not os.path.exists(out_path):
       os.mkdir(out_path)
   for file in files:
        if file not in black_list:
            file_path = os.path.join(in_path, file)
            file_name = os.path.splitext(os.path.basename(file_path))[0]
            out = os.path.join(out_path, file_name+".html")

            cmd = f"pandoc -s {file_path} -o {out} --template={template_path} --metadata title='{file_name}'"
            os.system(cmd)
            song_name = get_song_name(file_path)
            if song_name != None:
                pug_res += f"        a(href='./songs/{file_name}.html') {song_name} #[br]\n"

   with open( os.path.join(os.path.curdir,  'pages', 'songbook', 'index.pug'), encoding="utf-8", mode="w") as f:
        f.write(pug_res)
   remove_folder(os.path.join(os.path.curdir, 'sangbog'))

def clean_folder(path):
    files = os.listdir(path)
    for file in files:
        os.remove(os.path.join(path,file))

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