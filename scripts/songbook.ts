// @ts-ignore
import songs from "../pages/songbook/songs.json";
import {text_to_array, search} from "../scripts/util/search";

let search_element = document.getElementById("search") as HTMLInputElement;
let links_element = document.getElementById("links");


interface SongElement {
    element:    HTMLElement,
    search:     Int16Array,
    score:      number,
    index:      number,
}

let song_elements: SongElement[] = [];

function create_song_element(key: string, link: string, index: number): SongElement {
    let a = document.createElement("a") as HTMLAnchorElement;
    a.href = link;
    let d = document.createElement("div") as HTMLDivElement;
    d.className = "border-inner";
    let p = document.createElement("p") as HTMLParagraphElement;
    p.innerText = key;
    d.appendChild(p);
    a.appendChild(d);
    return {
        element: a,
        search: text_to_array(key),
        score: 0,
        index: index,
    };
}

search_element.addEventListener("change", (e: KeyboardEvent) => {
    let a = search_element.value;
    if (a == "") {
        links_element.innerHTML = "";
        song_elements = song_elements.sort((a, b) => a.index - b.index);
    } else {
        for(let song of song_elements)
        song.score = search(text_to_array(a), song.search);

        song_elements = song_elements.sort((a, b) => a.score - b.score);
        links_element.innerHTML = "";
    }
    for(let song_element of song_elements)
        links_element.appendChild(song_element.element);
});

document.addEventListener("DOMContentLoaded", _ => {
    let i = 0;
    for(let key in songs) 
        song_elements.push(create_song_element(key, songs[key], i++));

    links_element.innerHTML = "";

    for(let song_element of song_elements)
        links_element.appendChild(song_element.element);
});

