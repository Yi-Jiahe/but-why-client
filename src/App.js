import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import './App.css';
import Modal from './Modal';
import info from './icons/info.png';
import chat from './icons/chat.png';
import send from './icons/send.png';

const cloudfrontUrl = 'https://dayrhgvj5w0e9.cloudfront.net';

const soundClips = [
  "but-why.mp3",
  "i-know-i-love-myself-too.mp3",
  "gaslight-gatekeep-girlboss.mp3",
  "ara-ara.mp3",
  "youve-been-a-very-good-kronie.mp3",
  "would-you-bark-for-me-little-one.mp3",
].map(e => new Audio(`${cloudfrontUrl}/${e}`));

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
  const [superchatTier, setSuperchatTier] = useState(0);
  const [messageText, setMessageText] = useState("");
  const [currentVoiceLine, setCurrentVoiceLine] = useState("");
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    if (lastMessage === null) { return; }

    const message = JSON.parse(lastMessage.data);

    if (message.voiceLine) {
      const i = message.voiceLine - 1;
      soundClips[i].play()
      .then(() => {
        setCurrentVoiceLine(NPCmessages[i]);
        setTimeout(() => setCurrentVoiceLine(""), 3000);
      })
      .catch(err => console.log(err));

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
        <svg width='100%' height='100%' viewBox='0 0 1080 1920' style={{position: 'absolute'}}>
        <line x1="0" y1="70" x2="1080" y2="20" stroke='#9F9B55' strokeWidth='5' />
          <line x1="0" y1="100" x2="1080" y2="50" stroke='#9F9B55' strokeWidth='25' />
          <line x1="0" y1="150" x2="1080" y2="100" stroke='#9F9B55' strokeWidth='10' />
          <line x1="0" y1="170" x2="1080" y2="120" stroke='#9F9B55' strokeWidth='10' />
          <line x1="0" y1="350" x2="1080" y2="300" stroke='#9F9B55' strokeWidth='5' />
          <line x1="0" y1="360" x2="1080" y2="310" stroke='#9F9B55' strokeWidth='5' />
        </svg>
        <img id='kronii' src={`${cloudfrontUrl}/Kronii_cropped.png`} alt='kronii' />
        {/* <p>{connectionStatus}</p> */}
        <div id="voiceline-text" className={currentVoiceLine !== "" && 'fade-out'}>
          {currentVoiceLine}
        </div>
        <div id='chat-parent'>
          <div id='chat'>
            {messageHistory.map((e, i) => {
              return (
                <div key={i} className='chat-message' style={{ backgroundColor: `${(e.superchatTier === undefined || e.superchatTier === 0) ? 'white' : superchatColours[e.superchatTier - 1]}` }}>
                  <p>{e.message}</p>
                </div>
              );
            })}
          </div>
          <div id='chat-form' style={{ backgroundColor: `${superchatTier === 0 ? 'white' : superchatColours[superchatTier - 1]}` }}>
            {isSuperchat && <div id='superchat-input'>
              <p>{NPCmessages[superchatTier - 1]}</p>
              <input type='range' min={1} max={6} value={superchatTier} onChange={(e) => { setSuperchatTier(parseInt(e.target.value)) }} style={{ width: 'calc(100% - 100px)', margin: '25px 50px' }} list='markers' />
              <datalist id="markers">
                <option value="1"></option>
                <option value="2"></option>
                <option value="3"></option>
                <option value="4"></option>
                <option value="5"></option>
                <option value="6"></option>
              </datalist>
            </div>}
            <div style={{ width: '100%', display: 'flex', padding: '10px 10px' }}>
              <input type='text' value={messageText} placeholder='Chat...' onChange={(e) => setMessageText(e.target.value)} style={{ flexGrow: '1', borderRadius: '20px', padding: '10px 20px' }} />
              {messageText === "" ?
                <button className='icon-button' onClick={() => {
                  if (isSuperchat) {
                    setSuperchatTier(0)
                  } else {
                    setSuperchatTier(1)
                  }
                  setIsSuperchat(!isSuperchat)
                }}><img src={chat} alt='superchat' className='s20x20' /></button> :
                <button className='icon-button' onClick={() => {
                  sendMessage(JSON.stringify(isSuperchat ?
                    { superchatTier: superchatTier, message: messageText } :
                    { message: messageText }));
                  setMessageText("");
                }}><img src={send} alt='send' className='s20x20' /></button>
              }
            </div>
          </div>
        </div>
        <button id='about-button' className='icon-button' onClick={() => setShowAbout(true)}>
          <div className='s20x20' style={{ backgroundColor: 'white', borderRadius: '10px' }}>
            <img src={info} alt='info' className='s20x20' />
            </div>
        </button>
      </div>

      {showAbout && <Modal closeModal={() => { setShowAbout(false) }}>
        <div>
          <h1>NPC Kronii</h1>
          <p>A multiplayer chat room based on Kronii's <a href='https://www.youtube.com/watch?v=IgLGcD9-5SI'>【NPC Stream】Yum Yum #shorts</a></p>
          <p>If you have any suggestions or would like to report an issue, feel free to contact me on <a href='https://twitter.com/Activepaste1' target="_blank" rel="noreferrer">Twitter</a> or <a href='https://discordapp.com/users/196269893698453504' target="_blank" rel="noreferrer">Discord</a>.</p>
          <br />
          <p>Subscribe to <a href='https://www.youtube.com/@OuroKronii'>Ouro Kronii Ch. hololive-EN</a></p>
          <br />
          <h3>Image Credits</h3>
          <p>Kronii image from <a href='https://hololive.hololivepro.com/en/talents/ouro-kronii/'>hololive.holopro.com</a></p>
          <br />
          <h3>Icon credits</h3>
          <p><img src={info} alt='info' className='s20x20' /><a href="https://www.flaticon.com/free-icons/info" title="info icons">Info icons created by Freepik - Flaticon</a></p>
          <p><img src={send} alt='send' className='s20x20' /><a href="https://www.flaticon.com/free-icons/send" title="send icons">Send icons created by Becris - Flaticon</a></p>
          <p><img src={chat} alt='superchat' className='s20x20' /><a href="https://www.flaticon.com/free-icons/communication" title="communication icons">Communication icons created by Vectors Market - Flaticon</a></p>
        </div>
      </Modal>}
    </div>
  );
}

export default App;
