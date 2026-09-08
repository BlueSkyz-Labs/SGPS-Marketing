#!/usr/bin/env python3
import os, sys, json, hashlib, xml.etree.ElementTree as ET
from PIL import Image
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
errors=[]; counts={'raster':0,'svg':0,'json':0,'xml':0}
for dp,_,files in os.walk(ROOT):
  for fn in files:
    p=os.path.join(dp,fn); ext=os.path.splitext(fn)[1].lower()
    try:
      if ext in ('.png','.jpg','.jpeg','.webp','.avif','.ico','.tif','.tiff'):
        im=Image.open(p); im.verify(); counts['raster']+=1
      elif ext=='.svg': ET.parse(p); counts['svg']+=1
      elif ext in ('.json','.webmanifest'):
        json.load(open(p,encoding='utf-8')); counts['json']+=1
      elif ext=='.xml': ET.parse(p); counts['xml']+=1
    except Exception as e: errors.append(f'{os.path.relpath(p,ROOT)}: {e}')
required={
 '04_DIGITAL/02_SOCIAL_LINKEDIN/linkedin_company_cover_1512x256.png':(1512,256),
 '04_DIGITAL/02_SOCIAL_LINKEDIN/linkedin_personal_cover_1584x396.png':(1584,396),
 '04_DIGITAL/07_YOUTUBE/youtube_channel_art_2560x1440_SAFE.png':(2560,1440),
 '04_DIGITAL/07_YOUTUBE/youtube_thumbnail_1280x720.png':(1280,720),
 '04_DIGITAL/01_WEBSITE/open_graph_1200x630.png':(1200,630),
 '04_DIGITAL/05_SOCIAL_INSTAGRAM/instagram_post_portrait_1080x1350.png':(1080,1350),
 '04_DIGITAL/05_SOCIAL_INSTAGRAM/instagram_story_1080x1920.png':(1080,1920),
 '03_ICONS/01_FAVICON_PWA/apple-touch-icon.png':(180,180),
}
for rel,sz in required.items():
  p=os.path.join(ROOT,rel)
  if not os.path.exists(p): errors.append('MISSING '+rel)
  else:
    try:
      im=Image.open(p)
      if im.size!=sz: errors.append(f'DIMENSION {rel}: {im.size} != {sz}')
    except Exception as e: errors.append(f'OPEN {rel}: {e}')
print('COUNTS',counts)
if errors:
  print('FAIL',len(errors)); print('\n'.join(errors)); sys.exit(1)
print('PASS: brand kit integrity and critical dimensions verified')
