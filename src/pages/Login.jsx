import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import { useFaceDetection } from "../services/faceDetection";

function Login() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState("Detecting face");
  const { loadModels } = useFaceDetection(webcamRef, navigate, setInstructions);

  useEffect(() => {
    loadModels();
  }, []);

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
