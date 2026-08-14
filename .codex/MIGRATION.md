# Claude Code → Codex migration

Migration date: 2026-08-15

This project keeps the original Claude Code files unchanged. Codex-specific instructions live in `AGENTS.override.md`, and other Codex configuration lives in `.codex/`.

## Imported

- Project instructions: the existing root `AGENTS.md` is mirrored into the Codex-only `AGENTS.override.md`. Codex gives the override precedence, while the original `AGENTS.md` and its `CLAUDE.md` symlink remain unchanged.
- Project memory: the Mattally/material-calculator context, UX-first rule, free-only keyword-research constraint, and design-change boundary were added to `AGENTS.override.md`.
- User preference: casual Korean replies were added to `AGENTS.override.md`.
- Agent teams: Claude Code had experimental agent teams enabled. The Codex equivalent is enabled in `.codex/config.toml`, with up to three concurrent subagent threads.

## Reviewed; no project migration required

- Project MCP: the Claude project entry has no MCP servers enabled or configured.
- Project permissions: the Claude project entry has no allowed-tool overrides.
- Project hooks: no project-local Claude hooks exist. User-level hooks remain user-level and are not copied into this repository.
- Project agents: no project-local Claude custom-agent definitions exist.
- Project skills: no project-local `.claude/skills` directory exists.

## Already available in Codex at user/plugin scope

The active Claude setup overlaps with Codex capabilities already installed on this machine, including Caveman workflows, `kill-ai-slop`, skill creation, and the Figma plugin/skills. They were not duplicated into this repository. Figma's MCP connection should be authorized through the Codex Figma plugin when first used.

Claude-only/global plugins such as Ponytail, Humanize Korean, Korean Skills, Hookify, session reporting, and Claude-MD management were not copied into this project because they are user-wide tooling rather than project configuration, and some depend on Claude-specific hooks or commands. Use Codex's `/import` flow in a standalone CLI session or **Settings → Import** in the desktop app if those global plugins, recent chats, or global memories should also be imported at user scope.

## Intentionally excluded memories

Claude stored several Korean-named projects in the same slugged memory directory. Card-news, tourism/PINDOM, Instagram, and Taste Archive memories were excluded because they do not belong to Mattally. Only the memory explicitly identifying `/Users/kim2choi/01_Projects/에드센스` as the material-calculator project was migrated.

## Verification

Start a fresh Codex session in this repository after configuration changes. Codex reads `AGENTS.override.md` and trusted `.codex/config.toml` layers at session start.
