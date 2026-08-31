import './BlankPage.css'

// Generic "coming soon" placeholder used for nav destinations that don't
// have a real page built yet.
interface BlankPageProps {
  title: string
}

function BlankPage({ title }: BlankPageProps) {
  return (
    <div className="blank-page">
      <h1>{title}</h1>
      <p>Coming soon.</p>
    </div>
  )
}

export default BlankPage
