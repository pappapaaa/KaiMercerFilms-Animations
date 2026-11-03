#!/usr/bin/env python3
from pathlib import Path
import hashlib
root=Path(__file__).resolve().parents[1]
checked=0
for line in (root/'CHECKSUMS.sha256').read_text().splitlines():
    expected,rel=line.split('  ',1)
    path=root/rel
    if not path.resolve().is_relative_to(root.resolve()):raise SystemExit('Unsafe path: '+rel)
    if not path.is_file():raise SystemExit('Missing: '+rel)
    if hashlib.sha256(path.read_bytes()).hexdigest()!=expected:raise SystemExit('Mismatch: '+rel)
    checked+=1
print(f'PASS: {checked} files match SHA-256 checksums.')
