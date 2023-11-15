COMMAND_START = '\\'
BLOCK_START = '{'
BLOCK_END = '}'
### PARSING PART ###
class Text:
    def __init__(self, text):
        self.text = text

    def to_str(self, indent=0):
        text = self.text.replace("\n", " ")
        return f"{' ' * indent}[TEXT] \"{text}\""
class Block:
    def __init__(self, elements):
        self.body = elements

    def to_str(self, indent=0):
        temp = ""
        length = len(self.body)
        for i in range(0, length) :
            temp += self.body[i].to_str(indent+4) + ("\n" if i < length-1 else "")
        return f"{' ' * indent}[Block] \n{temp}"
class Command:
    def __init__(self, name, body):
        self.name = name
        self.body = body

    def to_str(self, indent=0):
        if self.body != None:
            return f"{' ' * indent}[COMMAND] {self.name} : {{ \n {self.body.to_str(indent+4)}}}"
        else:
            return f"{' ' * indent}[COMMAND] {self.name}"
class Parser:
    def __init__(self, string):
        self.str = string
        self.pos = 0 

    def parse(self, string = ""):
        # Try parse as command
        elements = []
        text_buf = ""
        buffer = self.str if string == "" else string
        pos = self.pos if string == "" else 0
        while pos < len(buffer):
            element = None

            if buffer[pos] == COMMAND_START:
                element, new_pos = self.parse_command(buffer, pos)
                pos = new_pos
            elif buffer[pos] == BLOCK_START:
                element, new_pos = self.parse_block(buffer, pos)
                pos = new_pos
            else:
                text_buf += buffer[pos]
                pos+=1
        
            if element != None:
                # Ensure that we rember to write text after encountering a element
                if text_buf != "":
                    elements.append(Text(text_buf))
                    text_buf = ""
                elements.append(element)
        # Ensure we write the last bit of text into a element
        if text_buf != "":
            elements.append(Text(text_buf))
        
        return elements

    def parse_block(self, buffer, pos):
        if buffer[pos] != BLOCK_START:
            return None
        offset = 1
        body = ""
        open_blocks = 0
        while(buffer[pos+offset] != BLOCK_END or open_blocks != 0):
            char = buffer[pos+offset]
            if char == BLOCK_START:
                open_blocks+=1
            if char == BLOCK_END:
                open_blocks-=1
            body += char
            offset += 1
        pos += offset + 1
        if body != "":
            return (Block(self.parse(body)), pos)
        else:
            return (None, pos)

    def parse_command(self, buffer, pos):
        if buffer[pos] != COMMAND_START:
            return (None, pos)
        offset = 1
        name = ""
        while((pos+offset) < len(buffer) and buffer[pos+offset].isalpha()):
            name += buffer[pos+offset]
            offset += 1
        # False positive no command just a '/' 
        if name == "":
            return (Text('\\'), pos+1)
        
        noffset = offset # save offset of the name

        # Eat whitespace
        while((pos+offset) < len(buffer) and buffer[pos+offset].isspace()):
            offset += 1
        
        # Command has body
        if (pos+offset) < len(buffer) and buffer[pos+offset] == BLOCK_START:
            pos+= offset
            block, new_pos = self.parse_block(buffer, pos)
            return (Command(name, block), new_pos)
        pos+=noffset
        return (Command(name, None), pos)

def text_to_html(el):
    return el.text.replace("\n","<br/>")

# (useAsIs, string)
def command_to_html(el):
    tag = ""
    if el.name == "tt":
        tag = "verb"
    elif el.name in ["emph", "sl"]:
        tag = "em"
    elif el.name == "bf":
        tag = "b"
    elif el.name == "st":
        tag = "s"
    elif el.name == "underline":
        tag = "u"
    elif el.name == "sc":
        tag = "div style='font-variant: small-caps;'"
    # Commands to preserve
    elif el.name in ["times", "nabla", "pi", "epsilon", "log"]:
        return (True, f"\\{el.name}")
    elif el.name in ["LaTeX", "ldots","dots"]:
        return (True, f"$\\{el.name}$")
    elif el.name == "ae":
        return (True, "æ")
    # Commands to yeeet
    elif el.name in ["vspace", "sf"]:
        return (True, "")
    else:
        tag = el.name
    if el.name == "mathscr" and el.body != None:
        return (True, f"\\{tag}{{"+ block_to_html(el.body.body) +"}")
    if el.body != None:
        return (True, f"<{tag}>"+ block_to_html(el.body.body)+f"</{tag}>")
    return (False, tag)
    
def block_to_html(el):
    res = ""
    closing = ""
    for x in el:
        if isinstance(x, Text):
            res += text_to_html(x)
        elif isinstance(x, Command):
            hasBody, command = command_to_html(x)
            if hasBody:
                res += command
            else:
                res += f"<{command}>"
                closing += f"</{command}>"
        elif isinstance(x, Block):
            res += block_to_html(x.body)
    return res + closing

def tex_to_html(s):
    s = (s
        .replace("\\&", "&amp;")
        .replace("\\'", "'")
        )
    parser = Parser(s)
    elements = parser.parse()
    return block_to_html(elements)
