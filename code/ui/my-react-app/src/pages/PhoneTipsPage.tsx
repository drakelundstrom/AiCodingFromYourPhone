const prompts = [
  'Generate a login screen with playful motion and spring transitions.',
  'Refactor this form into reusable components with TypeScript types.',
  'Build a camera-first onboarding flow for mobile users.',
]

export default function PhoneTipsPage() {
  return (
    <section className="panel page-enter">
      <p className="kicker">Prompt Ideas</p>
      <h1>Use these while vibecoding from your phone.</h1>
      <ul className="prompt-list">
        {prompts.map((prompt) => (
          <li key={prompt}>{prompt}</li>
        ))}
      </ul>
    </section>
  )
}
