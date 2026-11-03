# Complete workspace on GitHub

Repository source: https://github.com/pappapaaa/KaiMercerFilms-Animations

Complete snapshot: https://github.com/pappapaaa/KaiMercerFilms-Animations/releases/tag/workspace-2026-11-02

The repository root is the active Kai character/style kit. `workspace-projects/` exposes the earlier root/Eiffel project, `max-video/`, `scene-library/`, original upstream `repo/`, and supporting scripts/public assets. Its source index records the copied paths.

To restore everything, download every `KaiMercerFilms-workspace-part-*.zip` plus the manifest, checksum list and restoration guide from the release. Extract all ZIP parts into the same new directory. These are independent ZIPs containing different files under a common `new animate/` root, so no binary concatenation is needed.

The complete snapshot includes every workspace file: source, media, reference videos, all extracted frames, original audio, finished movies, thumbnails, generated character sheets, dependencies, caches, and Git metadata. Large files are included in the release even when they cannot be pushed as ordinary Git blobs. Each file has a SHA-256 entry in `workspace-manifest.json`; each archive is CRC-tested and has a whole-file SHA-256.

This preserves the folder snapshot. System-wide programs installed outside it, such as Chrome and FFmpeg, remain external prerequisites. The local Downloads workspace is retained.
