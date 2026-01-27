import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">tiny-url</h1>
      <p className="text-muted-foreground mb-4">URL Shortener</p>
      <Button>Get Started</Button>
    </div>
  )
}

export default App
