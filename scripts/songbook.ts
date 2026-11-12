// @ts-ignore
import songs from "../pages/songbook/songs.json";
import {string_to_array, similiarity} from "../scripts/util/search";
import {debounce} from "../scripts/util/common";

const search_element = document.getElementById("search") as HTMLInputElement;
const links_element = document.getElementById("links")!;
const song_element = document.getElementById("song")!;

interface Song {
    number: string,
    title: string,
    melody: string,
    body: Array<[number, string, string, string?, string?]>,
}

interface SongElement {
    element:    HTMLElement,
    search:     Int16Array,
    score:      number,
    index:      number,
}

let song_elements: SongElement[] = [];

function create_song_element(song: Song): SongElement {
    const a = document.createElement("a");
    a.href = `#song=${song.number}`;
    a.addEventListener("click", () => show_song(song));
    const d = document.createElement("div");
    d.className = "border-inner";
    const p = document.createElement("p");
    p.innerText = song.number+". " + song.title;
    d.appendChild(p);
    a.appendChild(d);
    return {
        element: a,
        search: string_to_array(song.title),
        score: 0,
        index: Number(song.number),
    };
}

function escape_html(text: string): string {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function tex_to_html(text: string): string {
    text = text
        .replace(/\/\{[^{}]*\}\//g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\\\/\\\/[^\n]*(?=\n|$)/g, "")
        .replace(/\\\s*\/\/[^\n]*(?=\n|$)|\/\/[^\n]*(?=\n|$)/g, "");
    let position = 0;

    function parse(stop_at_closing_brace = false): string {
        let result = "";
        let closing_tags = "";
        while (position < text.length) {
            const character = text[position];
            if (character === "}" && stop_at_closing_brace) {
                position++;
                break;
            }
            if (character === "{") {
                position++;
                result += parse(true);
                continue;
            }
            if (character === "$" ) {
                const end = text.indexOf("$", position + 1);
                if (end !== -1) {
                    result += `$${translate_math(text.slice(position + 1, end))}$`;
                    position = end + 1;
                    continue;
                }
            }
            if (character === "*" || character === "_") {
                const end = text.indexOf(character, position + 1);
                if (end !== -1) {
                    const tag = character === "*" ? "b" : "em";
                    result += `<${tag}>${tex_to_html(text.slice(position + 1, end))}</${tag}>`;
                    position = end + 1;
                    continue;
                }
            }
            if (character !== "\\") {
                result += character === "\n" ? "<br/>" : escape_html(character);
                position++;
                continue;
            }

            position++;
            const command_start = position;
            while (position < text.length && /[A-Za-z]/.test(text[position]))
                position++;
            let command = text.slice(command_start, position);
            let command_tail = "";
            for (const prefix of ["textbf", "textit", "underline", "emph", "strong", "small", "big", "context", "super", "bf", "sl", "sf", "sc", "em", "tt"]) {
                if (command !== prefix && command.startsWith(prefix)) {
                    command_tail = command.slice(prefix.length);
                    command = prefix;
                    break;
                }
            }
            while (position < text.length && /\s/.test(text[position]))
                position++;

            let body = "";
            if (text[position] === "{") {
                position++;
                body = parse(true);
            }

            const tags: {[key: string]: string} = {
                tt: "verb",
                emph: "em",
                em: "em",
                sl: "em",
                bf: "b",
                textbf: "b",
                textit: "em",
                strong: "b",
                st: "s",
                underline: "u",
            };
            if (command in tags) {
                if (body !== "")
                    result += `<${tags[command]}>${body}</${tags[command]}>`;
                else {
                    result += `<${tags[command]}>${escape_html(command_tail)}`;
                    closing_tags = `</${tags[command]}>${closing_tags}`;
                }
            }
            else if (["sc", "sf"].includes(command)) {
                const tag = command === "sc"
                    ? `<span style="font-variant: small-caps;">`
                    : `<span class="sans">`;
                if (body !== "")
                    result += `${tag}${body}</span>`;
                else {
                    result += `${tag}${escape_html(command_tail)}`;
                    closing_tags = `</span>${closing_tags}`;
                }
            }
            else if (["vspace", "small", "big", "context", "super"].includes(command))
                result += body;
            else if (["times", "nabla", "pi", "epsilon", "log"].includes(command))
                result += `\\${command}`;
            else if (["LaTeX", "ldots", "dots"].includes(command))
                result += `$\\${command}$`;
            else if (command === "ae")
                result += "æ";
            else if (command === "u" && /^[0-9A-Fa-f]+$/.test(body))
                result += String.fromCodePoint(parseInt(body, 16));
            else if (body !== "")
                result += `<${command}>${body}</${command}>`;
            else
                result += escape_html(`\\${command}`);
        }
        return result + closing_tags;
    }

    return parse()
        .replaceAll("\\&", "&amp;")
        .replaceAll("\\'", "'");
}

function translate_math(math: string): string {
    const symbols: {[key: string]: string} = {
        infinity: "\\infty", "arrow.r": "\\rightarrow", "arrow.l": "\\leftarrow",
        "arrow.t": "\\uparrow", "arrow.b": "\\downarrow", "<=": "\\leq",
        ">=": "\\geq", "!=": "\\neq", in: "\\in", subset: "\\subset",
        union: "\\cup", sect: "\\cap", times: "\\times", dot: "\\cdot",
        "...": "\\ldots", nabla: "\\nabla",
    };
    let translated = math;
    for (const key of Object.keys(symbols)) {
        const pattern = /^[A-Za-z]+$/.test(key)
            ? new RegExp(`(?<!\\\\)\\b${key}\\b`, "g")
            : null;
        translated = pattern == null
            ? translated.replaceAll(key, symbols[key])
            : translated.replace(pattern, symbols[key]);
    }
    const known = ["alpha", "beta", "gamma", "delta", "epsilon", "lambda", "pi", "sum", "log"];
    for (const symbol of known)
        translated = translated.replace(new RegExp(`(?<!\\\\)\\b${symbol}\\b`, "g"), `\\\\${symbol}`);
    return translated;
}

function render_song_body(song: Song): void {
    if (song_element == null)
        return;

    let paragraph_number = 0;
    for (const [, type, text, path, image] of song.body) {
        if (type === "i" && image != null) {
            const picture = document.createElement("img");
            picture.className = "image";
            picture.src = `data:image/png;base64,${image}`;
            picture.alt = path ?? "Song illustration";
            song_element.appendChild(picture);
            song_element.appendChild(document.createElement("br"));
            song_element.appendChild(document.createElement("br"));
            continue;
        }
        paragraph_number++;
        const paragraph = document.createElement("div");
        paragraph.className = `wrap ${type === "c" ? "chorus" : "verse"}`;
        paragraph.innerHTML = `<span class="num wrap-child">${paragraph_number}${type === "v" ? "." : ""}</span><span class="vtext wrap-child">${tex_to_html(text)}</span>`;
        song_element.appendChild(paragraph);
        song_element.appendChild(document.createElement("br"));
        song_element.appendChild(document.createElement("br"));
    }
}

function show_song(song: Song): void {
    if (links_element == null || song_element == null)
        return;

    links_element.hidden = true;
    search_element.hidden = true;
    song_element.hidden = false;
    song_element.innerHTML = "";

    const info = document.createElement("div");
    info.className = "info wrap";
    const heading = document.createElement("span");
    heading.className = "name";
    heading.innerText = `${song.number}. ${song.title}`;
    info.appendChild(heading);

    const melody = document.createElement("span");
    melody.className = "melody";
    melody.innerText = song.melody;
    info.appendChild(melody);
    song_element.appendChild(info);
    song_element.appendChild(document.createElement("br"));
    song_element.appendChild(document.createElement("br"));
    render_song_body(song);

    const render_math = (window as any).renderMathInElement;
    if (render_math != null)
        render_math(song_element, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
            ],
            throwOnError: false,
        });
}

function show_song_from_hash(): void {
    const number = new URLSearchParams(location.hash.slice(1)).get("song");
    const song = (songs as Song[]).find(song => song.number === number);
    if (song != null) {
        show_song(song);
    } else if (links_element != null && song_element != null) {
        links_element.hidden = false;
        search_element.hidden = false;
        song_element.hidden = true;
    }
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
    for (const song of songs as Song[])
        song_elements.push(create_song_element(song));

    links_element.innerHTML = "";
    for(const song_element of song_elements)
        links_element.appendChild(song_element.element);

    show_song_from_hash();
});

window.addEventListener("hashchange", show_song_from_hash);
window.addEventListener("load", show_song_from_hash, {once: true});

