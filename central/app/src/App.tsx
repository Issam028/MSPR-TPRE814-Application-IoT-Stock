async function getLots() {
  const response = await fetch('http://localhost:3001/lots')
  const data = await response.json()
  console.log(data)
}

function App() {
  return (
    <div>
      <button onClick={() => console.log('hello world')}>
        Cliquez-moi
      </button>
      <button onClick={getLots}>
        Get Lots
      </button>
    </div>
  )
}

export default App
