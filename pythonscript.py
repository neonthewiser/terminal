import os
import json

CONTENT_DIR = 'content'
OUTFILE = os.path.join(CONTENT_DIR, 'filelist.json')

filelist = []
for root, dirs, files in os.walk(CONTENT_DIR):
    for fname in files:
        if fname == 'filelist.json':
            continue  # don't include the filelist itself
        relpath = os.path.relpath(os.path.join(root, fname), CONTENT_DIR)
        filelist.append(relpath.replace("\\", "/"))

filelist.sort()

with open(OUTFILE, 'w', encoding='utf-8') as f:
    json.dump(filelist, f, indent=2, ensure_ascii=False)

print(f"Generated {OUTFILE} with {len(filelist)} files.")
