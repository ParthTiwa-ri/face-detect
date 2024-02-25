import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";

function Login() {
  const webcamRef = useRef(null);
  const intervalRef = useRef();
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState("Detecting face");

  useEffect(() => {
    loadModels();
    return () => clearInterval(intervalRef.current);
  }, []);

  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]);
    startFaceDetection();
  };

  const startFaceDetection = () => {
    let centerCount = 0;
    let countdown = 3;

    intervalRef.current = setInterval(async () => {
      const video = webcamRef.current?.video;
      if (!video) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections && detections.length > 0) {
        const face = detections[0];
        const { _box: box } = face.alignedRect;
        const centerX = (box._x + box._width / 2) / video.videoWidth;
        const centerY = (box._y + box._height / 2) / video.videoHeight;

        if (centerX > 0.4 && centerX < 0.6 && centerY > 0.4 && centerY < 0.6) {
          centerCount++;
          setInstructions(`Remain in center`);
          if (centerCount >= 3) {
            countdown--;
            setInstructions(`Redirecting to homepage in ${countdown} seconds`);
            if (countdown === 0) {
              clearInterval(intervalRef.current);
              navigate("/homepage");
            }
          }
        } else {
          centerCount = 0;
          countdown = 3;
          let newInstructions = "Please move ";
          if (centerX <= 0.4) newInstructions += "left. ";
          else if (centerX >= 0.6) newInstructions += "right. ";
          if (centerY <= 0.4) newInstructions += "down.";
          else if (centerY >= 0.6) newInstructions += "up.";

          setInstructions(newInstructions);
        }
      } else {
        setInstructions("Kindly show your face");
      }
    }, 1000);
  };

  return (
    <div
      className="hero min-h-screen relative"
      style={{ backgroundImage: "url(/bck.jpg)" }}
    >
      <div className="hero-overlay bg-opacity-80"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md">
          <h1 className="sm:text-5xl text-2xl font-bold mb-2">
            Welcome to FaceDetect Login
          </h1>
          <p className="py-6 flex justify-center">
            <Webcam
              className="rounded-l w-64 sm:w-auto shadow-xl"
              videoConstraints={{ facingMode: "user" }}
              ref={webcamRef}
            />
          </p>
          <p className="sm:text-xl text-lg font-bold text-primary-800">
            {instructions}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
