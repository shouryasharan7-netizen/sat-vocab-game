import json
import re
import os
import PyPDF2

pdf_path = "/Users/shouryasharan/.gemini/antigravity-ide/brain/95c19437-ae17-4026-a033-9d7f8e7647ac/media__1786002601954.pdf"
words_ts_path = "src/data/words.ts"

if not os.path.exists(pdf_path):
    print("PDF not found!")
    exit(1)

with open(pdf_path, 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

# The text has format:
# word (pos.) definition (example)
# Sometimes it spans multiple lines.

lines = text.split('\n')
clean_lines = []
for line in lines:
    line = line.strip()
    if not line or line == 'SAT Vocabulary' or len(line) == 1:
        continue
    clean_lines.append(line)

entries = []
current_entry = ""
# A new entry starts with lowercase letters, optional 1. , and then (adj.) etc.
pattern = re.compile(r'^([a-z\-]+)\s+(?:1\.\s*)?\((adj\.|n\.|v\.|adv\.)\)')

for line in clean_lines:
    if pattern.match(line):
        if current_entry:
            entries.append(current_entry)
        current_entry = line
    else:
        current_entry += " " + line
if current_entry:
    entries.append(current_entry)

parsed_words = []
for entry in entries:
    m = re.match(r'^([a-z\-]+)\s+(?:1\.\s*)?\((adj\.|n\.|v\.|adv\.)\)\s+(.*?)\s+\((.*?)\)', entry)
    if m:
        word = m.group(1)
        pos = m.group(2).replace('.', '')
        def_text = m.group(3).strip()
        ex_text = m.group(4).strip()
        parsed_words.append({
            "word": word,
            "pos": pos,
            "def": def_text,
            "ex": ex_text
        })

print(f"Parsed {len(parsed_words)} words.")

if len(parsed_words) > 0:
    existing_content = open(words_ts_path, 'r').read()
    new_words_str = ",\n".join([json.dumps(w) for w in parsed_words])
    
    end_idx = existing_content.rfind(']')
    if end_idx != -1:
        new_content = existing_content[:end_idx] + ",\n" + new_words_str + "\n" + existing_content[end_idx:]
        with open(words_ts_path, 'w') as f:
            f.write(new_content)
        print("Successfully updated src/data/words.ts")
    else:
        print("Could not find array end in words.ts")
