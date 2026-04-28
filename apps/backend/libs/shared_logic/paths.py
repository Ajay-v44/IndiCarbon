from __future__ import annotations

from pathlib import Path


def backend_root(path: Path, source_parent_index: int, container_parent_index: int = 1) -> Path:
    resolved = path.resolve()
    if len(resolved.parents) > source_parent_index:
        return resolved.parents[source_parent_index]
    return resolved.parents[container_parent_index]
