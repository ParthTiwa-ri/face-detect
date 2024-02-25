import { useRef } from "react";
import * as faceapi from "face-api.js";
import { useAuth } from "../Context/AuthContext";

export const useFaceDetection = (webcamRef, navigate, setInstructions) => {
  const intervalRef = useRef();
  const { setAuthenticated } = useAuth();

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
      // console.log(detections);

      if (detections && detections.length > 0) {
        const face = detections[0];
        const { _box: box } = face.alignedRect;
        const centerX = (box._x + box._width / 2) / video.videoWidth;
        const centerY = (box._y + box._height / 2) / video.videoHeight;

        // Get landmarks for the detected face
        const landmarks = face.landmarks;

        // Check if the face is turned sideways based on the position of landmarks
        const nose = landmarks.getNose();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        // Calculate the angles between the nose and the eyes
        const angleLeft = calculateAngle(
          nose[0],
          leftEye[0],
          rightEye[rightEye.length - 1]
        );
        const angleRight = calculateAngle(
          nose[0],
          rightEye[rightEye.length - 1],
          leftEye[0]
        );

        // Threshold for sideways detection (adjust as needed)
        const sidewaysThreshold = 5; // in degrees

        // If the face is turned sideways beyond the threshold to the left or right
        if (Math.abs(angleLeft) > sidewaysThreshold) {
          console.log("Person turned their head to the left side!");
        } else if (Math.abs(angleRight) > sidewaysThreshold) {
          console.log("Person turned their head to the right side!");
        }

        if (centerX > 0.4 && centerX < 0.6 && centerY > 0.4 && centerY < 0.6) {
          centerCount++;
          setInstructions(`Remain in center`);
          if (centerCount >= 3) {
            countdown--;
            setInstructions(`Redirecting to homepage in ${countdown} seconds`);
            if (countdown === 0) {
              clearInterval(intervalRef.current);
              // navigate("/homepage");
              setAuthenticated(true);
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
  // function calculateAngle(pointA, pointB, pointC) {
  //   const radians =
  //     Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
  //     Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  //   const degrees = radians * (180 / Math.PI);
  //   return degrees;
  // }
  function calculateAngle(pointA, pointB, pointC) {
    const vectorAB = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
    const vectorCB = { x: pointB.x - pointC.x, y: pointB.y - pointC.y };

    const dotProduct = vectorAB.x * vectorCB.x + vectorAB.y * vectorCB.y;
    const magnitudeA = Math.sqrt(
      vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y
    );
    const magnitudeB = Math.sqrt(
      vectorCB.x * vectorCB.x + vectorCB.y * vectorCB.y
    );

    const angleRad = Math.acos(dotProduct / (magnitudeA * magnitudeB));
    const angleDeg = angleRad * (180 / Math.PI);

    return angleDeg;
  }

  return { loadModels };
};
