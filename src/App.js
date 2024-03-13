import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import './App.css';
import kronii from './Ouro-Kronii_pr-img_01.png';

const superchatColours = [
  // Blue
  '#1565C0',
  // Cyan
  '#00B8D4',
  // Green
  '#0A8043',
  // Yellow
  '#FFB300',
  // Orange
  '#E65100',
  // Red
  '#C2185B',
];

const NPCmessages = [
  // Blue
  "But Why?",
  // Cyan
  "I know, I love myself too.",
  // Yellow
  "Gaslight, Gatekeep, Girlboss",
  // Orange
  "Ara Ara~",
  // Pink
  "You've been a very good kronie.",
  // Red
  "Would you bark for me, little one?"
];

function App() {
  // eslint-disable-next-line no-unused-vars
  const [socketUrl, _setSocketUrl] = useState(process.env.NODE_ENV === 'development' ? 'ws://localhost:8080' : process.env.REACT_APP_WEBSOCKET_SERVER);
  const [messageHistory, setMessageHistory] = useState([]);
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log('opened'),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });
  const [isSuperchat, setIsSuperchat] = useState(false);
  const [superchatTier, setSuperchatTier] = useState(1);
  const [messageText, setMessageText] = useState("");
  const [currentVoiceLine, setCurrentVoiceLine] = useState("");

  useEffect(() => {
    if (lastMessage === null) { return; }

    console.log("Message received: ", lastMessage);

    const message = JSON.parse(lastMessage.data);

    if (message.voiceLine) {
      setCurrentVoiceLine(NPCmessages[message.voiceLine - 1]);
      setTimeout(() => setCurrentVoiceLine(""), 3000);
      return
    }

    if (message.message === undefined || message.message === "") { return; }

    setMessageHistory((prev) => prev.concat(message));

  }, [lastMessage]);

  // TODO: Use this to determine what to render
  // eslint-disable-next-line no-unused-vars
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div className="App">
      <div id='video'>
        <img id='kronii' src={kronii} alt='kronii' />
        {/* <p>{connectionStatus}</p> */}
        <div id="voiceline-text" className={currentVoiceLine !== "" && 'fade-out'}>
          {currentVoiceLine}
        </div>
        <div id='chat-parent'>
          <div id='chat'>
            {messageHistory.map((e, i) => {
              return (
                <div key={i} style={{ backgroundColor: `${(e.superchatTier === undefined || e.superchatTier === 0) ? 'white' : superchatColours[e.superchatTier - 1]}`, width: 'fit-content', maxWidth: '100%', wordBreak: 'break-all', marginBottom: '2px', borderRadius: '5px' }}>
                  <p style={{margin: '1px 8px 0.5px'}}>{e.message}</p>
                </div>
              );
            })}
          </div>
          <div id='chat-form'>
            {isSuperchat && <div id='superchat-input' style={{ backgroundColor: `${superchatColours[superchatTier - 1]}` }}>
              <p>{NPCmessages[superchatTier - 1]}</p>
              <input type='range' min={1} max={6} value={superchatTier} onChange={(e) => { setSuperchatTier(parseInt(e.target.value)) }} style={{ width: '100%' }} />
            </div>}
            <div style={{ width: '100%', display: 'flex' }}>
              <input type='text' value={messageText} onChange={(e) => setMessageText(e.target.value)} style={{ flexGrow: '1' }} />
              {messageText === "" ?
                <button onClick={() => {
                  setIsSuperchat(!isSuperchat)
                }}>Superchat</button> :
                <button onClick={() => {
                  sendMessage(JSON.stringify(isSuperchat ?
                    { superchatTier: superchatTier, message: messageText } :
                    { message: messageText }));
                  setMessageText("");
                }}>Send</button>
              }
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

export default App;
