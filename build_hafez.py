import sys,zipfile,json,re,hashlib
from pathlib import Path
sys.path.insert(0,str(Path('pdf-deps').resolve()))
from bs4 import BeautifulSoup
from weasyprint import HTML
r=Path('github-pages-ready');z=zipfile.ZipFile('hafez.epub');opf=BeautifulSoup(z.read('OPF/content.opf'),'xml');manifest={i['id']:i['href'] for i in opf.find_all('item')};content=[];plain=[];poems=[]
for ref in opf.find_all('itemref'):
 href=manifest[ref['idref']]
 if href!='bio.xhtml' and not re.match(r'cat\d+sec\d+\.xhtml$',href):continue
 soup=BeautifulSoup(z.read('OPF/'+href),'html.parser')
 for e in soup.body.find_all(['h1','h2','h3','p']):
  txt=e.get_text(' ',strip=True)
  if not txt:continue
  tag='h2' if e.name.startswith('h') else 'p';content.append('<'+tag+'>'+__import__('html').escape(txt)+'</'+tag+'>');plain.append(txt)
  if e.find('a',id=re.compile('^poem-')):poems.append(e.find('a')['id'])
assert len(poems)>400 and len(set(poems))==len(poems)
text='مجموعه آثار حافظ\n\nمنبع: گنجور — https://ganjoor.net/hafez\n\n'+'\n\n'.join(plain);(r/'-2000003.txt').write_text(text)
html='''<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><style>@page{size:A5;margin:15mm 12mm 17mm;@bottom-center{content:counter(page);font-family:DejaVu Sans;font-size:8pt;color:#666}}body{font-family:DejaVu Sans;font-size:11pt;line-height:1.9;text-align:center}h1{font-size:23pt;margin-top:30mm}h2{font-size:13pt;color:#775735;break-after:avoid;margin-top:8mm}p{margin:1.5mm 0}a{color:inherit;text-decoration:none}.cover{break-after:page}.credit{font-size:9pt}</style><section class="cover"><h1>مجموعه آثار حافظ</h1><p>کتابخانهٔ Ketavilo</p><p class="credit">متن کامل نسخهٔ گنجور<br>https://ganjoor.net/hafez<br>فایل منبع: hafez.epub</p><p dir="ltr">Salim Suliman</p></section>'''+''.join(content)+'</html>'
p=r/'book-hafez.pdf';HTML(string=html).write_pdf(p);print('Poems',len(poems),'bytes',p.stat().st_size,flush=True)
from pypdf import PdfReader
m=json.loads((r/'pdf-manifest-v8.json').read_text());m['-2000003']={'path':p.name,'bytes':p.stat().st_size,'pages':len(PdfReader(p).pages),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'poems':len(poems),'source':'https://i.ganjoor.net/epub/hafez.epub'};(r/'pdf-manifest-v9.json').write_text(json.dumps(m,indent=2));print('Pages',m['-2000003']['pages'])
