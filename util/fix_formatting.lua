function SoftBreak (s)
    return pandoc.RawInline('html', "<br/>")
end

function Str (e)
    w, n = string.gsub(e.text, "-?%d*%.*%d+em", "")
    w, n = string.gsub(w, "-?%d*%.*%d+cm", "")
    w, n = string.gsub(w, "-?%d*%.*%d+px", "")
    w, n = string.gsub(w, "-?%d*%.*%d+pt", "")
    return w
end