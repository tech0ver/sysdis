# System Design Tools

Small, dependency-free calculators for learning system design.

The initial tool derives DAU from MAU and active-user percentage, then derives
read and write traffic for each operation:

```text
participating DAU = DAU × operation DAU percentage / 100
QPD = participating DAU × operations per participating DAU per day
QPS = QPD / 86,400
```

## Development

Run the calculator tests:

```bash
npm test
```

Open `index.html` in a modern browser to use the first tool.

## Deployment

GitHub Pages can publish this static site directly from the root of the `main`
branch. In the repository's **Settings → Pages**, select **Deploy from a branch**,
then choose `main` and `/(root)`.
