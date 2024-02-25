import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam"; // Import react-webcam
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";

function Login() {
  const webcamRef = useRef(null); // Ref for the webcam component

  const intervalRef = useRef();
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState("Detecting face"); // State for instructions

  useEffect(() => {
    loadModels();

    return () => {
      clearInterval(intervalRef.current);
    };
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
    let centerCount = 0; // Counter for consecutive frames with face in center
    let countdown = 3; // Initial countdown value
    intervalRef.current = setInterval(async () => {
      if (webcamRef.current) {
        const video = webcamRef.current.video;
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections && detections.length > 0) {
          const face = detections[0];
          const centerX =
            (face.alignedRect._box._x + face.alignedRect._box._width / 2) /
            video.videoWidth;
          const centerY =
            (face.alignedRect._box._y + face.alignedRect._box._height / 2) /
            video.videoHeight;

          if (
            centerX > 0.4 &&
            centerX < 0.6 &&
            centerY > 0.4 &&
            centerY < 0.6
          ) {
            centerCount++; // Increment counter if face is in center
            setInstructions(`Remain in center`);
            if (centerCount >= 3) {
              countdown--; // Decrement countdown
              setInstructions(
                `Redirecting to homepage in ${countdown} seconds`
              );
              if (countdown === 0) {
                clearInterval(intervalRef.current); // Stop the interval
                console.log("Redirecting to homepage");
                navigate("/homepage"); // Redirect to homepage
              }
            }
          } else {
            centerCount = 0; // Reset counter if face moves away from center
            countdown = 3; // Reset countdown
            let newInstructions = "Please move ";
            if (centerX <= 0.4) newInstructions += "left. ";
            else if (centerX >= 0.6) newInstructions += "right. ";
            if (centerY <= 0.4) newInstructions += "down.";
            else if (centerY >= 0.6) newInstructions += "up.";

            setInstructions(newInstructions); // Update instructions state
          }
        }
      }
    }, 1000);
  };

  return (
    <>
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage: "url(/bck.jpg)",
        }}
      >
        <div className="hero-overlay bg-opacity-80"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to FaceDetect Login</h1>
            <p className="py-6">
              <Webcam
                className="rounded-l  shadow-xl"
                videoConstraints={{ facingMode: "user" }}
                ref={webcamRef}
              />
            </p>
            <p className="text-xl font-bold text-primary-800">{instructions}</p>
            {/* Display instructions */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
