#!/usr/bin/env python3
"""
Gera as versões otimizadas da imagem de fundo do hero.

Uso:
    python3 scripts/gerar-hero-bg.py caminho/da/foto-original.jpg

Lê a foto original (ideal: paisagem, >= 3840 px de largura, sem pessoas em
destaque) e grava em public/hero/:
    hero-1920.webp, hero-2560.webp, hero-3840.webp
que o <img srcset> de hero-section.html usa conforme a largura da tela.

Requer Pillow (pip install pillow).
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

LARGURAS = (1920, 2560, 3840)
QUALIDADE = 82
DESTINO = Path(__file__).resolve().parent.parent / 'public' / 'hero'


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2

    origem = Path(sys.argv[1])
    im = ImageOps.exif_transpose(Image.open(origem)).convert('RGB')
    largura, altura = im.size
    print(f'Original: {origem.name} {largura}x{altura}')
    if largura < max(LARGURAS):
        print(f'AVISO: original tem {largura} px de largura; a versão de {max(LARGURAS)} px será ampliada '
              'e perderá nitidez. Prefira uma foto com pelo menos 3840 px.')
    if largura < altura:
        print('AVISO: foto em retrato; o hero é paisagem e cortará muito nas laterais.')

    DESTINO.mkdir(parents=True, exist_ok=True)
    for w in LARGURAS:
        h = round(altura * w / largura)
        saida = DESTINO / f'hero-{w}.webp'
        im.resize((w, h), Image.LANCZOS).save(saida, 'WEBP', quality=QUALIDADE, method=6)
        print(f'  {saida.relative_to(DESTINO.parent.parent)}  {w}x{h}  {saida.stat().st_size / 1024:.0f} KB')
    print('Pronto. Recarregue o site: o hero passa a usar a imagem automaticamente.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
