import { useRef } from "react";
import * as faceapi from "face-api.js";

export const useFaceDetection = (webcamRef, navigate, setInstructions) => {
  const intervalRef = useRef();

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

  return { loadModels };
};
