import base64
import os

header_path = 'frontend/public/images/bast_header.png'
footer_path = 'frontend/public/images/bast_footer.png'
output_path = 'frontend/src/assets/bastTemplates.js'

h_b64 = base64.b64encode(open(header_path, 'rb').read()).decode('utf-8')
f_b64 = base64.b64encode(open(footer_path, 'rb').read()).decode('utf-8')

os.makedirs('frontend/src/assets', exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(f'export const DEFAULT_BAST_HEADER = "data:image/png;base64,{h_b64}";\n\n')
    f.write(f'export const DEFAULT_BAST_FOOTER = "data:image/png;base64,{f_b64}";\n')

print(f"SUCCESS! Created bastTemplates.js! Header b64 len: {len(h_b64)}, Footer b64 len: {len(f_b64)}")
