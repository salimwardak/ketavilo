from pathlib import Path
import json,re,hashlib
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A5
from pypdf import PdfReader
r=Path('github-pages-ready');out=r
pdfmetrics.registerFont(TTFont('BookSerif','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
rows={b[0]:b for b in json.loads((r/'catalog.json').read_text())};ids=json.loads((r/'local.json').read_text());print(type(ids),flush=True)
if isinstance(ids,dict):ids=ids.get('ids',list(ids))
style=ParagraphStyle('body',fontName='BookSerif',fontSize=10,leading=15,spaceAfter=8,splitLongWords=True)
heading=ParagraphStyle('title',parent=style,fontSize=22,leading=29,spaceAfter=22)
small=ParagraphStyle('small',parent=style,fontSize=8,leading=12)
manifest={}
for rawid in ids:
 id=int(rawid);b=rows[id];src=(r/f'{id}.txt').read_text();target=out/f'book-{id}.pdf';story=[Spacer(1,65),Paragraph(escape(b[1]),heading),Paragraph(escape(b[2]),style),Spacer(1,25),Paragraph('Ketavilo Library',style),Paragraph('Complete text edition. Original Project Gutenberg text and license follow.',small),Paragraph(f'Source: https://www.gutenberg.org/ebooks/{id}',small),Paragraph('Salim Suliman',small),PageBreak()]
 for p in re.split(r'\n\s*\n',src.replace('\r\n','\n')):
  if p.strip():story.append(Paragraph(escape(p).replace('\n',' '),style))
 def footer(c,doc):
  c.setFont('BookSerif',7);c.setFillColorRGB(.4,.4,.4);c.drawString(30,21,'Ketavilo Library');c.drawRightString(A5[0]-30,21,str(doc.page))
 doc=SimpleDocTemplate(str(target),pagesize=A5,rightMargin=32,leftMargin=32,topMargin=35,bottomMargin=35,pageCompression=1,title=b[1],author=b[2]);doc.build(story,onFirstPage=footer,onLaterPages=footer)
 pages=PdfReader(target).pages;last=pages[-1].extract_text();assert 'Ketavilo Library' in last and len(pages)>5
 manifest[str(id)]={'path':f'book-{id}.pdf','bytes':target.stat().st_size,'pages':len(pages),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
 print(id,len(pages),target.stat().st_size,flush=True)
(r/'pdf-manifest-v8.json').write_text(json.dumps(manifest,indent=2))
