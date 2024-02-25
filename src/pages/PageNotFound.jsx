import { Link } from "react-router-dom";
import imageNotFound from "../images/404.png";
// import Button from "../ui/Button/Button";

function PageNotFound() {
  return (
    <div style={styles.container}>
      <img src={imageNotFound} alt="404 Page Not Found" style={styles.image} />
      <Link to="/">
        <button className="btn btn-primary">Back to Home</button>
      </Link>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Make container fill the entire viewport height
  },
  image: {
    width: "80%", // Make the image 80% of its container width
    height: "auto", // Maintain aspect ratio
  },
};

export default PageNotFound;
