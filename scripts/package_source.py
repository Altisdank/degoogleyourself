"""Package only the public project sources, without hosting identity or secrets."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
names = ["README.md", "LICENSE", "package.json", "server.mjs", ".gitignore"]
names += [str(p.relative_to(root)) for p in (root / "dist").iterdir() if p.suffix in {".html", ".css", ".js", ".svg"}]
names += [str(p.relative_to(root)) for folder in ["tests", "scripts"] for p in (root / folder).glob("*") if p.suffix in {".mjs", ".py"}]
names += [str(p.relative_to(root)) for p in (root / ".github" / "workflows").glob("*.yml")]
target = root / "dist" / "friare-kallkod.zip"
with ZipFile(target, "w", ZIP_DEFLATED) as archive:
    for name in sorted(names):
        archive.write(root / name, "friare/" + name.replace("\\", "/"))
print(f"Created {target.name}: {len(names)} public files, {target.stat().st_size} bytes")
