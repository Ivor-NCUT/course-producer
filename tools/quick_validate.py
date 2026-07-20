#!/usr/bin/env python3
"""CI 中使用的零依赖 Skill frontmatter 快速校验器。"""

import re
import sys
from pathlib import Path


def validate(skill_dir: Path) -> list[str]:
    errors = []
    file = skill_dir / "SKILL.md"
    if not file.is_file():
        return [f"{skill_dir}: missing SKILL.md"]
    text = file.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not match:
        return [f"{file}: missing frontmatter"]
    fields = {}
    for line in match.group(1).splitlines():
        field = re.match(r"^([a-z_]+):\s*(.*)$", line)
        if not field:
            errors.append(f"{file}: invalid frontmatter line: {line}")
            continue
        fields[field.group(1)] = field.group(2).strip().strip("\"'")
    if set(fields) != {"name", "description"}:
        errors.append(f"{file}: frontmatter must contain only name and description")
    if fields.get("name") != skill_dir.name:
        errors.append(f"{file}: name must match directory")
    if not re.fullmatch(r"[a-z0-9-]{1,63}", fields.get("name", "")):
        errors.append(f"{file}: invalid name")
    if not fields.get("description"):
        errors.append(f"{file}: empty description")
    if not (skill_dir / "agents" / "openai.yaml").is_file():
        errors.append(f"{skill_dir}: missing agents/openai.yaml")
    return errors


def main() -> int:
    paths = [Path(arg) for arg in sys.argv[1:]]
    if not paths:
        print("usage: quick_validate.py <skill-dir> [...]", file=sys.stderr)
        return 2
    errors = [error for path in paths for error in validate(path)]
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"validated {len(paths)} skills")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
