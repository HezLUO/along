# Along

Along is the broader product vision for a local-first, open-source companion layer for existing agents.

The current usable product from this vision is **Navi**, an independent open-source alpha that helps non-expert users understand, supervise, and steer expert agents.

Navi now lives at [HezLUO/navi](https://github.com/HezLUO/navi).

## Current Status

Along is an umbrella / vision repository. It explains the long-term product direction and how current and future products relate to it.

This repository is no longer the primary home for Navi alpha installation, release notes, or source verification. Use [HezLUO/navi](https://github.com/HezLUO/navi) for:

- Navi README and quick start;
- Navi GitHub releases;
- source verification commands;
- alpha feedback and issues;
- Navi post-alpha roadmap.

## Product Relationship

```text
Along
  Long-term companion-layer vision for existing agents.

Navi
  First independent V1 alpha product surface from the Along vision.

Progress/Rhythm Maps and Challenge Layer
  Current V1 alpha mechanisms inside Navi.
```

Navi is independent enough to install, test, release, and discuss directly. Along remains the broader product frame for future layers such as reusable Working Thread tooling, Core/MCP, adapters, local runtime, and companion presence.

## Current Products

- [Navi](https://github.com/HezLUO/navi): independent open-source alpha for non-expert supervision of expert agents.

## Docs

- [Along vision](docs/vision/along-vision.md)
- [Roadmap](docs/roadmap.md)
- [Navi product note](docs/products/navi.md)
- [Repository split decision](docs/decisions/2026-06-30-navi-repository-split-design.md)

## Scope

Along is not currently a separate runtime, app, background watcher, marketplace package, or npm package.

## License

MIT. See `LICENSE`.
