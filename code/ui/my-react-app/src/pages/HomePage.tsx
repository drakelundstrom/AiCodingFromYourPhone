export default function HomePage() {
  return (
    <section className="panel page-enter">
      <p className="kicker">Hi there</p>
      <h1>AI vibecoding from your phone is real.</h1>
      <p className="lead">
        Open your editor, talk to your coding assistant, and shape features
        while you are in a cafe line, on a train, or waiting for your coffee.
      </p>

      <div className="card-grid">
        <article className="card burst">
          <h2>Build fast</h2>
          <p>
            Sketch the idea in plain language, then iterate route by route until
            it feels right.
          </p>
        </article>
        <article className="card float">
          <h2>Ship confidently</h2>
          <p>
            Keep your flow with tiny feedback loops: prompt, preview, tweak,
            and merge.
          </p>
        </article>
        <article className="card sway">
          <h2>Stay playful</h2>
          <p>
            Great demos feel alive. Add color, personality, and motion that
            makes people smile.
          </p>
        </article>
      </div>
    </section>
  )
}
