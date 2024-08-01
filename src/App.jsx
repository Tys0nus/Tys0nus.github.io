import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient'
import './App.css';
import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import Progress from './Progress';  // Import the Progress component
import * as fiber from '@react-three/fiber'
import * as drei from '@react-three/drei'
import * as reactSpring from '@react-spring/three'


function App() {
  const [ready, setReady] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [context, setContext] = useState('');
  const [output, setOutput] = useState('');

  const [score, setScore] = useState(null);

  const worker = useRef(null);

  useEffect(() => {
    // Load questions from questions.txt file
    fetch('/questions.txt')
      .then(response => response.text())
      .then(data => {
        const questionsArray = data.split('\n');  // Split the text file into an array of questions
        setQuestions(questionsArray);
        const randomQuestion = questionsArray[Math.floor(Math.random() * questionsArray.length)];  // Select a random question
        setQuestion(randomQuestion);  // Set the random question
      })
      .catch(error => {
        console.error('Error loading questions:', error);
        setError('Error loading questions file');
      });
  }, []);

  useEffect(() => {
    // Load context from context.txt file
    fetch('/context.txt')
      .then(response => response.text())
      .then(data => setContext(data))
      .catch(error => {
        console.error('Error loading context:', error);
        setError('Error loading context file');
      });

    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          setReady(false);
          setProgressItems(prev => [...prev, e.data]);
          break;
        case 'progress':
          setProgressItems(prev => prev.map(item => (item.file === e.data.file ? { ...item, progress: e.data.progress } : item)));
          break;
        case 'done':
          setProgressItems(prev => prev.filter(item => item.file !== e.data.file));
          break;
        case 'ready':
          setReady(true);
          break;
        case 'update':
          setOutput(e.data.output);
          break;
        case 'complete':
          setOutput(e.data.output);  // Ensure the output state is updated
          setScore(e.data.score);
          setDisabled(false);
          break;
        case 'error':
          setError(e.data.error);
          setDisabled(false);
          break;
        default:
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);

    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  const answer = () => {
    setDisabled(true);
    setError(''); 
    worker.current.postMessage({
      question,
      context,
    });
  };

  return (
    <>
      <ShaderGradientCanvas
        importedFiber={{ ...fiber, ...drei, ...reactSpring }}
        style={{
          position: 'fixed',  // Change from 'absolute' to 'fixed'
          top: 0,
          left: 0,  // Add this line
          width: '100%',  // Add this line
          height: '100%',  // Add this line
          zIndex: -1,  // Add this line
        }}
      >
        <ambientLight intensity={0.3}  />
        <ShaderGradient
          control='query'
          urlString='https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.2&cAzimuthAngle=180&cDistance=3.6&cPolarAngle=90&cameraZoom=1&color1=%23ff5005&color2=%23dbba95&color3=%23d0bce1&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1.6&positionX=-1.4&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=10&rotationZ=50&shader=defaults&toggleAxis=false&type=waterPlane&uAmplitude=0&uDensity=2.3&uFrequency=5.5&uSpeed=0.4&uStrength=1&uTime=0&wireframe=false&zoomOut=false'
        />
      </ShaderGradientCanvas>

      <div className="container">
          <div className="profile-header">
              <div className="profile-info">
                  <h1>Aditya Chaugule</h1>
                  <p><i className="fas fa-globe-americas"></i> United States</p>
                  <p><i className="fas fa-briefcase"></i> Roboticist × Engineer</p>
                  <hr className="separator" />
                  <p className="profile-description">
                      I am a Robotics Engineer with a passion for developing intelligent machines that can perceive, reason and act in the real world.
                  </p>
              </div>
              <img className="profile-pic" alt="Aditya Chaugule" src="/images/pic.jpg" />
          </div>
          <div className="buttons">
              <a href="https://drive.google.com/file/d/1E_SWqaDaIXIoUb0OtXxWPoBxE9UlyPwc/view?usp=drive_link" target="_blank"><i class="fas fa-briefcase"></i> Portfolio</a>
              <a href="https://www.linkedin.com/in/adityachaugule" target="_blank"><i className="fab fa-linkedin"></i> adityachaugule</a>
              <a href="https://github.com/Tys0nus" target="_blank"><i className="fab fa-github"></i> Tys0nus</a>
              <a href="mailto:aditya97@terpmail.umd.edu"><i className="fas fa-envelope"></i> Email</a>
          </div>
      </div>

      <div className="output">
      {score !== null && ( // Conditionally render the score
        <div className="accuracy-score" style={{ position: 'fixed', top: '10px', right: '10px', color: 'white' }}>
          Accuracy: {Math.round(score * 100)}%
        </div>
      )}  
      <textarea className="output-box" value={output} rows={2} readOnly placeholder="Electra on standby... Fire away your questions or try a sample query!"></textarea>
      </div>

      <div className="chat-container">
              <div className="input-container">
                <textarea className="input" value={question} rows={1} onChange={e => setQuestion(e.target.value)} placeholder="Ask Electra about me!"></textarea>
                <button className="ask-button" disabled={disabled} onClick={answer}><i class="fa fa-paper-plane" aria-hidden="true"></i></button>
          </div>
      </div>

      <div className='progress-bars-container'>
          {ready === false && (
            <label>Loading Electra - a lightweight Transformer model... (only run once)</label>
          )}
          {progressItems.map(data => (
            <div key={data.file}>
              <Progress text={data.file} percentage={data.progress} />
            </div>
          ))}
      </div>

      <div className='disclaimer'>
        Web-GPU LLM in testing phase. Exciting things coming soon!
      </div>
    </>

  );
}

export default App;
