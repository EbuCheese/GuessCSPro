import './main.css'
import ImageReveal from './components/ImageReveal'
import zywoo from './assets/zywoo.png'

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-3xl mb-5">Guess the Counter-Strike Pro</h1>
      <ImageReveal
        src={zywoo} // Using placeholder 
        totalBlocks={25}  // 25 blocks per img
        interval={1500}   // 1.5 per block
      />
    </div>
  )
}

export default App