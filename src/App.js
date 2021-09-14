import logo from './logo.svg';
import './App.css';
import axios from "axios"

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div onClick={async()=>{
          let res = await axios.get("/api/organization/all")
          console.log(res);
        }} >
          click to check server
        </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
