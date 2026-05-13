# Along

Along is a lo-fi coding companion that learns along with you.

It is not built for broad code execution. You work on your project; Along quietly works on understanding it, keeps its own journal, and carries a small curiosity into the next session.

## MVP Shape

- Local web UI launched by `along start`
- Project memory in `.along/`
- Global companion memory in `~/.along/`
- Inspectable graph memory
- Session-bounded autonomy
- Reciprocal interaction
- Optional lo-fi soundscape
- No project code edits in the MVP

## Development

```bash
npm install
npm test
npm run typecheck
npm run web
```

In another terminal:

```bash
npm run dev
```

Then open:

```text
http://127.0.0.1:5173
```

## Demo Flow

1. Start the local server.
2. Open the Shared Desk.
3. Along chooses one small curiosity.
4. Along shows what it is reading.
5. Ask Along one question or correct one assumption.
6. Wrap up and inspect `.along/journal/` and `.along/graph/`.

## Safety Boundary

Along may read bounded project context, remember, and suggest. It does not modify project code, create branches, make commits, or run broad shell commands in the MVP.
