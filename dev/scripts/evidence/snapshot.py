"""Read members of registered script snapshots, including historical members served from Git.

A script snapshot (sources/<key>/source.json, kind script-snapshot, storage tracked) may list
members whose live file has changed since the snapshot was taken.  Such a member has a
manifest name under <key>/git/ and an entry in retrieval.git_members mapping it to its
repository path; its bytes are `git show <identifiers.git_commit>:<repository path>`.  This
is the same rule as Registry.git_target in scripts/evidence/check_evidence.py, for the
gates that read the old script text outside check_evidence.py (the migration-map checkers
and scripts/check_enrichment.py).

member_bytes() returns a member's bytes only if they hash to the sha256 that both
source.json and sources/MANIFEST.sha256 record; any disagreement raises SnapshotError, so
a tampered snapshot (record, manifest, commit or Git object) fails closed.

legacy_payload() serves the legacy text of a migration map: the snapshot member named in
the map's legacy_source/legacy_member when present (the live file may be rewritten), else
the live legacy_file.  Standard library only.
"""
import hashlib
import json
import pathlib
import re
import subprocess

REPO = pathlib.Path(__file__).resolve().parent.parent.parent


class SnapshotError(Exception):
    pass


def _source(root, key):
    p = pathlib.Path(root) / "sources" / key / "source.json"
    try:
        src = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise SnapshotError(f"sources/{key}/source.json is unreadable ({exc})")
    if not isinstance(src, dict) or src.get("key") != key:
        raise SnapshotError(f"sources/{key}/source.json does not register key '{key}'")
    return src


def _manifest(root):
    p = pathlib.Path(root) / "sources" / "MANIFEST.sha256"
    out = {}
    try:
        lines = p.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        raise SnapshotError(f"sources/MANIFEST.sha256 is unreadable ({exc})")
    for line in lines:
        m = re.fullmatch(r"([0-9a-f]{64})  (\S.*)", line)
        if m:
            out[m.group(2)] = m.group(1)
    return out


def git_target(src, member):
    """(commit, repository path) of a historical Git member of src, or None."""
    target = src.get("retrieval", {}).get("git_members", {}).get(member)
    if target is None:
        return None
    commit = src.get("identifiers", {}).get("git_commit", "")
    if (src.get("kind") != "script-snapshot" or src.get("storage") != "tracked"
            or not re.fullmatch(r"[0-9a-f]{40}", commit or "")
            or not isinstance(target, str) or target.startswith("/")
            or ".." in pathlib.PurePosixPath(target).parts):
        raise SnapshotError(f"invalid Git snapshot member or commit for '{member}'")
    return commit, target


def git_show(root, commit, path):
    proc = subprocess.run(["git", "-C", str(root), "show", f"{commit}:{path}"],
                          capture_output=True)
    if proc.returncode:
        raise SnapshotError(f"historical snapshot payload {commit[:12]}:{path} is unavailable "
                            "from Git")
    return proc.stdout


def member_bytes(root, key, member):
    """Bytes of member of source key, checked against source.json and the manifest."""
    src = _source(root, key)
    rec = next((f for f in src.get("files", []) if f.get("path") == member), None)
    if rec is None:
        raise SnapshotError(f"'{member}' is not a member of source '{key}'")
    digest = rec.get("sha256")
    if _manifest(root).get(member) != digest:
        raise SnapshotError(f"sha256 of '{member}' in sources/{key}/source.json is not the "
                            "manifest's")
    target = git_target(src, member)
    if target is not None:
        data = git_show(root, *target)
    else:
        p = (pathlib.Path(root) / "sources" / member).resolve()
        try:
            data = p.read_bytes()
        except OSError:
            raise SnapshotError(f"payload of '{member}' is missing")
    if hashlib.sha256(data).hexdigest() != digest:
        raise SnapshotError(f"stale snapshot: the payload of '{member}' (source '{key}') does "
                            f"not hash to the recorded {digest}")
    return data


def legacy_payload(root, mp):
    """(bytes, origin) of a migration map's legacy text; see the module docstring."""
    key, member = mp.get("legacy_source"), mp.get("legacy_member")
    if key is None and member is None:
        p = pathlib.Path(root) / mp["legacy_file"]
        return p.read_bytes(), mp["legacy_file"]
    if not (isinstance(key, str) and isinstance(member, str)):
        raise SnapshotError("the map needs both legacy_source and legacy_member, or neither")
    target = git_target(_source(root, key), member)
    if target is not None and target[1] != mp.get("legacy_file"):
        raise SnapshotError(f"legacy_member '{member}' is served from '{target[1]}', not from "
                            f"the map's legacy_file '{mp.get('legacy_file')}'")
    return member_bytes(root, key, member), f"{key}:{member}"
