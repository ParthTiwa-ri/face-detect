import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function HomePage() {
  return (
    <>
      <div>
        <Navbar />
        <div className="hero min-h-screen bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">
                Welcome to Our Homepage! 🎉
              </h1>
              <p className="py-6">
                Thank you for visiting our site. Here, youll find a curated
                selection of content tailored just for you, showcasing the
                exciting features and updates available after youve successfully
                logged in. Explore, engage, and enjoy the personalized
                experience we have crafted for you.
              </p>

              <Link to="/" className="btn btn-primary">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default HomePage;
