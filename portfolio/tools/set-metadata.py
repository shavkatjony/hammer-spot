"""
Add document metadata and a bookmark outline to a PDF printed by Chromium.

Usage:  python3 portfolio/tools/set-metadata.py <file.pdf> <meta.json>
meta.json: { title, author, subject, keywords, lang, outline: [{ chapter, title, page }] }
Needs:  pip install pypdf
"""
import json
import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import BooleanObject, NameObject, TextStringObject, DictionaryObject

pdf_path, meta_path = sys.argv[1], sys.argv[2]
meta = json.loads(open(meta_path, encoding='utf-8').read())

reader = PdfReader(pdf_path)
writer = PdfWriter(clone_from=reader)
writer.add_metadata({
    '/Title': meta['title'],
    '/Author': meta['author'],
    '/Subject': meta['subject'],
    '/Keywords': meta['keywords'],
    '/Creator': 'Portfolio generator (HTML/CSS, Chromium print)',
})

root = writer._root_object
root[NameObject('/Lang')] = TextStringObject(meta['lang'])
prefs = root.get('/ViewerPreferences')
prefs = prefs.get_object() if prefs is not None else DictionaryObject()
prefs[NameObject('/DisplayDocTitle')] = BooleanObject(True)
root[NameObject('/ViewerPreferences')] = prefs
root[NameObject('/PageLayout')] = NameObject('/SinglePage')

# Outline: chapters as parents, one entry per page beneath
parents = {}
for item in meta['outline']:
    ch = item['chapter']
    if ch not in parents:
        parents[ch] = writer.add_outline_item(ch, item['page'])
    writer.add_outline_item(item['title'], item['page'], parent=parents[ch])

with open(pdf_path, 'wb') as f:
    writer.write(f)
print(f"metadata and {len(meta['outline'])} bookmarks -> {pdf_path.split('/')[-1]}")
