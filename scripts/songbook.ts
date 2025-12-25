// @ts-ignore
import songs from "../pages/songbook/song_index.json";
import {string_to_array, similiarity} from "../scripts/util/search";
import {debounce} from "../scripts/util/common";

const search_element = document.getElementById("search") as HTMLInputElement;
const links_element = document.getElementById("links");

interface SongElement {
    element:    HTMLElement,
    search:     Int16Array,
    score:      number,
    index:      number,
}

let song_elements: SongElement[] = [];

function create_song_element(num: string, key: string, link: string): SongElement {
    const a = document.createElement("a");
    a.href = link;
    const d = document.createElement("div");
    d.className = "border-inner";
    const p = document.createElement("p");
    p.innerText = num+". " + key;
    d.appendChild(p);
    a.appendChild(d);
    return {
        element: a,
        search: string_to_array(key),
        score: 0,
        index: Number(num),
    };
}

search_element.addEventListener("input",
    debounce(100, _ => {
        const a = search_element.value;
        if (a === "") {
            links_element.innerHTML = "";
            song_elements.sort((a,b)=> a.index - b.index)
        } else {
            let song_num = Number(a)
            if (!Number.isNaN(song_num)) {
                song_elements = song_elements.sort((a, b) => Math.abs(song_num-a.index) - Math.abs(song_num-b.index));
            } else {
                for(const song of song_elements)
                    song.score = similiarity(string_to_array(a), song.search);
        
                song_elements = song_elements.sort((a, b) => a.score - b.score);
                links_element.innerHTML = "";
            }
        }
        for(const song_element of song_elements)
            links_element.appendChild(song_element.element);
    })
);

document.addEventListener("DOMContentLoaded", _ => {
    for(const key in songs) 
        song_elements.push(create_song_element(key, songs[key][0], songs[key][1]));

    links_element.innerHTML = "";
    for(const song_element of song_elements)
        links_element.appendChild(song_element.element);
});

